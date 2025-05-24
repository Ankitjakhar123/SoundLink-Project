import express from 'express';
import { addSong, listSong, removeSong, editSong, bulkAddSongs } from '../controllers/songController.js';
import upload from '../middleware/multer.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validationResult } from "express-validator";
import songModel from '../models/songModel.js';

const songRouter = express.Router();

songRouter.post('/add', authenticate, authorize('admin'), upload.fields([{name:'image', maxCount:1},{name:'audio',maxCount:1}]), addSong);
songRouter.get('/list', listSong);
songRouter.get('/:id', async (req, res) => {
  try {
    const song = await songModel.findById(req.params.id).populate('artist');
    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }
    res.json({ success: true, song });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching song' });
  }
});
songRouter.post('/remove', authenticate, authorize('admin'), removeSong);
songRouter.post('/edit', authenticate, authorize('admin'), upload.fields([{name:'image', maxCount:1},{name:'audio',maxCount:1}]), editSong);
songRouter.post('/bulk-add', authenticate, authorize('admin'), bulkAddSongs);

export default songRouter;

export const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map(validation => validation.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};
