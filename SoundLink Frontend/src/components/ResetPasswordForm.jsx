import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import axios from "axios";

const ResetPasswordForm = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check if we're in a PWA context
  useEffect(() => {
    const isInPWA = window.matchMedia('(display-mode: standalone)').matches || 
                    window.navigator.standalone || 
                    document.referrer.includes('android-app://');
    
    // If we're not in PWA and the token is in the URL, redirect to PWA
    if (!isInPWA && token) {
      const pwaUrl = `${window.location.origin}/reset-password/${token}`;
      window.location.href = pwaUrl;
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password`, {
        token,
        password: formData.password,
      });

      if (response.data.success) {
        setSuccess("Password has been reset successfully. You can now login with your new password.");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(response.data.message || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Please try again.");
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
          <label className="text-sm text-neutral-300 font-medium pl-1">New Password</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-400">
              <FaLock />
            </div>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
              className="bg-black/50 text-white border border-neutral-800 rounded-lg px-10 py-3 w-full focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all hover:bg-black/70"
              required
              minLength="6"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-neutral-300 font-medium pl-1">Confirm Password</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-400">
              <FaLock />
            </div>
            <input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              className="bg-black/50 text-white border border-neutral-800 rounded-lg px-10 py-3 w-full focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all hover:bg-black/70"
              required
              minLength="6"
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
              "Reset Password"
            )}
          </span>
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordForm; 