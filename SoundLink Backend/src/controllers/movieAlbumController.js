import MovieAlbum from '../models/MovieAlbum.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory and uploads path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../../uploads');

// Add a new movie album
export const addMovieAlbum = async (req, res) => {
  try {
    const { title, director, year, description, genre } = req.body;
    
    // Validate required fields
    if (!title || !director) {
      return res.status(400).json({
        success: false,
        message: 'Title and director are required'
      });
    }

    // Check if uploads directory exists, create if not
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`Created uploads directory: ${uploadsDir}`);
    }

    // Log user information for debugging
    console.log('User in request:', req.user);
    
    // Create new movie album with a fallback for createdBy
    const movieAlbum = new MovieAlbum({
      title,
      director,
      year,
      description,
      genre,
      // Use req.user._id if available, otherwise use a default user ID or null
      createdBy: req.user ? req.user._id : '000000000000000000000000' // Default ObjectId
    });

    // Handle cover image upload if provided
    if (req.file) {
      console.log('Processing file upload:', req.file.path);
      
      try {
        // Check if Cloudinary is configured
        const isCloudinaryConfigured = 
          process.env.CLOUDINARY_NAME && 
          process.env.CLOUDINARY_API_KEY && 
          process.env.CLOUDINARY_SECRET_KEY;

        if (!isCloudinaryConfigured) {
          console.log('Cloudinary not configured, using local file path');
          // Just use the local file path if Cloudinary is not configured
          const relativePath = path.relative(process.cwd(), req.file.path).replace(/\\/g, '/');
          movieAlbum.coverImage = `/${relativePath}`;
        } else {
          // Ensure Cloudinary is configured
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY,
          });
          
          // Upload to cloudinary
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'movie_albums',
            resource_type: 'image'
          });
          
          // Update movie album with image info
          movieAlbum.coverImage = result.secure_url;
          movieAlbum.cloudinaryId = result.public_id;
        }
      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);
        // Handle the error but continue - use a fallback
        const relativePath = path.relative(process.cwd(), req.file.path).replace(/\\/g, '/');
        movieAlbum.coverImage = `/${relativePath}`;
      }
    }

    // Save movie album
    await movieAlbum.save();

    res.status(201).json({
      success: true,
      message: 'Movie album created successfully',
      movieAlbum
    });
  } catch (error) {
    console.error('Error creating movie album:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create movie album',
      error: error.message
    });
  }
};

// List all movie albums
export const listMovieAlbums = async (req, res) => {
  try {
    const movieAlbums = await MovieAlbum.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      movieAlbums
    });
  } catch (error) {
    console.error('Error fetching movie albums:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movie albums',
      error: error.message
    });
  }
};

// Get a specific movie album
export const getMovieAlbum = async (req, res) => {
  try {
    const movieAlbum = await MovieAlbum.findById(req.params.id);
    
    if (!movieAlbum) {
      return res.status(404).json({
        success: false,
        message: 'Movie album not found'
      });
    }
    
    res.status(200).json({
      success: true,
      movieAlbum
    });
  } catch (error) {
    console.error('Error fetching movie album:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movie album',
      error: error.message
    });
  }
};

// Update a movie album
export const updateMovieAlbum = async (req, res) => {
  try {
    const { title, director, year, description, genre } = req.body;
    const movieAlbumId = req.params.id;
    
    // Find movie album
    const movieAlbum = await MovieAlbum.findById(movieAlbumId);
    
    if (!movieAlbum) {
      return res.status(404).json({
        success: false,
        message: 'Movie album not found'
      });
    }
    
    // Update fields
    if (title) movieAlbum.title = title;
    if (director) movieAlbum.director = director;
    if (year) movieAlbum.year = year;
    if (description) movieAlbum.description = description;
    if (genre) movieAlbum.genre = genre;
    
    // Handle image upload if provided
    if (req.file) {
      // Delete old image from cloudinary if exists
      if (movieAlbum.cloudinaryId) {
        await cloudinary.uploader.destroy(movieAlbum.cloudinaryId);
      }
      
      // Upload new image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'movie_albums',
        resource_type: 'image'
      });
      
      // Remove temp file
      fs.unlinkSync(req.file.path);
      
      // Update movie album with new image info
      movieAlbum.coverImage = result.secure_url;
      movieAlbum.cloudinaryId = result.public_id;
    }
    
    // Save updated movie album
    await movieAlbum.save();
    
    res.status(200).json({
      success: true,
      message: 'Movie album updated successfully',
      movieAlbum
    });
  } catch (error) {
    console.error('Error updating movie album:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update movie album',
      error: error.message
    });
  }
};

// Delete a movie album
export const deleteMovieAlbum = async (req, res) => {
  try {
    const movieAlbum = await MovieAlbum.findById(req.params.id);
    
    if (!movieAlbum) {
      return res.status(404).json({
        success: false,
        message: 'Movie album not found'
      });
    }
    
    // Delete image from cloudinary if exists
    if (movieAlbum.cloudinaryId) {
      await cloudinary.uploader.destroy(movieAlbum.cloudinaryId);
    }
    
    // Delete movie album
    await MovieAlbum.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Movie album deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting movie album:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete movie album',
      error: error.message
    });
  }
}; 