import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PlayerContext } from '../context/PlayerContext';
import { FaTrash, FaEdit, FaPlay, FaRandom, FaTimes, FaMusic, FaArrowLeft } from 'react-icons/fa';
import { MdPlayArrow, MdPause, MdFavorite, MdFavoriteBorder, MdPlaylistAdd, MdQueueMusic } from 'react-icons/md';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Skeleton from './Skeleton';
import AddToPlaylistModal from './AddToPlaylistModal';

const PlaylistView = () => {
  const { id } = useParams();
  const { 
    playWithId, 
    deletePlaylist, 
    toggleFavorite, 
    favorites,
    addToQueue,
    track,
    playStatus
  } = useContext(PlayerContext);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState("");
  const [showOptionsFor, setShowOptionsFor] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const navigate = useNavigate();
  const url = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchPlaylist();
    // eslint-disable-next-line
  }, [id]);

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

  // Click outside handler for song options menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptionsFor && !event.target.closest('.song-options')) {
        setShowOptionsFor(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptionsFor]);

  const fetchPlaylist = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${url}/api/playlist/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) {
        setPlaylist(data.playlist);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error("Error fetching playlist:", error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      const success = await deletePlaylist(id);
      if (success) {
        navigate('/');
      }
    }
  };

  const renamePlaylist = async () => {
    if (!newName.trim()) return;
    
    try {
      const res = await fetch(`${url}/api/playlist/rename`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ playlistId: id, name: newName })
      });
      
      const data = await res.json();
      if (data.success) {
        setEditName(false);
        fetchPlaylist();
      }
    } catch (error) {
      console.error("Error renaming playlist:", error);
    }
  };

  const playAll = () => {
    if (playlist && playlist.songs.length > 0) {
      playWithId(playlist.songs[0]._id);
    }
  };

  const shuffleAll = () => {
    if (playlist && playlist.songs.length > 0) {
      const randomIndex = Math.floor(Math.random() * playlist.songs.length);
      playWithId(playlist.songs[randomIndex]._id);
    }
  };

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

  const isFavorite = (songId) => {
    return favorites && favorites.some(fav => fav._id === songId);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-black to-neutral-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12">
          <Skeleton type="image" className="w-48 h-48" />
          <div className="flex-1">
            <Skeleton type="title" className="w-64 mb-4" />
            <Skeleton type="text" className="w-48 mb-2" />
            <Skeleton type="text" className="w-32" />
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-neutral-800/50 rounded-lg">
              <Skeleton type="image" className="w-16 h-16" />
              <div className="flex-1">
                <Skeleton type="text" className="w-48 mb-2" />
                <Skeleton type="text" className="w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  if (!playlist) return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-black to-neutral-900 text-white">
      <div className="bg-neutral-800/50 backdrop-blur-md p-8 rounded-xl border border-neutral-700 flex flex-col items-center gap-4 max-w-md text-center">
        <FaMusic className="text-5xl text-neutral-500" />
        <div className="text-2xl font-bold">Playlist not found</div>
        <p className="text-neutral-400">The playlist you're looking for doesn't exist or you don't have access to it.</p>
        <Link to="/" className="mt-4 bg-fuchsia-600 hover:bg-fuchsia-700 transition-colors text-white px-6 py-3 rounded-full font-medium">
          Go to Home
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-black via-neutral-900 to-black pb-32">
      {/* Playlist Header with Gradient Background */}
      <div className="relative">
        {/* Header Background with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-900/30 to-black z-0 h-96"></div>
        
        {/* Back Navigation */}
        <div className="relative z-10 pt-6 px-6">
          <Link to="/" className="inline-flex items-center text-white/80 hover:text-white">
            <FaArrowLeft className="mr-2" size={18} />
            <span>Back</span>
          </Link>
        </div>
        
        {/* Playlist Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 px-6 md:px-12 py-8 flex flex-col md:flex-row items-start md:items-end gap-8 max-w-7xl mx-auto"
        >
          {/* Playlist Cover */}
          <div className="w-52 h-52 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl shadow-fuchsia-900/20 group">
            <div className="w-full h-full bg-gradient-to-br from-fuchsia-600 to-purple-800 flex items-center justify-center relative">
              <FaMusic className="text-white/80 text-6xl" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <button 
                  onClick={playAll} 
                  disabled={playlist.songs.length === 0}
                  className={`bg-fuchsia-500 text-white rounded-full p-4 
                    ${playlist.songs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-fuchsia-600'}`}
                >
                  <FaPlay size={24} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Playlist Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-4">
              {editName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-neutral-800 text-white px-4 py-2 rounded-lg border border-neutral-700"
                    placeholder="New playlist name"
                  />
                  <button
                    onClick={renamePlaylist}
                    className="bg-fuchsia-600 text-white px-4 py-2 rounded-lg hover:bg-fuchsia-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditName(false)}
                    className="text-neutral-400 hover:text-white"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-4xl md:text-5xl font-bold text-white truncate">
                    {playlist.name}
                  </h1>
                  <button
                    onClick={() => {
                      setNewName(playlist.name);
                      setEditName(true);
                    }}
                    className="text-neutral-400 hover:text-white"
                  >
                    <FaEdit size={20} />
                  </button>
                  <button
                    onClick={handleDeletePlaylist}
                    className="text-neutral-400 hover:text-red-500"
                  >
                    <FaTrash size={20} />
                  </button>
                </>
              )}
            </div>
            
            <p className="text-neutral-400 mb-6">
              {playlist.songs.length} songs
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={playAll}
                disabled={playlist.songs.length === 0}
                className={`bg-fuchsia-600 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2
                  ${playlist.songs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-fuchsia-700'}`}
              >
                <FaPlay size={18} />
                Play All
              </button>
              <button
                onClick={shuffleAll}
                disabled={playlist.songs.length === 0}
                className={`bg-neutral-800 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2
                  ${playlist.songs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-700'}`}
              >
                <FaRandom size={18} />
                Shuffle
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Songs List */}
      <div className="px-6 md:px-12 pt-8 max-w-7xl mx-auto w-full">
        {playlist.songs.length > 0 ? (
          <>
            {/* Grid View (for small screens) */}
            {viewMode === 'grid' && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-4"
              >
                {playlist.songs.map((song) => (
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
                        {isFavorite(song._id) ? 
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
              </motion.div>
            )}

            {/* List View (for larger screens) */}
            {viewMode === 'list' && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="backdrop-blur-md rounded-xl p-6 border border-white/5"
                style={{
                  background: 'linear-gradient(135deg, rgba(142, 36, 170, 0.2), rgba(18, 18, 18, 0.1))'
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {playlist.songs.map((song, index) => (
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
              </motion.div>
            )}
          </>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center">
            <FaMusic className="text-6xl text-white/20 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">This playlist is empty</h3>
            <p className="text-white/60 mb-8 text-center max-w-md">
              Start adding your favorite songs to create your perfect playlist.
            </p>
            <Link 
              to="/" 
              className="bg-fuchsia-600 hover:bg-fuchsia-700 transition-colors text-white px-6 py-3 rounded-full font-medium"
            >
              Browse Songs
            </Link>
          </div>
        )}
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

export default PlaylistView; 