//
// Ocean Professional theme tokens and helpers
//
export const colors = {
  primary: '#2563EB', // blue-600
  secondary: '#F59E0B', // amber-500
  success: '#10B981', // emerald-500 (better for success color)
  warning: '#F59E0B',
  error: '#EF4444', // red-500
  background: '#f9fafb',
  surface: '#ffffff',
  text: '#111827',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  focus: '#93C5FD',
  overlay: 'rgba(17,24,39,0.5)',
};

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.07)',
  lg: '0 10px 15px rgba(0,0,0,0.12)',
};

export const radii = {
  sm: '6px',
  md: '10px',
  lg: '14px',
  pill: '9999px',
};

export const transitions = {
  base: 'all 200ms ease',
};

export const gradients = {
  subtle: `linear-gradient(135deg, rgba(59,130,246,0.08), rgba(243,244,246,1))`, // blue-500/10 to gray-50
};

export const theme = {
  colors,
  shadows,
  radii,
  transitions,
  gradients,
};

// PUBLIC_INTERFACE
export function applyThemeToDocument() {
  /** Apply CSS variables to document root for usage in CSS files. */
  const root = document.documentElement;
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-success', colors.success);
  root.style.setProperty('--color-warning', colors.warning);
  root.style.setProperty('--color-error', colors.error);
  root.style.setProperty('--color-bg', colors.background);
  root.style.setProperty('--color-surface', colors.surface);
  root.style.setProperty('--color-text', colors.text);
  root.style.setProperty('--color-text-muted', colors.textMuted);
  root.style.setProperty('--color-border', colors.border);
  root.style.setProperty('--shadow-sm', shadows.sm);
  root.style.setProperty('--shadow-md', shadows.md);
  root.style.setProperty('--shadow-lg', shadows.lg);
  root.style.setProperty('--radius-sm', radii.sm);
  root.style.setProperty('--radius-md', radii.md);
  root.style.setProperty('--radius-lg', radii.lg);
  root.style.setProperty('--radius-pill', radii.pill);
  root.style.setProperty('--gradient-subtle', gradients.subtle);
}
