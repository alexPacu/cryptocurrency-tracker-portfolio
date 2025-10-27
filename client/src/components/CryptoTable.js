import React from 'react';
import '../styles/CryptoTable.css';

const CryptoTable = ({ 
  coins, 
  loading, 
  currentPage, 
  onPageChange, 
  itemsPerPage, 
  onItemsPerPageChange,
  totalPages 
}) => {
  const formatNumber = (num) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="crypto-table-container">
      <div className="table-responsive">
        <table className="crypto-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th className="text-right">Price</th>
              <th className="text-right">24h %</th>
              <th className="text-right">Market Cap</th>
              <th className="text-right">24h Volume</th>
              <th className="text-right">24h Trend</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin) => {
              const isPositive = coin.price_change_percentage_24h > 0;
              return (
                <tr key={coin.id} className="crypto-row">
                  <td>{coin.market_cap_rank}</td>
                  <td>
                    <div className="coin-info">
                      <img src={coin.image} alt={coin.name} />
                      <div>
                        <div className="coin-name">{coin.name}</div>
                        <div className="coin-symbol">{coin.symbol.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right">
                    {formatNumber(coin.current_price)}
                  </td>
                  <td className={`text-right ${isPositive ? 'percentage-up' : 'percentage-down'}`}>
                    <div className="change-container">
                      <span className="trend-arrow">
                        {isPositive ? '↑' : '↓'}
                      </span>
                      {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </div>
                  </td>
                  <td className="text-right">
                    {formatNumber(coin.market_cap)}
                  </td>
                  <td className="text-right">
                    {formatNumber(coin.total_volume)}
                  </td>
                  <td className="text-right">
                    {coin.sparkline_in_7d && (
                      <div className="sparkline">
                        <svg viewBox="0 0 100 30" width="100" height="30">
                          <polyline
                            points={coin.sparkline_in_7d.price
                              .map((price, i) => {
                                const x = (i / (coin.sparkline_in_7d.price.length - 1)) * 100;
                                const min = Math.min(...coin.sparkline_in_7d.price);
                                const max = Math.max(...coin.sparkline_in_7d.price);
                                const y = 30 - ((price - min) / (max - min)) * 30;
                                return `${x},${y}`;
                              })
                              .join(' ')}
                            fill="none"
                            stroke={isPositive ? 'var(--success)' : 'var(--error)'}
                            strokeWidth="1"
                          />
                        </svg>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="items-per-page">
          <span>Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          >
            {[10, 25, 50, 100].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <span>entries</span>
        </div>

        <div className="pagination">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="page-btn"
          >
            ←
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
              >
                {pageNum}
              </button>
            );
          })}
          
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className="ellipsis">...</span>
          )}
          
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <button
              onClick={() => onPageChange(totalPages)}
              className="page-btn"
            >
              {totalPages}
            </button>
          )}

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CryptoTable;