import songModel from "../models/songModel.js";
import albumModel from "../models/albumModel.js";
import userModel from "../models/userModel.js";
import artistModel from "../models/artistModel.js";

export const search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: "Query required." });
    const regex = new RegExp(q, "i");
    const songs = await songModel.find({ $or: [{ name: regex }, { desc: regex }] });
    const albums = await albumModel.find({ $or: [{ name: regex }, { desc: regex }] });
    const users = await userModel.find({ username: regex });
    const artists = await artistModel.find({ $or: [{ name: regex }, { bio: regex }] });
    res.json({ success: true, songs, albums, users, artists });
  } catch (error) {
    res.status(500).json({ success: false, message: "Search failed." });
  }
}; 