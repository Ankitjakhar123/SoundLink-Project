import mongoose from 'mongoose';

// Debug handler to test MongoDB connection and models
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Create response object
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'not set',
      dbInfo: {
        mongoUri: process.env.MONGODB_URI ? 'set (hidden)' : 'not set',
        connectionState: getConnectionStateName(mongoose.connection.readyState)
      },
      models: Object.keys(mongoose.models),
      mongooseVersion: mongoose.version
    };

    // Try to connect if not already connected
    if (mongoose.connection.readyState !== 1) {
      try {
        await mongoose.connect(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 5000
        });
        response.dbInfo.connectionState = getConnectionStateName(mongoose.connection.readyState);
        response.dbInfo.connectionSuccess = true;
      } catch (dbError) {
        response.dbInfo.connectionError = dbError.message;
        response.dbInfo.connectionSuccess = false;
      }
    } else {
      response.dbInfo.connectionSuccess = true;
    }

    // Try to list collections if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        response.collections = collections.map(col => col.name);
      } catch (colError) {
        response.collectionError = colError.message;
      }

      // Show number of documents in known collections
      try {
        response.collectionCounts = {};
        for (const modelName in mongoose.models) {
          try {
            const count = await mongoose.models[modelName].countDocuments();
            response.collectionCounts[modelName] = count;
          } catch (countError) {
            response.collectionCounts[modelName] = `Error: ${countError.message}`;
          }
        }
      } catch (countError) {
        response.countError = countError.message;
      }
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error during debug',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Helper function to get connection state name
function getConnectionStateName(state) {
  switch (state) {
    case 0: return 'disconnected';
    case 1: return 'connected';
    case 2: return 'connecting';
    case 3: return 'disconnecting';
    default: return `unknown (${state})`;
  }
} 