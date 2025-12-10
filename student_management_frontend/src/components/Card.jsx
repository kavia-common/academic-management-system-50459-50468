import React from 'react';

// PUBLIC_INTERFACE
export default function Card({ title, actions, children, className = '', headerRight }) {
  return (
    <section className={['card', className].filter(Boolean).join(' ')}>
      {(title || actions || headerRight) && (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ fontWeight: 600 }}>{title}</div>
          <div>{headerRight || actions}</div>
        </header>
      )}
      <div style={{ padding: '14px 16px' }}>
        {children}
      </div>
    </section>
  );
}
