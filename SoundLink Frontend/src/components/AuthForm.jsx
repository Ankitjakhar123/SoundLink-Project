import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";

const AuthForm = ({ mode = "login" }) => {
  const { login, register } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (mode === "login") {
        const ok = await login(form.email, form.password);
        if (!ok) setError("Invalid credentials");
        else setSuccess("Welcome back!");
      } else {
        const ok = await register(form.username, form.email, form.password);
        if (!ok) setError("Registration failed");
        else setSuccess("Registration successful! Please log in.");
      }
    } catch {
      setError("Something went wrong.");
    }
    setLoading(false);
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
      {mode === "register" && (
        <input
          name="username"
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="bg-neutral-900 text-white border border-neutral-700 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          required
        />
      )}
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="bg-neutral-900 text-white border border-neutral-700 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        className="bg-neutral-900 text-white border border-neutral-700 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:scale-105 transition-transform"
      >
        {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Register"}
      </button>
      {error && <div className="text-red-400 text-center">{error}</div>}
      {success && <div className="text-green-400 text-center">{success}</div>}
    </motion.form>
  );
};

export default AuthForm; 