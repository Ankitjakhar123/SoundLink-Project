import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "song" }],
  createdAt: { type: Date, default: Date.now },
});

const playlistModel = mongoose.models.playlist || mongoose.model("playlist", playlistSchema);

export default playlistModel; 