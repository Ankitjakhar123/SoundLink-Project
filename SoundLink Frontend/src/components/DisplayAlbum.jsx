import React, { useContext, useEffect, useState, useRef } from 'react';
// import Navbar from './Navbar';
import { useParams, Link } from 'react-router-dom';
import { PlayerContext } from '../context/PlayerContext';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useExtractColors } from 'react-extract-colors';
import { MdPlayArrow, MdPause, MdFavorite, MdFavoriteBorder, MdPlaylistAdd, MdMoreVert, MdArrowBack, MdQueueMusic, MdMusicNote } from 'react-icons/md';
import AddToPlaylistModal from './AddToPlaylistModal';
import "../components/MobileStyles.css"; // Import mobile-specific styles

const DisplayAlbum = () => {
  const { id } = useParams();
  const [albumData, setAlbumData] = useState(null);
  const displayRef = useRef();
  const { playWithId, albumsData, songsData, toggleFavorite, isFavorite, addToQueue, track, playStatus } = useContext(PlayerContext);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [showOptions, setShowOptions] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

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

  // Function to get background color with opacity
  const getBackgroundColor = (color, opacity = 0.3) => {
    if (!color) return 'rgba(0, 0, 0, 0.3)';
    // Convert hex to rgba
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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
        className="rounded text-white transition-all duration-500 shadow-2xl p-4 md:p-8 w-full mx-auto flex flex-col gap-6 mt-[-15px] content-container pb-32 mb-8"
      >
        {/* <Link to="/" className="inline-flex items-center text-white/80 hover:text-white py-4">
          <MdArrowBack /> Back to Home
        </Link> */}

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

        {/* Grid View (for small screens) */}
        {viewMode === 'grid' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
          >
            {albumSongs.length > 0 ? (
              albumSongs.map((song) => (
                <div 
                  key={song._id}
                  onClick={() => playWithId(song._id)}
                  className="relative rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 hover:bg-white/10 shadow-lg hover:shadow-xl"
                  style={{
                    background: dominantColor ? 
                      `linear-gradient(135deg, ${getBackgroundColor(dominantColor, 0.2)}, ${getBackgroundColor(darkerColor, 0.1)})` : 
                      'rgba(0, 0, 0, 0.3)'
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
                             background: dominantColor ? 
                               `linear-gradient(135deg, ${getBackgroundColor(dominantColor, 0.3)}, ${getBackgroundColor(darkerColor, 0.2)})` : 
                               'rgba(0, 0, 0, 0.3)'
                           }}>
                        <MdMusicNote size={60} />
                      </div>
                    )}
                    
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      {isPlaying(song._id) ? (
                        <div className="bg-fuchsia-500 rounded-full p-3">
                          <MdPause className="text-white" size={30} />
                        </div>
                      ) : (
                        <div className="bg-fuchsia-500 rounded-full p-3">
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
              ))
            ) : (
              <div className="col-span-full py-12 text-center rounded-xl"
                   style={{
                     background: dominantColor ? 
                       `linear-gradient(135deg, ${getBackgroundColor(dominantColor, 0.2)}, ${getBackgroundColor(darkerColor, 0.1)})` : 
                       'rgba(0, 0, 0, 0.3)'
                   }}>
                <MdPlayArrow size={60} className="text-neutral-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No songs in this album</h3>
                <p className="text-neutral-400">
                  This album doesn't have any songs yet.
                </p>
              </div>
            )}
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
              background: dominantColor ? 
                `linear-gradient(135deg, ${getBackgroundColor(dominantColor, 0.2)}, ${getBackgroundColor(darkerColor, 0.1)})` : 
                'rgba(0, 0, 0, 0.3)'
            }}
          >
            {albumSongs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {albumSongs.map((song, index) => (
                  <div 
                    key={song._id} 
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-all cursor-pointer group"
                    style={{
                      background: dominantColor ? 
                        `linear-gradient(135deg, ${getBackgroundColor(dominantColor, 0.3)}, ${getBackgroundColor(darkerColor, 0.2)})` : 
                        'rgba(0, 0, 0, 0.3)'
                    }}
                    onClick={() => playWithId(song._id)}
                  >
                    <div className="flex-shrink-0 w-8 text-center text-neutral-500">
                      {index + 1}
                    </div>
                    <div className="bg-neutral-800 w-12 h-12 rounded flex items-center justify-center relative">
                      {song.image ? (
                        <img 
                          src={song.image} 
                          alt={song.name} 
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200"
                             style={{
                               background: dominantColor ? 
                                 `linear-gradient(135deg, ${getBackgroundColor(dominantColor, 0.4)}, ${getBackgroundColor(darkerColor, 0.3)})` : 
                                 'rgba(0, 0, 0, 0.6)'
                             }}>
                          {isPlaying(song._id) ? (
                            <div className="bg-fuchsia-500 rounded-full p-1">
                              <MdPause className="text-white" size={24} />
                            </div>
                          ) : (
                            <div className="bg-fuchsia-500 rounded-full p-1">
                              <MdPlayArrow className="text-white" size={24} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate text-white">{song.name}</h3>
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
            ) : (
              <div className="py-12 text-center">
                <MdPlayArrow size={60} className="text-neutral-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No songs in this album</h3>
                <p className="text-neutral-400">
                  This album doesn't have any songs yet.
                </p>
              </div>
            )}
          </motion.div>
        )}
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
