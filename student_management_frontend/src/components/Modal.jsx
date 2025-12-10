import React, { useEffect } from 'react';
import Button from './Button';

// PUBLIC_INTERFACE
export default function Modal({ open, title, onClose, children, footer }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose?.(); }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title || 'dialog'} onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="modal" role="document">
        {title && <header>{title}</header>}
        <div className="body">{children}</div>
        <div className="footer">
          {footer || <Button variant="ghost" onClick={onClose}>Close</Button>}
        </div>
      </div>
    </div>
  );
}
