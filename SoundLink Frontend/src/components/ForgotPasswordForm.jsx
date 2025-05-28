import React, { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import axios from "axios";

const ForgotPasswordForm = ({ onBack }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`, { email });
      if (response.data.success) {
        setSuccess("Password reset instructions have been sent to your email.");
      } else {
        setError(response.data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-sm bg-black/40 rounded-2xl shadow-2xl p-8 w-full">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-pink-300 text-center mb-8">
        Reset Password
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="text-sm text-neutral-300 font-medium pl-1">Email</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-400">
              <FaEnvelope />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="bg-black/50 text-white border border-neutral-800 rounded-lg px-10 py-3 w-full focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all hover:bg-black/70"
              required
              autoComplete="email"
            />
          </div>
        </div>

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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-medium py-3 rounded-lg hover:shadow-lg hover:from-fuchsia-500 hover:to-purple-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden group"
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
              "Send Reset Instructions"
            )}
          </span>
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-fuchsia-400 hover:text-fuchsia-300 transition"
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm; 