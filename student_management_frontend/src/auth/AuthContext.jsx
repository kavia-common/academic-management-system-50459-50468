import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from './authApi';

/**
 * Shape of the authenticated user object:
 * {
 *   id: string,
 *   email: string,
 *   name?: string,
 *   role: 'admin' | 'teacher'
 * }
 */

// Keys for localStorage
const LS_TOKEN_KEY = 'ams_auth_token';
const LS_USER_KEY = 'ams_auth_user';

// PUBLIC_INTERFACE
export const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  // Methods
  login: async (_email, _password) => {},
  logout: () => {},
  refreshProfile: async () => {},
  hasRole: (_role) => false,
});

/**
 * PUBLIC_INTERFACE
 * AuthProvider manages authentication state, persists token/user to localStorage,
 * and exposes helpers to login/logout and guard routes based on roles.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(LS_TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Persist updates
  useEffect(() => {
    try {
      if (token) localStorage.setItem(LS_TOKEN_KEY, token);
      else localStorage.removeItem(LS_TOKEN_KEY);
    } catch {}
  }, [token]);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(LS_USER_KEY);
    } catch {}
  }, [user]);

  // On mount if we have a token but no user, try to fetch profile
  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      if (token && !user) {
        try {
          setLoading(true);
          const profile = await authApi.me(token);
          if (!cancelled) setUser(profile);
        } catch {
          if (!cancelled) {
            setToken(null);
            setUser(null);
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      }
    }
    bootstrap();
    return () => { cancelled = true; };
  }, [token, user]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      setToken(res?.token || null);
      setUser(res?.user || null);

      // Redirect logic: if there was a redirectTo in state, go there, else home
      const state = location.state;
      const redirectTo = state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e?.body?.message || e?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  }, [location.state, navigate]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const refreshProfile = useCallback(async () => {
    if (!token) return null;
    try {
      const profile = await authApi.me(token);
      setUser(profile);
      return profile;
    } catch {
      setToken(null);
      setUser(null);
      return null;
    }
  }, [token]);

  const hasRole = useCallback((role) => {
    if (!user?.role) return false;
    return user.role === role;
  }, [user]);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    refreshProfile,
    hasRole,
    loading,
  }), [user, token, login, logout, refreshProfile, hasRole, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to consume authentication context. */
  return useContext(AuthContext);
}
