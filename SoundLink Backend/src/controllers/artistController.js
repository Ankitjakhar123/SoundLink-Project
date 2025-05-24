import artistModel from "../models/artistModel.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

// Add a new artist
const addArtist = async (req, res) => {
  try {
    const { name, bio } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    
    // Handle image upload
    let imageUrl = "";
    let cloudinaryId = "";
    
    if (req.file) {
      // Upload to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "soundlink_artists",
      });
      
      imageUrl = result.secure_url;
      cloudinaryId = result.public_id;
      
      // Remove temporary file
      fs.unlinkSync(req.file.path);
    }
    
    // Create new artist
    const artist = new artistModel({
      name,
      bio: bio || "",
      image: imageUrl,
      cloudinaryId,
      createdBy: req.user.id
    });
    
    await artist.save();
    
    res.status(201).json({
      success: true,
      message: "Artist added successfully",
      artist
    });
    
  } catch (error) {
    console.error("Error in addArtist:", error);
    res.status(500).json({ success: false, message: "Failed to add artist" });
  }
};

// List all artists
const listArtists = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const [artists, total] = await Promise.all([
      artistModel.find({}).skip(skip).limit(limit),
      artistModel.countDocuments()
    ]);
    
    res.json({
      success: true,
      artists,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
    
  } catch (error) {
    console.error("Error in listArtists:", error);
    res.status(500).json({ success: false, message: "Failed to fetch artists" });
  }
};

// Get a single artist by ID
const getArtist = async (req, res) => {
  try {
    const artist = await artistModel.findById(req.params.id);
    
    if (!artist) {
      return res.status(404).json({ success: false, message: "Artist not found" });
    }
    
    res.json({ success: true, artist });
    
  } catch (error) {
    console.error("Error in getArtist:", error);
    res.status(500).json({ success: false, message: "Failed to fetch artist" });
  }
};

// Update an artist
const updateArtist = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const artistId = req.params.id;
    
    // Find the artist
    const artist = await artistModel.findById(artistId);
    
    if (!artist) {
      return res.status(404).json({ success: false, message: "Artist not found" });
    }
    
    // Update fields
    if (name) artist.name = name;
    if (bio !== undefined) artist.bio = bio;
    
    // Handle image update
    if (req.file) {
      // Delete old image from cloudinary if exists
      if (artist.cloudinaryId) {
        await cloudinary.uploader.destroy(artist.cloudinaryId);
      }
      
      // Upload new image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "soundlink_artists",
      });
      
      artist.image = result.secure_url;
      artist.cloudinaryId = result.public_id;
      
      // Remove temporary file
      fs.unlinkSync(req.file.path);
    }
    
    await artist.save();
    
    res.json({
      success: true,
      message: "Artist updated successfully",
      artist
    });
    
  } catch (error) {
    console.error("Error in updateArtist:", error);
    res.status(500).json({ success: false, message: "Failed to update artist" });
  }
};

// Delete an artist
const deleteArtist = async (req, res) => {
  try {
    const artistId = req.params.id;
    
    // Find the artist
    const artist = await artistModel.findById(artistId);
    
    if (!artist) {
      return res.status(404).json({ success: false, message: "Artist not found" });
    }
    
    // Delete image from cloudinary if exists
    if (artist.cloudinaryId) {
      await cloudinary.uploader.destroy(artist.cloudinaryId);
    }
    
    // Delete artist from database
    await artistModel.findByIdAndDelete(artistId);
    
    res.json({
      success: true,
      message: "Artist deleted successfully"
    });
    
  } catch (error) {
    console.error("Error in deleteArtist:", error);
    res.status(500).json({ success: false, message: "Failed to delete artist" });
  }
};

// Bulk add artists (for testing or data import)
const bulkAddArtists = async (req, res) => {
  try {
    const artists = req.body.artists; // Array of artist objects
    
    if (!Array.isArray(artists) || artists.length === 0) {
      return res.status(400).json({ success: false, message: "No artists provided" });
    }
    
    const created = await artistModel.insertMany(artists.map(a => ({
      ...a,
      createdBy: req.user.id
    })));
    
    res.json({ success: true, artists: created });
    
  } catch (error) {
    console.error("Error in bulkAddArtists:", error);
    res.status(500).json({ success: false, message: "Bulk add failed" });
  }
};

export {
  addArtist,
  listArtists,
  getArtist,
  updateArtist,
  deleteArtist,
  bulkAddArtists
}; 