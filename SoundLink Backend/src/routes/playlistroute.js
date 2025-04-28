import express from 'express';
import {
  getPlaylistById,
  getUserPlaylists,
  createPlaylist,
  addSongToPlaylist
} from '../controllers/playlistController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all playlists for the current user
router.get('/my', authenticate, getUserPlaylists);
// Create a new playlist
router.post('/create', authenticate, createPlaylist);
// Add a song to a playlist
router.post('/add-song', authenticate, addSongToPlaylist);
// Get a playlist by ID
router.get('/:id', authenticate, getPlaylistById);

export default router; 