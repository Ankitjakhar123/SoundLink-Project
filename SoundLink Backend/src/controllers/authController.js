import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Register a new user
export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    const existingUser = await userModel.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ username, email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ success: true, message: "User registered successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Registration failed." });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials." });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed." });
  }
};

// Get current user info
export const getCurrentUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get user info." });
  }
}; 