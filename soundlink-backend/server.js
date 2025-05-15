import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import songRouter from './src/routes/songroute.js';
import connectDB from './src/config/mongodb.js';
import connectCloudinary from './src/config/cloudinary.js';
import albumRouter from './src/routes/albumroute.js';
import authRouter from './src/routes/authroute.js';
import favoriteRouter from './src/routes/favoriteroute.js';
import commentRouter from './src/routes/commentroute.js';
import searchRouter from './src/routes/searchroute.js';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import playlistroute from './src/routes/playlistroute.js';
import analyticsroute from './src/routes/analyticsroute.js';
import userRouter from './src/routes/userroute.js';
import movieAlbumRouter from './src/routes/movieAlbumRoutes.js';
import artistRouter from './src/routes/artistRoutes.js';
import playRouter from './src/routes/playroute.js';
import keepAlive from './src/utils/keepAlive.js';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const port = process.env.PORT || 4000;

// Create database connections when needed, not at startup
let isDbConnected = false;
const ensureDbConnection = async () => {
  if (!isDbConnected) {
    try {
      await connectDB();
      await connectCloudinary();
      isDbConnected = true;
    } catch (error) {
      console.error("Error connecting to databases:", error);
    }
  }
  return isDbConnected;
};

// Middleware
app.use(express.json());

// Configure CORS
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',    // Local development
      'http://localhost:3000',    // Alternative local port
      'https://ankitsoundlink.netlify.app', // Netlify deployment
      'https://sound-link-backend.vercel.app', // Vercel deployment
      'https://sound-link-backend-git-main-ankitjakhar123s-projects.vercel.app', // Vercel preview
      'https://sound-link-backend-668cyje4n-ankitjakhar123s-projects.vercel.app', // Vercel unique deploy URL
      'https://soundlink-backend.vercel.app' // Potential renamed Vercel URL
    ];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 10000 requests per windowMs
});
app.use(limiter);

// Connect DB middleware - ensures DB connection for all routes
app.use(async (req, res, next) => {
  try {
    await ensureDbConnection();
    next();
  } catch (error) {
    next(error);
  }
});

// Routes
app.use("/api/song", songRouter);
app.use('/api/album', albumRouter);
app.use('/api/auth', authRouter);
app.use('/api/favorite', favoriteRouter);
app.use('/api/comment', commentRouter);
app.use('/api/search', searchRouter);
app.use('/api/playlist', playlistroute);
app.use('/api/analytics', analyticsroute);
app.use('/api/user', userRouter);
app.use('/api/moviealbum', movieAlbumRouter);
app.use('/api/artist', artistRouter);
app.use('/api/play', playRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Diagnostic route
app.get('/api/diagnostics', (req, res) => {
  try {
    const mongoDbMasked = process.env.MONGODB_URI 
      ? process.env.MONGODB_URI.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://*****:*****@')
      : 'not set';
      
    const diagnostics = {
      environment: process.env.NODE_ENV || 'not set',
      mongoDb: {
        configured: Boolean(process.env.MONGODB_URI),
        uri: mongoDbMasked,
        connectionState: mongoose.connection.readyState === 1 ? 'connected' : 
                         mongoose.connection.readyState === 2 ? 'connecting' : 
                         mongoose.connection.readyState === 3 ? 'disconnecting' : 'disconnected'
      },
      cloudinary: {
        configured: Boolean(process.env.CLOUDINARY_NAME && 
                          process.env.CLOUDINARY_API_KEY && 
                          process.env.CLOUDINARY_SECRET_KEY),
        cloudName: process.env.CLOUDINARY_NAME ? 'set' : 'not set',
        apiKey: process.env.CLOUDINARY_API_KEY ? 'set' : 'not set',
        secretKey: process.env.CLOUDINARY_SECRET_KEY ? 'set' : 'not set'
      },
      deployment: {
        vercel: Boolean(process.env.VERCEL),
        platform: process.platform,
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage()
      },
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json({ 
      status: 'ok', 
      diagnostics 
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error generating diagnostics',
      error: error.message
    });
  }
});

// MongoDB test route
app.get('/api/test-mongodb', async (req, res) => {
  try {
    await ensureDbConnection();
    
    // Try to perform a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    res.status(200).json({
      status: 'ok',
      message: 'MongoDB connection successful',
      collections: collectionNames,
      readyState: mongoose.connection.readyState
    });
  } catch (error) {
    console.error("MongoDB test failed:", error);
    res.status(500).json({
      status: 'error',
      message: 'MongoDB connection test failed',
      error: error.message
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.send("SoundLink API Working");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
  });
});

// For regular Node.js environments (not serverless)
if (!process.env.VERCEL) {
  const server = app.listen(port, () => {
    console.log(`Server started on ${port}`);
    
    // Keep-alive for Render (not needed for Vercel)
    const isProduction = process.env.NODE_ENV === 'production';
    const serverUrl = isProduction 
      ? process.env.SERVER_URL || 'https://your-render-app-url.onrender.com' 
      : `http://localhost:${port}`;
    
    // Set up the keep-alive service
    keepAlive(`${serverUrl}/api/health`, 14);
  });
}

// Export the app for serverless environments
export default app;
