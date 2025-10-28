import React from 'react';
import '../styles/Dashboard.css';

export default function PortfolioSummary() {
  return (
    <div className="portfolio-summary card">
      <h2>Portfolio Summary</h2>
      <div className="portfolio-stats">
        <div className="stat-item">
          <p className="stat-label">Total Portfolio Value</p>
          <p className="stat-value">$12,345.67</p>
        </div>
        <div className="stat-item">
          <p className="stat-label">Total Profit/Loss</p>
          <p className="stat-value success">
            $2,100.45 <span>(+17.01%)</span>
          </p>
        </div>
        <div className="stat-item">
          <p className="stat-label">Overall ROI</p>
          <p className="stat-value success">20.5%</p>
        </div>

        <button className="btn btn-primary btn-large" style={{ marginTop: 12 }}>
          View Detailed Portfolio
        </button>
      </div>
    </div>
  );
}