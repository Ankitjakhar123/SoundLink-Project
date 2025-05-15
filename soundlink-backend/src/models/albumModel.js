import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
  name: { type: String, required: true },
  desc: { type: String, required: true },
  bgColour: { type: String, required: true },
  image: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'artist' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
}, {
  timestamps: true
});

const albumModel = mongoose.model.album || mongoose.model("album", albumSchema);

export default albumModel;
