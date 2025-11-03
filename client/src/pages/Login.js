import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/pages.css';
import { toast } from 'react-toastify';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setBusy(true);
    try {
      // Placeholder: replace with real auth API call
      // const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      // handle real response here
      await new Promise(r => setTimeout(r, 700));
      localStorage.setItem('auth.user', JSON.stringify({ email }));
      toast.success('Logged in');
      navigate('/portfolio');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="dashboard-main container">
        <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2>Login</h2>
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 12 }}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: 8, marginTop: 6, borderRadius: 4, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)' }}
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: 8, marginTop: 6, borderRadius: 4, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)' }}
              />
            </label>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" type="submit" disabled={busy} style={{ flex: 1 }}>
                {busy ? 'Logging in...' : 'Login'}
              </button>
              <Link to="/register" className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 1rem', borderRadius: 4 }}>
                Register
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}