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
    playStatus, 
    pause, 
    play 
  } = useContext(PlayerContext);
  
  const [activeTab, setActiveTab] = useState('favorites');
  const [showOptions, setShowOptions] = useState(null);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  
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
      <div className="mt-6 bg-neutral-900/50 backdrop-blur-md rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 p-4 border-b border-neutral-900 text-neutral-400 text-sm">
          <div className="col-span-7 md:col-span-6 flex items-center"># TITLE</div>
          <div className="hidden md:block md:col-span-3">ALBUM</div>
          <div className="col-span-3 md:col-span-2 text-right md:text-left">DURATION</div>
          <div className="col-span-2 md:col-span-1 text-right"></div>
        </div>
        
        <div className="divide-y divide-neutral-900/50">
          {favorites.map((song, index) => (
            <div 
              key={song._id} 
              className={`grid grid-cols-12 p-4 hover:bg-white/10 transition-all cursor-pointer group ${isPlaying(song._id) ? 'bg-white/10' : ''}`}
              onClick={() => playWithId(song._id)}
            >
              <div className="col-span-7 md:col-span-6 flex items-center gap-3">
                <div className="w-6 min-w-[24px] text-neutral-400 flex items-center justify-center">
                  <span className={isPlaying(song._id) ? 'hidden' : 'group-hover:hidden'}>{index + 1}</span>
                  <button 
                    className={isPlaying(song._id) ? 'block' : 'hidden group-hover:block'}
                    onClick={(e) => handlePlayPause(e, song._id)}
                  >
                    {isPlaying(song._id) ? <MdPause className="text-fuchsia-500" /> : <MdPlayArrow />}
                  </button>
                </div>
                
                <div className="bg-neutral-800 w-10 h-10 min-w-[40px] rounded flex-shrink-0 overflow-hidden">
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
              
              <div className="hidden md:block md:col-span-3 text-neutral-400 truncate">
                {song.album || "Single"}
              </div>
              
              <div className="col-span-3 md:col-span-2 flex items-center text-neutral-400 justify-end md:justify-start">
                {song.duration || "--:--"}
              </div>
              
              <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-1 sm:gap-3">
                <button 
                  onClick={(e) => handleToggleFavorite(e, song._id)}
                  className="opacity-70 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-white"
                  aria-label="Toggle favorite"
                >
                  <MdFavorite className="text-fuchsia-500" size={18} />
                </button>
                
                <div className="relative song-options">
                  <button 
                    onClick={(e) => handleToggleOptions(e, song._id)}
                    className="opacity-70 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-white"
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
            className="bg-neutral-900/50 rounded-lg p-4 hover:bg-neutral-800 transition-all cursor-pointer shadow-lg"
          >
            <div className="aspect-square rounded bg-neutral-800 mb-3 overflow-hidden flex items-center justify-center">
              {playlist.songs && playlist.songs.length > 0 && playlist.songs[0].image ? (
                <img 
                  src={playlist.songs[0].image} 
                  alt={playlist.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <MdPlaylistPlay size={50} className="text-fuchsia-500/50" />
              )}
            </div>
            <h4 className="text-white font-medium truncate">{playlist.name}</h4>
            <p className="text-neutral-400 text-sm truncate">{playlist.songs ? playlist.songs.length : 0} songs</p>
          </Link>
        ))}
      </div>
    );
  };
  
  // Render recently played tracks
  const renderHistory = () => {
    if (!recentlyPlayed || recentlyPlayed.length === 0) {
      return (
        <div className="py-12 text-center bg-neutral-900/30 rounded-xl my-6">
          <MdHistory size={60} className="text-neutral-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No recent history</h3>
          <p className="text-neutral-400">
            Play songs to see your listening history
          </p>
        </div>
      );
    }
    
    return (
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {recentlyPlayed.map(song => (
          <div 
            key={song._id}
            onClick={() => playWithId(song._id)} 
            className="bg-neutral-900/50 rounded-lg p-3 hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <div className="aspect-square rounded bg-neutral-800 mb-3 overflow-hidden relative group">
              {song.image ? (
                <img 
                  src={song.image} 
                  alt={song.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MdPlayArrow size={40} className="text-fuchsia-500/50" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <button className="bg-fuchsia-500 rounded-full p-3">
                  <MdPlayArrow className="text-white" size={24} />
                </button>
              </div>
            </div>
            <h4 className="text-white font-medium truncate">{song.name}</h4>
            <p className="text-neutral-400 text-sm truncate">{song.desc}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-start items-center bg-gradient-to-b from-black via-black to-neutral-900 pb-16 px-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Back navigation */}
        <Link to="/" className="inline-flex items-center text-white/80 hover:text-white py-4">
          <MdArrowBack className="mr-2" size={20} />
          <span>Back to Home</span>
        </Link>

        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-4 mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Your Library
          </h1>
          
          {/* Tabs */}
          <div className="flex border-b border-neutral-900">
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'favorites' 
                  ? 'text-fuchsia-500 border-b-2 border-fuchsia-500' 
                  : 'text-white hover:text-fuchsia-400'
              }`}
              onClick={() => setActiveTab('favorites')}
            >
              <div className="flex items-center gap-2">
                <MdFavorite />
                <span>Favorites</span>
              </div>
            </button>
            
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'playlists' 
                  ? 'text-fuchsia-500 border-b-2 border-fuchsia-500' 
                  : 'text-white hover:text-fuchsia-400'
              }`}
              onClick={() => setActiveTab('playlists')}
            >
              <div className="flex items-center gap-2">
                <MdPlaylistPlay />
                <span>Playlists</span>
              </div>
            </button>
            
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'history' 
                  ? 'text-fuchsia-500 border-b-2 border-fuchsia-500' 
                  : 'text-white hover:text-fuchsia-400'
              }`}
              onClick={() => setActiveTab('history')}
            >
              <div className="flex items-center gap-2">
                <MdHistory />
                <span>Recently Played</span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Content based on active tab */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-[300px]"
        >
          {renderContent()}
        </motion.div>
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

export default Library; 