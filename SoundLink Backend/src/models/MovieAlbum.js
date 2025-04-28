import mongoose from 'mongoose';

const movieAlbumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  director: {
    type: String,
    required: [true, 'Director is required'],
    trim: true
  },
  year: {
    type: Number,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  genre: {
    type: String,
    trim: true
  },
  coverImage: {
    type: String,
    default: ''
  },
  cloudinaryId: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

const MovieAlbum = mongoose.model('MovieAlbum', movieAlbumSchema);

export default MovieAlbum; 