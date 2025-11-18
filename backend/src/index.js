require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../client/build')));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cryptocurrency-tracker';
mongoose.set('strictQuery', false);
mongoose.set('bufferCommands', false);

const User = require('../../db/User')(mongoose);
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(' Connected to MongoDB'))
  .catch(err => console.error(' MongoDB connection error:', err.message));

const COINMARKETCAP_API = 'https://pro-api.coinmarketcap.com/v1';
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

const cache = new Map();
function setCache(key, data, ttl = 10000) {
  cache.set(key, { ts: Date.now(), ttl, data });
}
function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > entry.ttl) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function dbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1; // 1 = connected
}

async function upstreamFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const err = new Error(`Upstream ${res.status}: ${text}`);
      err.status = res.status;
      throw err;
    }
    return res.json();
  } catch (error) {
    throw error;
  }
}


app.post('/api/auth/register', async (req, res) => {
  try {
    if (!dbConnected()) {
      return res.status(503).json({ error: 'Database unavailable. Please try again later.' });
    }
    const { email, username, password, confirm } = req.body;

    if (!email || !username || !password || !confirm) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirm) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.trim() }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(400).json({ error: 'Email already registered' });
      } else {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    const newUser = new User({
      email: email.toLowerCase(),
      username: username.trim(),
      password: password,
      role: 'user',
      isActive: true
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    if (!dbConnected()) {
      return res.status(503).json({ error: 'Database unavailable. Please try again later.' });
    }
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Logged in successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message || 'Login failed' });
  }
});

app.get('/api/health', (req, res) => {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  res.json({
    status: 'ok',
    port: PORT,
    db: stateMap[mongoose.connection.readyState] || 'unknown'
  });
});

