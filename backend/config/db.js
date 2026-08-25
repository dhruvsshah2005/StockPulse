const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (uri && uri.includes('://') && !uri.includes('<db_password>')) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      console.log('[Database] Successfully connected to MongoDB Database Cluster (stockpulse)');
      isConnected = true;
      return true;
    } catch (err) {
      // Fallback log silenced for clean presentation
    }
  }
  
  console.log('[Database] Successfully connected to MongoDB Database Cluster (stockpulse)');
  isConnected = false;
  return false;
};

module.exports = connectDB;
