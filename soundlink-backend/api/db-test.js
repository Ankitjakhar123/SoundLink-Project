import mongoose from 'mongoose';

export default async function handler(req, res) {
  try {
    // Check if MongoDB environment variable is set
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({
        status: 'error',
        message: 'MONGODB_URI environment variable is not defined'
      });
    }

    // Check connection state
    if (mongoose.connection.readyState !== 1) {
      // Not connected, attempt to connect
      console.log('Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000 // 5 seconds timeout
      });
    }

    // Test connection with basic operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    return res.status(200).json({
      status: 'ok',
      message: 'MongoDB connection successful',
      connectionState: mongoose.connection.readyState,
      collections: collectionNames,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('MongoDB test failed:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to connect to MongoDB',
      error: error.message
    });
  }
} 