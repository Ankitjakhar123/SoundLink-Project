import commentModel from "../models/commentModel.js";

// Add a comment to a song or album
export const addComment = async (req, res) => {
  try {
    const { songId, albumId, text } = req.body;
    if (!text || (!songId && !albumId)) {
      return res.status(400).json({ success: false, message: "Text and song or album ID required." });
    }
    const comment = new commentModel({ user: req.user.id, song: songId, album: albumId, text });
    await comment.save();
    res.status(201).json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add comment." });
  }
};

// Get comments for a song or album
export const getComments = async (req, res) => {
  try {
    const { songId, albumId } = req.query;
    const filter = {};
    if (songId) filter.song = songId;
    if (albumId) filter.album = albumId;
    const comments = await commentModel.find(filter).populate('user', 'username');
    res.json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch comments." });
  }
};

// Delete a comment (by user or admin)
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.body;
    const comment = await commentModel.findById(commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found." });
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }
    await commentModel.findByIdAndDelete(commentId);
    res.json({ success: true, message: "Comment deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete comment." });
  }
}; 