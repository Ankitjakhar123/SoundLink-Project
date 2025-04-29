import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { MdPerson, MdPlayArrow, MdPause, MdFavorite, MdFavoriteBorder, MdPlaylistAdd, MdArrowBack, MdQueueMusic, MdMoreVert } from "react-icons/md";
import { PlayerContext } from "../context/PlayerContext";
import AddToPlaylistModal from "./AddToPlaylistModal";

const ArtistDetail = () => {
  const { id } = useParams();
  const { playWithId, toggleFavorite, favorites, addToQueue, track, playStatus, pause, play } = useContext(PlayerContext);
  const [artist, setArtist] = useState(null);
  const [artistSongs, setArtistSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOptions, setShowOptions] = useState(null);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

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

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptions && !event.target.closest('.song-options')) {
        setShowOptions(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showOptions]);

  // Handlers for song actions
  const handleToggleFavorite = (e, songId) => {
    e.stopPropagation();
    toggleFavorite && toggleFavorite(songId);
  };

  const handleAddToPlaylist = (e, songId) => {
    e.stopPropagation();
    setSelectedSongId(songId);
    setShowPlaylistModal(true);
  };

  const handleAddToQueue = (e, songId) => {
    e.stopPropagation();
    addToQueue && addToQueue(songId);
  };

  const handleToggleOptions = (e, songId) => {
    e.stopPropagation();
    setShowOptions(showOptions === songId ? null : songId);
  };

  const isPlaying = (songId) => {
    return track && track._id === songId && playStatus;
  };

  const handlePlayPause = (e, songId) => {
    e.stopPropagation();
    if (track && track._id === songId) {
      if (playStatus) {
        pause();
      } else {
        play();
      }
    } else {
      playWithId(songId);
    }
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
            {artistSongs.length > 0 && (
              <button
                onClick={() => playWithId(artistSongs[0]._id)}
                className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white py-2 px-6 rounded-full flex items-center gap-2 transition-colors mx-auto md:mx-0"
              >
                <MdPlayArrow size={24} /> Play Artist
              </button>
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
            <div className="bg-neutral-900/50 backdrop-blur-md rounded-xl overflow-hidden">
              <div className="grid grid-cols-4 p-4 border-b border-neutral-800 text-neutral-400 text-sm">
                <div className="flex items-center"># TITLE</div>
                <div className="hidden md:block">ALBUM</div>
                <div className="hidden md:block">DURATION</div>
                <div className="text-right"></div>
              </div>
              
              <div className="divide-y divide-neutral-800/50">
                {artistSongs.map((song, index) => (
                  <div 
                    key={song._id} 
                    className={`grid grid-cols-4 p-4 hover:bg-white/10 transition-all cursor-pointer group ${isPlaying(song._id) ? 'bg-white/10' : ''}`}
                    onClick={() => playWithId(song._id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 text-neutral-400 flex items-center justify-center">
                        <span className={isPlaying(song._id) ? 'hidden' : 'group-hover:hidden'}>{index + 1}</span>
                        <button 
                          className={isPlaying(song._id) ? 'block' : 'hidden group-hover:block'}
                          onClick={(e) => handlePlayPause(e, song._id)}
                        >
                          {isPlaying(song._id) ? <MdPause className="text-fuchsia-500" /> : <MdPlayArrow />}
                        </button>
                      </div>
                      
                      <div className="bg-neutral-800 w-10 h-10 rounded flex-shrink-0 overflow-hidden">
                        {song.image ? (
                          <img 
                            src={song.image} 
                            alt={song.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MdPlayArrow size={20} className="text-fuchsia-500" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium truncate ${isPlaying(song._id) ? 'text-fuchsia-500' : 'text-white'}`}>{song.name}</div>
                        <div className="text-xs text-neutral-400 truncate">{song.desc}</div>
                      </div>
                    </div>
                    
                    <div className="hidden md:block text-neutral-400 truncate">
                      {song.album || "Single"}
                    </div>
                    
                    <div className="hidden md:flex items-center text-neutral-400">
                      {song.duration || "--:--"}
                    </div>
                    
                    <div className="flex items-center justify-end gap-1 sm:gap-3">
                      <button 
                        onClick={(e) => handleToggleFavorite(e, song._id)}
                        className="sm:opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-white"
                        aria-label="Toggle favorite"
                      >
                        {isFavorite(song._id) ? 
                          <MdFavorite className="text-fuchsia-500" size={18} /> : 
                          <MdFavoriteBorder size={18} />
                        }
                      </button>
                      
                      <div className="text-neutral-400 md:hidden text-[14px] sm:text-[15px]">
                        {song.duration || "--:--"}
                      </div>
                      
                      <div className="relative song-options">
                        <button 
                          onClick={(e) => handleToggleOptions(e, song._id)}
                          className="sm:opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-white"
                          aria-label="More options"
                        >
                          <MdMoreVert size={18} />
                        </button>
                        
                        {showOptions === song._id && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-800 rounded-md shadow-lg py-1 z-50 border border-neutral-700">
                            <button 
                              onClick={(e) => {e.stopPropagation(); handleAddToQueue(e, song._id)}}
                              className="w-full text-left px-4 py-2 text-white hover:bg-neutral-700 flex items-center gap-2"
                            >
                              <MdQueueMusic size={18} />
                              Add to Queue
                            </button>
                            <button 
                              onClick={(e) => {e.stopPropagation(); handleAddToPlaylist(e, song._id)}}
                              className="w-full text-left px-4 py-2 text-white hover:bg-neutral-700 flex items-center gap-2"
                            >
                              <MdPlaylistAdd size={18} />
                              Add to Playlist
                            </button>
                          </div>
                        )}
                      </div>
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
      
      {showPlaylistModal && (
        <AddToPlaylistModal 
          songId={selectedSongId} 
          onClose={() => setShowPlaylistModal(false)} 
        />
      )}
    </div>
  );
};

export default ArtistDetail; 