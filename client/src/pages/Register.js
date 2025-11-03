import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/pages.css';
import { toast } from 'react-toastify';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const validateEmail = (e) => /\S+@\S+\.\S+/.test(e);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !username || !password || !confirm) {
      toast.error('Please fill all fields');
      return;
    }
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }

    setBusy(true);
    try {
      // Placeholder: replace with actual registration API call
      await new Promise((r) => setTimeout(r, 800));
      toast.success('Registered successfully. Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="dashboard-main container">
        <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2>Register</h2>
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 12 }}>
            <label>
              Email
              <input
                aria-label="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: 8, marginTop: 6, borderRadius: 4, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)' }}
              />
            </label>

            <label>
              Username
              <input
                aria-label="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ width: '100%', padding: 8, marginTop: 6, borderRadius: 4, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)' }}
              />
            </label>

            <label>
              Password
              <input
                aria-label="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: 8, marginTop: 6, borderRadius: 4, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)' }}
              />
            </label>

            <label>
              Confirm Password
              <input
                aria-label="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                style={{ width: '100%', padding: 8, marginTop: 6, borderRadius: 4, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)' }}
              />
            </label>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" type="submit" disabled={busy} style={{ flex: 1 }}>
                {busy ? 'Registering...' : 'Register'}
              </button>
              <Link to="/login" className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 1rem', borderRadius: 4 }}>
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}