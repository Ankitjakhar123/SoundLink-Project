import express from 'express';
import { addAlbum, listAlbum, removeAlbum, editAlbum } from '../controllers/albumController.js';
import upload from '../middleware/multer.js';
import { authenticate, authorize } from '../middleware/auth.js';

const albumRouter = express.Router();

// ✅ Fixed: quotes, parentheses, and commas
albumRouter.post('/add', authenticate, authorize('admin'), upload.single('image'), addAlbum);
albumRouter.get('/list', listAlbum);
albumRouter.post('/remove', authenticate, authorize('admin'), removeAlbum);
albumRouter.post('/edit', authenticate, authorize('admin'), upload.single('image'), editAlbum);

export default albumRouter;
