import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Create Express app
const app = express();

// Basic middleware
app.use(express.json());
app.use(cors());

// Simple health check endpoint
app.get('/api', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'SoundLink API is running',
    timestamp: new Date().toISOString() 
  });
});

// MongoDB test endpoint
app.get('/api/db', async (req, res) => {
  try {
    // Check MongoDB connection
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({
        status: 'error',
        message: 'MongoDB URI is not defined'
      });
    }

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
      });
    }

    return res.status(200).json({
      status: 'ok',
      message: 'MongoDB connection successful',
      connectionState: mongoose.connection.readyState
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to connect to MongoDB',
      error: error.message
    });
  }
});

// Environment variables check endpoint
app.get('/api/env', (req, res) => {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV || 'not set',
    MONGODB_URI: process.env.MONGODB_URI ? 'set' : 'not set',
    CLOUDINARY_NAME: process.env.CLOUDINARY_NAME ? 'set' : 'not set',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? 'set' : 'not set',
    CLOUDINARY_SECRET_KEY: process.env.CLOUDINARY_SECRET_KEY ? 'set' : 'not set',
    JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'not set'
  };

  return res.status(200).json({
    status: 'ok',
    environment: envVars
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('API error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
  });
});

// Export the Express API
export default app; 