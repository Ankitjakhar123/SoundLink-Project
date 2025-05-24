import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { MdFavorite, MdPlaylistPlay, MdHistory, MdPlayArrow, MdPause, MdFavoriteBorder, MdPlaylistAdd, MdQueueMusic, MdMoreVert, MdArrowBack } from 'react-icons/md';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';
import AddToPlaylistModal from './AddToPlaylistModal';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const Library = () => {
  const { user } = useContext(AuthContext);
  const { 
    playWithId, 
    favorites, 
    toggleFavorite, 
    playlists, 
    getUserPlaylists, 
    addToQueue, 
    track, 
    playStatus
  } = useContext(PlayerContext);
  
  const [activeTab, setActiveTab] = useState('favorites');
  const [showOptions, setShowOptions] = useState(null);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Fetch playlists on component mount
  useEffect(() => {
    if (user) {
      getUserPlaylists();
    }
  }, [user, getUserPlaylists]);
  
  // Get recently played from localStorage
  useEffect(() => {
    const storedRecents = localStorage.getItem('recentlyPlayed');
    if (storedRecents) {
      try {
        setRecentlyPlayed(JSON.parse(storedRecents));
      } catch (error) {
        console.error('Error parsing recently played:', error);
        setRecentlyPlayed([]);
      }
    }
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
  };

  const isPlaying = (songId) => {
    return track && track._id === songId && playStatus;
  };
  
  // Determine which content to show based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'favorites':
        return renderFavorites();
      case 'playlists':
        return renderPlaylists();
      case 'history':
        return renderHistory();
      default:
        return renderFavorites();
    }
  };
  
  // Render favorite songs
  const renderFavorites = () => {
    if (!favorites || favorites.length === 0) {
      return (
        <div className="py-12 text-center bg-neutral-900/30 rounded-xl my-6">
          <MdFavorite size={60} className="text-neutral-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No favorites yet</h3>
          <p className="text-neutral-400">
            Like songs to add them to your favorites
          </p>
        </div>
      );
    }
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-6"
      >
        {/* Grid View (for small screens) */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {favorites.map((song) => (
              <div 
                key={song._id} 
                onClick={() => playWithId(song._id)}
                className="relative rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 hover:bg-white/10 shadow-lg hover:shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(142, 36, 170, 0.2), rgba(18, 18, 18, 0.1))'
                }}
              >
                <div className="aspect-square relative overflow-hidden">
                  {song.image ? (
                    <img 
                      src={song.image} 
                      alt={song.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-fuchsia-500"
                         style={{
                           background: 'linear-gradient(135deg, rgba(142, 36, 170, 0.3), rgba(18, 18, 18, 0.2))'
                         }}>
                      <MdPlayArrow size={60} />
                    </div>
                  )}
                  
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                    {isPlaying(song._id) ? (
                      <div className="bg-fuchsia-500 rounded-full p-3 shadow-lg transform scale-110">
                        <MdPause className="text-white" size={30} />
                      </div>
                    ) : (
                      <div className="bg-fuchsia-500 rounded-full p-3 shadow-lg transform scale-110">
                        <MdPlayArrow className="text-white" size={30} />
                      </div>
                    )}
                  </div>
                  
                  {/* Favorite button */}
                  <button 
                    onClick={(e) => handleToggleFavorite(e, song._id)}
                    className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MdFavorite className="text-fuchsia-500" size={20} />
                  </button>
                </div>
                
                <div className="p-3">
                  <h3 className={`font-bold truncate ${isPlaying(song._id) ? 'text-fuchsia-500' : 'text-white'}`}>
                    {isPlaying(song._id) && (
                      <span className="inline-block w-2 h-2 bg-fuchsia-500 rounded-full mr-2 animate-pulse"></span>
                    )}
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
            ))}
          </div>
        )}

        {/* List View (for larger screens) */}
        {viewMode === 'list' && (
          <div className="backdrop-blur-md rounded-xl p-6 border border-white/5"
               style={{
                 background: 'linear-gradient(135deg, rgba(142, 36, 170, 0.2), rgba(18, 18, 18, 0.1))'
               }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favorites.map((song, index) => (
                <div 
                  key={song._id} 
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-all cursor-pointer group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(142, 36, 170, 0.3), rgba(18, 18, 18, 0.2))'
                  }}
                  onClick={() => playWithId(song._id)}
                >
                  <div className="flex-shrink-0 w-8 text-center text-neutral-500">
                    {isPlaying(song._id) ? (
                      <div className="bg-fuchsia-500 rounded-full p-1">
                        <MdPause className="text-white" size={16} />
                      </div>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="bg-neutral-800 w-12 h-12 rounded flex items-center justify-center relative group-hover:bg-neutral-700 transition-colors">
                    {song.image ? (
                      <img 
                        src={song.image} 
                        alt={song.name} 
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MdPlayArrow className="text-fuchsia-500" size={24} />
                      </div>
                    )}
                    {isPlaying(song._id) && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="bg-fuchsia-500 rounded-full p-1">
                          <MdPause className="text-white" size={24} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold truncate ${isPlaying(song._id) ? 'text-fuchsia-500' : 'text-white'}`}>
                      {isPlaying(song._id) && (
                        <span className="inline-block w-2 h-2 bg-fuchsia-500 rounded-full mr-2 animate-pulse"></span>
                      )}
                      {song.name}
                    </h3>
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
                      <MdQueueMusic size={22} />
                    </button>
                    <span className="text-neutral-400 ml-1 min-w-[45px] text-right">{song.duration || "--:--"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  };
  
  // Render user playlists
  const renderPlaylists = () => {
    if (!playlists || playlists.length === 0) {
      return (
        <div className="py-12 text-center bg-neutral-900/30 rounded-xl my-6">
          <MdPlaylistPlay size={60} className="text-neutral-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No playlists yet</h3>
          <p className="text-neutral-400">
            Create playlists to organize your music
          </p>
        </div>
      );
    }
    
    return (
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {playlists.map(playlist => (
          <Link 
            key={playlist._id}
            to={`/playlist/${playlist._id}`}
            className="group"
          >
            <div className="aspect-square rounded-lg overflow-hidden bg-neutral-800 relative">
              <div className="w-full h-full bg-gradient-to-br from-fuchsia-600 to-purple-800 flex items-center justify-center">
                <MdPlaylistPlay className="text-white/80 text-4xl" />
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <div className="bg-fuchsia-500 rounded-full p-3 shadow-lg transform scale-110">
                  <MdPlayArrow className="text-white" size={24} />
                </div>
              </div>
            </div>
            <h3 className="mt-2 text-white font-medium truncate">{playlist.name}</h3>
            <p className="text-sm text-neutral-400">{playlist.songs.length} songs</p>
          </Link>
        ))}
      </div>
    );
  };
  
  // Render recently played songs
  const renderHistory = () => {
    if (!recentlyPlayed || recentlyPlayed.length === 0) {
      return (
        <div className="py-12 text-center bg-neutral-900/30 rounded-xl my-6">
          <MdHistory size={60} className="text-neutral-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No history yet</h3>
          <p className="text-neutral-400">
            Your recently played songs will appear here
          </p>
        </div>
      );
    }
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-6"
      >
        {/* Grid View (for small screens) */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {recentlyPlayed.map((song) => (
              <div 
                key={song._id} 
                onClick={() => playWithId(song._id)}
                className="relative rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 hover:bg-white/10 shadow-lg hover:shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(142, 36, 170, 0.2), rgba(18, 18, 18, 0.1))'
                }}
              >
                <div className="aspect-square relative overflow-hidden">
                  {song.image ? (
                    <img 
                      src={song.image} 
                      alt={song.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-fuchsia-500"
                         style={{
                           background: 'linear-gradient(135deg, rgba(142, 36, 170, 0.3), rgba(18, 18, 18, 0.2))'
                         }}>
                      <MdPlayArrow size={60} />
                    </div>
                  )}
                  
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                    {isPlaying(song._id) ? (
                      <div className="bg-fuchsia-500 rounded-full p-3 shadow-lg transform scale-110">
                        <MdPause className="text-white" size={30} />
                      </div>
                    ) : (
                      <div className="bg-fuchsia-500 rounded-full p-3 shadow-lg transform scale-110">
                        <MdPlayArrow className="text-white" size={30} />
                      </div>
                    )}
                  </div>
                  
                  {/* Favorite button */}
                  <button 
                    onClick={(e) => handleToggleFavorite(e, song._id)}
                    className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {favorites && favorites.some(fav => fav._id === song._id) ? 
                      <MdFavorite className="text-fuchsia-500" size={20} /> : 
                      <MdFavoriteBorder className="text-white" size={20} />
                    }
                  </button>
                </div>
                
                <div className="p-3">
                  <h3 className={`font-bold truncate ${isPlaying(song._id) ? 'text-fuchsia-500' : 'text-white'}`}>
                    {isPlaying(song._id) && (
                      <span className="inline-block w-2 h-2 bg-fuchsia-500 rounded-full mr-2 animate-pulse"></span>
                    )}
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
            ))}
          </div>
        )}

        {/* List View (for larger screens) */}
        {viewMode === 'list' && (
          <div className="backdrop-blur-md rounded-xl p-6 border border-white/5"
               style={{
                 background: 'linear-gradient(135deg, rgba(142, 36, 170, 0.2), rgba(18, 18, 18, 0.1))'
               }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentlyPlayed.map((song, index) => (
                <div 
                  key={song._id} 
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-all cursor-pointer group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(142, 36, 170, 0.3), rgba(18, 18, 18, 0.2))'
                  }}
                  onClick={() => playWithId(song._id)}
                >
                  <div className="flex-shrink-0 w-8 text-center text-neutral-500">
                    {isPlaying(song._id) ? (
                      <div className="bg-fuchsia-500 rounded-full p-1">
                        <MdPause className="text-white" size={16} />
                      </div>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="bg-neutral-800 w-12 h-12 rounded flex items-center justify-center relative group-hover:bg-neutral-700 transition-colors">
                    {song.image ? (
                      <img 
                        src={song.image} 
                        alt={song.name} 
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MdPlayArrow className="text-fuchsia-500" size={24} />
                      </div>
                    )}
                    {isPlaying(song._id) && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="bg-fuchsia-500 rounded-full p-1">
                          <MdPause className="text-white" size={24} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold truncate ${isPlaying(song._id) ? 'text-fuchsia-500' : 'text-white'}`}>
                      {isPlaying(song._id) && (
                        <span className="inline-block w-2 h-2 bg-fuchsia-500 rounded-full mr-2 animate-pulse"></span>
                      )}
                      {song.name}
                    </h3>
                    <p className="text-sm text-neutral-400 truncate">{song.desc}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => handleToggleFavorite(e, song._id)}
                      className="text-white opacity-50 hover:opacity-100 transition-opacity"
                    >
                      {favorites && favorites.some(fav => fav._id === song._id) ? 
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
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-black via-neutral-900 to-black pb-32 px-4 pt-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Library header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Your Library
          </h1>
          {user && (
            <p className="text-neutral-400">
              Your personal music collection, {user.username}
            </p>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'bg-fuchsia-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            Favorites
          </button>
          <button
            onClick={() => setActiveTab('playlists')}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              activeTab === 'playlists'
                ? 'bg-fuchsia-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            Playlists
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-fuchsia-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            History
          </button>
        </div>

        {/* Content */}
        {renderContent()}
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

export default Library; 