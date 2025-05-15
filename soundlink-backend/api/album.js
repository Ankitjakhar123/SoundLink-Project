import mongoose from 'mongoose';

// Handler for album-related API requests
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

  // Get the specific album endpoint
  const pathParts = req.url.split('/');
  const endpoint = pathParts[pathParts.length - 1].split('?')[0];

  try {
    // Import albumModel dynamically
    const albumModel = mongoose.model('albums') || 
                       mongoose.model('Albums') || 
                       (await import('../src/models/albumModel.js')).default;

    // Handle list request
    if (endpoint === 'list' || req.url.includes('/list')) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      const [albums, total] = await Promise.all([
        albumModel.find({}).populate('artist').skip(skip).limit(limit),
        albumModel.countDocuments()
      ]);
      
      return res.status(200).json({ 
        success: true, 
        albums, 
        total, 
        page, 
        pages: Math.ceil(total / limit) 
      });
    }

    // Handle other album endpoints or return error for unknown endpoint
    return res.status(404).json({
      success: false,
      message: `Unknown album endpoint: ${endpoint}`
    });
  } catch (error) {
    console.error('Error handling album request:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
} 