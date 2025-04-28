import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const SearchAdmin = ({ token }) => {
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const url = import.meta.env.VITE_BACKEND_URL;

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await axios.get(`${url}/api/search`, {
      params: { q },
      headers: { Authorization: `Bearer ${token}` },
    });
    setResults(res.data);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-black/80 rounded-lg p-6 shadow-lg max-w-xl mx-auto mt-8"
    >
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search songs, albums, users..."
          className="bg-neutral-900 text-white border border-neutral-700 rounded px-4 py-2 flex-1"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      {results && (
        <div className="text-white">
          <div className="mb-2 font-bold">Songs:</div>
          <ul>
            {results.songs?.map((s) => (
              <li key={s._id}>{s.name}</li>
            ))}
          </ul>
          <div className="mb-2 font-bold mt-4">Albums:</div>
          <ul>
            {results.albums?.map((a) => (
              <li key={a._id}>{a.name}</li>
            ))}
          </ul>
          <div className="mb-2 font-bold mt-4">Users:</div>
          <ul>
            {results.users?.map((u) => (
              <li key={u._id}>{u.username}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default SearchAdmin; 