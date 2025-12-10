import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Button from './Button';

// PUBLIC_INTERFACE
export default function Sidebar() {
  const { isAuthenticated, user, logout } = useAuth();

  const links = useMemo(() => {
    const base = [
      { to: '/', label: 'Dashboard' },
    ];
    const shared = [
      { to: '/students', label: 'Students' },
      { to: '/courses', label: 'Courses' },
      { to: '/attendance', label: 'Attendance' },
    ];
    const adminOnly = [{ to: '/settings', label: 'Settings', role: 'admin' }];

    if (!isAuthenticated) {
      return [{ to: '/login', label: 'Login', public: true }];
    }

    const result = [...base, ...shared];
    if (user?.role === 'admin') {
      result.push(...adminOnly);
    }
    return result;
  }, [isAuthenticated, user]);

  return (
    <aside className="sidebar" aria-label="Side navigation">
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
          {links.map(l => (
            <li key={l.to}>
              <NavLink
                end={l.to === '/'}
                to={l.to}
                className={({ isActive }) =>
                  'nav-link ' + (isActive ? 'active' : '')
                }
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: '10px',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                  background: isActive ? 'rgba(37,99,235,0.08)' : 'transparent',
                  border: '1px solid var(--color-border)',
                  textDecoration: 'none',
                  transition: 'background 150ms ease',
                })}
              >
                <span aria-hidden>•</span>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      {isAuthenticated ? (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Signed in as {user?.name || user?.email} ({user?.role})
          </div>
          <Button variant="ghost" onClick={logout}>Logout</Button>
        </div>
      ) : null}
    </aside>
  );
}
