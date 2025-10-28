import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import CryptoTable from '../components/CryptoTable';
import PortfolioSummary from '../components/PortfolioSummary';
import '../styles/pages.css';
import '../styles/Dashboard.css'; // keep the .portfolio-summary styles
import { getPortfolioCoins } from '../utils/portfolio';

export default function Portfolio() {
  const [coins, setCoins] = useState(() => getPortfolioCoins());

  useEffect(() => {
    const handler = () => setCoins(getPortfolioCoins());
    window.addEventListener('portfolio:change', handler);
    return () => window.removeEventListener('portfolio:change', handler);
  }, []);

  return (
    <div>
      <Navbar />
      <main className="dashboard-main container">
        <h2>Portfolio</h2>
        <p>Kevesebb helyfoglalás — itt tarthatod a kiválasztott kriptóidat.</p>

        <PortfolioSummary />

        <div className="card" style={{ marginTop: 16 }}>
          {coins.length === 0 && <p>No coins in portfolio yet. Add coins from the Dashboard.</p>}
          {coins.length > 0 && (
            <CryptoTable
              coins={coins}
              loading={false}
              currentPage={1}
              onPageChange={() => {}}
              itemsPerPage={coins.length}
              onItemsPerPageChange={() => {}}
              totalPages={1}
              hidePagination={true}
            />
          )}
        </div>
      </main>
    </div>
  );
}