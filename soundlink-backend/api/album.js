import mongoose from 'mongoose';

// Handler for album-related API requests
export default async function handler(req, res) {
  // Set CORS headers to allow requests from your frontend
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins during debugging
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('Album API called with URL:', req.url);
  console.log('Query params:', req.query);

  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected, trying to connect...');
      try {
        await mongoose.connect(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 5000
        });
        console.log('MongoDB connected successfully');
      } catch (dbError) {
        console.error('MongoDB connection error:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database connection error',
          error: dbError.message
        });
      }
    }

    // Get the specific album endpoint
    const pathParts = req.url.split('/');
    const endpoint = pathParts[pathParts.length - 1].split('?')[0];
    console.log('Endpoint detected:', endpoint);

    try {
      // Try to get the model if it's already registered
      let albumModel;
      try {
        if (mongoose.models.Album) {
          console.log('Using existing Album model');
          albumModel = mongoose.models.Album;
        } else if (mongoose.models.album) {
          console.log('Using existing album model');
          albumModel = mongoose.models.album;
        } else if (mongoose.models.albums) {
          console.log('Using existing albums model');
          albumModel = mongoose.models.albums;
        } else {
          console.log('No existing album model, creating schema');
          // Define a simple Album schema if model doesn't exist
          const albumSchema = new mongoose.Schema({
            name: String,
            desc: String,
            bgColour: String,
            image: String,
            artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
            createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
          });
          
          albumModel = mongoose.models.Album || mongoose.model('Album', albumSchema);
        }
      } catch (modelError) {
        console.error('Error loading model:', modelError);
        return res.status(500).json({
          success: false,
          message: 'Error loading data model',
          error: modelError.message
        });
      }

      // Handle list request
      if (endpoint === 'list' || req.url.includes('/list')) {
        console.log('Handling album list request');
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        try {
          const [albums, total] = await Promise.all([
            albumModel.find({}).populate('artist').skip(skip).limit(limit).lean(),
            albumModel.countDocuments()
          ]);
          
          console.log(`Found ${albums.length} albums out of ${total} total`);
          return res.status(200).json({ 
            success: true, 
            albums, 
            total, 
            page, 
            pages: Math.ceil(total / limit) 
          });
        } catch (listError) {
          console.error('Error listing albums:', listError);
          return res.status(500).json({
            success: false,
            message: 'Error fetching album list',
            error: listError.message
          });
        }
      }

      // Handle other album endpoints or return error for unknown endpoint
      return res.status(404).json({
        success: false,
        message: `Unknown album endpoint: ${endpoint}`
      });
    } catch (dataError) {
      console.error('Error processing data:', dataError);
      return res.status(500).json({
        success: false,
        message: 'Error processing data',
        error: dataError.message
      });
    }
  } catch (error) {
    console.error('Unhandled error in album API:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 