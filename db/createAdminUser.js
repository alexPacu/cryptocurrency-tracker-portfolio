require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cryptocurrency-tracker';

async function connectToDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    const dbName = MONGODB_URI.split('/').pop().split('?')[0];
    console.log(`   Database: ${dbName}`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully\n');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
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

async function createAdminUser() {
  const username = process.argv[2];
  const email = process.argv[3];
  const password = process.argv[4];

  if (!username || !email || !password) {
    console.error('Usage: node createAdminUser.js <username> <email> <password>');
    console.error('Example: node createAdminUser.js admin admin@example.com admin123');
    process.exit(1);
  }

  try {
    await connectToDatabase();

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.trim() }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        console.error(`User with email ${email} already exists`);
      } else {
        console.error(`User with username ${username} already exists`);
      }
      process.exit(1);
    }

    const adminUser = new User({
      username: username.trim(),
      email: email.toLowerCase(),
      password: password,
      role: 'admin',
      isActive: true
    });

    await adminUser.save();

    console.log('Admin user created successfully!');
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   ID: ${adminUser._id}`);

  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    await disconnectFromDatabase();
    process.exit(0);
  }
}

if (require.main === module) {
  createAdminUser();
}

module.exports = { createAdminUser };

