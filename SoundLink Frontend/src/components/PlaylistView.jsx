import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PlayerContext } from '../context/PlayerContext';
import { FaTrash, FaEdit, FaPlay, FaRandom, FaTimes, FaMusic, FaArrowLeft, FaEllipsisH } from 'react-icons/fa';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const PlaylistView = () => {
  const { id } = useParams();
  // eslint-disable-next-line no-unused-vars
  const { playWithId, playlists, deletePlaylist, removeFromPlaylist } = useContext(PlayerContext);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState("");
  const [showOptionsFor, setShowOptionsFor] = useState(null);
  const navigate = useNavigate();
  const url = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchPlaylist();
    // eslint-disable-next-line
  }, [id]);

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

  const removeSong = async (songId) => {
    const success = await removeFromPlaylist(songId, id);
    if (success) {
      fetchPlaylist();
      setShowOptionsFor(null);
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

  const formatDuration = (seconds) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-black to-neutral-900 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-xl font-medium text-fuchsia-400">Loading playlist...</div>
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
          <div className="flex flex-col max-w-3xl">
            <p className="uppercase text-xs font-medium text-white/60 tracking-widest">Playlist</p>
            
            {editName ? (
              <div className="flex items-center gap-3 mt-2">
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && renamePlaylist()}
                  autoFocus
                  className="bg-white/10 text-white border border-white/20 rounded-lg px-4 py-2 text-2xl font-bold focus:outline-none focus:border-fuchsia-500"
                />
                <button 
                  onClick={renamePlaylist} 
                  className="bg-fuchsia-600 hover:bg-fuchsia-700 transition-colors text-white p-2 rounded-lg"
                >
                  Save
                </button>
                <button 
                  onClick={() => setEditName(false)} 
                  className="text-white/60 hover:text-white p-2 rounded-lg"
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-2">
                <h1 className="text-4xl md:text-5xl font-bold text-white break-words">{playlist.name}</h1>
                <button 
                  onClick={() => { setEditName(true); setNewName(playlist.name); }} 
                  className="text-white/60 hover:text-white"
                >
                  <FaEdit size={18} />
                </button>
              </div>
            )}
            
            <p className="text-white/60 mt-2 md:mt-4 text-sm md:text-base">
              {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button 
                onClick={playAll} 
                disabled={playlist.songs.length === 0}
                className={`bg-fuchsia-600 hover:bg-fuchsia-700 transition-colors text-white font-medium px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-fuchsia-900/20
                ${playlist.songs.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaPlay size={14} /> Play All
              </button>
              <button 
                onClick={shuffleAll} 
                disabled={playlist.songs.length === 0}
                className={`bg-white/10 hover:bg-white/20 transition-colors text-white font-medium px-6 py-3 rounded-full flex items-center gap-2
                ${playlist.songs.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaRandom size={14} /> Shuffle
              </button>
              <button 
                onClick={handleDeletePlaylist}
                className="bg-red-600/20 hover:bg-red-600/40 transition-colors text-red-400 font-medium px-6 py-3 rounded-full flex items-center gap-2"
              >
                <FaTrash size={14} /> Delete Playlist
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Songs List Section */}
      <div className="px-6 md:px-12 pt-8 max-w-7xl mx-auto w-full">
        {/* Song List Header */}
        {playlist.songs.length > 0 && (
          <div className="grid grid-cols-12 gap-4 py-2 px-4 text-white/50 font-medium text-sm border-b border-white/10">
            <div className="col-span-1 flex items-center justify-center">#</div>
            <div className="col-span-5">TITLE</div>
            <div className="col-span-4 hidden md:block">DESCRIPTION</div>
            <div className="col-span-2 hidden md:block text-right">DURATION</div>
          </div>
        )}
        
        {/* Songs List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {playlist.songs.length === 0 ? (
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
          ) : (
            <div className="divide-y divide-white/5">
              {playlist.songs.map((song, idx) => (
                <div
                  key={song._id}
                  className="grid grid-cols-12 gap-4 py-3 px-4 items-center group hover:bg-white/5 rounded-md transition-colors cursor-pointer relative"
                  onClick={() => playWithId(song._id)}
                >
                  {/* Index / Play Icon */}
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="group-hover:hidden text-white/40">{idx + 1}</span>
                    <FaPlay className="hidden group-hover:block text-white" size={12} />
                  </div>
                  
                  {/* Song Title and Image */}
                  <div className="col-span-11 md:col-span-5 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-neutral-800">
                      {song.image ? (
                        <img 
                          src={song.image} 
                          alt={song.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-900">
                          <FaMusic className="text-white/60" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-medium truncate">{song.name}</h3>
                      <p className="text-white/60 text-sm truncate md:hidden">{song.desc}</p>
                    </div>
                  </div>
                  
                  {/* Song Description */}
                  <div className="col-span-4 hidden md:block truncate text-white/60">
                    {song.desc}
                  </div>
                  
                  {/* Duration / Options */}
                  <div className="hidden md:flex col-span-2 items-center justify-end gap-4">
                    <span className="text-white/60">{formatDuration(song.duration)}</span>
                    
                    {/* Song Options Button */}
                    <div className="relative song-options">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowOptionsFor(showOptionsFor === song._id ? null : song._id);
                        }}
                        className="p-2 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/10"
                      >
                        <FaEllipsisH />
                      </button>
                      
                      {/* Options Dropdown */}
                      {showOptionsFor === song._id && (
                        <div className="absolute right-0 top-8 z-20 bg-neutral-800 rounded-md shadow-xl py-1 min-w-[150px] border border-white/10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSong(song._id);
                            }}
                            className="w-full py-2 px-4 text-left flex items-center gap-3 text-red-400 hover:bg-neutral-700 transition-colors"
                          >
                            <FaTrash size={14} /> Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PlaylistView; 