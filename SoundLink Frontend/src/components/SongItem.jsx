import React, { useContext, useState, useRef } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { MdMusicNote } from 'react-icons/md';
import { FaPlus, FaPlay, FaPause, FaHeart, FaEllipsisV } from 'react-icons/fa';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import "./SongItem.css";

const SongItem = ({ name, image, desc, id }) => {
  const { playWithId, playStatus, track, toggleFavorite, isFavorite, play, pause } = useContext(PlayerContext);
  const { user, token } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState("");
  const url = import.meta.env.VITE_BACKEND_URL;

  // Double tap detection
  const tapTimeoutRef = useRef(null);
  const lastTapRef = useRef(0);
  const DOUBLE_TAP_DELAY = 300; // ms between taps to be considered a double tap
  
  const handleTap = (e) => {
    // Prevent double tap from zooming on mobile
    e.preventDefault();
    
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapRef.current;
    
    clearTimeout(tapTimeoutRef.current);
    
    if (tapLength < DOUBLE_TAP_DELAY && tapLength > 0) {
      // Double tap detected - toggle favorite
      toggleFavorite(id);
      
      // Add visual feedback
      const target = e.currentTarget;
      target.classList.add('song-item-double-tapped');
      setTimeout(() => {
        target.classList.remove('song-item-double-tapped');
      }, 300);
      
      // Clear timeout and last tap time
      lastTapRef.current = 0;
    } else {
      // First tap - set timeout to handle single tap after delay
      tapTimeoutRef.current = setTimeout(() => {
        // Single tap behavior - play/pause the song
        if (track && track._id === id) {
          if (playStatus) {
            pause();
          } else {
            play();
          }
        } else {
          playWithId(id);
        }
        lastTapRef.current = 0;
      }, DOUBLE_TAP_DELAY);
      
      lastTapRef.current = currentTime;
    }
  };
  
  // Clean up timeout if component unmounts
  React.useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);
  
  const isPlaying = track && track._id === id && playStatus;
  // Show favorite indication when applicable
  const songIsFavorite = isFavorite(id);

  const openModal = async (e) => {
    e.stopPropagation();
    setShowModal(true);
    setLoading(true);
    try {
      const res = await axios.get(`${url}/api/playlist/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaylists(res.data.playlists || []);
    } catch {
      setPlaylists([]);
    }
    setLoading(false);
  };

  const addToPlaylist = async (playlistId) => {
    setLoading(true);
    await axios.post(
      `${url}/api/playlist/add-song`,
      { playlistId, songId: id },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setShowModal(false);
    setLoading(false);
  };

  const createAndAdd = async () => {
    if (!newPlaylist) return;
    setLoading(true);
    try {
      const res = await axios.post(
        `${url}/api/playlist/create`,
        { name: newPlaylist },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await axios.post(
        `${url}/api/playlist/add-song`,
        { playlistId: res.data.playlist._id, songId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setNewPlaylist("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onClick={handleTap}
      className={`min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26] bg-black/90 shadow-2xl relative ${
        isPlaying ? "song-item-playing" : ""
      }`}
    >
      {image ? (
        <img className='rounded w-full object-cover aspect-square' src={image} alt="" />
      ) : (
        <MdMusicNote className='w-24 h-24 text-fuchsia-500 mx-auto' />
      )}
      <p className='font-bold mt-2 mb-1 truncate text-sm sm:text-base'>{name}</p>
      <p className='text-slate-200 text-xs sm:text-sm truncate'>{desc}</p>
      {/* Add to Playlist Button */}
      {user && (
        <button
          className="absolute top-2 right-2 bg-fuchsia-700 text-white rounded-full p-2 hover:bg-fuchsia-500 z-10"
          onClick={openModal}
          title="Add to Playlist"
        >
          <FaPlus />
        </button>
      )}
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-neutral-900 rounded-2xl p-8 w-full max-w-sm mx-4 flex flex-col gap-4 relative shadow-2xl border border-fuchsia-800">
            <button
              className="absolute top-2 right-2 text-neutral-400 hover:text-white text-2xl"
              onClick={e => { e.stopPropagation(); setShowModal(false); }}
            >
              ×
            </button>
            <h3 className="text-xl font-bold text-white mb-2 text-center">Add to Playlist</h3>
            {loading ? (
              <div className="text-white text-center py-6">Loading...</div>
            ) : (
              <>
                <div className="flex flex-col gap-2 mb-2">
                  {playlists.map(pl => (
                    <button
                      key={pl._id}
                      className="w-full text-left px-3 py-2 rounded-lg bg-neutral-800 text-white font-semibold hover:bg-fuchsia-700 transition text-sm"
                      onClick={e => { e.stopPropagation(); addToPlaylist(pl._id); }}
                    >
                      {pl.name} <span className="text-xs text-neutral-400">({pl.songs.length} songs)</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newPlaylist}
                    onChange={e => setNewPlaylist(e.target.value)}
                    placeholder="New playlist name"
                    className="bg-neutral-800 text-white border border-neutral-700 rounded px-3 py-2 flex-1"
                  />
                  <button
                    onClick={e => { e.stopPropagation(); createAndAdd(); }}
                    className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform"
                  >
                    Create & Add
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SongItem;
