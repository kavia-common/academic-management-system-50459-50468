import React, { useMemo, useState } from 'react';
import Button from '../components/Button';
import { Input, Select } from '../components/Input';
import Card from '../components/Card';
import { useAuth } from '../auth/AuthContext';

/**
 * PUBLIC_INTERFACE
 * Signup page for new Admin/Teacher users.
 * Uses env-based API base URL via authApi placeholders. Role selection is optional; defaults to 'teacher'.
 */
export default function Signup() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'teacher' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [allowRoleSelection] = useState(() => {
    // Toggle this to false if backend policy restricts role selection.
    // Leaving true for demo purposes with a note in README.
    return true;
  });

  const passwordMismatch = useMemo(() => {
    return form.password && form.confirm && form.password !== form.confirm;
  }, [form.password, form.confirm]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (passwordMismatch) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    const role = allowRoleSelection ? form.role : 'teacher';
    const res = await register(form.name, form.email, form.password, role);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error || 'Signup failed');
    }
  }

  return (
    <div className="container" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <Card title="Create your account">
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }} noValidate>
            <Input
              id="name"
              label="Full name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              placeholder="Jane Doe"
            />
            <Input
              id="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              placeholder="you@example.com"
            />
            <div className="row" style={{ gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Input
                  id="password"
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  placeholder="••••••••"
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Input
                  id="confirm"
                  label="Confirm password"
                  type="password"
                  value={form.confirm}
                  onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>
            {allowRoleSelection ? (
              <Select
                id="role"
                label="Role"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </Select>
            ) : (
              <input type="hidden" value="teacher" readOnly />
            )}
            {passwordMismatch ? (
              <div role="alert" style={{ color: 'var(--color-error)', fontSize: 14 }}>
                Passwords do not match.
              </div>
            ) : null}
            {error ? (
              <div role="alert" style={{ color: 'var(--color-error)', fontSize: 14 }}>
                {error}
              </div>
            ) : null}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 6 }}>
              <a className="btn ghost" href="/login" style={{ textDecoration: 'none' }}>
                Back to Login
              </a>
              <Button type="submit" disabled={submitting || passwordMismatch}>
                {submitting ? 'Creating account…' : 'Sign up'}
              </Button>
            </div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
              Note: This demo uses placeholder API endpoints and env-based base URL. Wire to your backend when ready.
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
