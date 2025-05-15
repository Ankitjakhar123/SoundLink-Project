import playlistModel from "../models/playlistModel.js";

// Create a new playlist
export const createPlaylist = async (req, res) => {
  try {
    const { name } = req.body;
    const playlist = new playlistModel({ name, user: req.user.id });
    await playlist.save();
    res.status(201).json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create playlist." });
  }
};

// Get all playlists for current user
export const getUserPlaylists = async (req, res) => {
  try {
    const playlists = await playlistModel.find({ user: req.user.id }).populate('songs');
    res.json({ success: true, playlists });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch playlists." });
  }
};

// Add a song to a playlist
export const addSongToPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.body;
    const playlist = await playlistModel.findById(playlistId);
    if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found." });
    if (!playlist.songs.includes(songId)) playlist.songs.push(songId);
    await playlist.save();
    res.json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add song." });
  }
};

// Remove a song from a playlist
export const removeSongFromPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.body;
    const playlist = await playlistModel.findById(playlistId);
    if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found." });
    playlist.songs = playlist.songs.filter(id => id.toString() !== songId);
    await playlist.save();
    res.json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to remove song." });
  }
};

// Delete a playlist
export const deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.body;
    await playlistModel.findByIdAndDelete(playlistId);
    res.json({ success: true, message: "Playlist deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete playlist." });
  }
};

// Get a playlist by ID
export const getPlaylistById = async (req, res) => {
  try {
    const playlist = await playlistModel.findById(req.params.id).populate('songs');
    if (!playlist) return res.status(404).json({ success: false, message: "Playlist not found." });
    res.json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch playlist." });
  }
}; 