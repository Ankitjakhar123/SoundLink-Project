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
  MdInfoOutline,
  MdTimer,
  MdAdd
} from 'react-icons/md';
import axios from 'axios';

const MoreOptionsSheet = ({ isOpen, onClose, trackId }) => {
  const navigate = useNavigate();
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
    songsData,
    sleepTimer,
    setSleepTimer
  } = useContext(PlayerContext);
  
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');

  if (!isOpen || !track) return null;

  // Get the current song from songsData based on trackId
  const currentSong = trackId ? songsData.find(song => song._id === trackId) : track;
  if (!currentSong) return null;

  // Format remaining time
  const formatRemainingTime = () => {
    if (!sleepTimer) return null;
    const now = new Date();
    const endTime = new Date(now.getTime() + sleepTimer * 60000);
    const diff = endTime - now;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle custom time submission
  const handleCustomTime = () => {
    const minutes = parseInt(customMinutes);
    if (minutes > 0 && minutes <= 180) { // Max 3 hours
      setSleepTimer(minutes);
      if (window.toast) {
        window.toast.success(`Sleep timer set for ${minutes} minutes`);
      }
      setShowCustomTime(false);
      setCustomMinutes('');
      onClose();
    } else {
      if (window.toast) {
        window.toast.error('Please enter a time between 1 and 180 minutes');
      }
    }
  };

  // Handle navigation to artist page
  const goToArtist = async () => {
    try {
      // Get artist name from desc field
      const artistName = currentSong.desc || getArtistName(currentSong);
      console.log('Artist Name:', artistName);

      if (!artistName || artistName === 'Unknown Artist') {
        console.warn('Invalid artist name:', artistName);
        return;
      }

      // Fetch artists list to find the correct artist ID
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
      const response = await axios.get(`${backendUrl}/api/artist/list`);
      
      if (response.data.success) {
        // Find the artist by name
        const artist = response.data.artists.find(a => 
          a.name.toLowerCase() === artistName.toLowerCase()
        );

        if (artist) {
          console.log('Found artist:', artist);
          navigate(`/artist/${artist._id}`);
        } else {
          console.warn('Artist not found in database:', artistName);
          // If artist not found, try to find a song with the same artist name
          const artistSong = songsData.find(song => 
            (song.desc || getArtistName(song)).toLowerCase() === artistName.toLowerCase()
          );
          
          if (artistSong) {
            console.log('Found song by artist:', artistSong);
            // Navigate to the song's page instead
            navigate(`/song/${artistSong._id}`);
          }
        }
      }
    } catch (error) {
      console.error('Error navigating to artist:', error);
    } finally {
      onClose();
    }
  };

  // Handle navigation to album page
  const goToAlbum = async () => {
    try {
      console.log('Starting album navigation...');
      console.log('Current Song:', currentSong);
      
      // Get album name
      const albumName = getAlbumName(currentSong);
      console.log('Album Name:', albumName);

      if (!albumName || albumName === 'Unknown Album') {
        console.warn('Invalid album name:', albumName);
        return;
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
      
      // First try regular albums
      console.log('Fetching regular albums...');
      const regularAlbumsResponse = await axios.get(`${backendUrl}/api/album/list`);
      if (regularAlbumsResponse.data.success && regularAlbumsResponse.data.albums) {
        const regularAlbum = regularAlbumsResponse.data.albums.find(a => 
          a.name.toLowerCase() === albumName.toLowerCase()
        );
        if (regularAlbum) {
          console.log('Found regular album:', regularAlbum);
          navigate(`/album/${regularAlbum._id}`);
          return;
        }
      }

      // Then try movie albums
      console.log('Fetching movie albums...');
      const movieAlbumsResponse = await axios.get(`${backendUrl}/api/moviealbum/list`);
      if (movieAlbumsResponse.data.success && movieAlbumsResponse.data.movieAlbums) {
        const movieAlbum = movieAlbumsResponse.data.movieAlbums.find(a => 
          a.title.toLowerCase() === albumName.toLowerCase()
        );
        if (movieAlbum) {
          console.log('Found movie album:', movieAlbum);
          navigate(`/moviealbum/${movieAlbum._id}`);
          return;
        }
      }

      // If no album found, try to find a song with the same album name
      const albumSong = songsData.find(song => {
        const songAlbum = getAlbumName(song);
        return songAlbum && songAlbum.toLowerCase() === albumName.toLowerCase();
      });

      if (albumSong) {
        console.log('No album found, navigating to song instead:', albumSong._id);
        navigate(`/song/${albumSong._id}`);
      } else {
        console.warn('No album or song found for:', albumName);
      }
    } catch (error) {
      console.error('Error navigating to album:', error);
    } finally {
      onClose();
    }
  };

  // Handle sharing functionality
  const shareTrack = () => {
    try {
      const artistName = getArtistName(currentSong);
      const shareData = {
        title: currentSong.name,
        text: `Check out ${currentSong.name} by ${artistName}`,
        url: `${window.location.origin}/song/${currentSong._id}`
      };

      if (navigator.share) {
        navigator.share(shareData).catch(error => {
          console.log('Sharing failed:', error);
          fallbackShare(shareData.url);
        });
      } else {
        fallbackShare(shareData.url);
      }
    } catch (error) {
      console.error('Error sharing track:', error);
    } finally {
      onClose();
    }
  };

  // Fallback share function
  const fallbackShare = (url) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        if (window.toast) {
          window.toast.success('Link copied to clipboard!');
        } else {
          alert('Link copied to clipboard!');
        }
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        if (window.toast) {
          window.toast.error('Failed to copy link');
        }
      });
  };

  // Handle download functionality
  const downloadTrack = () => {
    try {
      if (!currentSong.file) {
        console.warn('No file URL available for download');
        return;
      }

      const artistName = getArtistName(currentSong);
      const fileName = `${currentSong.name} - ${artistName}.mp3`;
      
      const link = document.createElement('a');
      link.href = currentSong.file;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading track:', error);
    } finally {
      onClose();
    }
  };

  // Add to radio (similar songs)
  const goToRadio = () => {
    try {
      navigate('/radio');
    } catch (error) {
      console.error('Error navigating to radio:', error);
    } finally {
      onClose();
    }
  };

  // About this song option
  const goToSongInfo = () => {
    try {
      if (currentSong && currentSong._id) {
        navigate(`/song/${currentSong._id}/info`);
      }
    } catch (error) {
      console.error('Error navigating to song info:', error);
    } finally {
      onClose();
    }
  };

  // Option items when showing the main menu
  const mainMenuItems = [
    {
      icon: isFavorite(trackId) ? <FaHeart /> : <FaRegHeart />,
      label: isFavorite(trackId) ? 'Remove from Liked Songs' : 'Like',
      action: () => {
        try {
          toggleFavorite(trackId);
          if (window.toast) {
            window.toast.success(isFavorite(trackId) ? 'Removed from Liked Songs' : 'Added to Liked Songs');
          }
        } catch (error) {
          console.error('Error toggling favorite:', error);
        } finally {
          onClose();
        }
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
        try {
          addToQueue(trackId);
          if (window.toast) {
            window.toast.success('Added to queue');
          }
        } catch (error) {
          console.error('Error adding to queue:', error);
        } finally {
          onClose();
        }
      }
    },
    {
      icon: <MdTimer />,
      label: 'Sleep Timer',
      action: () => {
        setShowSleepTimer(true);
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
            className="fixed inset-0 bg-black/70 z-[60]"
            onClick={onClose}
          />
          
          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[60] max-h-[85vh] overflow-y-auto rounded-t-xl options-sheet"
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
              {showSleepTimer ? (
                /* Sleep Timer sub-menu */
                <>
                  {/* Back button */}
                  <div className="px-4 py-2 mb-2 border-b" style={{ borderColor: `${themeColors.text}20` }}>
                    <button
                      className="w-full flex items-center"
                      onClick={() => setShowSleepTimer(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                      <span className="ml-2 font-medium">Sleep Timer</span>
                    </button>
                  </div>

                  {/* Active timer display */}
                  {sleepTimer && (
                    <div className="px-4 py-3 mb-2 border-b" style={{ borderColor: `${themeColors.text}20` }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MdTimer size={24} style={{ color: themeColors.primary }} />
                          <span className="ml-2 text-base" style={{ color: themeColors.text }}>
                            Timer active
                          </span>
                        </div>
                        <span className="text-lg font-medium" style={{ color: themeColors.primary }}>
                          {formatRemainingTime()}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Timer options */}
                  {!showCustomTime ? (
                    <>
                      {[15, 30, 45, 60, 90].map((minutes) => (
                        <button
                          key={minutes}
                          className="w-full flex items-center px-4 py-3 hover:bg-white/5"
                          onClick={() => {
                            setSleepTimer(minutes);
                            if (window.toast) {
                              window.toast.success(`Sleep timer set for ${minutes} minutes`);
                            }
                            onClose();
                          }}
                        >
                          <div className="w-8 h-8 flex items-center justify-center mr-4" 
                            style={{ 
                              color: sleepTimer === minutes ? themeColors.primary : themeColors.text 
                            }}
                          >
                            <MdTimer size={24} />
                          </div>
                          <span className="text-base" style={{ color: themeColors.text }}>
                            {minutes} minutes
                          </span>
                          {sleepTimer === minutes && (
                            <span className="ml-auto w-2 h-2 rounded-full" 
                              style={{ backgroundColor: themeColors.primary }} 
                            />
                          )}
                        </button>
                      ))}

                      {/* Custom time button */}
                      <button
                        className="w-full flex items-center px-4 py-3 hover:bg-white/5"
                        onClick={() => setShowCustomTime(true)}
                      >
                        <div className="w-8 h-8 flex items-center justify-center mr-4" 
                          style={{ color: themeColors.text }}
                        >
                          <MdAdd size={24} />
                        </div>
                        <span className="text-base" style={{ color: themeColors.text }}>
                          Custom time
                        </span>
                      </button>
                    </>
                  ) : (
                    /* Custom time input */
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="180"
                          value={customMinutes}
                          onChange={(e) => setCustomMinutes(e.target.value)}
                          placeholder="Enter minutes (1-180)"
                          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border"
                          style={{ 
                            color: themeColors.text,
                            borderColor: `${themeColors.text}30`
                          }}
                        />
                        <button
                          onClick={handleCustomTime}
                          className="px-4 py-2 rounded-lg"
                          style={{ 
                            backgroundColor: themeColors.primary,
                            color: themeColors.text
                          }}
                        >
                          Set
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setShowCustomTime(false);
                          setCustomMinutes('');
                        }}
                        className="w-full mt-2 text-sm text-center"
                        style={{ color: `${themeColors.text}99` }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  
                  {/* Cancel timer option */}
                  {sleepTimer && !showCustomTime && (
                    <button
                      className="w-full flex items-center px-4 py-3 hover:bg-white/5 mt-2 border-t"
                      style={{ borderColor: `${themeColors.text}20` }}
                      onClick={() => {
                        setSleepTimer(null);
                        if (window.toast) {
                          window.toast.success('Sleep timer cancelled');
                        }
                        onClose();
                      }}
                    >
                      <div className="w-8 h-8 flex items-center justify-center mr-4" 
                        style={{ color: themeColors.text }}
                      >
                        <MdClose size={24} />
                      </div>
                      <span className="text-base" style={{ color: themeColors.text }}>
                        Cancel Timer
                      </span>
                    </button>
                  )}
                </>
              ) : !showPlaylists ? (
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
                    {item.label === 'Sleep Timer' && sleepTimer && (
                      <span className="ml-auto text-sm" style={{ color: themeColors.primary }}>
                        {formatRemainingTime()}
                      </span>
                    )}
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