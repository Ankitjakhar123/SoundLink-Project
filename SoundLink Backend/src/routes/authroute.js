import express from "express";
import { register, login, getCurrentUser, forgotPassword, resetPassword, verifyOTP, resendOTP } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// Configure Cloudinary storage for version 2.x
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'soundlink/profiles',
    format: async (req, file) => {
      if (file.mimetype === 'image/jpeg') return 'jpg';
      if (file.mimetype === 'image/png') return 'png';
      return 'png'; // default format
    },
    public_id: (req, file) => `user_${Date.now()}`
  }
});

// Filter for image files only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for avatar uploads!'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    console.error('Multer upload error:', err);
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  } else if (err) {
    // An unknown error occurred
    console.error('Unknown upload error:', err);
    return res.status(500).json({
      success: false,
      message: `Something went wrong with file upload: ${err.message}`
    });
  }
  
  // If no error, continue
  next();
};

// Auth routes
router.post("/register", upload.single('avatar'), handleMulterError, register);
router.post("/login", login);
router.get("/me", protect, getCurrentUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// OTP routes
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

export default router; 