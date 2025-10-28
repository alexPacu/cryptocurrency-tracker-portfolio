import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Navbar.css';
import { useSettings } from '../contexts/SettingsContext';

const Navbar = () => {
  const { t } = useSettings();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <span className="logo-icon">₿</span>
          Crypto Tracker
        </div>
        
        <div className="nav-items">
          <NavLink to="/" end className={({isActive}) => `nav-button ${isActive ? 'active' : ''}`}>
            {t('dashboard')}
          </NavLink>
          <NavLink to="/portfolio" className={({isActive}) => `nav-button ${isActive ? 'active' : ''}`}>
            {t('portfolio')}
          </NavLink>
          <NavLink to="/settings" className={({isActive}) => `nav-button ${isActive ? 'active' : ''}`}>
            {t('settings')}
          </NavLink>
          <button className="nav-button login-button">
            {t('login')}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;