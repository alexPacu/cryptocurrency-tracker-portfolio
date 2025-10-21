export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export async function fetchCoins(page = 1, perPage = 100): Promise<Coin[]> {
  const response = await fetch(
    `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch coins');
  }
  
  return response.json();
}

export async function fetchCoinDetails(id: string) {
  const response = await fetch(
    `${COINGECKO_API}/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch coin details');
  }
  
  return response.json();
}

export async function searchCoins(query: string): Promise<Coin[]> {
  if (!query.trim()) return [];
  
  const response = await fetch(
    `${COINGECKO_API}/search?query=${encodeURIComponent(query)}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to search coins');
  }
  
  const data = await response.json();
  
  // Get detailed info for top 10 results
  const coinIds = data.coins.slice(0, 10).map((c: any) => c.id).join(',');
  if (!coinIds) return [];
  
  const detailsResponse = await fetch(
    `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${coinIds}&sparkline=false`
  );
  
  return detailsResponse.json();
}
