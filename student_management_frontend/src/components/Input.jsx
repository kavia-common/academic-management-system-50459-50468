import React from 'react';

// PUBLIC_INTERFACE
export function Input({ label, id, className = '', ...props }) {
  return (
    <label htmlFor={id} style={{ display: 'grid', gap: 6 }}>
      {label && <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600 }}>{label}</span>}
      <input id={id} className={['input', className].filter(Boolean).join(' ')} {...props} />
    </label>
  );
}

// PUBLIC_INTERFACE
export function Select({ label, id, children, className = '', ...props }) {
  return (
    <label htmlFor={id} style={{ display: 'grid', gap: 6 }}>
      {label && <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600 }}>{label}</span>}
      <select id={id} className={['select', className].filter(Boolean).join(' ')} {...props}>
        {children}
      </select>
    </label>
  );
}
