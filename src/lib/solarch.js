// Client-side wrapper to interact with the Solarch backend REST API
// Avoids importing the Node.js 'solarch' package directly into the browser bundle

/**
 * Helper to convert filter options into PocketBase / Solarch filter string expressions.
 * Supports:
 * - String filters (e.g. `role = "ADMIN" && approval_status = "APPROVED"`)
 * - Object filters (e.g. `{ role: 'ADMIN', approval_status: 'APPROVED' }`)
 */
export function buildFilterString(filter) {
  if (!filter) return '';
  if (typeof filter === 'string') return filter.trim();

  if (typeof filter === 'object' && !Array.isArray(filter)) {
    const expressions = [];
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined) continue;
      if (value === null) {
        expressions.push(`${key} = null`);
      } else if (typeof value === 'boolean' || typeof value === 'number') {
        expressions.push(`${key} = ${value}`);
      } else {
        const escaped = String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        expressions.push(`${key} = "${escaped}"`);
      }
    }
    return expressions.join(' && ');
  }

  return '';
}

export class SolarchClient {
  constructor(config = {}) {
    const rawUrl = typeof config === 'string' ? config : (config.url || 'http://localhost:8090');
    this.url = rawUrl.replace(/\/$/, '');
    this.token = typeof localStorage !== 'undefined' ? localStorage.getItem('solarch_token') : null;
    this.sse = null;
    this.clientId = null;
    this.activeSubscriptions = new Map(); // colName -> Set of { id, callback, options }
    this.collectionListeners = new Set(); // set of colNames with active SSE event listener
    this.reconnectTimeout = null;
    this.isReconnecting = false;
    
    this.auth = {
      login: async (email, password) => {
        const res = await this.request('/api/collections/users/auth-with-password', 'POST', { identity: email, password });
        if (res && res.token) {
          this.token = res.token;
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('solarch_token', res.token);
            if (res.record) {
              localStorage.setItem('solarch_user', JSON.stringify(res.record));
            }
          }
          // PocketBase returns the user in 'record'
          res.user = res.record;
        }
        return res;
      },
      getUser: async () => {
        if (!this.token) throw new Error('No active session');
        
        try {
          // Standard PocketBase auth-refresh to hydrate session
          const res = await this.request('/api/collections/users/auth-refresh', 'POST');
          if (res && res.token) {
            this.token = res.token;
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('solarch_token', res.token);
              if (res.record) {
                localStorage.setItem('solarch_user', JSON.stringify(res.record));
              }
            }
            return res.record;
          }
        } catch {
          // If solarch doesn't support auth-refresh (404), fallback to local cache
        }

        if (typeof localStorage !== 'undefined') {
          const localUser = localStorage.getItem('solarch_user');
          if (localUser) {
            return JSON.parse(localUser);
          }
        }
        
        throw new Error('No active session');
      },
      logout: async () => {
        this.token = null;
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('solarch_token');
          localStorage.removeItem('solarch_user');
        }
        this.disconnectRealtime();
      }
    };

    this.db = {
      collection: (colName) => ({
        get: async (options = {}) => {
          const query = new URLSearchParams();
          if (options.limit) query.append('limit', options.limit);
          if (options.perPage) query.append('perPage', options.perPage);
          if (options.page) query.append('page', options.page);
          if (options.sort) query.append('sort', options.sort);

          const filterStr = buildFilterString(options.filter);
          if (filterStr) {
            query.append('filter', filterStr);
          }

          const qs = query.toString() ? `?${query.toString()}` : '';
          return await this.request(`/api/collections/${colName}/records${qs}`, 'GET');
        },
        getFirstListItem: async (filter) => {
          const query = new URLSearchParams();
          const filterStr = buildFilterString(filter);
          if (filterStr) {
            query.append('filter', filterStr);
          }
          query.append('limit', '1');
          query.append('perPage', '1');
          const qs = query.toString() ? `?${query.toString()}` : '';
          const res = await this.request(`/api/collections/${colName}/records${qs}`, 'GET');
          const items = res?.items || res?.documents || [];
          if (items.length === 0) {
            throw new Error(`Record not found in ${colName}`);
          }
          return items[0];
        },
        getById: async (id) => {
          return await this.request(`/api/collections/${colName}/records/${id}`, 'GET');
        },
        create: async (data) => {
          return await this.request(`/api/collections/${colName}/records`, 'POST', data);
        },
        update: async (id, data) => {
          return await this.request(`/api/collections/${colName}/records/${id}`, 'PATCH', data);
        },
        delete: async (id) => {
          return await this.request(`/api/collections/${colName}/records/${id}`, 'DELETE');
        },
        subscribe: async (optionsOrCallback, maybeCallback) => {
          const options = typeof optionsOrCallback === 'function' ? {} : (optionsOrCallback || {});
          const callback = typeof optionsOrCallback === 'function' ? optionsOrCallback : maybeCallback;

          if (typeof callback !== 'function') {
            throw new Error('Subscription callback must be a function');
          }

          this.initRealtime();

          const subId = Math.random().toString(36).substring(7);
          if (!this.activeSubscriptions.has(colName)) {
            this.activeSubscriptions.set(colName, new Set());
          }
          this.activeSubscriptions.get(colName).add({ id: subId, callback, options });
          
          // Ensure SINGLE event listener per collection name (FINDING-010 FIX)
          this.ensureCollectionListener(colName);

          if (this.clientId) {
            this.submitSubscriptions();
          }

          // Unsubscribe function
          return () => {
            const colSubs = this.activeSubscriptions.get(colName);
            if (colSubs) {
              for (const sub of colSubs) {
                if (sub.id === subId) {
                  colSubs.delete(sub);
                  break;
                }
              }
              if (colSubs.size === 0) {
                this.activeSubscriptions.delete(colName);
                if (this.clientId) {
                  this.submitSubscriptions();
                }
              }
            }
          };
        }
      })
    };
  }

  initRealtime() {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;
    if (this.sse && this.sse.readyState !== EventSource.CLOSED) return;

    // FINDING-006 FIX: Pass token in query param for authenticated SSE stream
    const tokenQuery = this.token ? `?token=${encodeURIComponent(this.token)}` : '';
    this.sse = new EventSource(`${this.url}/api/realtime${tokenQuery}`);
    this.collectionListeners.clear();

    this.sse.addEventListener('PB_CONNECT', (e) => {
      try {
        const data = JSON.parse(e.data);
        this.clientId = data.clientId;
        this.submitSubscriptions();
      } catch {}
    });

    this.sse.addEventListener('connected', (e) => {
      try {
        const data = JSON.parse(e.data);
        this.clientId = data.clientId;
        this.submitSubscriptions();
      } catch {}
    });

    // Re-bind listeners for any active collections
    for (const colName of this.activeSubscriptions.keys()) {
      this.ensureCollectionListener(colName);
    }

    // FINDING-008 FIX: Reconnection handling with backoff
    this.sse.onerror = () => {
      if (this.isReconnecting) return;
      this.isReconnecting = true;
      if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = setTimeout(() => {
        this.isReconnecting = false;
        if (this.activeSubscriptions.size > 0) {
          this.disconnectRealtime();
          this.initRealtime();
        }
      }, 3000);
    };
  }

  ensureCollectionListener(colName) {
    if (!this.sse || this.collectionListeners.has(colName)) return;
    this.collectionListeners.add(colName);

    // Single listener for this collection name (FINDING-010 FIX)
    const handler = (e) => {
      try {
        const data = JSON.parse(e.data);
        const colSubs = this.activeSubscriptions.get(colName);
        if (colSubs && data.record) {
          colSubs.forEach(sub => {
            // Match custom filter criteria if present
            if (sub.options?.filter?.$id && data.record.id !== sub.options.filter.$id) return;
            if (sub.options?.filter?.trip_id && data.record.trip_id !== sub.options.filter.trip_id) return;
            if (sub.options?.filter?.bus_id && data.record.bus_id !== sub.options.filter.bus_id) return;
            sub.callback({ action: data.action, document: data.record, record: data.record });
          });
        }
      } catch {}
    };

    this.sse.addEventListener(colName, handler);
  }

  disconnectRealtime() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.sse) {
      this.sse.close();
      this.sse = null;
    }
    this.clientId = null;
    this.collectionListeners.clear();
  }

  async submitSubscriptions() {
    if (!this.clientId) return;
    const channels = Array.from(this.activeSubscriptions.keys()).map(name => ({
      action: 'subscribe',
      channel: `collections.${name}.records`
    }));
    if (channels.length === 0) return;
    try {
      await this.request('/api/realtime', 'POST', {
        clientId: this.clientId,
        subscriptions: channels
      });
    } catch {}
  }

  async request(path, method, body = null) {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const options = {
      method,
      headers
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    let response;
    try {
      response = await fetch(`${this.url}${path}`, options);
    } catch {
      throw new Error("Unable to connect to SmartTransit server.");
    }
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        if (response.status === 404) throw new Error("The requested information could not be found.");
        if (response.status === 500) throw new Error("SmartTransit server error. Please try again later.");
        throw new Error(`API Error: ${response.statusText}`);
      }

      const msg = errorData?.message || response.statusText;
      if (response.status === 401) throw new Error("Your session has expired. Please log in again.");
      if (response.status === 403) throw new Error("You don't have permission to perform this action.");
      if (response.status === 400 && msg.includes("Failed to authenticate")) throw new Error("Invalid email or password.");
      
      throw new Error(msg);
    }

    return response.status !== 204 ? await response.json() : null;
  }
}

export const solarch = new SolarchClient({
  url: typeof import.meta !== 'undefined' && import.meta.env?.VITE_SOLARCH_URL ? import.meta.env.VITE_SOLARCH_URL : 'http://localhost:8090'
});

export default solarch;
