import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import userModel from '../models/userModel.js';
import userSettingsModel from '../models/userSettingsModel.js';
import { fileURLToPath } from 'url';
import fs from 'fs';
import mongoose from 'mongoose';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Debug cloudinary configuration
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_SECRET_KEY;

console.log('Cloudinary Config:', {
  isConfigured: isCloudinaryConfigured,
  cloud_name: process.env.CLOUDINARY_NAME ? 'Set' : 'Not Set',
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set',
  api_secret: process.env.CLOUDINARY_SECRET_KEY ? 'Set' : 'Not Set'
});

// Ensure uploads directory exists for local fallback
const uploadDir = path.join(__dirname, '../../../uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created directory: ${uploadDir}`);
}

// Configure storage based on availability
let storage;

if (isCloudinaryConfigured) {
  // Use Cloudinary if configured
  console.log('Using Cloudinary storage for uploads');
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'soundlink/profiles',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
  });
} else {
  // Fall back to local storage
  console.log('Cloudinary not configured. Using local storage as fallback');
  storage = multer.diskStorage({
    destination: function(req, file, cb) {
      console.log(`Uploading to directory: ${uploadDir}`);
      cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
      const filename = `user-${Date.now()}${path.extname(file.originalname)}`;
      console.log(`Generated filename: ${filename}`);
      cb(null, filename);
    }
  });
}

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    
    console.log(`Received file: ${file.originalname}, mimetype: ${file.mimetype}`);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Update user profile
router.post('/update', verifyToken, upload.single('image'), async (req, res) => {
  try {
    console.log('Update route called, req.file:', req.file);
    console.log('Request body:', req.body);
    console.log('User from token:', req.user);
    
    const { username, email } = req.body;
    
    // Get the user ID from the token
    const userId = req.user.id;
    
    if (!userId) {
      console.error('No user ID found in token:', req.user);
      return res.status(400).json({ success: false, message: 'Invalid token: No user ID found' });
    }
    
    console.log('Looking for user with ID:', userId);
    
    try {
      // Handle both string IDs and ObjectIds
      const user = await userModel.findById(userId);
      
      if (!user) {
        console.log(`User not found with ID: ${userId}`);
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      console.log('Found user:', user.username);
      
      // Update user fields
      user.username = username || user.username;
      user.email = email || user.email;
      
      // Update profile image if uploaded
      if (req.file) {
        console.log('Uploaded file info:', req.file);
        
        if (isCloudinaryConfigured) {
          // For Cloudinary, the file object contains the URL
          user.image = req.file.path || req.file.secure_url || req.file.url;
        } else {
          // For local storage
          user.image = `/uploads/profiles/${req.file.filename}`;
        }
        
        console.log(`Updated user image to: ${user.image}`);
      } else {
        console.log('No file uploaded');
      }
      
      await user.save();
      console.log('User saved successfully');
      
      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          image: user.image,
          role: user.role
        }
      });
    } catch (findError) {
      console.error('Error finding user:', findError);
      return res.status(500).json({ success: false, message: 'Error finding user: ' + findError.message });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Get user settings
router.get('/settings', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find settings for user or create default
    let settings = await userSettingsModel.findOne({ user: userId });
    
    if (!settings) {
      // Return default settings if none found
      return res.status(200).json({
        success: true,
        settings: {
          darkMode: true,
          notifications: true,
          privateAccount: false,
          showListeningActivity: true,
          autoplay: true,
          crossfade: false,
          normalizeVolume: false,
          language: 'english',
          quality: 'high'
        }
      });
    }
    
    return res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error getting user settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while getting user settings'
    });
  }
});

// Update user settings
router.post('/settings', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { settings } = req.body;
    
    if (!settings) {
      return res.status(400).json({
        success: false,
        message: 'No settings data provided'
      });
    }
    
    console.log('Updating settings for user:', userId);
    console.log('Settings data:', settings);
    
    // Find and update or create new settings
    const updatedSettings = await userSettingsModel.findOneAndUpdate(
      { user: userId },
      { 
        user: userId,
        ...settings
      },
      { new: true, upsert: true }
    );
    
    console.log('Settings updated successfully:', updatedSettings);
    
    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating user settings'
    });
  }
});

export default router; 