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

//app config
const app=express();
const port= process.env.PORT || 4000;
connectDB();
connectCloudinary();


//middelewares

app.use(express.json());
// Configure CORS to allow credentials
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

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(morgan('dev'));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 10000 requests per windowMs
});
app.use(limiter);

//initializing routes

app.use("/api/song",songRouter)
app.use('/api/album',albumRouter)
app.use('/api/auth', authRouter)
app.use('/api/favorite', favoriteRouter)
app.use('/api/comment', commentRouter)
app.use('/api/search', searchRouter)
app.use('/api/playlist', playlistroute)
app.use('/api/analytics', analyticsroute)
app.use('/api/user', userRouter)
app.use('/api/moviealbum', movieAlbumRouter)
app.use('/api/artist', artistRouter)
app.use('/api/play', playRouter)

// Health check endpoint for Docker
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Diagnostic route for checking environment variables
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
    // Test MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      // Connection is not established, try to connect
      console.log("MongoDB not connected, attempting to connect...");
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      });
    }
    
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

app.get('/',(req,res)=> res.send("Api Working"))

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
  });
});

const server = app.listen(port, () => {
  console.log(`Server started on ${port}`);
  
  // Determine the full URL for the server
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL === '1';
  
  // Don't run keepAlive on Vercel as it uses a different serverless model
  if (!isVercel) {
    const serverUrl = isProduction 
      ? process.env.SERVER_URL || 'https://your-render-app-url.onrender.com' 
      : `http://localhost:${port}`;
    
    // Set up the keep-alive service to ping the health endpoint
    // every 14 minutes (just under the 15-minute inactivity threshold)
    keepAlive(`${serverUrl}/api/health`, 14);
  }
});
