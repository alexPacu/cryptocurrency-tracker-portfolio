import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/pages.css';

const API_BASE = process.env.REACT_APP_API_BASE || '';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromGoogle = params.get('token');
    if (tokenFromGoogle) {
      try {
        const payload = JSON.parse(atob(tokenFromGoogle.split('.')[1]));
        const user = {
          _id: payload.sub,
          username: payload.name || payload.email?.split('@')[0] || 'User',
          email: payload.email
        };
        localStorage.setItem('auth.token', tokenFromGoogle);
        localStorage.setItem('auth.user', JSON.stringify(user));
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Failed to parse Google token:', err);
        setError('Google login failed. Please try again.');
      }
    }
  }, [location.search, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setBusy(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('auth.user', JSON.stringify(data.user));
      localStorage.setItem('auth.token', data.token);

      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = () => {
    const base = API_BASE || '';
    window.location.href = `${base}/api/auth/google`;
  };

  return (
    <div>
      <Navbar />
      <main className="dashboard-main container">
        <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2>Login</h2>
          {error && (
            <div
              style={{
                color: '#ef4444',
                marginBottom: '1rem',
                padding: '0.5rem',
                background: '#fee2e2',
                borderRadius: '4px'
              }}
            >
              {error}
            </div>
          )}
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 12 }}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 8,
                  marginTop: 6,
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text)'
                }}
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 8,
                  marginTop: 6,
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text)'
                }}
              />
            </label>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" type="submit" disabled={busy} style={{ flex: 1 }}>
                {busy ? 'Logging in...' : 'Login'}
              </button>
              <Link
                to="/register"
                className="btn btn-ghost"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 1rem', borderRadius: 4 }}
              >
                Register
              </Link>
            </div>
          </form>

          <div style={{ marginTop: 16 }}>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={handleGoogle}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}