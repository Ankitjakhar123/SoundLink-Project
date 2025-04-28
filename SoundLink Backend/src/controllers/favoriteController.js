import favoriteModel from "../models/favoriteModel.js";

// Like a song or album
export const like = async (req, res) => {
  try {
    const { songId, albumId } = req.body;
    if (!songId && !albumId) {
      return res.status(400).json({ success: false, message: "Song or album ID required." });
    }
    const filter = { user: req.user.id };
    if (songId) filter.song = songId;
    if (albumId) filter.album = albumId;
    let favorite = await favoriteModel.findOne(filter);
    if (!favorite) {
      favorite = new favoriteModel(filter);
      await favorite.save();
    }
    res.json({ success: true, favorite });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to like." });
  }
};

// Unlike a song or album
export const unlike = async (req, res) => {
  try {
    const { songId, albumId } = req.body;
    if (!songId && !albumId) {
      return res.status(400).json({ success: false, message: "Song or album ID required." });
    }
    const filter = { user: req.user.id };
    if (songId) filter.song = songId;
    if (albumId) filter.album = albumId;
    await favoriteModel.findOneAndDelete(filter);
    res.json({ success: true, message: "Unliked." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to unlike." });
  }
};

// Get all favorites for current user
export const getFavorites = async (req, res) => {
  try {
    const favorites = await favoriteModel.find({ user: req.user.id }).populate('song').populate('album');
    res.json({ success: true, favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch favorites." });
  }
}; 