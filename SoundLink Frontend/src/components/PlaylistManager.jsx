import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { motion } from "framer-motion";

const PlaylistManager = () => {
  const { user, token } = useContext(AuthContext);
  const [playlists, setPlaylists] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const url = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (user) fetchPlaylists();
    // eslint-disable-next-line
  }, [user]);

  const fetchPlaylists = async () => {
    setLoading(true);
    const res = await axios.get(`${url}/api/playlist/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPlaylists(res.data.playlists || []);
    setLoading(false);
  };

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    await axios.post(
      `${url}/api/playlist/create`,
      { name },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setName("");
    fetchPlaylists();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-black/90 rounded-xl shadow-2xl p-8 w-full max-w-lg mx-auto flex flex-col gap-6"
    >
      <h2 className="text-2xl font-bold text-white mb-4">Your Playlists</h2>
      <form onSubmit={createPlaylist} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New playlist name"
          className="bg-neutral-900 text-white border border-neutral-700 rounded px-4 py-2 flex-1"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform"
        >
          Create
        </button>
      </form>
      {loading ? (
        <div className="text-white">Loading...</div>
      ) : (
        <ul className="space-y-2">
          {playlists.map((pl) => (
            <li
              key={pl._id}
              className="bg-neutral-900 rounded-lg px-4 py-3 flex justify-between items-center"
            >
              <span className="text-white">{pl.name}</span>
              <span className="text-xs text-neutral-400">
                {pl.songs.length} songs
              </span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default PlaylistManager;
