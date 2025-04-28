import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  song: { type: mongoose.Schema.Types.ObjectId, ref: "song" },
  album: { type: mongoose.Schema.Types.ObjectId, ref: "album" },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const commentModel = mongoose.models.comment || mongoose.model("comment", commentSchema);

export default commentModel; 