import { config } from '../config';
import { api } from '../api/client';

// Build absolute or relative path based on available base URL.
// Do not hardcode endpoints; expose placeholder endpoints that can be wired later.
function authPath(p) {
  // Prefer explicit auth paths under base; if base is missing, let api.client handle it gracefully
  const normalized = p.startsWith('/') ? p : `/${p}`;
  return normalized;
}

// PUBLIC_INTERFACE
export const authApi = {
  /**
   * Attempt login with email/password.
   * This is a placeholder that posts to '/auth/login' relative to the configured base URL.
   * Returns: { token: string, user: { id, email, role } }
   */
  async login(email, password) {
    const path = authPath('auth/login');
    // The backend is expected to return token and user. This will be wired later.
    const res = await api.post(path, { email, password });
    return res;
  },

  /**
   * PUBLIC_INTERFACE
   * Register a new user.
   * Placeholder that posts to '/auth/register'. The backend should return:
   * { token: string, user: { id, email, name, role } }
   */
  async register({ name, email, password, role = 'teacher' }) {
    const path = authPath('auth/register');
    const res = await api.post(path, { name, email, password, role });
    return res;
  },

  /**
   * PUBLIC_INTERFACE
   * Fetch profile of the current user using a bearer token.
   * This is a placeholder that GETs '/auth/me'.
   */
  async me(token) {
    const path = authPath('auth/me');
    const data = await fetch(config.baseUrl ? `${config.baseUrl}${path.startsWith('/') ? '' : '/'}${path}` : path, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const contentType = data.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await data.json() : await data.text();
    if (!data.ok) {
      const err = new Error('Profile fetch failed');
      err.status = data.status;
      err.body = body;
      throw err;
    }
    return body;
  },
};
