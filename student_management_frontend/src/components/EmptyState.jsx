import React from 'react';
import Button from './Button';

// PUBLIC_INTERFACE
export default function EmptyState({ title = 'No data', description = 'There is nothing here yet.', actionLabel, onAction }) {
  return (
    <div className="card" style={{ padding: 24, textAlign: 'center' }}>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{title}</div>
      <div style={{ color: 'var(--color-text-muted)', marginBottom: 14 }}>{description}</div>
      {actionLabel && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
