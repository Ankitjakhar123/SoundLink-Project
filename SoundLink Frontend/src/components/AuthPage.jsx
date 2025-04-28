import React, { useState } from "react";
import AuthForm from "./AuthForm";
import { motion, AnimatePresence } from "framer-motion";

const AuthPage = () => {
  const [mode, setMode] = useState("login");

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-black via-neutral-900 to-fuchsia-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -40 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-full max-w-md p-1 rounded-2xl shadow-2xl bg-gradient-to-br from-fuchsia-700/60 to-pink-700/60 border-2 border-fuchsia-800 animate-pulse"
        >
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black px-6 py-2 rounded-full shadow-lg border-2 border-fuchsia-700 text-fuchsia-200 font-bold text-lg tracking-wider animate-bounce">
            SoundLink Premium
          </div>
          <AuthForm mode={mode} />
          <div className="flex justify-center mt-4">
            {mode === "login" ? (
              <button
                onClick={() => setMode("register")}
                className="text-fuchsia-400 hover:underline transition"
              >
                New here? <span className="font-bold">Create an account</span>
              </button>
            ) : (
              <button
                onClick={() => setMode("login")}
                className="text-fuchsia-400 hover:underline transition"
              >
                Already have an account? <span className="font-bold">Sign in</span>
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthPage; 