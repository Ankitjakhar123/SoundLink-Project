import React, { useContext, useState, useRef, useEffect } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { MdMusicNote } from 'react-icons/md';
import { FaPlus, FaPlay, FaPause, FaHeart, FaEllipsisV, FaShare, FaLink } from 'react-icons/fa';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import "./SongItem.css";
import Skeleton from './Skeleton';

const SongItem = ({ name, image, desc, id }) => {
  const { playWithId, playStatus, track, toggleFavorite, isFavorite, play, pause } = useContext(PlayerContext);
  const { user, token } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState("");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const url = import.meta.env.VITE_BACKEND_URL;

  // Double tap detection
  const tapTimeoutRef = useRef(null);
  const lastTapRef = useRef(0);
  const DOUBLE_TAP_DELAY = 300; // ms between taps to be considered a double tap
  
  // Long press detection
  const longPressTimeoutRef = useRef(null);
  const isLongPressRef = useRef(false);
  const LONG_PRESS_DELAY = 600; // ms to consider a press as "long"
  
  const handleTouchStart = (e) => {
    // Prevent default to avoid zoom on double tap
    e.preventDefault();
    
    // Start long press detection
    isLongPressRef.current = false;
    
    longPressTimeoutRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      
      // Vibrate to indicate long press (if supported)
      if (navigator.vibrate) {
        navigator.vibrate([50]);
      }
      
      // Show options menu on long press
      openOptionsMenu(e);
    }, LONG_PRESS_DELAY);
    
    // Double tap detection code
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapRef.current;
    
    clearTimeout(tapTimeoutRef.current);
    
    if (tapLength < DOUBLE_TAP_DELAY && tapLength > 0) {
      // Clear long press detection since this is a double tap
      clearTimeout(longPressTimeoutRef.current);
      
      // Double tap detected - toggle favorite
      toggleFavorite(id);
      
      // Add visual feedback
      const target = e.currentTarget;
      target.classList.add('song-item-double-tapped');
      
      // Provide haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([20, 30, 20]);
      }
      
      setTimeout(() => {
        target.classList.remove('song-item-double-tapped');
      }, 300);
      
      // Clear timeout and last tap time
      lastTapRef.current = 0;
    } else {
      // First tap - set timeout to handle single tap after delay
      tapTimeoutRef.current = setTimeout(() => {
        // Only trigger if not a long press
        if (!isLongPressRef.current) {
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
        }
        lastTapRef.current = 0;
      }, DOUBLE_TAP_DELAY);
      
      lastTapRef.current = currentTime;
    }
  };
  
  const handleTouchEnd = (e) => {
    // Clear long press detection on touch end
    clearTimeout(longPressTimeoutRef.current);
  };
  
  const handleTouchMove = (e) => {
    // If user starts moving finger, cancel long press and double tap
    clearTimeout(longPressTimeoutRef.current);
    clearTimeout(tapTimeoutRef.current);
    isLongPressRef.current = false;
  };
  
  // Open options menu for the song (share, add to playlist, etc.)
  const openOptionsMenu = (e) => {
    e.stopPropagation();
    
    // Create a dropdown or bottom sheet with options
    // For now, we'll just open the playlist modal
    openModal(e);
  };
  
  // Share the song if Web Share API is supported
  const shareSong = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: `Check out ${name} by ${desc} on SoundLink`,
          url: `${window.location.origin}/song/${id}`
        });
        
        // Hide menus on successful share
        setShowShareMenu(false);
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      setShowShareMenu(true);
    }
  };
  
  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
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
    } catch (error) {
      console.error("Error fetching playlists:", error);
      setPlaylists([]);
    }
    setLoading(false);
  };

  const addToPlaylist = async (playlistId) => {
    setLoading(true);
    try {
      await axios.post(
        `${url}/api/playlist/add-song`,
        { playlistId, songId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      toast.success(`Added to playlist`);
    } catch (error) {
      console.error("Error adding to playlist:", error);
      toast.error("Failed to add song to playlist");
    } finally {
      setLoading(false);
    }
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
      toast.success(`Added to new playlist "${newPlaylist}"`);
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast.error("Failed to create playlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onClick={() => {}} // Empty click handler to avoid conflicts with touch events
      className={`song-item min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26] bg-black/90 shadow-2xl relative touch-ripple no-select ${
        isPlaying ? "song-item-playing" : ""
      } ${songIsFavorite ? "song-item-favorite" : ""}`}
    >
      {image ? (
        <img className='rounded w-full object-cover aspect-square' src={image} alt="" />
      ) : (
        <MdMusicNote className='w-24 h-24 text-fuchsia-500 mx-auto' />
      )}
      <p className='font-bold mt-2 mb-1 truncate text-sm sm:text-base'>{name}</p>
      <p className='text-slate-200 text-xs sm:text-sm truncate'>{desc}</p>
      
      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex gap-2">
        {/* Add to Playlist Button */}
        {user && (
          <button
            className="bg-fuchsia-700 text-white rounded-full p-2 hover:bg-fuchsia-500 z-10"
            onClick={openModal}
            title="Add to Playlist"
          >
            <FaPlus />
          </button>
        )}
        
        {/* Share Button */}
        <button
          className="bg-fuchsia-700 text-white rounded-full p-2 hover:bg-fuchsia-500 z-10"
          onClick={shareSong}
          title="Share Song"
        >
          <FaShare />
        </button>
      </div>
      
      {/* Favorite Indicator */}
      {songIsFavorite && (
        <div className="absolute bottom-2 right-2 text-red-500">
          <FaHeart className="song-item-favorite-btn active" />
        </div>
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
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                    <Skeleton type="image" className="w-12 h-12" />
                    <div className="flex-1">
                      <Skeleton type="text" className="w-32 mb-2" />
                      <Skeleton type="text" className="w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2 mb-2 max-h-60 overflow-y-auto touch-scroll">
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
      
      {/* Share Menu */}
      {showShareMenu && (
        <div className="fixed inset-x-0 bottom-0 z-50 bg-neutral-900 border-t border-neutral-700 rounded-t-xl overflow-hidden shadow-xl animate-slide-up">
          <div className="p-4">
            <h3 className="text-lg font-bold text-white mb-4">Share "{name}"</h3>
            
            <div className="grid grid-cols-4 gap-4 mb-4">
              {/* Copy Link */}
              <button 
                className="flex flex-col items-center justify-center gap-2" 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/song/${id}`);
                  toast.success("Link copied to clipboard");
                  setShowShareMenu(false);
                }}
              >
                <div className="bg-neutral-800 w-12 h-12 rounded-full flex items-center justify-center text-white">
                  <FaLink className="text-xl" />
                </div>
                <span className="text-xs text-white">Copy Link</span>
              </button>
              
              {/* Other share options would go here */}
            </div>
            
            <button 
              className="w-full py-3 text-center text-white font-medium border-t border-neutral-700 mt-2"
              onClick={() => setShowShareMenu(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SongItem;
