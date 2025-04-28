import { v2 as cloudinary } from "cloudinary";
import songModel from "../models/songModel.js";

const addSong = async (req, res) => {
  try {
    const name = req.body.name; // ✅ fixed typo: bodey → body
    const desc = req.body.desc;
    const album = req.body.album;
    const artist = req.body.artist; // Add artist field

    const audioFile = req.files.audio[0];
    const imageFile = req.files.image[0];

    const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
      resource_type: "video",
    });
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    // ❌ Incorrect quotes in duration string interpolation
    const duration = `${Math.floor(audioUpload.duration / 60)}:${Math.floor(audioUpload.duration % 60)}`;

    const songData = {
      name,
      desc,
      album,
      image: imageUpload.secure_url,
      file: audioUpload.secure_url,
      duration,
      createdBy: req.user.id,
    };
    
    // Add artist to songData if provided
    if (artist) {
      songData.artist = artist;
    }

    const song = songModel(songData);
    await song.save();

    res.json({ success: true, message: "Song Added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const listSong = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [songs, total] = await Promise.all([
      songModel.find({}).populate('artist').skip(skip).limit(limit),
      songModel.countDocuments()
    ]);
    res.json({ success: true, songs, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.json({ success: false });
  }
};

const removeSong = async (req, res) => {
  try {
    await songModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Song removed" }); // ✅ fixed typo: semicolon inside res.json
  } catch (error) {
    res.json({ success: false }); // ✅ fixed syntax: replaced `{success:"False"}` with valid object
  }
};

// Edit a song
const editSong = async (req, res) => {
  try {
    const { id, name, desc, album, artist } = req.body;
    let updateData = { name, desc, album };
    
    // Include artist in update if provided
    if (artist) {
      updateData.artist = artist;
    }
    
    if (req.files && req.files.image) {
      const imageUpload = await cloudinary.uploader.upload(req.files.image[0].path, {
        resource_type: "image",
      });
      updateData.image = imageUpload.secure_url;
    }
    if (req.files && req.files.audio) {
      const audioUpload = await cloudinary.uploader.upload(req.files.audio[0].path, {
        resource_type: "video",
      });
      updateData.file = audioUpload.secure_url;
      updateData.duration = `${Math.floor(audioUpload.duration / 60)}:${Math.floor(audioUpload.duration % 60)}`;
    }
    const updated = await songModel.findByIdAndUpdate(id, updateData, { new: true }).populate('artist');
    if (!updated) return res.status(404).json({ success: false, message: "Song not found" });
    res.json({ success: true, song: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to edit song" });
  }
};

// Bulk add songs
const bulkAddSongs = async (req, res) => {
  try {
    const songs = req.body.songs; // Array of song objects
    if (!Array.isArray(songs) || songs.length === 0) {
      return res.status(400).json({ success: false, message: "No songs provided" });
    }
    const created = await songModel.insertMany(songs.map(s => ({
      ...s,
      createdBy: req.user.id
    })));
    res.json({ success: true, songs: created });
  } catch (error) {
    res.status(500).json({ success: false, message: "Bulk add failed" });
  }
};

export { addSong, listSong, removeSong, editSong, bulkAddSongs };
