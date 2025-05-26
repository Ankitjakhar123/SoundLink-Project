import React, { useState, useEffect } from "react";
import AuthForm from "../AuthForm";
import { motion, AnimatePresence } from "framer-motion";
import { FaMusic, FaHeadphones, FaCompactDisc, FaGuitar } from "react-icons/fa";
import { useLocation } from "react-router-dom";

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [currentAnimation, setCurrentAnimation] = useState(0);
  const location = useLocation();
  const message = location.state?.message;
  const returnTo = location.state?.returnTo;
  
  const animations = [
    { icon: FaHeadphones, color: "text-fuchsia-500" },
    { icon: FaMusic, color: "text-pink-500" },
    { icon: FaCompactDisc, color: "text-purple-500" },
    { icon: FaGuitar, color: "text-indigo-500" }
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnimation(prev => (prev + 1) % animations.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-black via-neutral-900 to-neutral-800">
      {/* Left side - Artwork and branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-fuchsia-900 via-purple-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/sound-wave-pattern.svg')] opacity-10 bg-repeat"></div>
        <div className="flex flex-col items-center justify-center h-full w-full p-12 z-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="mb-8"
          >
            <div className="h-40 w-40 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 flex items-center justify-center shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentAnimation}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 30 }}
                  transition={{ duration: 0.5 }}
                  className={`${animations[currentAnimation].color}`}
                >
                  {React.createElement(animations[currentAnimation].icon, { size: 80 })}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-pink-300 mb-4"
          >
            SoundLink
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-fuchsia-100 text-center text-lg max-w-md mb-6"
          >
            Your premium music experience awaits. Discover, stream, and enjoy unlimited music with high-quality sound.
          </motion.p>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            className="grid grid-cols-2 gap-4 w-full max-w-sm"
          >
            {[
              "Unlimited Songs", 
              "HD Quality", 
              "Offline Access", 
              "No Ads"
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-fuchsia-400"></div>
                <span className="text-white text-sm">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      
      {/* Right side - Authentication form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="mb-8 text-center md:hidden">
              <h1 className="text-4xl font-bold text-white mb-2">SoundLink</h1>
              <p className="text-neutral-400">Your premium music experience</p>
            </div>
            
            {message && (
              <div className="mb-6 p-3 rounded-lg bg-fuchsia-900/50 border border-fuchsia-700 text-white text-center">
                {message}
              </div>
            )}
            
            <AuthForm mode={mode} returnTo={returnTo} />
            
            <div className="flex justify-center mt-6">
              {mode === "login" ? (
                <button
                  onClick={() => setMode("register")}
                  className="text-fuchsia-400 hover:text-fuchsia-300 transition"
                >
                  New here? <span className="font-bold">Create an account</span>
                </button>
              ) : (
                <button
                  onClick={() => setMode("login")}
                  className="text-fuchsia-400 hover:text-fuchsia-300 transition"
                >
                  Already have an account? <span className="font-bold">Sign in</span>
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthPage; 