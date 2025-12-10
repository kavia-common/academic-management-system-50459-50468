import React from 'react';

// PUBLIC_INTERFACE
export default function Button({ children, variant = 'primary', type = 'button', className = '', ...props }) {
  const classes = ['btn', variant === 'primary' ? '' : variant, className].filter(Boolean).join(' ');
  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
