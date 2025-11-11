const mongoose = require('mongoose');

const cryptocurrencySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  coinmarketcap_id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  current_price: {
    type: Number,
    required: true
  },
  market_cap: {
    type: Number,
    index: true
  },
  market_cap_rank: {
    type: Number,
    index: true
  },
  total_volume: {
    type: Number
  },
  price_change_percentage_24h: {
    type: Number
  },
  
  circulating_supply: {
    type: Number
  },
  total_supply: {
    type: Number
  },
  max_supply: {
    type: Number
  },
  
  num_market_pairs: {
    type: Number
  },
  cmc_rank: {
    type: Number,
    index: true
  },
  
  platform: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  tags: {
    type: [String],
    default: []
  },
  category: {
    type: String
  },
  
  date_added: {
    type: Date
  },
  last_updated: {
    type: Date,
    default: Date.now
  },
  
  image: {
    type: String
  },
  
  quote: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  sparkline_in_7d: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  fetched_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  raw_data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

cryptocurrencySchema.index({ market_cap_rank: 1, fetched_at: -1 });
cryptocurrencySchema.index({ symbol: 1, fetched_at: -1 });
cryptocurrencySchema.index({ cmc_rank: 1 });

const Cryptocurrency = mongoose.model('Cryptocurrency', cryptocurrencySchema);

module.exports = Cryptocurrency;

