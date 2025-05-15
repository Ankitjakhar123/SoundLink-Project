import mongoose from 'mongoose';

// Handler for song-related API requests
export default async function handler(req, res) {
  // Set CORS headers to allow requests from your frontend
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://ankitsoundlink.netlify.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check if MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      });
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      return res.status(500).json({
        success: false,
        message: 'Database connection error',
        error: error.message
      });
    }
  }

  // Get the specific song endpoint
  const pathParts = req.url.split('/');
  const endpoint = pathParts[pathParts.length - 1].split('?')[0];

  try {
    // Import songModel dynamically
    const songModel = mongoose.model('songs') || 
                      mongoose.model('Songs') || 
                      (await import('../src/models/songModel.js')).default;

    // Handle list request
    if (endpoint === 'list' || req.url.includes('/list')) {
      const all = req.query.all === 'true';
      
      if (all) {
        // Return all songs without pagination
        const songs = await songModel.find({}).populate('artist');
        return res.status(200).json({ 
          success: true, 
          songs, 
          total: songs.length 
        });
      } else {
        // Use pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const [songs, total] = await Promise.all([
          songModel.find({}).populate('artist').skip(skip).limit(limit),
          songModel.countDocuments()
        ]);
        
        return res.status(200).json({ 
          success: true, 
          songs, 
          total, 
          page, 
          pages: Math.ceil(total / limit) 
        });
      }
    }

    // Handle other song endpoints or return error for unknown endpoint
    return res.status(404).json({
      success: false,
      message: `Unknown song endpoint: ${endpoint}`
    });
  } catch (error) {
    console.error('Error handling song request:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
} 