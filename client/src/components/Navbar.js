import React, { useMemo, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import { useSettings } from '../contexts/SettingsContext';

const Navbar = () => {
  const { t, theme, setTheme } = useSettings();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem('auth.user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const isLoggedIn = !!localStorage.getItem('auth.token');

  const handleLogout = () => {
    localStorage.removeItem('auth.user');
    localStorage.removeItem('auth.token');
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="brand">
          <Link to="/" className="logo">
            <span className="logo-icon">₿</span>
            Crypto Tracker
          </Link>
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? '☀️' : '🌙'}
          </button>
        </div>
        
        <div className="nav-items">
          {isLoggedIn && (
            <NavLink to="/watchlist" className={({isActive}) => `nav-button ${isActive ? 'active' : ''}`}>
              {t('watchlist')}
            </NavLink>
          )}
          <NavLink to="/portfolio" className={({isActive}) => `nav-button ${isActive ? 'active' : ''}`}>
            {t('portfolio')}
          </NavLink>

          {isLoggedIn ? (
            <div className="profile-menu">
              <button className="nav-button" onClick={() => setMenuOpen(v => !v)} aria-haspopup="true" aria-expanded={menuOpen}>
                {user?.username ? user.username : 'Profile'}
              </button>
              {menuOpen && (
                <div className="menu" role="menu">
                  <button className="menu-item" onClick={() => { setMenuOpen(false); navigate('/settings'); }} role="menuitem">
                    {t('settings')}
                  </button>
                  <button className="menu-item" onClick={handleLogout} role="menuitem">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className="nav-button login-button">
              {t('login')}
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;