import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaUser, FaLock, FaEnvelope, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ForgotPasswordForm from "./ForgotPasswordForm";
import OTPVerificationForm from "./OTPVerificationForm";

// Default avatars for user selection
const DEFAULT_AVATARS = [
  "/avatars/avatar1.svg",
  "/avatars/avatar2.svg",
  "/avatars/avatar3.svg",
  "/avatars/avatar4.svg",
  "/avatars/avatar5.svg",
  "/avatars/avatar6.svg",
];

const AuthForm = ({ mode = "login", returnTo }) => {
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [customAvatar, setCustomAvatar] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [showAvatars, setShowAvatars] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);
  const [userId, setUserId] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomAvatar(file);
      setSelectedAvatar(URL.createObjectURL(file));
      setShowAvatars(false);
    }
  };

  const handleSelectAvatar = (avatarPath) => {
    setSelectedAvatar(avatarPath);
    setCustomAvatar(null);
    setShowAvatars(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      if (currentMode === "login") {
        const result = await login(form.email, form.password);
        console.log("Login result:", result); // Add logging to debug
        
        if (result.success) {
          setSuccess("Welcome back!");
          setTimeout(() => navigate(returnTo || "/"), 500);
        } else if (result.requiresVerification) {
          console.log("Verification required, userId:", result.userId); // Add logging
          setUserId(result.userId);
          setCurrentMode("verify-otp");
          setError("Please verify your email to continue.");
        } else {
          setError(result.message || "Invalid credentials");
        }
      } else if (currentMode === "register") {
        if (form.password !== form.confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        let avatarFile = customAvatar;
        
        // If a default avatar was selected (not a custom upload)
        if (selectedAvatar && !customAvatar) {
          // Fetch the selected default avatar as a file
          try {
            const response = await fetch(selectedAvatar);
            const blob = await response.blob();
            const fileName = selectedAvatar.split('/').pop();
            avatarFile = new File([blob], fileName, { type: blob.type });
          } catch (err) {
            console.error("Error fetching default avatar:", err);
          }
        }
        
        const result = await register({
          username: form.username,
          email: form.email,
          password: form.password,
          avatar: avatarFile
        });
        
        if (result.success) {
          setUserId(result.userId);
          setCurrentMode("verify-otp");
        } else {
          setError(result.message || "Registration failed");
        }
      } else if (currentMode === "verify-otp") {
        // OTP verification logic
        // This is a placeholder and should be implemented
        setError("OTP verification logic not implemented");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (currentMode === "forgot-password") {
    return <ForgotPasswordForm onBack={() => setCurrentMode("login")} />;
  }

  if (currentMode === "verify-otp") {
    console.log("Rendering OTP form with userId:", userId); // Add logging
    return <OTPVerificationForm userId={userId} onBack={() => setCurrentMode("login")} />;
  }

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}
      </style>
      
      <div className="backdrop-blur-sm bg-black/40 rounded-2xl shadow-2xl p-8 w-full">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-pink-300 text-center mb-8">
          {currentMode === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        
        {/* Avatar selection (register only) */}
        {currentMode === "register" && (
          <div className="flex flex-col items-center gap-4 mb-6">
            <div 
              className="relative w-24 h-24 rounded-full bg-black/50 flex items-center justify-center border-2 border-fuchsia-500 cursor-pointer overflow-hidden shadow-lg hover:shadow-fuchsia-500/20 transition"
              onClick={() => setShowAvatars(prev => !prev)}
            >
              {selectedAvatar ? (
                <img 
                  src={selectedAvatar} 
                  alt="Selected avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUserCircle className="text-fuchsia-300 opacity-50" size={50} />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-medium px-2 py-1 rounded-full bg-fuchsia-600/70">Choose</span>
              </div>
            </div>
            
            {/* Avatar options */}
            {showAvatars && (
              <div className="bg-black/70 rounded-xl p-4 border border-fuchsia-900/50 shadow-xl animate-fadeIn">
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {DEFAULT_AVATARS.map((avatar, index) => (
                    <div 
                      key={index}
                      className={`relative w-16 h-16 rounded-full cursor-pointer overflow-hidden transition-transform ${selectedAvatar === avatar ? 'ring-2 ring-fuchsia-500 scale-105' : 'hover:scale-105'}`}
                      onClick={() => handleSelectAvatar(avatar)}
                    >
                      <img 
                        src={avatar}
                        alt={`Avatar ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-center">
                  <label className="bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-xs font-medium px-3 py-1.5 rounded-full cursor-pointer hover:shadow-lg hover:from-fuchsia-500 hover:to-purple-500 transition">
                    Upload Custom
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username field (register only) */}
          {currentMode === "register" && (
            <div className="space-y-1">
              <label className="text-sm text-neutral-300 font-medium pl-1">Username</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-400">
                  <FaUser />
                </div>
                <input
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  value={form.username}
                  onChange={handleChange}
                  className="bg-black/50 text-white border border-neutral-800 rounded-lg px-10 py-3 w-full focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all hover:bg-black/70"
                  required
                  autoComplete="username"
                />
              </div>
            </div>
          )}
          
          {/* Email field */}
          <div className="space-y-1">
            <label className="text-sm text-neutral-300 font-medium pl-1">Email</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-400">
                <FaEnvelope />
              </div>
              <input
                name="email"
                type="email"
                placeholder="Your email address"
                value={form.email}
                onChange={handleChange}
                className="bg-black/50 text-white border border-neutral-800 rounded-lg px-10 py-3 w-full focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all hover:bg-black/70"
                required
                autoComplete="email"
              />
            </div>
          </div>
          
          {/* Password field */}
          <div className="space-y-1">
            <label className="text-sm text-neutral-300 font-medium pl-1">Password</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-400">
                <FaLock />
              </div>
              <input
                name="password"
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                className="bg-black/50 text-white border border-neutral-800 rounded-lg px-10 py-3 w-full focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all hover:bg-black/70"
                required
                autoComplete={currentMode === "login" ? "current-password" : "new-password"}
              />
            </div>
          </div>
          
          {/* Confirm Password field */}
          {currentMode === "register" && (
            <div className="space-y-1">
              <label className="text-sm text-neutral-300 font-medium pl-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-400">
                  <FaLock />
                </div>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="bg-black/50 text-white border border-neutral-800 rounded-lg px-10 py-3 w-full focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all hover:bg-black/70"
                  required
                  minLength="6"
                />
              </div>
            </div>
          )}
          
          {/* Forgotten password link (login only) */}
          {currentMode === "login" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setCurrentMode("forgot-password")}
                className="text-fuchsia-400 text-sm hover:text-fuchsia-300 transition"
              >
                Forgot password?
              </button>
            </div>
          )}
          
          {/* Messages */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-900/20 border border-green-800 text-green-200 px-4 py-2 rounded-lg text-sm">
              {success}
            </div>
          )}
          
          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-medium py-3 rounded-lg hover:shadow-lg hover:from-fuchsia-500 hover:to-purple-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group mt-2"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                currentMode === "login" ? "Sign In" : "Create Account"
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          </button>
        </form>
      </div>
    </>
  );
};

export default AuthForm; 