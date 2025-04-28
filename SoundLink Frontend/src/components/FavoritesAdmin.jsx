import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const FavoritesAdmin = ({ token }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const url = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    const res = await axios.get(`${url}/api/favorites/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setFavorites(res.data.favorites);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-black/90 rounded-xl shadow-2xl p-8 w-full max-w-2xl mx-auto flex flex-col gap-6 mt-8"
    >
      <h2 className="text-2xl font-bold text-white mb-4">All User Favorites</h2>
      {loading ? (
        <div className="text-white">Loading...</div>
      ) : (
        <ul className="space-y-2">
          {favorites.map((fav) => (
            <li key={fav._id} className="bg-neutral-900 rounded-lg px-4 py-3 flex flex-col">
              <span className="text-white font-semibold">User: {fav.user?.email || fav.user}</span>
              <span className="text-fuchsia-400">Song: {fav.song?.name || fav.song}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default FavoritesAdmin; 