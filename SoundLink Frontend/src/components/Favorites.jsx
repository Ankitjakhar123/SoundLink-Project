import React, { useContext, useEffect, useState } from "react";
import { MdPlayArrow, MdFavorite, MdFavoriteBorder, MdPlaylistAdd, MdArrowBack, MdQueueMusic, MdPause } from "react-icons/md";
import { Link } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { AuthContext } from "../context/AuthContext";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const Favorites = () => {
  const { favorites, playWithId, toggleFavorite, loading, addToQueue, track, playStatus } = useContext(PlayerContext);
  const { user } = useContext(AuthContext);
  const [favoriteSongs, setFavoriteSongs] = useState([]);

  useEffect(() => {
    if (favorites) {
      setFavoriteSongs(favorites);
    }
  }, [favorites]);

  // Handlers for song actions
  const handleToggleFavorite = (e, songId) => {
    e.stopPropagation();
    toggleFavorite(songId);
  };

  const handleAddToPlaylist = (e, songId) => {
    e.stopPropagation();
    // This would be implemented with a playlist system
    console.log("Add to playlist:", songId);
  };
  
  const handleAddToQueue = (e, songId) => {
    e.stopPropagation();
    addToQueue(songId);
  };

  if (loading.favorites) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white">
        <div className="animate-pulse text-fuchsia-500 text-xl">Loading favorites...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-start items-center bg-gradient-to-b from-black via-black to-neutral-900 pb-16 px-4 pt-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Back navigation */}
        {/* <Link to="/" className="inline-flex items-center text-white/80 hover:text-white py-4">
          <MdArrowBack className="mr-2" size={20} />
          <span>Back to Home</span>
        </Link> */}

        {/* Favorites header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Your Favorites
          </h1>
          {user && (
            <p className="text-neutral-400">
              Songs you've marked as favorites, {user.username}
            </p>
          )}
        </motion.div>

        {/* Songs list */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-neutral-900/50 backdrop-blur-md rounded-xl p-6 border border-white/5"
        >
          {favoriteSongs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteSongs.map((song) => (
                <div 
                  key={song._id} 
                  className={`flex items-center gap-4 ${track && track._id === song._id ? 'bg-fuchsia-900/30' : 'bg-black/30'} p-3 rounded-lg hover:bg-white/10 transition-all cursor-pointer group`}
                  onClick={() => playWithId(song._id)}
                >
                  <div className="bg-neutral-800 w-12 h-12 rounded flex items-center justify-center relative">
                    {song.image ? (
                      <img 
                        src={song.image} 
                        alt={song.name} 
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <MdPlayArrow size={24} className="text-fuchsia-500" />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      {track && track._id === song._id ? (
                        playStatus ? (
                          <div className="bg-fuchsia-500 rounded-full p-1">
                            <MdPause size={22} className="text-white" />
                          </div>
                        ) : (
                          <div className="bg-fuchsia-500 rounded-full p-1">
                            <MdPlayArrow size={22} className="text-white" />
                          </div>
                        )
                      ) : (
                        <MdPlayArrow size={24} className="text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate text-white">{song.name}</h3>
                    <p className="text-sm text-neutral-400 truncate">{song.desc}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => handleToggleFavorite(e, song._id)}
                      className="text-white opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <MdFavorite className="text-fuchsia-500" size={20} />
                    </button>
                    <button 
                      onClick={(e) => handleAddToPlaylist(e, song._id)}
                      className="text-white opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <MdPlaylistAdd size={22} />
                    </button>
                    <button 
                      onClick={(e) => handleAddToQueue(e, song._id)}
                      className="text-white opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <MdQueueMusic size={20} />
                    </button>
                    <span className="text-neutral-400 ml-1 min-w-[45px] text-right">{song.duration || "--:--"}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <MdFavoriteBorder size={60} className="text-neutral-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No favorites yet</h3>
              <p className="text-neutral-400">
                Start liking songs to build your favorite collection
              </p>
              <Link to="/" className="block mt-6 text-fuchsia-500 hover:text-fuchsia-400">
                Browse songs to add
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Favorites; 