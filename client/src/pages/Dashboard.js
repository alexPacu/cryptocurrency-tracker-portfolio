import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import CryptoTable from '../components/CryptoTable';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/coins?page=${currentPage}&per_page=${itemsPerPage}`);
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

  const totalMarketCap = coins.reduce((sum, coin) => sum + coin.market_cap, 0);
  const total24hVolume = coins.reduce((sum, coin) => sum + coin.total_volume, 0);
  const btcDominance = coins[0] ? ((coins[0].market_cap / totalMarketCap) * 100).toFixed(1) : "0.0";
  const activeCryptos = coins.length;

  return (
    <div className="dashboard">
      <Navbar />

      <main className="dashboard-main">
        <div className="stats-grid">
          <StatCard title="Market Cap" value="$1.2T" change="2.1%" isPositive={true} />
          <StatCard title="24h Volume" value="$88B" change="5.4%" isPositive={false} />
          <StatCard title="BTC Dominance" value={`${btcDominance}%`} change="0.8%" isPositive={true} />
          <StatCard title="Active Cryptos" value={activeCryptos.toLocaleString()} change="0.2%" isPositive={true} />
        </div>

        <div className="content-grid">
          <div className="main-content">
            <div className="card">
              <div className="card-header">
                <h2>Live Cryptocurrency Prices</h2>
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
              <button className="btn btn-primary btn-large">
                View Detailed Portfolio
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}