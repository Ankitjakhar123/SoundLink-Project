import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
  name: { type: String, required: true },
  desc: { type: String, required: true },
  album: { type: String, required: true },
  image: { type: String, required: true },
  file: { type: String, required: true },
  duration: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'artist' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
}, {
  timestamps: true
});

const SongModel = mongoose.model('song', songSchema);
export default SongModel;

// ❌ Fix: `model1`