import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import CryptoTable from '../components/CryptoTable';
import '../styles/pages.css';
import '../styles/Dashboard.css';
import { getWatchlistCoins } from '../utils/watchlist';
import { useSettings } from '../contexts/SettingsContext';
import { useNavigate } from 'react-router-dom';

export default function Portfolio() {
  const { t } = useSettings();
  const navigate = useNavigate();
  const [coins, setCoins] = useState(() => getWatchlistCoins());

  useEffect(() => {
    const loggedIn = !!localStorage.getItem('auth.token');
    if (!loggedIn) {
      navigate('/login');
      return;
    }
    const handler = () => setCoins(getWatchlistCoins());
    window.addEventListener('watchlist:change', handler);
    return () => window.removeEventListener('watchlist:change', handler);
  }, []);

  return (
    <div>
      <Navbar />
      <main className="dashboard-main container">
        <h2>Watchlist</h2>
        <p>Track selected cryptocurrencies here.</p>

        <div className="card" style={{ marginTop: 16 }}>
          {coins.length === 0 && <p>{t('noWatchlist')}</p>}
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