import userModel from "../models/userModel.js";
import songModel from "../models/songModel.js";
import albumModel from "../models/albumModel.js";
import playModel from "../models/playModel.js";
import MovieAlbum from "../models/MovieAlbum.js";
import artistModel from "../models/artistModel.js";

export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await userModel.countDocuments();
    const totalSongs = await songModel.countDocuments();
    const totalAlbums = await albumModel.countDocuments();
    const totalMovieAlbums = await MovieAlbum.countDocuments();
    const totalArtists = await artistModel.countDocuments();
    const totalPlays = await playModel.countDocuments();

    // Most played songs (top 5)
    const mostPlayed = await playModel.aggregate([
      { $group: { _id: "$song", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "songs",
          localField: "_id",
          foreignField: "_id",
          as: "song"
        }
      },
      { $unwind: "$song" }
    ]);

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalSongs,
        totalAlbums,
        totalMovieAlbums,
        totalArtists,
        totalPlays,
        mostPlayed
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch analytics." });
  }
}; 