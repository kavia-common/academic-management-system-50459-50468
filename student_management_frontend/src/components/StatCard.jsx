import React from 'react';

// PUBLIC_INTERFACE
export default function StatCard({ label, value, trend }) {
  return (
    <div className="card" style={{ padding: 16, backgroundImage: 'var(--gradient-subtle)' }}>
      <div style={{ color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>{value}</div>
      {trend && <div style={{ marginTop: 4, color: trend > 0 ? '#065F46' : '#991B1B', fontSize: 12 }}>
        {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
      </div>}
    </div>
  );
}
