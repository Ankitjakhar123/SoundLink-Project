import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { MdPerson, MdPlayArrow, MdFavorite, MdFavoriteBorder, MdPlaylistAdd, MdArrowBack } from "react-icons/md";
import { PlayerContext } from "../context/PlayerContext";

const ArtistDetail = () => {
  const { id } = useParams();
  const { playWithId, toggleFavorite, favorites } = useContext(PlayerContext);
  const [artist, setArtist] = useState(null);
  const [artistSongs, setArtistSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if a song is in favorites
  const isFavorite = (songId) => {
    return favorites && favorites.some(fav => fav._id === songId);
  };

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true);
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
        
        // Fetch artist details
        const artistRes = await axios.get(`${backendUrl}/api/artist/${id}`);
        if (artistRes.data.success) {
          setArtist(artistRes.data.artist);
          
          // Fetch all songs
          const songsRes = await axios.get(`${backendUrl}/api/song/list`);
          if (songsRes.data.success) {
            // Filter songs by artist ID or by matching artist name in descriptions
            const artistName = artistRes.data.artist.name.toLowerCase();
            const filteredSongs = songsRes.data.songs.filter(song => 
              // Match by artist ID reference
              (song.artist && song.artist === id) || 
              // Match by artist name in song name or description
              (song.name && song.name.toLowerCase().includes(artistName)) ||
              (song.desc && song.desc.toLowerCase().includes(artistName))
            );
            setArtistSongs(filteredSongs);
          }
        }
      } catch (err) {
        console.error("Error fetching artist data:", err);
        setError("Failed to load artist information");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArtistData();
    }
  }, [id]);

  // Handlers for song actions
  const handleToggleFavorite = (e, songId) => {
    e.stopPropagation();
    toggleFavorite && toggleFavorite(songId);
  };

  const handleAddToPlaylist = (e, songId) => {
    e.stopPropagation();
    // This would be implemented with a playlist system
    console.log("Add to playlist:", songId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white">
        <div className="animate-pulse text-fuchsia-500 text-xl">Loading artist...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white">
        <div className="text-white text-xl">Artist not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-start items-center bg-gradient-to-b from-black via-black to-neutral-900 pb-16 px-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Back navigation */}
        <Link to="/" className="inline-flex items-center text-white/80 hover:text-white py-4">
          <MdArrowBack className="mr-2" size={20} />
          <span>Back to Home</span>
        </Link>

        {/* Artist header */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-48 h-48 rounded-full overflow-hidden border-4 border-fuchsia-500/30 shadow-lg"
          >
            {artist.image ? (
              <img 
                src={artist.image} 
                alt={artist.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                <MdPerson className="text-fuchsia-500" size={80} />
              </div>
            )}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 text-center md:text-left"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{artist.name}</h1>
            {artist.bio && (
              <p className="text-neutral-300 text-lg mb-6 max-w-2xl">{artist.bio}</p>
            )}
          </motion.div>
        </div>

        {/* Songs section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <MdPlayArrow className="text-fuchsia-500 mr-2" size={24} />
            Songs by {artist.name}
          </h2>

          {artistSongs.length > 0 ? (
            <div className="bg-neutral-900/50 backdrop-blur-md rounded-xl p-6 border border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {artistSongs.map((song) => (
                  <div 
                    key={song._id} 
                    className="flex items-center gap-4 bg-black/30 p-3 rounded-lg hover:bg-white/10 transition-all cursor-pointer group"
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
                        <MdPlayArrow size={24} className="text-white" />
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
                        {isFavorite(song._id) ? 
                          <MdFavorite className="text-fuchsia-500" size={20} /> : 
                          <MdFavoriteBorder size={20} />
                        }
                      </button>
                      <button 
                        onClick={(e) => handleAddToPlaylist(e, song._id)}
                        className="text-white opacity-50 hover:opacity-100 transition-opacity"
                      >
                        <MdPlaylistAdd size={22} />
                      </button>
                      <span className="text-neutral-400 ml-1 min-w-[45px] text-right">{song.duration || "--:--"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-neutral-900/50 backdrop-blur-md rounded-xl p-8 border border-white/5 text-center">
              <p className="text-neutral-400">No songs available by this artist yet</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ArtistDetail; 