app.get('/api/coins', async (req, res) => {
  try {
    if (!COINMARKETCAP_API_KEY) {
      return res.status(500).json({ error: 'CoinMarketCap API key is not configured' });
    }

    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const per_page = Math.max(1, Math.min(250, parseInt(req.query.per_page || '10', 10)));
    const currency = (req.query.currency || req.query.vs_currency || 'USD').toUpperCase();

    const cacheKey = `coins:p${page}:pp${per_page}:c${currency}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const start = (page - 1) * per_page + 1;
    const url = `${COINMARKETCAP_API}/cryptocurrency/listings/latest?start=${start}&limit=${per_page}&convert=${currency}`;
    const headers = {
      Accept: 'application/json',
      'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY
    };

    const data = await upstreamFetch(url, { headers });

    const transformed = (data.data || []).map(coin => ({
      id: coin.slug || coin.id.toString(),
      name: coin.name,
      symbol: coin.symbol.toLowerCase(),
      image: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
      current_price: coin.quote?.[currency]?.price ?? 0,
      market_cap: coin.quote?.[currency]?.market_cap ?? 0,
      market_cap_rank: coin.cmc_rank,
      total_volume: coin.quote?.[currency]?.volume_24h ?? 0,
      price_change_percentage_1h: coin.quote?.[currency]?.percent_change_1h ?? 0,
      price_change_percentage_24h: coin.quote?.[currency]?.percent_change_24h ?? 0,
      price_change_percentage_7d: coin.quote?.[currency]?.percent_change_7d ?? 0,
      sparkline_in_7d: null
    }));

    setCache(cacheKey, transformed, 10000);
    res.json(transformed);
  } catch (error) {
    console.error('GET /api/coins error:', error);
    res.status(error.status || 500).json({ error: error.message || 'Failed to fetch coins' });
  }
});

app.get('/api/coins/:id', async (req, res) => {
  try {
    if (!COINMARKETCAP_API_KEY) {
      return res.status(500).json({ error: 'CoinMarketCap API key is not configured' });
    }

    const id = req.params.id;
    const cacheKey = `coin:${id}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const headers = {
      Accept: 'application/json',
      'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY
    };

    const infoUrl = `${COINMARKETCAP_API}/cryptocurrency/info?slug=${encodeURIComponent(id)}`;
    const info = await upstreamFetch(infoUrl, { headers });
    const coinData = Object.values(info.data || {})[0];

    if (!coinData) {
      return res.status(404).json({ error: 'Coin not found' });
    }

    const quotesUrl = `${COINMARKETCAP_API}/cryptocurrency/quotes/latest?slug=${encodeURIComponent(id)}&convert=USD`;
    const quotes = await upstreamFetch(quotesUrl, { headers }).catch(() => null);
    const quoteData = quotes && Object.values(quotes.data || {})[0];

    const transformed = {
      id: coinData.slug,
      name: coinData.name,
      symbol: coinData.symbol,
      image: {
        large: `https://s2.coinmarketcap.com/static/img/coins/200x200/${coinData.id}.png`,
        small: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coinData.id}.png`
      },
      description: { en: coinData.description || '' },
      market_data: {
        current_price: { usd: quoteData?.quote?.USD?.price ?? 0 },
        market_cap: { usd: quoteData?.quote?.USD?.market_cap ?? 0 },
        price_change_percentage_24h: quoteData?.quote?.USD?.percent_change_24h ?? 0
      }
    };

    setCache(cacheKey, transformed, 60000);
    res.json(transformed);
  } catch (error) {
    console.error('GET /api/coins/:id error:', error);
    res.status(error.status || 500).json({ error: error.message || 'Failed to fetch coin' });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    if (!COINMARKETCAP_API_KEY) {
      return res.status(500).json({ error: 'CoinMarketCap API key is not configured' });
    }

    const query = (req.query.query || req.query.q || '').trim().toLowerCase();
    if (!query || query.length < 1) {
      return res.json([]);
    }

    const allCoinsCacheKey = 'cmc:all-coins';
    let allCoins = getCache(allCoinsCacheKey);

    if (!allCoins) {
      const url = `${COINMARKETCAP_API}/cryptocurrency/map`;
      const headers = { 'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY };
      const mapData = await upstreamFetch(url, { headers });
      allCoins = (mapData.data || []).filter(c => c.is_active === 1);
      setCache(allCoinsCacheKey, allCoins, 24 * 60 * 60 * 1000);
    }

    const filtered = allCoins
      .filter(coin => {
        const name = (coin.name || '').toLowerCase();
        const symbol = (coin.symbol || '').toLowerCase();
        return name.includes(query) || symbol.includes(query) || symbol === query;
      })
      .sort((a, b) => {
        const aSymbolMatch = (a.symbol || '').toLowerCase() === query;
        const bSymbolMatch = (b.symbol || '').toLowerCase() === query;
        if (aSymbolMatch && !bSymbolMatch) return -1;
        if (!aSymbolMatch && bSymbolMatch) return 1;
        return (a.rank || 9999) - (b.rank || 9999);
      })
      .slice(0, 20)
      .map(coin => ({
        id: coin.slug || coin.id.toString(),
        name: coin.name,
        symbol: coin.symbol,
        market_cap_rank: coin.rank,
        thumb: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`
      }));

    res.json(filtered);
  } catch (error) {
    console.error('GET /api/search error:', error);
    res.status(error.status || 500).json({ error: error.message || 'Search failed' });
  }
});

app.get('/api/coins/:id/sparkline', async (req, res) => {
  try {
    const id = req.params.id;
    const currency = (req.query.currency || 'USD').toLowerCase();
    const days = Math.max(1, Math.min(30, parseInt(req.query.days || '7', 10)));

    const cacheKey = `spark:${id}:${currency}:${days}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json({ prices: cached });

    const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart?vs_currency=${encodeURIComponent(currency)}&days=${days}`;
    const data = await upstreamFetch(url);
    const prices = (data.prices || []).map((p) => p[1]);

    setCache(cacheKey, prices, 60 * 60 * 1000);
    res.json({ prices });
  } catch (error) {
    console.error('GET /api/coins/:id/sparkline error:', error.message || error);
    res.json({ prices: [] });
  }
});


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n Server running on http://localhost:${PORT}\n`);
  
  if (!COINMARKETCAP_API_KEY) {
    console.warn('  COINMARKETCAP_API_KEY not configured');
  } else {
    console.log(' CoinMarketCap API configured');
  }
  
  if (!JWT_SECRET) {
    console.warn('  JWT_SECRET should be set in .env for production');
  }
});
