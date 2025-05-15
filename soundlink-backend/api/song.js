import mongoose from 'mongoose';

// Handler for song-related API requests
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

  console.log('Song API called with URL:', req.url);
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

    // Get the specific song endpoint
    const pathParts = req.url.split('/');
    const endpoint = pathParts[pathParts.length - 1].split('?')[0];
    console.log('Endpoint detected:', endpoint);

    try {
      // Try to get the model if it's already registered
      let songModel;
      try {
        if (mongoose.models.Song) {
          console.log('Using existing Song model');
          songModel = mongoose.models.Song;
        } else if (mongoose.models.song) {
          console.log('Using existing song model');
          songModel = mongoose.models.song;
        } else if (mongoose.models.songs) {
          console.log('Using existing songs model');
          songModel = mongoose.models.songs;
        } else {
          console.log('No existing song model, loading from file');
          // Define a simple Song schema if model doesn't exist
          const songSchema = new mongoose.Schema({
            name: String,
            desc: String,
            album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
            artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
            image: String,
            file: String,
            duration: String,
            lyrics: String,
            createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
          });
          
          songModel = mongoose.models.Song || mongoose.model('Song', songSchema);
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
        console.log('Handling list request');
        const all = req.query.all === 'true';
        
        if (all) {
          console.log('Fetching all songs');
          // Return all songs without pagination
          const songs = await songModel.find({}).populate('artist').lean();
          console.log(`Found ${songs.length} songs`);
          return res.status(200).json({ 
            success: true, 
            songs, 
            total: songs.length 
          });
        } else {
          console.log('Fetching paginated songs');
          // Use pagination
          const page = parseInt(req.query.page) || 1;
          const limit = parseInt(req.query.limit) || 20;
          const skip = (page - 1) * limit;
          
          const [songs, total] = await Promise.all([
            songModel.find({}).populate('artist').skip(skip).limit(limit).lean(),
            songModel.countDocuments()
          ]);
          
          console.log(`Found ${songs.length} songs out of ${total} total`);
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
    } catch (dataError) {
      console.error('Error processing data:', dataError);
      return res.status(500).json({
        success: false,
        message: 'Error processing data',
        error: dataError.message
      });
    }
  } catch (error) {
    console.error('Unhandled error in song API:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 