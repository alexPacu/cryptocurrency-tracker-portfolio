require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const User = require('./db/User');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cryptocurrency-tracker';
mongoose.connect(MONGODB_URI)
  .then(() => console.log(' Connected to MongoDB'))
  .catch(err => console.error(' MongoDB connection error:', err.message));

app.use(express.static(path.join(__dirname, 'client/build')));

function transformCoinData(coin, currency = 'USD') {
  const currencyUpper = currency.toUpperCase();
  const quote = coin.quote[currencyUpper] || coin.quote.USD;
  return {
    id: coin.slug || coin.id.toString(),
    name: coin.name,
    symbol: coin.symbol.toLowerCase(),
    image: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
    current_price: quote.price,
    market_cap: quote.market_cap,
    market_cap_rank: coin.cmc_rank,
    total_volume: quote.volume_24h,
    price_change_percentage_24h: quote.percent_change_24h,
    sparkline_in_7d: null,
  };
}


app.post('/api/auth/register', async (req, res) => {
  try {
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

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
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

    return res.json({
      message: 'Logged in successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message || 'Login failed' });
  }
});


const COINMARKETCAP_API = 'https://pro-api.coinmarketcap.com/v1';
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

app.get('/api/coins', async (req, res) => {
  try {
    if (!COINMARKETCAP_API_KEY) {
      return res.status(500).json({ error: 'CoinMarketCap API key is not configured' });
    }

    const { page = 1, per_page = 10 } = req.query;
    const currency = req.query.currency || req.query.vs_currency || 'USD';
    
    const start = (parseInt(page) - 1) * parseInt(per_page) + 1;
    const limit = parseInt(per_page);

    const url = `${COINMARKETCAP_API}/cryptocurrency/listings/latest?start=${start}&limit=${limit}&convert=${currency}`;

    const headers = {
      'Accept': 'application/json',
      'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
    };

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('CoinMarketCap API error:', response.status, errorText);
      throw new Error(`CoinMarketCap API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const transformedData = data.data.map(coin => transformCoinData(coin, currency));
    
    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching coins:', error);
    res.status(500).json({ error: 'Failed to fetch cryptocurrency data', details: error.message });
  }
});

app.get('/api/coins/:id', async (req, res) => {
  try {
    if (!COINMARKETCAP_API_KEY) {
      return res.status(500).json({ error: 'CoinMarketCap API key is not configured' });
    }

    const { id } = req.params;
    const url = `${COINMARKETCAP_API}/cryptocurrency/info?slug=${id}`;

    const headers = {
      'Accept': 'application/json',
      'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
    };

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const coinData = Object.values(data.data)[0];
    if (!coinData) {
      return res.status(404).json({ error: 'Coin not found' });
    }

    const transformedData = {
      id: coinData.slug,
      name: coinData.name,
      symbol: coinData.symbol,
      image: {
        large: `https://s2.coinmarketcap.com/static/img/coins/200x200/${coinData.id}.png`,
        small: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coinData.id}.png`,
      },
      description: {
        en: coinData.description || '',
      },
      market_data: {
        current_price: {
          usd: 0,
        },
        market_cap: {
          usd: 0,
        },
        price_change_percentage_24h: 0,
      },
    };

    const listingsUrl = `${COINMARKETCAP_API}/cryptocurrency/quotes/latest?slug=${id}&convert=USD`;
    const listingsResponse = await fetch(listingsUrl, { headers });
    if (listingsResponse.ok) {
      const listingsData = await listingsResponse.json();
      const quoteData = Object.values(listingsData.data)[0];
      if (quoteData && quoteData.quote.USD) {
        const usdQuote = quoteData.quote.USD;
        transformedData.market_data.current_price.usd = usdQuote.price;
        transformedData.market_data.market_cap.usd = usdQuote.market_cap;
        transformedData.market_data.price_change_percentage_24h = usdQuote.percent_change_24h;
      }
    }

    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching coin details:', error);
    res.status(500).json({ error: 'Failed to fetch coin details', details: error.message });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    if (!COINMARKETCAP_API_KEY) {
      return res.status(500).json({ error: 'CoinMarketCap API key is not configured' });
    }

    const { query } = req.query;
    const url = `${COINMARKETCAP_API}/cryptocurrency/search?query=${encodeURIComponent(query)}`;

    const headers = {
      'Accept': 'application/json',
      'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
    };

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`CoinMarketCap API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const transformedResults = data.data.coins.map(coin => ({
      id: coin.slug,
      name: coin.name,
      symbol: coin.symbol,
      market_cap_rank: coin.rank,
    }));

    res.json({ coins: transformedResults });
  } catch (error) {
    console.error('Error searching coins:', error);
    res.status(500).json({ error: 'Failed to search coins', details: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (!COINMARKETCAP_API_KEY) {
    console.warn('  WARNING: COINMARKETCAP_API_KEY is not set in environment variables');
  } else {
    console.log(' CoinMarketCap API key is configured');
  }
});