import React from 'react';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">
          <span className="logo-icon">₿</span>
          Crypto Tracker
        </div>
        
        <div className="nav-items">
          <button className="nav-button">
            Dashboard
          </button>
          <button className="nav-button">
            Portfolio
          </button>
          <button className="nav-button login-button">
            Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;