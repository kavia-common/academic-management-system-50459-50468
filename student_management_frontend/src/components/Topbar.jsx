import React from 'react';

// PUBLIC_INTERFACE
export default function Topbar() {
  return (
    <div className="header" role="banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-primary)' }} aria-hidden />
        <strong>Student Management</strong>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          Welcome
        </div>
      </div>
    </div>
  );
}
