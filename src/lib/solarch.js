// Client-side wrapper to interact with the Solarch backend REST API
// Avoids importing the Node.js 'solarch' package directly into the browser bundle

class SolarchClient {
  constructor(config) {
    this.url = config.url.replace(/\/$/, '');
    this.token = localStorage.getItem('solarch_token');
    
    this.auth = {
      login: async (email, password) => {
        const res = await this.request('/api/collections/users/auth-with-password', 'POST', { identity: email, password });
        if (res.token) {
          this.token = res.token;
          localStorage.setItem('solarch_token', res.token);
          if (res.record) {
            localStorage.setItem('solarch_user', JSON.stringify(res.record));
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
            localStorage.setItem('solarch_token', res.token);
            if (res.record) {
              localStorage.setItem('solarch_user', JSON.stringify(res.record));
            }
            return res.record;
          }
        } catch (err) {
          // If solarch mock doesn't support auth-refresh (404), fallback to local cache
          console.warn('Auth refresh not supported, falling back to local cache.');
        }

        const localUser = localStorage.getItem('solarch_user');
        if (localUser) {
          return JSON.parse(localUser);
        }
        
        throw new Error('No active session');
      },
      logout: async () => {
        this.token = null;
        localStorage.removeItem('solarch_token');
        localStorage.removeItem('solarch_user');
      }
    };

    this.db = {
      collection: (colName) => ({
        get: async (options = {}) => {
          // Construct query string from options
          const query = new URLSearchParams();
          if (options.limit) query.append('limit', options.limit);
          if (options.filter) {
            query.append('filter', JSON.stringify(options.filter));
          }
          const qs = query.toString() ? `?${query.toString()}` : '';
          return await this.request(`/api/collections/${colName}/records${qs}`, 'GET');
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
        subscribe: async (options, callback) => {
          if (!this.sse) {
            this.sse = new EventSource(`${this.url}/api/realtime`);
            this.activeSubscriptions = new Map();

            this.sse.addEventListener('PB_CONNECT', async (e) => {
              try {
                const data = JSON.parse(e.data);
                this.clientId = data.clientId;
                this.submitSubscriptions();
              } catch (err) {}
            });

            this.sse.addEventListener(colName, (e) => {
              try {
                const data = JSON.parse(e.data);
                const colSubs = this.activeSubscriptions.get(colName);
                if (colSubs) {
                  colSubs.forEach(sub => {
                    // Match pocketbase filter structure if present
                    if (sub.options?.filter?.$id && data.record.id !== sub.options.filter.$id) return;
                    if (sub.options?.filter?.trip_id && data.record.trip_id !== sub.options.filter.trip_id) return;
                    sub.callback({ action: data.action, document: data.record });
                  });
                }
              } catch (err) {}
            });
          } else {
             // If sse exists, bind listener for this colName if not present
             if (!this.activeSubscriptions.has(colName)) {
               this.sse.addEventListener(colName, (e) => {
                  try {
                    const data = JSON.parse(e.data);
                    const colSubs = this.activeSubscriptions.get(colName);
                    if (colSubs) {
                      colSubs.forEach(sub => {
                        if (sub.options?.filter?.$id && data.record.id !== sub.options.filter.$id) return;
                        if (sub.options?.filter?.trip_id && data.record.trip_id !== sub.options.filter.trip_id) return;
                        sub.callback({ action: data.action, document: data.record });
                      });
                    }
                  } catch (err) {}
                });
             }
          }

          const subId = Math.random().toString(36).substring(7);
          if (!this.activeSubscriptions.has(colName)) {
            this.activeSubscriptions.set(colName, new Set());
          }
          this.activeSubscriptions.get(colName).add({ id: subId, callback, options });
          
          if (this.clientId) {
            this.submitSubscriptions();
          }

          return () => {
            const colSubs = this.activeSubscriptions.get(colName);
            if (colSubs) {
              for (const sub of colSubs) {
                if (sub.id === subId) {
                  colSubs.delete(sub);
                }
              }
            }
          };
        }
      })
    };
  }

  async submitSubscriptions() {
    if (!this.clientId) return;
    const subs = Array.from(this.activeSubscriptions.keys());
    try {
      await this.request('/api/realtime', 'POST', {
        clientId: this.clientId,
        subscriptions: subs
      });
    } catch (err) {
      console.error('Failed to submit SSE subscriptions', err);
    }
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
    } catch (e) {
      throw new Error("Unable to connect to SmartTransit server.");
    }
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        if (response.status === 404) throw new Error("The requested information could not be found.");
        if (response.status === 500) throw new Error("SmartTransit server error. Please try again later.");
        throw new Error(`API Error: ${response.statusText}`);
      }

      const msg = errorData.message || response.statusText;
      if (response.status === 401) throw new Error("Your session has expired. Please log in again.");
      if (response.status === 403) throw new Error("You don't have permission to perform this action.");
      if (response.status === 400 && msg.includes("Failed to authenticate")) throw new Error("Invalid email or password.");
      
      throw new Error(msg);
    }

    return response.status !== 204 ? await response.json() : null;
  }
}

export const solarch = new SolarchClient({
  url: import.meta.env.VITE_SOLARCH_URL || 'http://localhost:8090'
});

export default solarch;
