import React from 'react';
import '../styles/StatCard.css';

const StatCard = ({ title, value, change, isPositive }) => {
  return (
    <div className="stat-card">
      <h3 className="stat-title">{title}</h3>
      <div className="stat-value">{value}</div>
      {change != null && change !== '' && (
        <div className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
          <span className="trend-arrow">{isPositive ? '↑' : '↓'}</span>
          {change}
        </div>
      )}
    </div>
  );
};

export default StatCard;