import React from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import '../styles/pages.css';

export default function NotFound() {
  return (
    <div>
      <Navbar />
      <main className="dashboard-main container">
        <h2>Page not found</h2>
        <p>The page you requested does not exist.</p>
        <p><Link to="/">Go back to Dashboard</Link></p>
      </main>
    </div>
  );
}