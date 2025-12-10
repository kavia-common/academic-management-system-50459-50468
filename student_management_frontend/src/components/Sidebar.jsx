import React from 'react';
import { NavLink } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function Sidebar() {

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/students', label: 'Students' },
    { to: '/classes', label: 'Classes' },
    { to: '/courses', label: 'Courses' },
    { to: '/attendance', label: 'Attendance' },
    { to: '/exams', label: 'Exams' },
    { to: '/marks', label: 'Marks' },
    { to: '/results', label: 'Results' },
    { to: '/settings', label: 'Settings' },
  ];

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
    </aside>
  );
}
