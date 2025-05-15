import playModel from "../models/playModel.js";

// Record a song play
export const recordPlay = async (req, res) => {
  try {
    const { song } = req.body;
    const user = req.user.id;
    
    // Create and save the play record
    const play = new playModel({ user, song });
    await play.save();
    
    res.status(201).json({ success: true, message: "Play recorded successfully" });
  } catch (error) {
    console.error("Error recording play:", error);
    res.status(500).json({ success: false, message: "Failed to record play" });
  }
}; 