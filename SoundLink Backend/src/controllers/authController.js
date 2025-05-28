import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email
const sendOTPEmail = async (email, otp, username) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "🎵 SoundLink - Verify Your Email",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .email-wrapper {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(90deg, #ff2e63 0%, #ff6b6b 100%);
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
            background-color: #ffffff;
          }
          .message {
            color: #666;
            font-size: 16px;
            margin-bottom: 25px;
          }
          .otp-code {
            background: #f8f9fa;
            border: 2px dashed #ff2e63;
            padding: 20px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            color: #ff2e63;
            margin: 20px 0;
            letter-spacing: 5px;
          }
          .footer {
            background-color: #1a1a1a;
            color: #888;
            padding: 20px;
            text-align: center;
            font-size: 14px;
          }
          .note {
            background-color: #f8f9fa;
            border-left: 4px solid #ff2e63;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #666;
          }
          .logo {
            font-size: 32px;
            margin-bottom: 15px;
          }
          .wave {
            color: #ff2e63;
            animation: wave 2s infinite;
            display: inline-block;
          }
          @keyframes wave {
            0% { transform: rotate(0deg); }
            10% { transform: rotate(14deg); }
            20% { transform: rotate(-8deg); }
            30% { transform: rotate(14deg); }
            40% { transform: rotate(-4deg); }
            50% { transform: rotate(10deg); }
            60% { transform: rotate(0deg); }
            100% { transform: rotate(0deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email-wrapper">
            <div class="header">
              <div class="logo">🎵</div>
              <h1>SoundLink</h1>
            </div>
            <div class="content">
              <div class="message">
                <p>Hello ${username},</p>
                <p>Welcome to SoundLink! Please use the following OTP to verify your email address:</p>
              </div>
              <div class="otp-code">
                ${otp}
              </div>
              <div class="note">
                <p><strong>Note:</strong> This OTP will expire in 10 minutes.</p>
                <p>If you didn't create an account with SoundLink, you can safely ignore this email.</p>
              </div>
              <div class="message">
                <p>Keep the music playing!</p>
                <p>The SoundLink Team <span class="wave">🎵</span></p>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} SoundLink. All rights reserved.</p>
              <p>Your ultimate music streaming platform</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

// Register a new user
export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    
    // Check if user already exists
    const existingUser = await userModel.findOne({ 
      $or: [
        { email: { $regex: new RegExp(`^${email}$`, 'i') } },
        { username: { $regex: new RegExp(`^${username}$`, 'i') } }
      ]
    });
    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return res.status(400).json({ success: false, message: "Email is already registered." });
      }
      if (existingUser.username.toLowerCase() === username.toLowerCase()) {
        return res.status(400).json({ success: false, message: "Username is already taken." });
      }
    }
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user object with basic fields
    const userData = { 
      username, 
      email, 
      password: hashedPassword,
      role: role || "user",
      clerkId: `manual_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      otp: {
        code: otp,
        expires: otpExpiry,
        verified: false
      },
      isVerified: false
    };
    
    // Add avatar path if file was uploaded
    if (req.file) {
      userData.avatar = req.file.path || req.file.secure_url;
    }
    
    // Create and save new user
    const user = new userModel(userData);
    await user.save();
    
    // Send OTP email
    await sendOTPEmail(email, otp, username);
    
    res.status(201).json({ 
      success: true, 
      message: "Registration successful. Please check your email for OTP verification.",
      userId: user._id
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Registration failed." });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    
    if (!userId || !otp) {
      return res.status(400).json({ success: false, message: "User ID and OTP are required." });
    }
    
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "User is already verified." });
    }
    
    if (!user.otp || !user.otp.code || !user.otp.expires) {
      return res.status(400).json({ success: false, message: "Invalid OTP request." });
    }
    
    if (user.otp.code !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }
    
    if (Date.now() > user.otp.expires) {
      return res.status(400).json({ success: false, message: "OTP has expired." });
    }
    
    // Update user verification status
    user.isVerified = true;
    user.otp.verified = true;
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    
    res.json({
      success: true,
      message: "Email verified successfully.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ success: false, message: "OTP verification failed." });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required." });
    }
    
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "User is already verified." });
    }
    
    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Update user's OTP
    user.otp = {
      code: otp,
      expires: otpExpiry,
      verified: false
    };
    await user.save();
    
    // Send new OTP email
    await sendOTPEmail(user.email, otp, user.username);
    
    res.json({
      success: true,
      message: "New OTP has been sent to your email."
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ success: false, message: "Failed to resend OTP." });
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

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        success: false, 
        message: "Please verify your email first.",
        userId: user._id,
        requiresVerification: true
      });
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

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }
    
    console.log("Processing forgot password request for email:", email);
    
    // Log all users in database for debugging
    const allUsers = await userModel.find({});
    console.log("All users in database:", allUsers.map(u => ({ email: u.email, username: u.username })));
    
    // Try case-insensitive search
    const user = await userModel.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });
    
    console.log("Search query result:", user ? "User found" : "No user found");
    if (user) {
      console.log("Found user details:", { email: user.email, username: user.username });
    }
    
    if (!user) {
      console.log("No user found with email:", email);
      // Return success even if user doesn't exist for security
      return res.json({ success: true, message: "If an account exists with this email, you will receive password reset instructions." });
    }
    
    console.log("User found, generating reset token");
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    
    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();
    
    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log("Reset URL:", resetUrl);
    
    // Configure email transporter
    console.log("Configuring email transporter with settings:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      user: process.env.SMTP_USER,
      from: process.env.SMTP_FROM
    });
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    // Send email
    console.log("Attempting to send email to:", user.email);
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: "🎵 SoundLink - Reset Your Password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .email-wrapper {
              background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
              border-radius: 15px;
              overflow: hidden;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(90deg, #ff2e63 0%, #ff6b6b 100%);
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content {
              padding: 40px 30px;
              background-color: #ffffff;
            }
            .message {
              color: #666;
              font-size: 16px;
              margin-bottom: 25px;
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background: linear-gradient(90deg, #ff2e63 0%, #ff6b6b 100%);
              color: white;
              text-decoration: none;
              border-radius: 25px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
            }
            .footer {
              background-color: #1a1a1a;
              color: #888;
              padding: 20px;
              text-align: center;
              font-size: 14px;
            }
            .note {
              background-color: #f8f9fa;
              border-left: 4px solid #ff2e63;
              padding: 15px;
              margin: 20px 0;
              font-size: 14px;
              color: #666;
            }
            .logo {
              font-size: 32px;
              margin-bottom: 15px;
            }
            .wave {
              color: #ff2e63;
              animation: wave 2s infinite;
              display: inline-block;
            }
            @keyframes wave {
              0% { transform: rotate(0deg); }
              10% { transform: rotate(14deg); }
              20% { transform: rotate(-8deg); }
              30% { transform: rotate(14deg); }
              40% { transform: rotate(-4deg); }
              50% { transform: rotate(10deg); }
              60% { transform: rotate(0deg); }
              100% { transform: rotate(0deg); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-wrapper">
              <div class="header">
                <div class="logo">🎵</div>
                <h1>SoundLink</h1>
              </div>
              <div class="content">
                <div class="message">
                  <p>Hello ${user.username},</p>
                  <p>We received a request to reset your password for your SoundLink account. Click the button below to create a new password:</p>
                </div>
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                <div class="note">
                  <p><strong>Note:</strong> This link will expire in 1 hour for security reasons.</p>
                  <p>If you didn't request this password reset, you can safely ignore this email.</p>
                </div>
                <div class="message">
                  <p>Keep the music playing!</p>
                  <p>The SoundLink Team <span class="wave">🎵</span></p>
                </div>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} SoundLink. All rights reserved.</p>
                <p>Your ultimate music streaming platform</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    
    console.log("Email sent successfully:", info.messageId);
    
    res.json({ success: true, message: "If an account exists with this email, you will receive password reset instructions." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Failed to process password reset request." });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token and new password are required." });
    }
    
    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token." });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user's password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.json({ success: true, message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Failed to reset password." });
  }
}; 