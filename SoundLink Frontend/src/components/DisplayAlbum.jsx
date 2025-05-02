import React, { useContext, useEffect, useState, useRef } from 'react';
// import Navbar from './Navbar';
import { useParams, Link } from 'react-router-dom';
import { PlayerContext } from '../context/PlayerContext';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useExtractColors } from 'react-extract-colors';
import { MdPlayArrow, MdPause, MdFavorite, MdFavoriteBorder, MdPlaylistAdd, MdMoreVert, MdArrowBack, MdQueueMusic } from 'react-icons/md';
import AddToPlaylistModal from './AddToPlaylistModal';
import "../components/MobileStyles.css"; // Import mobile-specific styles

const DisplayAlbum = () => {
  const { id } = useParams();
  const [albumData, setAlbumData] = useState(null);
  const displayRef = useRef();
  const { playWithId, albumsData, songsData, toggleFavorite, isFavorite, addToQueue, track, playStatus, pause, play } = useContext(PlayerContext);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [showOptions, setShowOptions] = useState(null);

  useEffect(() => {
    console.log('Album ID from URL:', id);
    console.log('Available Albums:', albumsData);
    if (albumsData && albumsData.length > 0) {
      const foundAlbum = albumsData.find(album => album._id === id);
      if (foundAlbum) {
        setAlbumData(foundAlbum);
      } else {
        setAlbumData(null);
      }
    }
  }, [id, albumsData]);

  // Extract dominant color from album image
  const { dominantColor, darkerColor } = useExtractColors(albumData?.image);

  useEffect(() => {
    if (displayRef.current && dominantColor && darkerColor) {
      displayRef.current.style.background = `linear-gradient(135deg, ${dominantColor}, ${darkerColor}, #121212)`;
    }
  }, [dominantColor, darkerColor]);

  // Handle menu click
  const handleToggleOptions = (e, songId) => {
    e.stopPropagation();
    setShowOptions(showOptions === songId ? null : songId);
    
    // Add animation class to the button when clicked
    if (e.currentTarget) {
      e.currentTarget.classList.add('options-menu-active');
      setTimeout(() => e.currentTarget.classList.remove('options-menu-active'), 500);
    }
  };

  // Close options menu when clicking outside or scrolling
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptions && !event.target.closest('.song-options')) {
        setShowOptions(null);
      }
    };
    
    const handleScroll = () => {
      if (showOptions) {
        setShowOptions(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [showOptions]);

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

  if (!albumsData) {
    return <div className="text-white p-4">Loading albums data...</div>;
  }

  if (!albumsData.length) {
    return <div className="text-white p-4">No albums available.</div>;
  }

  if (!albumData) {
    return <div className="text-white p-4">Album not found. ID: {id}</div>;
  }

  if (!albumData.image || !albumData.name) {
    return <div className="text-white p-4">Album data is incomplete.</div>;
  }

  // Filter songs that belong to this album
  const albumSongs = songsData.filter((item) => item.album === albumData.name);

  return (
    <>
      <motion.div
        ref={displayRef}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded text-white transition-all duration-500 shadow-2xl p-4 md:p-8 w-full mx-auto flex flex-col gap-6 mt-[-15px] content-container"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mt-4">
          <MdArrowBack /> Back to Home
        </Link>

        <div className="mt-6 flex gap-8 flex-col md:flex-row md:items-end">
          <img className="w-48 h-48 rounded shadow-2xl object-cover" src={albumData.image} alt={albumData.name} />
          <div className="flex flex-col">
            <p className="text-neutral-400">Album</p>
            <h2 className="text-4xl md:text-6xl font-bold mb-4">{albumData.name}</h2>
            <h4 className="text-neutral-300">{albumData.desc}</h4>
            <div className="flex items-center gap-2 mt-2">
              <button 
                onClick={() => albumSongs.length > 0 && playWithId(albumSongs[0]._id)}
                className="mt-4 bg-fuchsia-600 hover:bg-fuchsia-700 text-white py-2 px-6 rounded-full flex items-center gap-2 transition-colors"
              >
                <MdPlayArrow size={24} /> Play
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Header - Hidden on Mobile */}
        <div className="hidden md:grid grid-cols-4 mt-10 mb-4 pl-2 text-[#a7a7a7]">
          <p><b className="mr-4">#</b>Title</p>
          <p className="hidden md:block">Album</p>
          <p className="hidden md:block">Date Added</p>
          <p className="text-center"><MdPlayArrow className="inline-block" /></p>
        </div>

        {/* Song List Section */}
        <div className="divide-y divide-neutral-800/50">
          {albumSongs.map((item, index) => (
            <div
              onClick={() => playWithId(item._id)}
              key={item._id}
              className={`p-4 hover:bg-white/10 cursor-pointer transition-all ${isPlaying(item._id) ? 'bg-white/10' : ''}`}
            >
              {/* Desktop View - Hidden on mobile */}
              <div className="hidden md:grid md:grid-cols-4 gap-2 items-center text-[#a7a7a7]">
                <div className="flex items-center text-white">
                  <div className="w-6 min-w-6 mr-2 text-center">
                    <span className={isPlaying(item._id) ? 'hidden' : 'group-hover:hidden'}>{index + 1}</span>
                    <button 
                      className={isPlaying(item._id) ? 'block' : 'hidden group-hover:block'}
                      onClick={(e) => handlePlayPause(e, item._id)}
                    >
                      {isPlaying(item._id) ? <MdPause className="text-fuchsia-500" /> : <MdPlayArrow className="text-white" />}
                    </button>
                  </div>
                  <img className="w-10 h-10 min-w-[40px] mr-3 rounded" src={item.image} alt={item.name} />
                  <div className="flex-1 min-w-0">
                    <p className={`truncate ${isPlaying(item._id) ? 'text-fuchsia-500' : 'text-white'} text-base`}>{item.name}</p>
                    <p className="text-xs truncate">{item.desc}</p>
                  </div>
                </div>
                <p className="text-[15px] truncate">{albumData.name}</p>
                <p className="text-[15px]">5 days ago</p>
                <div className="flex items-center justify-end gap-3 pr-2">
                  <button 
                    onClick={(e) => handleToggleFavorite(e, item._id)}
                    className="opacity-70 group-hover:opacity-100 transition-opacity"
                  >
                    {isFavorite(item._id) ? 
                      <MdFavorite className="text-fuchsia-500" size={18} /> : 
                      <MdFavoriteBorder size={18} />
                    }
                  </button>
                  <span className="text-[15px]">{item.duration}</span>
                  <div className="relative song-options">
                    <button 
                      onClick={(e) => handleToggleOptions(e, item._id)}
                      className="opacity-70 group-hover:opacity-100 transition-opacity"
                    >
                      <MdMoreVert size={18} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Mobile View - Only shown on small screens */}
              <div className="md:hidden flex items-center gap-3">
                <div className="w-6 min-w-[24px] text-neutral-400 flex items-center justify-center">
                  <span className={isPlaying(item._id) ? 'hidden' : 'group-hover:hidden'}>{index + 1}</span>
                  <button 
                    className={isPlaying(item._id) ? 'block' : 'hidden group-hover:block'}
                    onClick={(e) => handlePlayPause(e, item._id)}
                  >
                    {isPlaying(item._id) ? <MdPause className="text-fuchsia-500" /> : <MdPlayArrow />}
                  </button>
                </div>
                
                <div className="bg-neutral-800 w-14 h-14 min-w-[56px] rounded-lg flex-shrink-0 overflow-hidden relative">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MdPlayArrow size={24} className="text-fuchsia-500" />
                    </div>
                  )}
                  {isPlaying(item._id) && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-fuchsia-500"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 pr-2">
                  <div className={`font-medium truncate ${isPlaying(item._id) ? 'text-fuchsia-500' : 'text-white'} text-sm`}>{item.name}</div>
                  <div className="text-xs text-neutral-400 truncate">{item.desc || ""}</div>
                </div>
                
                {/* Mobile action buttons with heart and three dots side by side */}
                <div className="flex items-center gap-1 relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const btn = e.currentTarget;
                      btn.classList.add('favorite-animation');
                      setTimeout(() => btn.classList.remove('favorite-animation'), 1000);
                      handleToggleFavorite(e, item._id);
                    }}
                    className="text-lg"
                  >
                    {isFavorite(item._id) ? 
                      <MdFavorite className="text-fuchsia-500" size={20} /> : 
                      <MdFavoriteBorder size={20} className="text-neutral-400" />
                    }
                  </button>
                  
                  <button 
                    onClick={(e) => handleToggleOptions(e, item._id)}
                    className={`text-lg song-options ${showOptions === item._id ? 'text-fuchsia-500' : ''}`}
                  >
                    <MdMoreVert className={showOptions === item._id ? "text-fuchsia-500" : "text-neutral-400"} size={20} />
                  </button>
                  
                  <span className="text-xs text-neutral-400 song-duration ml-1">{item.duration || "--:--"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Floating menu that won't be hidden by other songs */}
      {showOptions && (
        <div className="fixed z-[100] bg-neutral-800 rounded-lg shadow-xl border border-neutral-700 menu-options" 
             style={{
               bottom: '80px', 
               right: '24px', 
               width: '150px'
             }}>
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToQueue(e, showOptions);
                setShowOptions(null);
              }}
              className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm text-white hover:bg-neutral-700 transition-colors"
            >
              <MdQueueMusic className="text-fuchsia-400" size={16} />
              <span>Add to Queue</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToPlaylist(e, showOptions);
                setShowOptions(null);
              }}
              className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm text-white hover:bg-neutral-700 transition-colors"
            >
              <MdPlaylistAdd className="text-fuchsia-400" size={16} />
              <span>Add to Playlist</span>
            </button>
          </div>
        </div>
      )}

      {showPlaylistModal && (
        <AddToPlaylistModal 
          songId={selectedSongId} 
          onClose={() => setShowPlaylistModal(false)} 
        />
      )}
    </>
  );
};

export default DisplayAlbum;
