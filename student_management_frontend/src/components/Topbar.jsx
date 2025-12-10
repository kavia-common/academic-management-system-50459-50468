import React from 'react';
import { useAuth } from '../auth/AuthContext';
import Button from './Button';

// PUBLIC_INTERFACE
export default function Topbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="header" role="banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-primary)' }} aria-hidden />
        <strong>Student Management</strong>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isAuthenticated ? (
          <>
            <div aria-label="User" title={user?.email} style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {user?.name || user?.email} • {user?.role}
            </div>
            <Button variant="ghost" onClick={logout}>Logout</Button>
          </>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Not signed in</div>
        )}
      </div>
    </div>
  );
}
