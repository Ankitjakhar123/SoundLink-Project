import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  song: { type: mongoose.Schema.Types.ObjectId, ref: "song" },
  album: { type: mongoose.Schema.Types.ObjectId, ref: "album" },
  radioStation: {
    stationuuid: String,
    name: String,
    url_resolved: String,
    favicon: String,
    bitrate: String,
    codec: String,
    country: String,
    language: String,
  },
  createdAt: { type: Date, default: Date.now },
});

const favoriteModel = mongoose.models.favorite || mongoose.model("favorite", favoriteSchema);

export default favoriteModel; 