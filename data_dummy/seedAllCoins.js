require('dotenv').config();
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const Cryptocurrency = require('./models/Cryptocurrency');

const COINMARKETCAP_API = 'https://pro-api.coinmarketcap.com/v1';
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cryptocurrency-tracker';

const MAX_API_LIMIT = 5000;

function transformCoinData(coin, currency = 'USD') {
  const currencyUpper = currency.toUpperCase();
  const quote = coin.quote[currencyUpper] || coin.quote.USD;
  
  return {
    id: coin.slug || coin.id.toString(),
    coinmarketcap_id: coin.id,
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    slug: coin.slug || coin.id.toString(),
    
    current_price: quote.price || 0,
    market_cap: quote.market_cap || null,
    market_cap_rank: coin.cmc_rank || null,
    total_volume: quote.volume_24h || null,
    price_change_percentage_24h: quote.percent_change_24h || null,
    
    circulating_supply: coin.circulating_supply || null,
    total_supply: coin.total_supply || null,
    max_supply: coin.max_supply || null,
    
    num_market_pairs: coin.num_market_pairs || null,
    cmc_rank: coin.cmc_rank || null,
    
    platform: coin.platform || null,
    
    tags: coin.tags || [],
    category: coin.category || null,
    
    date_added: coin.date_added ? new Date(coin.date_added) : null,
    last_updated: quote.last_updated ? new Date(quote.last_updated) : new Date(),
    
    image: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
    
    quote: coin.quote || {},
    
    sparkline_in_7d: null,
    
    fetched_at: new Date(),
    
    raw_data: coin
  };
}

