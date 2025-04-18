import { v2 as cloudinary } from "cloudinary";
import albumModel from "../models/albumModel.js";

// Add new album
const addAlbum = async (req, res) => {
  try {
    const { name, desc, bgColour } = req.body; // ✅ match frontend keys
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
    };

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
    const allAlbums = await albumModel.find({});
    res.json({ success: true, albums: allAlbums });
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

export { addAlbum, listAlbum, removeAlbum };
