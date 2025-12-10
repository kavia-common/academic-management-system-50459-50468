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
        <div className="search" role="search">
          <span aria-hidden>🔍</span>
          <span style={{ color: 'var(--color-text-muted)' }}>Search</span>
        </div>
        <div aria-label="Profile" role="img" title="Profile" style={{ width: 32, height: 32, borderRadius: '50%', background: '#E5E7EB', display: 'grid', placeItems: 'center', border: '1px solid var(--color-border)' }}>👤</div>
      </div>
    </div>
  );
}