async function fetchAllCryptocurrencies(currency = 'USD') {
  try {
    if (!COINMARKETCAP_API_KEY) {
      throw new Error('CoinMarketCap API key is not configured. Please set COINMARKETCAP_API_KEY in your .env file');
    }

    console.log('Fetching ALL cryptocurrencies from CoinMarketCap API...');
    console.log(`   Maximum limit: ${MAX_API_LIMIT} coins`);
    console.log(`   Currency: ${currency}\n`);
    
    const url = `${COINMARKETCAP_API}/cryptocurrency/listings/latest?start=1&limit=${MAX_API_LIMIT}&convert=${currency}`;
    const headers = {
      'Accept': 'application/json',
      'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
    };

    console.log('   Making API request...');
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('CoinMarketCap API error:', response.status, errorText);
      throw new Error(`CoinMarketCap API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    const coinsCount = data.data ? data.data.length : 0;
    
    console.log(`Successfully fetched ${coinsCount} cryptocurrencies`);
    
    if (data.status && data.status.total_count) {
      console.log(`   Total available: ${data.status.total_count} cryptocurrencies`);
      if (data.status.total_count > MAX_API_LIMIT) {
        console.log(`   Note: API returned ${coinsCount} coins (max per request: ${MAX_API_LIMIT})`);
        console.log(`   Some coins may not be included due to API limits.`);
      }
    }
    
    if (!data.data || data.data.length === 0) {
      throw new Error('No cryptocurrency data received from API');
    }
    
    console.log('   Transforming data...');
    const transformedCoins = data.data.map(coin => transformCoinData(coin, currency));
    
    return transformedCoins;
  } catch (error) {
    console.error('Error fetching cryptocurrency data:', error.message);
    throw error;
  }
}

async function saveAllToDatabase(coins) {
  try {
    console.log(`\nSaving ${coins.length} cryptocurrencies to database...`);
    
    let savedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const errors = [];

    const bulkOps = coins.map(coin => ({
      updateOne: {
        filter: { id: coin.id },
        update: {
          $set: {
            ...coin,
            fetched_at: new Date()
          }
        },
        upsert: true
      }
    }));

    const countBefore = await Cryptocurrency.countDocuments();
    
    try {
      const result = await Cryptocurrency.bulkWrite(bulkOps, { ordered: false });
      savedCount = result.upsertedCount || 0;
      updatedCount = result.modifiedCount || 0;
      const matchedCount = result.matchedCount || 0;
      console.log(`   Bulk operation completed`);
      console.log(`   - Matched: ${matchedCount}, Upserted (new): ${savedCount}, Modified: ${updatedCount}`);
    } catch (bulkError) {
      console.log(`   Bulk operation had issues, falling back to individual saves...`);
      console.log(`   Error: ${bulkError.message}`);
      
      for (const coin of coins) {
        try {
          const exists = await Cryptocurrency.findOne({ id: coin.id });
          
          await Cryptocurrency.findOneAndUpdate(
            { id: coin.id },
            {
              $set: {
                ...coin,
                fetched_at: new Date()
              }
            },
            {
              upsert: true,
              new: true,
              setDefaultsOnInsert: true
            }
          );

          if (!exists) {
            savedCount++;
          } else {
            updatedCount++;
          }
        } catch (error) {
          errorCount++;
          errors.push({ id: coin.id, name: coin.name, error: error.message });
          if (errorCount <= 5) {
            console.error(`   Error saving coin ${coin.id} (${coin.name}):`, error.message);
          }
        }
      }
    }

    console.log(`\nDatabase operation completed:`);
    console.log(`   - New coins saved: ${savedCount}`);
    console.log(`   - Existing coins updated: ${updatedCount}`);
    if (errorCount > 0) {
      console.log(`   - Errors: ${errorCount}`);
      if (errors.length > 0 && errors.length <= 10) {
        console.log(`   - Error details:`, errors);
      }
    }
    console.log(`   - Total processed: ${coins.length}`);
    
    return { savedCount, updatedCount, errorCount, total: coins.length };
  } catch (error) {
    console.error('Error saving to database:', error.message);
    throw error;
  }
}

async function connectToDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    const dbName = MONGODB_URI.split('/').pop().split('?')[0];
    console.log(`   Database: ${dbName}`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully\n');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('   Make sure MongoDB is running and MONGODB_URI is correct in .env');
    console.error('   Default: mongodb://localhost:27017/cryptocurrency-tracker');
    throw error;
  }
}

async function disconnectFromDatabase() {
  try {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error.message);
  }
}

async function getDatabaseStats() {
  try {
    const totalCount = await Cryptocurrency.countDocuments();
    const latestFetch = await Cryptocurrency.findOne().sort({ fetched_at: -1 }).select('fetched_at');
    
    console.log('\nDatabase Statistics:');
    console.log(`   - Total cryptocurrencies: ${totalCount}`);
    if (latestFetch && latestFetch.fetched_at) {
      console.log(`   - Last fetched: ${latestFetch.fetched_at.toLocaleString()}`);
    }
  } catch (error) {
    console.error('Error getting database stats:', error.message);
  }
}

async function clearDatabase() {
  try {
    const count = await Cryptocurrency.countDocuments();
    if (count > 0) {
      console.log(`\nClearing database...`);
      console.log(`   Removing ${count} existing cryptocurrencies...`);
      await Cryptocurrency.deleteMany({});
      console.log('Database cleared successfully');
    } else {
      console.log('   Database is already empty');
    }
  } catch (error) {
    console.error('Error clearing database:', error.message);
    throw error;
  }
}

async function main() {
  const currency = process.argv[2] || 'USD';
  const clearDB = process.argv[3] === '--clear'; 

  console.log('Starting database seeding process...');
  console.log('   Fetching ALL available cryptocurrencies');
  console.log(`   Currency: ${currency}`);
  if (clearDB) {
    console.log('   Clear database: Yes\n');
  } else {
    console.log('   Clear database: No (will update existing)\n');
  }

  try {
    await connectToDatabase();

    await getDatabaseStats();

    if (clearDB) {
      await clearDatabase();
    }

    const coins = await fetchAllCryptocurrencies(currency);

    const stats = await saveAllToDatabase(coins);

    await getDatabaseStats();

    console.log('\nDatabase seeding completed successfully!');
    console.log(`\nSummary:`);
    console.log(`   - Fetched: ${stats.total} cryptocurrencies`);
    console.log(`   - Saved: ${stats.savedCount} new records`);
    console.log(`   - Updated: ${stats.updatedCount} existing records`);
    if (stats.errorCount > 0) {
      console.log(`   - Errors: ${stats.errorCount}`);
    }
  } catch (error) {
    console.error('\nDatabase seeding failed:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  } finally {
    await disconnectFromDatabase();
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  fetchAllCryptocurrencies,
  saveAllToDatabase,
  connectToDatabase,
  disconnectFromDatabase,
  getDatabaseStats
};
