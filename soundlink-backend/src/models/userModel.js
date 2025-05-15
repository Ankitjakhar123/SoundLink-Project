import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "/default-avatar.svg" },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  createdAt: { type: Date, default: Date.now },
  isEmailVerified: { type: Boolean, default: false },
  clerkId: { type: String, sparse: true, unique: true }
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel; 