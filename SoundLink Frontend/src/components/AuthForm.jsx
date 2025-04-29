import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaEnvelope, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Default avatars for user selection
const DEFAULT_AVATARS = [
  "/avatars/avatar1.svg",
  "/avatars/avatar2.svg",
  "/avatars/avatar3.svg",
  "/avatars/avatar4.svg",
  "/avatars/avatar5.svg",
  "/avatars/avatar6.svg",
];

const AuthForm = ({ mode = "login" }) => {
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [customAvatar, setCustomAvatar] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [showAvatars, setShowAvatars] = useState(false);
  
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
      if (mode === "login") {
        const result = await login(form.email, form.password);
        if (result.success) {
          setSuccess("Welcome back!");
          navigate("/");
        } else {
          setError(result.message || "Invalid credentials");
        }
      } else {
        // For registration
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
          setSuccess("Registration successful! Please log in.");
          setTimeout(() => {
            window.location.href = "/auth"; // Full reload to login page
          }, 1500);
        } else {
          setError(result.message || "Registration failed");
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onSubmit={handleSubmit}
      className="bg-black/90 rounded-xl shadow-2xl p-8 w-full max-w-md mx-auto flex flex-col gap-6"
    >
      <h2 className="text-3xl font-bold text-white text-center mb-2">
        {mode === "login" ? "Sign In" : "Create Account"}
      </h2>
      
      {/* Avatar selection (register only) */}
      {mode === "register" && (
        <div className="flex flex-col items-center gap-4">
          <div 
            className="relative w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center border-2 border-fuchsia-600 cursor-pointer overflow-hidden"
            onClick={() => setShowAvatars(prev => !prev)}
          >
            {selectedAvatar ? (
              <img 
                src={selectedAvatar} 
                alt="Selected avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUserCircle className="text-neutral-600" size={60} />
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-medium">Select Avatar</span>
            </div>
          </div>
          
          {/* Avatar options */}
          {showAvatars && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-neutral-900 rounded-xl p-4 border border-neutral-800"
            >
              <div className="grid grid-cols-3 gap-3 mb-3">
                {DEFAULT_AVATARS.map((avatar, index) => (
                  <img 
                    key={index}
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                    className={`w-16 h-16 rounded-full object-cover cursor-pointer border-2 ${selectedAvatar === avatar ? 'border-fuchsia-500' : 'border-transparent'} hover:border-fuchsia-500 transition`}
                    onClick={() => handleSelectAvatar(avatar)}
                  />
                ))}
              </div>
              <div className="flex justify-center">
                <label className="bg-fuchsia-600 text-white text-xs font-medium px-3 py-1.5 rounded-full cursor-pointer hover:bg-fuchsia-700 transition">
                  Upload Custom
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>
            </motion.div>
          )}
        </div>
      )}
      
      {/* Username field (register only) */}
      {mode === "register" && (
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            <FaUser />
          </div>
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="bg-neutral-900 text-white border border-neutral-700 rounded-lg px-10 py-3 w-full focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            required
          />
        </div>
      )}
      
      {/* Email field */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
          <FaEnvelope />
        </div>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="bg-neutral-900 text-white border border-neutral-700 rounded-lg px-10 py-3 w-full focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          required
        />
      </div>
      
      {/* Password field */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
          <FaLock />
        </div>
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="bg-neutral-900 text-white border border-neutral-700 rounded-lg px-10 py-3 w-full focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          required
        />
      </div>
      
      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:scale-105 transition-transform mt-2 relative overflow-hidden group"
      >
        <span className="relative z-10">
          {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-fuchsia-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
      </button>
      
      {/* Messages */}
      {error && <div className="text-red-400 text-center text-sm">{error}</div>}
      {success && <div className="text-green-400 text-center text-sm">{success}</div>}
      
      {/* Forgotten password link (login only) */}
      {mode === "login" && (
        <div className="text-center">
          <a href="#" className="text-fuchsia-400 text-sm hover:underline">
            Forgot your password?
          </a>
        </div>
      )}
    </motion.form>
  );
};

export default AuthForm; 