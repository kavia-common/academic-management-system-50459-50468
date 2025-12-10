import { config } from '../config';

function buildUrl(path = '') {
  if (!config.baseUrl) return path; // allow relative use in dev if not configured
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${config.baseUrl}${normalized}`;
}

function getToken() {
  try {
    return localStorage.getItem('ams_auth_token');
  } catch {
    return null;
  }
}

// Basic wrapper
async function request(path, options = {}) {
  const url = buildUrl(path);
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
};
