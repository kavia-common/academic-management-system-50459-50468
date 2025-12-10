import React from 'react';

// PUBLIC_INTERFACE
export default function Badge({ children, tone = 'info', className = '', ...props }) {
  const classes = ['badge', tone, className].filter(Boolean).join(' ');
  return (
    <span className={classes} {...props}>{children}</span>
  );
}
