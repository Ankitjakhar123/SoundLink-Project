import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { MdPlayArrow, MdFavorite, MdFavoriteBorder, MdPlaylistAdd, MdArrowBack, MdSearch, MdClear, MdPause, MdQueueMusic, MdMusicNote } from 'react-icons/md';
import { PlayerContext } from '../context/PlayerContext';
import AddToPlaylistModal from './AddToPlaylistModal';
import { toast } from 'react-toastify';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const TrendingSongs = () => {
  const { playWithId, track, playStatus, toggleFavorite, favorites, addToQueue } = useContext(PlayerContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    const fetchTrendingSongs = async () => {
      try {
        setLoading(true);
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
        const response = await fetch(`${backendUrl}/api/song/list?all=true`);
        const data = await response.json();
        
        if (data.success) {
          // For now, we'll simulate trending by:
          // 1. Taking all songs
          // 2. Sorting them randomly (or you could sort by play count if available)
          // 3. Taking the top 20 as "trending"
          const allSongs = data.songs;
          // Sort randomly for now (in a real app, this would be based on popularity metrics)
          const sortedSongs = [...allSongs].sort(() => Math.random() - 0.5).slice(0, 20);
          setTrendingSongs(sortedSongs);
        } else {
          setError('Failed to load trending songs');
        }
      } catch (error) {
        console.error('Error fetching trending songs:', error);
        setError('Failed to load trending songs');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingSongs();
  }, []);

  // Check screen size and set view mode accordingly
  useEffect(() => {
    const handleResize = () => {
      setViewMode(window.innerWidth < 768 ? 'grid' : 'list');
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredSongs = trendingSongs.filter(song => 
    song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (song.desc && song.desc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handlers for song actions
  const handleToggleFavorite = (e, songId) => {
    e.stopPropagation();
    toggleFavorite(songId);
  };

  const handleAddToPlaylist = (e, songId) => {
    e.stopPropagation();
    setSelectedSongId(songId);
    setShowPlaylistModal(true);
  };

  const handleAddToQueue = (e, songId) => {
    e.stopPropagation();
    addToQueue(songId);
    toast.success("Added to queue");
  };

  const isFavorite = (songId) => {
    return favorites && favorites.some(fav => fav._id === songId);
  };

  const isPlaying = (songId) => {
    return track && track._id === songId && playStatus;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white">
        <div className="animate-pulse text-fuchsia-500 text-xl">Loading trending songs...</div>
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

  return (
    <div className="min-h-screen w-full flex flex-col justify-start items-center bg-gradient-to-b from-black via-black to-neutral-900 pb-16 px-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Back navigation */}
        {/* <Link to="/" className="inline-flex items-center text-white/80 hover:text-white py-4">
          <MdArrowBack className="mr-2" size={20} />
          <span>Back to Home</span>
        </Link> */}

        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Trending Songs
          </h1>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search trending songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-10 bg-neutral-800/70 border border-neutral-700 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            />
            <MdSearch className="absolute top-2.5 left-3 text-neutral-400" size={20} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute top-2.5 right-3 text-neutral-400 hover:text-white"
              >
                <MdClear size={20} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Grid View (for small screens) */}
        {viewMode === 'grid' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
          >
            {filteredSongs.length > 0 ? (
              filteredSongs.map((song) => (
                <div 
                  key={song._id}
                  onClick={() => playWithId(song._id)}
                  className="relative bg-neutral-900/50 rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 hover:bg-neutral-800/70 shadow-lg hover:shadow-xl"
                >
                  <div className="aspect-square relative overflow-hidden">
                    {song.image ? (
                      <img 
                        src={song.image} 
                        alt={song.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-fuchsia-500">
                        <MdMusicNote size={60} />
                      </div>
                    )}
                    
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      {isPlaying(song._id) ? (
                        <div className="bg-fuchsia-500 rounded-full p-3">
                          <MdPause className="text-white" size={30} />
                        </div>
                      ) : (
                        <div className="bg-fuchsia-500 rounded-full p-3">
                          <MdPlayArrow className="text-white" size={30} />
                        </div>
                      )}
                    </div>
                    
                    {/* Favorite button */}
                    <button 
                      onClick={(e) => handleToggleFavorite(e, song._id)}
                      className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {isFavorite(song._id) ? 
                        <MdFavorite className="text-fuchsia-500" size={20} /> : 
                        <MdFavoriteBorder className="text-white" size={20} />
                      }
                    </button>
                  </div>
                  
                  <div className="p-3">
                    <h3 className={`font-bold truncate ${isPlaying(song._id) ? 'text-fuchsia-500' : 'text-white'}`}>
                      {song.name}
                    </h3>
                    <p className="text-xs text-neutral-400 truncate mt-1">{song.desc}</p>
                    
                    {/* Song actions */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-neutral-400">{song.duration || "--:--"}</span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => handleAddToQueue(e, song._id)}
                          className="text-neutral-400 hover:text-white"
                        >
                          <MdQueueMusic size={18} />
                        </button>
                        <button 
                          onClick={(e) => handleAddToPlaylist(e, song._id)}
                          className="text-neutral-400 hover:text-white"
                        >
                          <MdPlaylistAdd size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-neutral-900/30 rounded-xl">
                <MdPlayArrow size={60} className="text-neutral-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No trending songs found</h3>
                <p className="text-neutral-400">
                  {searchQuery ? 'No songs match your search.' : 'There are no trending songs to display yet.'}
                </p>
                <Link to="/" className="block mt-6 text-fuchsia-500 hover:text-fuchsia-400">
                  Browse all songs
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {/* List View (for larger screens) */}
        {viewMode === 'list' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-neutral-900/50 backdrop-blur-md rounded-xl p-6 border border-white/5"
          >
            {filteredSongs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSongs.map((song, index) => (
                  <div 
                    key={song._id} 
                    className="flex items-center gap-4 bg-black/30 p-3 rounded-lg hover:bg-white/10 transition-all cursor-pointer group"
                    onClick={() => playWithId(song._id)}
                  >
                    <div className="flex-shrink-0 w-8 text-center text-neutral-500">
                      {index + 1}
                    </div>
                    <div className="bg-neutral-800 w-12 h-12 rounded flex items-center justify-center relative">
                      {song.image ? (
                        <img 
                          src={song.image} 
                          alt={song.name} 
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                          {track && track._id === song._id ? (
                            playStatus ? (
                              <div className="bg-fuchsia-500 rounded-full p-1">
                                <MdPause className="text-white" size={24} />
                              </div>
                            ) : (
                              <div className="bg-fuchsia-500 rounded-full p-1">
                                <MdPlayArrow className="text-white" size={24} />
                              </div>
                            )
                          ) : (
                            <MdPlayArrow className="text-white" size={24} />
                          )}
                        </div>
                      )}
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
                      <button 
                        onClick={(e) => handleAddToQueue(e, song._id)}
                        className="text-white opacity-50 hover:opacity-100 transition-opacity"
                      >
                        <MdQueueMusic size={22} />
                      </button>
                      <span className="text-neutral-400 ml-1 min-w-[45px] text-right">{song.duration || "--:--"}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <MdPlayArrow size={60} className="text-neutral-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No trending songs found</h3>
                <p className="text-neutral-400">
                  {searchQuery ? 'No songs match your search.' : 'There are no trending songs to display yet.'}
                </p>
                <Link to="/" className="block mt-6 text-fuchsia-500 hover:text-fuchsia-400">
                  Browse all songs
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Add To Playlist Modal */}
      {showPlaylistModal && (
        <AddToPlaylistModal 
          songId={selectedSongId} 
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  );
};

export default TrendingSongs; 