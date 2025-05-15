import mongoose from "mongoose";

const artistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String, default: "" },
  image: { type: String, default: "" },
  cloudinaryId: { type: String, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
}, {
  timestamps: true
});

const artistModel = mongoose.model("artist", artistSchema);

export default artistModel; 