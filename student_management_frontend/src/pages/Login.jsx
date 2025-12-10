import React, { useState } from 'react';
import Button from '../components/Button';
import { Input } from '../components/Input';
import Card from '../components/Card';
import { useAuth } from '../auth/AuthContext';

/**
 * PUBLIC_INTERFACE
 * Login page for Admin/Teacher users.
 * Reads backend base URL from environment (via config/api) and uses placeholder authApi endpoints.
 */
export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await login(form.email, form.password);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error || 'Login failed');
    }
  }

  return (
    <div className="container" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Card title="Sign in">
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
            <Input
              id="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              placeholder="you@example.com"
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              placeholder="••••••••"
            />
            {error ? (
              <div role="alert" style={{ color: 'var(--color-error)', fontSize: 14 }}>
                {error}
              </div>
            ) : null}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
              Tip: This demo expects backend wiring later. Use valid credentials once backend is ready.
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
