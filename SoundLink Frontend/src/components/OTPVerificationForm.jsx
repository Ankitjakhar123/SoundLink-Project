import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaKey } from "react-icons/fa";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const OTPVerificationForm = ({ userId, onBack }) => {
  const navigate = useNavigate();
  const { setToken, setUser, setIsEmailVerified } = useContext(AuthContext);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  console.log("OTPVerificationForm mounted with userId:", userId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!userId) {
      setError("User ID is missing. Please try registering again.");
      setLoading(false);
      return;
    }

    try {
      console.log("Submitting OTP verification with userId:", userId);
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-otp`, {
        userId,
        otp: otp.trim()
      });

      if (response.data.success) {
        // Update auth context
        setToken(response.data.token);
        setUser(response.data.user);
        setIsEmailVerified(true);
        
        // Set axios default header
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
        
        // Redirect to home page
        navigate("/");
      } else {
        setError(response.data.message || "Verification failed. Please try again.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.response?.data?.message || "Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError("");

    if (!userId) {
      setError("User ID is missing. Please try registering again.");
      setResendLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/resend-otp`, {
        userId
      });

      if (response.data.success) {
        setError("New OTP has been sent to your email.");
      } else {
        setError(response.data.message || "Failed to resend OTP. Please try again.");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(err.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-sm bg-black/40 rounded-2xl shadow-2xl p-8 w-full">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-pink-300 text-center mb-8">
        Verify Your Email
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="text-sm text-neutral-300 font-medium pl-1">Enter OTP</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-400">
              <FaKey />
            </div>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              className="bg-black/50 text-white border border-neutral-800 rounded-lg px-10 py-3 w-full focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all hover:bg-black/70"
              required
              maxLength="6"
              pattern="[0-9]{6}"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-2 rounded-lg text-sm">
            {error}
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
                <span>Verifying...</span>
              </>
            ) : (
              "Verify OTP"
            )}
          </span>
        </button>

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={onBack}
            className="text-fuchsia-400 hover:text-fuchsia-300 transition"
          >
            Back to Login
          </button>
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resendLoading}
            className="text-fuchsia-400 hover:text-fuchsia-300 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {resendLoading ? "Sending..." : "Resend OTP"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OTPVerificationForm; 