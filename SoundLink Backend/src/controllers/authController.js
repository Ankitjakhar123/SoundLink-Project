import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Register a new user
export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    
    // Check if user already exists
    const existingUser = await userModel.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists." });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user object with basic fields
    const userData = { 
      username, 
      email, 
      password: hashedPassword,
      role: role || "user"
    };
    
    // Add avatar path if file was uploaded
    if (req.file) {
      // Get the relative path to the avatar file
      const avatarPath = `/uploads/profiles/${req.file.filename}`;
      userData.avatar = avatarPath;
    }
    
    // Create and save new user
    const user = new userModel(userData);
    await user.save();
    
    res.status(201).json({ success: true, message: "User registered successfully." });
  } catch (error) {
    console.error("Registration error:", error);
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
    
    // Include avatar in response if available
    const userData = { 
      id: user._id, 
      username: user.username, 
      email: user.email, 
      role: user.role 
    };
    
    if (user.avatar) {
      userData.avatar = user.avatar;
    }
    
    res.json({ 
      success: true, 
      token, 
      user: userData 
    });
  } catch (error) {
    console.error("Login error:", error);
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