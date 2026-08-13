/**
 * Solarch Client — Light, robust REST & Realtime SDK for Solarch BaaS
 */

class AuthStore {
  constructor() {
    const hasStorage = typeof localStorage !== 'undefined';
    this.token = hasStorage ? (localStorage.getItem('solarch_token') || '') : '';
    const savedRecord = hasStorage ? localStorage.getItem('solarch_record') : null;
    this.record = savedRecord ? JSON.parse(savedRecord) : null;
    this.listeners = new Set();
  }

  get isValid() {
    return !!this.token && !!this.record;
  }

  save(token, record) {
    this.token = token;
    this.record = record;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('solarch_token', token);
      localStorage.setItem('solarch_record', JSON.stringify(record));
    }
    this.notify();
  }

  clear() {
    this.token = '';
    this.record = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('solarch_token');
      localStorage.removeItem('solarch_record');
    }
    this.notify();
  }

  onChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach((cb) => cb({ token: this.token, record: this.record }));
  }
}

class RecordService {
  constructor(client, name) {
    this.client = client;
    this.name = name;
  }

  async _request(path, options = {}) {
    const url = `${this.client.baseUrl}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.client.authStore.token ? { Authorization: `Bearer ${this.client.authStore.token}` } : {}),
      ...options.headers,
    };

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ message: res.statusText }));
      const err = new Error(errData.message || `Request failed with status ${res.status}`);
      err.status = res.status;
      err.data = errData;
      throw err;
    }
    return res.json();
  }

  async getFullList(options = {}) {
    const params = new URLSearchParams();
    if (options.sort) params.set('sort', options.sort);
    if (options.filter) params.set('filter', options.filter);
    if (options.expand) params.set('expand', options.expand);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await this._request(`/api/collections/${this.name}/records${query}`);
    return res.items || res;
  }

  async getOne(id, options = {}) {
    const params = new URLSearchParams();
    if (options.expand) params.set('expand', options.expand);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this._request(`/api/collections/${this.name}/records/${id}${query}`);
  }

  async getFirstListItem(filterStr, options = {}) {
    const items = await this.getFullList({ ...options, filter: filterStr });
    if (!items || items.length === 0) {
      const err = new Error('Record not found');
      err.status = 404;
      throw err;
    }
    return items[0];
  }

  async create(data) {
    return this._request(`/api/collections/${this.name}/records`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id, data) {
    return this._request(`/api/collections/${this.name}/records/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(id) {
    return this._request(`/api/collections/${this.name}/records/${id}`, {
      method: 'DELETE',
    });
  }

  async authWithPassword(email, password) {
    const res = await this._request(`/api/collections/${this.name}/auth-with-password`, {
      method: 'POST',
      body: JSON.stringify({ identity: email, email, password }),
    });

    const token = res.token || res.jwt;
    const record = res.record || res.user;
    this.client.authStore.save(token, record);
    return { token, record };
  }

  async subscribe(topic, callback) {
    return this.client.subscribeRealtime(this.name, callback);
  }

  async unsubscribe() {
    // Handled by EventSource cleanup in client
  }
}

export class SolarchClient {
  constructor(baseUrl = 'http://127.0.0.1:8090') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.authStore = new AuthStore();
    this.subscriptions = new Map();
    this.eventSource = null;
  }

  collection(name) {
    return new RecordService(this, name);
  }

  filter(template, params = {}) {
    let result = template;
    for (const [key, val] of Object.entries(params)) {
      const formatted = typeof val === 'string' ? `"${val}"` : val;
      result = result.replace(new RegExp(`{:${key}}`, 'g'), formatted);
    }
    return result;
  }

  subscribeRealtime(collectionName, callback) {
    if (!this.eventSource) {
      const sseUrl = `${this.baseUrl}/api/realtime`;
      this.eventSource = new EventSource(sseUrl);
      this.eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          const collection = data.collection || data.record?.collection;
          const listeners = this.subscriptions.get(collection);
          if (listeners) {
            listeners.forEach((cb) => cb(data));
          }
          const wildcardListeners = this.subscriptions.get('*');
          if (wildcardListeners) {
            wildcardListeners.forEach((cb) => cb(data));
          }
        } catch (err) {
          console.error('SSE parse error:', err);
        }
      };
    }

    if (!this.subscriptions.has(collectionName)) {
      this.subscriptions.set(collectionName, new Set());
    }
    this.subscriptions.get(collectionName).add(callback);

    return () => {
      const set = this.subscriptions.get(collectionName);
      if (set) set.delete(callback);
    };
  }
}

const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SOLARCH_URL) || 'http://127.0.0.1:8090';
const sol = new SolarchClient(baseUrl);
export default sol;
