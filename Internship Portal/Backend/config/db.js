const mongoose = require('mongoose');

let retryCount = 0;
const MAX_RETRIES = 3;
let isConnecting = false;

const connectDB = async () => {
  // Prevent multiple concurrent connection attempts
  if (isConnecting) {
    console.log(`🔄 Connection already in progress, skipping...`);
    return;
  }
  
  isConnecting = true;
  
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    
    // Reset retry count on successful connection
    retryCount = 0;
    isConnecting = false;
    
  } catch (error) {
    isConnecting = false;
    retryCount++;
    
    console.error(`❌ MongoDB Connection Error (Attempt ${retryCount}/${MAX_RETRIES}): ${error.message}`);
    
    // Check if it's a network/IP whitelist issue
    if (error.message.includes('IP') || error.message.includes('whitelist') || error.message.includes('authentication')) {
      console.log(`
🔧 QUICK FIX NEEDED:
1. Go to MongoDB Atlas Dashboard
2. Navigate to Network Access
3. Click "Add IP Address"
4. Select "Allow Access from Anywhere (0.0.0.0/0)"
5. Save and restart the server

Alternatively, add your current IP to the whitelist.
      `);
    }
    
    // Don't exit the process immediately - let the server start but show warnings
    console.log(`⚠️  Server starting without database connection...`);
    console.log(`⚠️  Some features may not work until database is connected.`);
    
    // Only retry if we haven't exceeded max retries
    if (retryCount < MAX_RETRIES) {
      const delay = Math.min(10000 * retryCount, 30000); // Exponential backoff, max 30s
      console.log(`🔄 Will retry connection in ${delay/1000} seconds...`);
      
      setTimeout(() => {
        console.log(`🔄 Attempting to reconnect to MongoDB (${retryCount + 1}/${MAX_RETRIES})...`);
        connectDB();
      }, delay);
    } else {
      console.log(`❌ Max connection retries (${MAX_RETRIES}) exceeded. Manual intervention required.`);
      console.log(`💡 Server will continue running without database connection.`);
    }
  }
};

module.exports = connectDB;