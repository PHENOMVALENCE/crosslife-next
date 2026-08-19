'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const form = new FormData(e.currentTarget);
    const body = {
      full_name: String(form.get('full_name')),
      email: String(form.get('email')),
      phone: String(form.get('phone')),
      password: String(form.get('password')),
    };

    try {
      const res = await fetch('/api/auth/student/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message);
        setTimeout(() => router.push('/student/login'), 2500);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cl-auth">
      <div className="cl-auth__shell">
        <div className="cl-auth__brand">
          <img src="/assets/img/logo.png" alt="CrossLife" className="cl-auth__logo" />
          <h1>Create Account</h1>
          <p>Join the School of Christ Academy</p>
        </div>
        <div className="cl-auth__card">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit} autoComplete="on">
            <div className="cl-auth__field">
              <label htmlFor="full_name" className="form-label">Full name *</label>
              <input type="text" className="form-control" id="full_name" name="full_name" required />
            </div>
            <div className="cl-auth__field">
              <label htmlFor="email" className="form-label">Email *</label>
              <input type="email" className="form-control" id="email" name="email" required />
            </div>
            <div className="cl-auth__field">
              <label htmlFor="phone" className="form-label">Phone</label>
              <input type="tel" className="form-control" id="phone" name="phone" />
            </div>
            <div className="cl-auth__field">
              <label htmlFor="password" className="form-label">Password *</label>
              <input type="password" className="form-control" id="password" name="password" minLength={8} required />
            </div>
            <button type="submit" className="cl-auth__submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Register'}
            </button>
          </form>
          <p className="cl-auth__footer mt-3">
            Already have an account? <Link href="/student/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
