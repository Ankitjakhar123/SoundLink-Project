const User = require('../models/userModel');
const UserSettings = require('../models/userSettingsModel');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Get user settings
exports.getUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find settings for user or create default
    let settings = await UserSettings.findOne({ user: userId });
    
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
};

// Update user settings
exports.updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { settings } = req.body;
    
    if (!settings) {
      return res.status(400).json({
        success: false,
        message: 'No settings data provided'
      });
    }
    
    // Find and update or create new settings
    const updatedSettings = await UserSettings.findOneAndUpdate(
      { user: userId },
      { 
        user: userId,
        ...settings
      },
      { new: true, upsert: true }
    );
    
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
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!username && !email && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'No update data provided'
      });
    }
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user fields if provided
    if (username) user.username = username;
    if (email) user.email = email;
    
    // Handle profile image upload if provided
    if (req.file) {
      try {
        // Upload to cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'soundlink/profiles',
          use_filename: true
        });
        
        // Store cloudinary image details
        user.image = result.secure_url;
        user.cloudinaryId = result.public_id;
        
        // Delete local file after upload
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error('Error uploading to cloudinary:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Error uploading profile image'
        });
      }
    }
    
    // Save user
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        image: user.image,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
}; 