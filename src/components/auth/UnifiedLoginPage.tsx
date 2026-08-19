'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

export default function UnifiedLoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode = searchParams.get('mode') === 'admin' ? 'admin' : 'student';
  const [mode, setMode] = useState<'student' | 'admin'>(initialMode);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');
  const [flashType, setFlashType] = useState('danger');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const msg = searchParams.get('flash');
    const type = searchParams.get('flash_type') || 'danger';
    if (msg) {
      setFlash(msg);
      setFlashType(type);
    }
  }, [searchParams]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body: Record<string, string> = {};
    formData.forEach((v, k) => {
      body[k] = String(v);
    });

    const endpoint = mode === 'admin' ? '/api/auth/admin/login' : '/api/auth/student/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        router.push(data.redirect || (mode === 'admin' ? '/admin' : '/student/dashboard'));
        router.refresh();
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cl-auth">
      <div className="cl-auth__shell">
        <div className="cl-auth__brand">
          <img src="/assets/img/logo.png" alt="CrossLife" className="cl-auth__logo" />
          <h1>School of Christ Academy</h1>
          <p>Sign in to your account</p>
        </div>

        <div className="cl-auth__card">
          <div className="cl-auth__tabs" role="tablist">
            <button
              type="button"
              className={`cl-auth__tab${mode === 'student' ? ' is-active' : ''}`}
              onClick={() => setMode('student')}
            >
              Student
            </button>
            <button
              type="button"
              className={`cl-auth__tab${mode === 'admin' ? ' is-active' : ''}`}
              onClick={() => setMode('admin')}
            >
              Admin
            </button>
          </div>

          {flash && (
            <div className={`alert alert-${flashType === 'success' ? 'success' : flashType === 'warning' ? 'warning' : 'danger'} py-3`}>
              {flash}
            </div>
          )}

          {error && (
            <div className="alert alert-danger py-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="on">
            {mode === 'student' ? (
              <>
                <div className="cl-auth__field">
                  <label htmlFor="student_email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="student_email"
                    name="email"
                    required
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                <div className="cl-auth__field">
                  <label htmlFor="student_password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="student_password"
                    name="password"
                    required
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <div className="cl-auth__forgot">
                    <Link className="cl-auth__forgot-link" href="/student/forgot-password">
                      Forgot your password?
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="cl-auth__field">
                  <label htmlFor="admin_username" className="form-label">
                    Username or email
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="admin_username"
                    name="username"
                    required
                    placeholder="admin@crosslife.org"
                    autoComplete="username"
                  />
                </div>
                <div className="cl-auth__field">
                  <label htmlFor="admin_password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="admin_password"
                    name="password"
                    required
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </div>
              </>
            )}
            <button type="submit" className="cl-auth__submit" disabled={loading}>
              <i className={`bi bi-${mode === 'admin' ? 'shield-lock' : 'box-arrow-in-right'}`}></i>{' '}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {mode === 'student' && (
            <>
              <div className="cl-auth__divider my-3 text-center text-muted small">or</div>
              <a href="/api/auth/google" className="btn btn-outline-dark w-100 mb-2">
                <i className="bi bi-google me-2"></i>Sign in with Google
              </a>
            </>
          )}

          {mode === 'student' && (
            <p className="cl-auth__footer">
              Don&apos;t have an account? <Link href="/student/register">Create one</Link>
            </p>
          )}
          {mode === 'admin' && (
            <p className="cl-auth__note mb-0">
              <i className="bi bi-info-circle"></i> Cross Admin access is for authorised staff only.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
