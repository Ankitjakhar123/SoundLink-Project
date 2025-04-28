import mongoose from "mongoose";

const playSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  song: { type: mongoose.Schema.Types.ObjectId, ref: "song", required: true },
  playedAt: { type: Date, default: Date.now },
});

const playModel = mongoose.models.play || mongoose.model("play", playSchema);

export default playModel; 