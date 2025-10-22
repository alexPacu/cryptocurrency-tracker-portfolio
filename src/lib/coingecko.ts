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

interface ErrorResponse {
  status: {
    error_code: number;
    error_message: string;
  };
}

const COINGECKO_API = import.meta.env.VITE_COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';
const API_KEY = import.meta.env.VITE_COINGECKO_API_KEY;

const getHeaders = (): HeadersInit => {
  return API_KEY ? { 'x-cg-demo-api-key': API_KEY } : {};
};

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleResponse(response: Response) {
  if (response.status === 429) {
    await delay(60000);
    throw new Error('Rate limit exceeded. Please try again.');
  }

  if (!response.ok) {
    const errorData = await response.json() as ErrorResponse;
    throw new Error(
      errorData.status?.error_message || 
      `API Error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function fetchCoins(page = 1, perPage = 10): Promise<Coin[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=24h`,
      { headers: getHeaders() }
    );
    
    const data = await handleResponse(response);
    
    return data.map((coin: any) => ({
      ...coin,
      current_price: Number(coin.current_price),
      market_cap: Number(coin.market_cap),
      total_volume: Number(coin.total_volume),
      price_change_percentage_24h: Number(coin.price_change_percentage_24h || 0),
    }));
  } catch (error) {
    console.error('Error fetching coins:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch cryptocurrency data: ${error.message}`);
    }
    throw new Error('Failed to fetch cryptocurrency data');
  }
}

export async function fetchCoinDetails(id: string) {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`,
      { headers: getHeaders() }
    );
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching coin details:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch coin details: ${error.message}`);
    }
    throw new Error('Failed to fetch coin details');
  }
}

export async function searchCoins(query: string): Promise<Coin[]> {
  if (!query.trim()) return [];
  
  try {
    const response = await fetch(
      `${COINGECKO_API}/search?query=${encodeURIComponent(query)}`,
      { headers: getHeaders() }
    );
    
    const data = await handleResponse(response);
    
    const coinIds = data.coins.slice(0, 10).map((c: any) => c.id).join(',');
    if (!coinIds) return [];
    
    const detailsResponse = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${coinIds}&sparkline=false`,
      { headers: getHeaders() }
    );
    
    return await handleResponse(detailsResponse);
  } catch (error) {
    console.error('Error searching coins:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to search coins: ${error.message}`);
    }
    throw new Error('Failed to search coins');
  }
}
