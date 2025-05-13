import React, { useContext, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerContext } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaPlus, FaEllipsisH } from 'react-icons/fa';
import { 
  MdOutlineQueueMusic, 
  MdRadio, 
  MdOutlineShare, 
  MdPerson, 
  MdAlbum,
  MdDownload,
  MdClose,
  MdPlaylistAdd,
  MdInfoOutline
} from 'react-icons/md';

const MoreOptionsSheet = ({ isOpen, onClose, trackId }) => {
  const { 
    toggleFavorite, 
    isFavorite, 
    track, 
    themeColors, 
    getArtistName, 
    getAlbumName,
    addToQueue,
    playlists,
    addToPlaylist,
    songsData
  } = useContext(PlayerContext);
  
  const navigate = useNavigate();
  const [showPlaylists, setShowPlaylists] = useState(false);

  if (!isOpen || !track) return null;

  // Get the current song from songsData based on trackId
  const currentSong = trackId ? songsData.find(song => song._id === trackId) : track;
  if (!currentSong) return null;

  // Handle navigation to artist page
  const goToArtist = () => {
    const artistName = getArtistName(currentSong);
    
    // First, check if we have an artist ID to use (preferred)
    if (currentSong.artist && typeof currentSong.artist === 'string' && currentSong.artist.length > 5) {
      navigate(`/artist/${currentSong.artist}`);
    } else {
      // If no ID, use the artist name as the identifier (fallback)
      navigate(`/artist/${encodeURIComponent(artistName)}`);
    }
    onClose();
  };

  // Handle navigation to album page
  const goToAlbum = () => {
    // First check if we have an album ID
    if (currentSong.albumId) {
      navigate(`/album/${currentSong.albumId}`);
    } else {
      // Look for the album in albumsData by name
      const albumName = getAlbumName(currentSong);
      
      // Navigate to album page
      if (albumName && albumName !== 'Unknown Album') {
        // Use album name in URL when it's not numeric (handle old paths)
        if (!/^\d+$/.test(albumName)) {
          navigate(`/album/${encodeURIComponent(albumName)}`);
        } else {
          // For numeric IDs, just use as is
          navigate(`/album/${albumName}`);
        }
      }
    }
    onClose();
  };

  // Handle sharing functionality
  const shareTrack = () => {
    if (navigator.share) {
      navigator.share({
        title: currentSong.name,
        text: `Check out ${currentSong.name} by ${getArtistName(currentSong)}`,
        url: window.location.origin + `/song/${currentSong._id}`
      })
      .catch(error => console.log('Sharing failed', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      const shareUrl = `${window.location.origin}/song/${currentSong._id}`;
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          alert('Link copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
    onClose();
  };

  // Handle download functionality
  const downloadTrack = () => {
    if (currentSong.file) {
      const link = document.createElement('a');
      link.href = currentSong.file;
      link.download = `${currentSong.name} - ${getArtistName(currentSong)}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    onClose();
  };

  // Add to radio (similar songs)
  const goToRadio = () => {
    // Navigate to either an actual radio route or similar songs based on genre
    navigate(`/trending?genre=${encodeURIComponent(currentSong.genre || '')}`);
    onClose();
  };

  // About this song option - direct to song info page
  const goToSongInfo = () => {
    // Since there isn't a dedicated song page, show the song in its album context
    if (currentSong.album) {
      navigate(`/album/${encodeURIComponent(currentSong.album)}`, { 
        state: { highlightSongId: currentSong._id } 
      });
    } else {
      // Fallback - go to artist
      goToArtist();
    }
    onClose();
  };

  // Option items when showing the main menu
  const mainMenuItems = [
    {
      icon: isFavorite(trackId) ? <FaHeart /> : <FaRegHeart />,
      label: isFavorite(trackId) ? 'Remove from Liked Songs' : 'Like',
      action: () => {
        toggleFavorite(trackId);
        onClose();
      }
    },
    {
      icon: <FaPlus />,
      label: 'Add to playlist',
      action: () => {
        setShowPlaylists(true);
      }
    },
    {
      icon: <MdOutlineQueueMusic />,
      label: 'Add to queue',
      action: () => {
        addToQueue(trackId);
        onClose();
        // Show toast notification
        if (window.toast) {
          window.toast.success('Added to queue');
        }
      }
    },
    {
      icon: <MdRadio />,
      label: 'Go to radio',
      action: goToRadio
    },
    {
      icon: <MdPerson />,
      label: 'Go to artist',
      action: goToArtist
    },
    {
      icon: <MdAlbum />,
      label: 'Go to album',
      action: goToAlbum
    },
    {
      icon: <MdOutlineShare />,
      label: 'Share',
      action: shareTrack
    },
    {
      icon: <MdDownload />,
      label: 'Download',
      action: downloadTrack
    },
    {
      icon: <MdInfoOutline />,
      label: 'About this song',
      action: goToSongInfo
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50"
            onClick={onClose}
          />
          
          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-xl options-sheet"
            style={{ 
              backgroundColor: themeColors.secondary,
              color: themeColors.text
            }}
          >
            {/* Sheet handle */}
            <div className="w-full flex justify-center py-2">
              <div className="w-10 h-1 rounded-full bg-gray-400/30"></div>
            </div>
            
            {/* Track header */}
            <div className="flex items-center px-4 py-3 border-b" style={{ borderColor: `${themeColors.text}20` }}>
              <div className="w-12 h-12 rounded overflow-hidden mr-3">
                <img 
                  src={currentSong.image} 
                  alt={currentSong.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold truncate" style={{ color: themeColors.text }}>
                  {currentSong.name}
                </h3>
                <p className="text-sm truncate" style={{ color: `${themeColors.text}99` }}>
                  {getArtistName(currentSong)} • {getAlbumName(currentSong)}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ backgroundColor: `${themeColors.text}10` }}
              >
                <MdClose size={18} style={{ color: themeColors.text }} />
              </button>
            </div>
            
            {/* Options list */}
            <div className="py-2">
              {!showPlaylists ? (
                /* Main menu options */
                mainMenuItems.map((item, index) => (
                <button
                  key={index}
                  className="w-full flex items-center px-4 py-3 hover:bg-white/5"
                  onClick={item.action}
                >
                    <div 
                      className="w-8 h-8 flex items-center justify-center mr-4" 
                      style={{ 
                        color: item.label.includes('Like') && isFavorite(trackId) 
                          ? themeColors.accent 
                          : themeColors.text 
                      }}
                    >
                    {item.icon}
                  </div>
                  <span className="text-base" style={{ color: themeColors.text }}>
                    {item.label}
                  </span>
                </button>
                ))
              ) : (
                /* Playlist selection sub-menu */
                <>
                  {/* Back button */}
                  <div className="px-4 py-2 mb-2 border-b" style={{ borderColor: `${themeColors.text}20` }}>
                    <button
                      className="w-full flex items-center"
                      onClick={() => setShowPlaylists(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                      <span className="ml-2 font-medium">Your playlists</span>
                    </button>
                  </div>
                  
                  {/* Create new playlist button */}
                  <button
                    className="w-full flex items-center px-4 py-3 hover:bg-white/5"
                    onClick={() => {
                      navigate('/create-playlist', { state: { trackId } });
                      onClose();
                    }}
                  >
                    <div className="w-8 h-8 flex items-center justify-center mr-4" style={{ color: themeColors.primary }}>
                      <MdPlaylistAdd size={24} />
                    </div>
                    <span className="text-base" style={{ color: themeColors.text }}>
                      Create new playlist
                    </span>
                  </button>
                  
                  {/* Playlist list */}
                  {playlists.length > 0 ? playlists.map((playlist) => (
                    <button
                      key={playlist._id}
                      className="w-full flex items-center px-4 py-3 hover:bg-white/5"
                      onClick={() => {
                        addToPlaylist(trackId, playlist._id);
                        onClose();
                      }}
                    >
                      <div className="w-8 h-8 flex items-center justify-center mr-4">
                        {playlist.coverImage ? (
                          <img 
                            src={playlist.coverImage} 
                            alt={playlist.name} 
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center rounded" 
                            style={{ backgroundColor: `${themeColors.primary}40` }}
                          >
                            <MdOutlineQueueMusic size={16} />
                          </div>
                        )}
                      </div>
                      <span className="text-base" style={{ color: themeColors.text }}>
                        {playlist.name}
                      </span>
                    </button>
                  )) : (
                    <div className="text-center py-4 text-sm opacity-70" style={{ color: themeColors.text }}>
                      You don't have any playlists yet
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Safe area padding for iOS */}
            <div className="h-6"></div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MoreOptionsSheet; 