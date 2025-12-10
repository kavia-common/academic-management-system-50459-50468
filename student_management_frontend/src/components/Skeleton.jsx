import React from 'react';

// PUBLIC_INTERFACE
export function Skeleton({ height = 14, width = '100%', style }) {
  return <div className="skeleton" style={{ height, width, ...style }} aria-hidden="true" />;
}

// PUBLIC_INTERFACE
export function ListSkeleton({ rows = 5 }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 100px', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <Skeleton height={14} />
          <Skeleton height={14} />
          <Skeleton height={14} />
          <Skeleton height={28} />
        </div>
      ))}
    </div>
  );
}
