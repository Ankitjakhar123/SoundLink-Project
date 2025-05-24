import { v2 as cloudinary } from "cloudinary";
import albumModel from "../models/albumModel.js";

// Add new album
const addAlbum = async (req, res) => {
  try {
    const { name, desc, bgColour, artist } = req.body; // ✅ match frontend keys
    const imageFile = req.file;

    if (!imageFile) {
      return res.json({ success: false, message: "Image file missing" });
    }

    // Upload image to Cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    // Prepare album data
    const albumData = {
      name,
      desc,
      bgColour,
      image: imageUpload.secure_url,
      createdBy: req.user.id,
    };
    
    // Add artist to albumData if provided
    if (artist) {
      albumData.artist = artist;
    }

    const album = new albumModel(albumData);
    await album.save();

    res.json({ success: true, message: "Album added" });
  } catch (error) {
    console.error("Error in addAlbum:", error);
    res.json({ success: false, message: "Failed to add album" });
  }
};

// List all albums
const listAlbum = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [albums, total] = await Promise.all([
      albumModel.find({}).populate('artist').skip(skip).limit(limit),
      albumModel.countDocuments()
    ]);
    res.json({ success: true, albums, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Error in listAlbum:", error);
    res.json({ success: false, message: "Failed to fetch albums" });
  }
};

// Remove an album
const removeAlbum = async (req, res) => {
  try {
    await albumModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Album removed" });
  } catch (error) {
    console.error("Error in removeAlbum:", error);
    res.json({ success: false, message: "Failed to remove album" });
  }
};

// Edit an album
const editAlbum = async (req, res) => {
  try {
    const { id, name, desc, bgColour, artist } = req.body;
    let updateData = { name, desc, bgColour };
    
    // Include artist in update if provided
    if (artist) {
      updateData.artist = artist;
    }
    
    if (req.file) {
      // Upload new image to Cloudinary
      const imageUpload = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
      });
      updateData.image = imageUpload.secure_url;
    }
    const updated = await albumModel.findByIdAndUpdate(id, updateData, { new: true }).populate('artist');
    if (!updated) return res.status(404).json({ success: false, message: "Album not found" });
    res.json({ success: true, album: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to edit album" });
  }
};

// Bulk add albums
const bulkAddAlbums = async (req, res) => {
  try {
    const albums = req.body.albums; // Array of album objects
    if (!Array.isArray(albums) || albums.length === 0) {
      return res.status(400).json({ success: false, message: "No albums provided" });
    }
    const created = await albumModel.insertMany(albums.map(a => ({
      ...a,
      createdBy: req.user.id
    })));
    res.json({ success: true, albums: created });
  } catch (error) {
    res.status(500).json({ success: false, message: "Bulk add failed" });
  }
};

export { addAlbum, listAlbum, removeAlbum, editAlbum, bulkAddAlbums };
