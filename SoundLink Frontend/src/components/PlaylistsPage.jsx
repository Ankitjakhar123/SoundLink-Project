import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { PlayerContext } from '../context/PlayerContext';
import axios from 'axios';
import { 
  MdPlaylistAdd, 
  MdPlaylistPlay, 
  MdMusicNote, 
  MdDeleteOutline,
  MdOutlineEdit
} from 'react-icons/md';
import { FaPlay, FaHeadphones } from 'react-icons/fa';
import { motion } from 'framer-motion';

const PlaylistsPage = () => {
  const { user, token } = useContext(AuthContext);
  const { playWithId } = useContext(PlayerContext);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const navigate = useNavigate();
  const url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { message: 'Please sign in to view your playlists', returnTo: '/playlists' } });
    } else {
      fetchPlaylists();
    }
  }, [user, navigate]);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/playlist/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaylists(res.data.playlists || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    
    setCreatingPlaylist(true);
    try {
      await axios.post(
        `${url}/api/playlist/create`,
        { name: newPlaylistName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewPlaylistName('');
      setShowCreateForm(false);
      fetchPlaylists();
    } catch (error) {
      console.error('Error creating playlist:', error);
    } finally {
      setCreatingPlaylist(false);
    }
  };

  const deletePlaylist = async (id) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;
    
    try {
      await axios.delete(`${url}/api/playlist/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPlaylists();
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  // Extract dominant colors from playlist songs for theme
  const getPlaylistTheme = (playlist) => {
    if (!playlist?.songs?.length) {
      return {
        bgGradient: 'from-neutral-900 to-neutral-800',
        textColor: 'text-white',
        btnColor: 'bg-fuchsia-600 hover:bg-fuchsia-700'
      };
    }

    // Based on number of songs and genres
    const songsCount = playlist.songs.length;
    
    // Extract genres if available
    const genres = playlist.songs
      .map(song => song.genre)
      .filter(Boolean);
    
    const uniqueGenres = [...new Set(genres)];
    
    // Assign theme based on genre or song count
    if (uniqueGenres.includes('rock')) {
      return {
        bgGradient: 'from-red-900 to-neutral-900',
        textColor: 'text-red-200',
        btnColor: 'bg-red-600 hover:bg-red-700'
      };
    } else if (uniqueGenres.includes('electronic') || uniqueGenres.includes('dance')) {
      return {
        bgGradient: 'from-cyan-900 to-blue-900',
        textColor: 'text-cyan-200',
        btnColor: 'bg-cyan-600 hover:bg-cyan-700'
      };
    } else if (uniqueGenres.includes('hip-hop') || uniqueGenres.includes('rap')) {
      return {
        bgGradient: 'from-purple-900 to-neutral-900',
        textColor: 'text-purple-200',
        btnColor: 'bg-purple-600 hover:bg-purple-700'
      };
    } else if (uniqueGenres.includes('jazz') || uniqueGenres.includes('blues')) {
      return {
        bgGradient: 'from-amber-900 to-neutral-900',
        textColor: 'text-amber-200',
        btnColor: 'bg-amber-600 hover:bg-amber-700'
      };
    } else if (songsCount > 15) {
      return {
        bgGradient: 'from-emerald-900 to-neutral-900',
        textColor: 'text-emerald-200',
        btnColor: 'bg-emerald-600 hover:bg-emerald-700'
      };
    } else if (songsCount > 8) {
      return {
        bgGradient: 'from-fuchsia-900 to-neutral-900',
        textColor: 'text-fuchsia-200',
        btnColor: 'bg-fuchsia-600 hover:bg-fuchsia-700'
      };
    } else {
      return {
        bgGradient: 'from-indigo-900 to-neutral-900',
        textColor: 'text-indigo-200',
        btnColor: 'bg-indigo-600 hover:bg-indigo-700'
      };
    }
  };

  // Create a mosaic of cover arts for playlist without songs
  const PlaylistCoverMosaic = ({ playlist }) => {
    // Take up to 4 songs for the mosaic
    const songs = playlist?.songs?.slice(0, 4) || [];
    
    if (songs.length === 0) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
          <MdPlaylistPlay className="text-neutral-600" size={40} />
        </div>
      );
    }
    
    if (songs.length === 1) {
      return (
        <div className="w-full h-full bg-black">
          {songs[0].image ? (
            <img 
              src={songs[0].image} 
              alt={songs[0].name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
              <MdMusicNote className="text-neutral-600" size={40} />
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5 bg-black overflow-hidden">
        {songs.map((song, idx) => (
          <div key={idx} className="overflow-hidden">
            {song.image ? (
              <img 
                src={song.image} 
                alt={song.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                <MdMusicNote className="text-neutral-600" size={20} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl text-fuchsia-400">Loading playlists...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-b from-black to-neutral-900 text-white pb-24"
    >
      {/* Header */}
      <div className="bg-gradient-to-b from-fuchsia-900/30 to-transparent py-12 px-4 md:px-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
            <MdPlaylistPlay size={48} className="text-fuchsia-400" />
            Your Playlists
          </h1>
          <p className="text-lg text-neutral-300 mb-8">Organize and enjoy your music collections</p>
          
          {/* Create Playlist Button/Form */}
          {showCreateForm ? (
            <motion.form 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={createPlaylist}
              className="flex gap-2 max-w-md mb-8"
            >
              <input
                type="text"
                value={newPlaylistName}
                onChange={e => setNewPlaylistName(e.target.value)}
                placeholder="Enter playlist name..."
                className="bg-neutral-800/80 text-white px-4 py-3 rounded-lg border border-neutral-700 focus:border-fuchsia-500 flex-1 focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={creatingPlaylist}
                className={`px-5 py-3 bg-fuchsia-600 text-white rounded-lg font-medium flex items-center gap-2 ${
                  creatingPlaylist ? 'opacity-70 cursor-not-allowed' : 'hover:bg-fuchsia-700'
                }`}
              >
                {creatingPlaylist ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <MdPlaylistAdd size={20} />
                    Create
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700"
              >
                Cancel
              </button>
            </motion.form>
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition shadow-lg mb-8"
            >
              <MdPlaylistAdd size={24} />
              Create New Playlist
            </button>
          )}
        </div>
      </div>
      
      {/* Playlists Grid */}
      <div className="px-4 md:px-12 py-8 max-w-7xl mx-auto">
        {playlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MdPlaylistPlay size={80} className="text-neutral-700 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">You don't have any playlists yet</h2>
            <p className="text-neutral-400 mb-8 max-w-md">
              Create your first playlist to start organizing your favorite music
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-fuchsia-600 text-white rounded-full font-medium hover:bg-fuchsia-700 transition flex items-center gap-2"
            >
              <MdPlaylistAdd size={20} />
              Create Your First Playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlists.map(playlist => {
              const theme = getPlaylistTheme(playlist);
              return (
                <motion.div
                  key={playlist._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-xl overflow-hidden bg-gradient-to-br ${theme.bgGradient} shadow-xl group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
                >
                  {/* Cover Artwork */}
                  <div className="aspect-square w-full relative overflow-hidden">
                    <PlaylistCoverMosaic playlist={playlist} />
                    
                    {/* Overlay and Play Button */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button
                        onClick={() => navigate(`/playlist/${playlist._id}`)}
                        className={`${theme.btnColor} text-white rounded-full p-4 transition-transform transform hover:scale-110`}
                      >
                        <FaPlay size={20} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Playlist Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`text-xl font-bold ${theme.textColor} truncate`}>{playlist.name}</h3>
                        <p className="text-neutral-400 mt-1 flex items-center gap-1">
                          <FaHeadphones className="text-neutral-500" />
                          <span>{playlist.songs?.length || 0} songs</span>
                        </p>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-1">
                        <button 
                          onClick={() => navigate(`/playlist/${playlist._id}`)}
                          className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/10"
                          title="Edit playlist"
                        >
                          <MdOutlineEdit size={18} />
                        </button>
                        <button 
                          onClick={() => deletePlaylist(playlist._id)}
                          className="p-2 text-neutral-400 hover:text-red-500 rounded-full hover:bg-white/10"
                          title="Delete playlist"
                        >
                          <MdDeleteOutline size={18} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Preview of songs */}
                    {playlist.songs && playlist.songs.length > 0 && (
                      <div className="mt-3 border-t border-white/10 pt-3">
                        <p className="text-xs text-neutral-500 uppercase font-medium mb-2">Preview</p>
                        <div className="space-y-2">
                          {playlist.songs.slice(0, 3).map((song, idx) => (
                            <div 
                              key={idx}
                              className="flex items-center gap-2 text-sm hover:bg-white/5 p-1 rounded cursor-pointer"
                              onClick={() => playWithId(song._id)}
                            >
                              <div className="w-6 h-6 rounded bg-neutral-800 flex-shrink-0 overflow-hidden">
                                {song.image ? (
                                  <img src={song.image} alt={song.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                                    <MdMusicNote className="text-neutral-600" size={12} />
                                  </div>
                                )}
                              </div>
                              <span className="text-neutral-300 truncate">{song.name}</span>
                            </div>
                          ))}
                          {playlist.songs.length > 3 && (
                            <div className="text-xs text-neutral-500 text-right pt-1">
                              +{playlist.songs.length - 3} more songs
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* View Button */}
                    <Link
                      to={`/playlist/${playlist._id}`}
                      className={`mt-4 ${theme.btnColor} w-full py-2 px-4 rounded-lg text-white font-medium text-center block transition`}
                    >
                      View Playlist
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PlaylistsPage; 