import { config } from '../config';

function buildUrl(path = '') {
  if (!config.baseUrl) return path; // allow relative use in dev if not configured
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${config.baseUrl}${normalized}`;
}

// Basic wrapper (no auth headers)
async function request(path, options = {}) {
  const url = buildUrl(path);
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const resp = await fetch(url, { ...options, headers });
  const contentType = resp.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await resp.json() : await resp.text();
  if (!resp.ok) {
    const error = new Error('Request failed');
    error.status = resp.status;
    error.body = body;
    throw error;
  }
  return body;
}

// PUBLIC_INTERFACE
export const api = {
  /** Health check; does not throw if baseUrl is missing—returns a friendly message instead. */
  async healthCheck() {
    if (!config.baseUrl) {
      return { ok: true, message: 'No API base configured. Using client-only mode.' };
    }
    try {
      const path = config.healthPath || '/health';
      const data = await request(path, { method: 'GET' });
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e?.message || 'health check failed' };
    }
  },
  // Placeholder helpers - ready to be wired to real endpoints later
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),

  // PUBLIC_INTERFACE
  students: {
    /**
     * Configurable endpoints for student APIs. Update these paths in your env/README wiring.
     * Defaults assume a RESTful convention under /students.
     */
    endpoints: {
      list: '/students',
      create: '/students',
      update: (id) => `/students/${encodeURIComponent(id)}`,
      delete: (id) => `/students/${encodeURIComponent(id)}`,
    },

    // PUBLIC_INTERFACE
    async listStudents() {
      if (!config.baseUrl) {
        // Client-only mode: return empty list by default
        return [];
      }
      return api.get(api.students.endpoints.list);
    },

    // PUBLIC_INTERFACE
    async createStudent(payload) {
      if (!config.baseUrl) {
        // Client-only mode: echo payload with generated id
        return { ...payload, id: `tmp-${Date.now()}` };
      }
      return api.post(api.students.endpoints.create, payload);
    },

    // PUBLIC_INTERFACE
    async updateStudent(id, payload) {
      if (!config.baseUrl) {
        // Client-only mode: return merged object
        return { id, ...payload };
      }
      const path = api.students.endpoints.update(id);
      return api.put(path, payload);
    },

    // PUBLIC_INTERFACE
    async deleteStudent(id) {
      if (!config.baseUrl) {
        return { ok: true, id };
      }
      const path = api.students.endpoints.delete(id);
      return api.del(path);
    },
  },
};
