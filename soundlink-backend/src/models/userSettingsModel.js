import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  darkMode: {
    type: Boolean,
    default: true
  },
  notifications: {
    type: Boolean,
    default: true
  },
  privateAccount: {
    type: Boolean,
    default: false
  },
  showListeningActivity: {
    type: Boolean,
    default: true
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  crossfade: {
    type: Boolean,
    default: false
  },
  normalizeVolume: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    enum: ['english', 'spanish', 'french', 'german', 'japanese', 'chinese'],
    default: 'english'
  },
  quality: {
    type: String,
    enum: ['low', 'medium', 'high', 'ultra'],
    default: 'high'
  }
}, { timestamps: true });

export default mongoose.model('UserSettings', userSettingsSchema); 