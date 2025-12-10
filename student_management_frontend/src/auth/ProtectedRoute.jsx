import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

// PUBLIC_INTERFACE
export function ProtectedRoute() {
  /**
   * Route element that ensures user is authenticated.
   * If not authenticated, redirects to /login preserving the intended location.
   */
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

// PUBLIC_INTERFACE
export function RoleRoute({ roles = [] }) {
  /**
   * Route element that ensures user has one of the specified roles.
   * If not authorized, redirects to home or login appropriately.
   */
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (roles.length > 0 && (!user?.role || !roles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
