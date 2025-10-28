import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import CryptoTable from '../components/CryptoTable';
import '../styles/Dashboard.css';
import { useSettings } from '../contexts/SettingsContext';

export default function Dashboard() {
  const { currency } = useSettings();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
    // refetch when currency changes
  }, [currentPage, itemsPerPage, currency]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/coins?page=${currentPage}&per_page=${itemsPerPage}&currency=${encodeURIComponent(currency)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setCoins(data);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch cryptocurrency data');
    } finally {
      setLoading(false);
    }
  };

  const totalMarketCap = coins.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
  const total24hVolume = coins.reduce((sum, coin) => sum + (coin.total_volume || 0), 0);
  const btcDominance = coins[0] ? ((coins[0].market_cap / (totalMarketCap || 1)) * 100).toFixed(1) : "0.0";
  const activeCryptos = coins.length;

  return (
    <div className="dashboard">
      <Navbar />

      <main className="dashboard-main">
        <div className="stats-grid">
          <StatCard title="Market Cap" value={totalMarketCap ? `$${(totalMarketCap/1e9).toFixed(2)}B` : '$0'} change="2.1%" isPositive={true} />
          <StatCard title="24h Volume" value={total24hVolume ? `$${(total24hVolume/1e9).toFixed(2)}B` : '$0'} change="5.4%" isPositive={false} />
          <StatCard title="BTC Dominance" value={`${btcDominance}%`} change="0.8%" isPositive={true} />
          <StatCard title="Active Cryptos" value={activeCryptos.toLocaleString()} change="0.2%" isPositive={true} />
        </div>

        <div className="content-grid">
          <div className="main-content">
            <div className="card">
              <div className="card-header">
                <h2>Live Cryptocurrency Prices ({currency.toUpperCase()})</h2>
                <button 
                  className="btn btn-ghost"
                  onClick={fetchData}
                  disabled={loading}
                >
                  Refresh
                </button>
              </div>
              <CryptoTable 
                coins={coins} 
                loading={loading} 
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalPages={Math.ceil(250 / itemsPerPage)}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}