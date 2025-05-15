import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import upload from '../middleware/multer.js';
import multer from 'multer';
import { 
  addMovieAlbum, 
  listMovieAlbums, 
  getMovieAlbum, 
  updateMovieAlbum, 
  deleteMovieAlbum 
} from '../controllers/movieAlbumController.js';

const router = express.Router();

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    console.error('Multer upload error:', err);
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  } else if (err) {
    // An unknown error occurred
    console.error('Unknown upload error:', err);
    return res.status(500).json({
      success: false,
      message: `Something went wrong: ${err.message}`
    });
  }
  
  // If no error, continue
  next();
};

// Route to add a new movie album (admin only)
router.post('/add', 
  (req, res, next) => {
    console.log('Starting movie album creation process');
    next();
  },
  authenticate, 
  (req, res, next) => {
    console.log('User after authentication:', req.user);
    next();
  },
  authorize('admin'), 
  (req, res, next) => {
    console.log('User passed authorization check');
    upload.single('coverImage')(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      }
      console.log('File upload successful');
      next();
    });
  },
  addMovieAlbum
);

// Route to list all movie albums
router.get('/list', 
  listMovieAlbums
);

// Route to get a specific movie album
router.get('/:id', 
  getMovieAlbum
);

// Route to update a movie album (admin only)
router.put('/:id', 
  authenticate, 
  authorize('admin'), 
  (req, res, next) => {
    upload.single('coverImage')(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      }
      next();
    });
  },
  updateMovieAlbum
);

// Route to delete a movie album (admin only)
router.delete('/:id', 
  authenticate, 
  authorize('admin'), 
  deleteMovieAlbum
);

export default router; 