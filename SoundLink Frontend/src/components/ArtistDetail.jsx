import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { MdPerson, MdPlayArrow, MdPause, MdFavorite, MdFavoriteBorder, MdPlaylistAdd, MdArrowBack, MdQueueMusic, MdMoreVert } from "react-icons/md";
import { PlayerContext } from "../context/PlayerContext";
import AddToPlaylistModal from "./AddToPlaylistModal";
import "../components/MobileStyles.css"; // Import mobile-specific styles
import Skeleton from "./Skeleton";

const ArtistDetail = () => {
  const { id } = useParams();
  const { 
    track, 
    playStatus, 
    playWithId, 
    addToQueue, 
    toggleFavorite, 
    favorites 
  } = useContext(PlayerContext);
  const [artist, setArtist] = useState(null);
  const [artistSongs, setArtistSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOptions, setShowOptions] = useState(null);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [dominantColor, setDominantColor] = useState("#8E24AA");
  const [secondaryColor, setSecondaryColor] = useState("#121212");
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const displayRef = useRef();
  const imageRef = useRef();
  const canvasRef = useRef(document.createElement('canvas'));

  // Function to get background color with opacity
  const getBackgroundColor = (color, opacity = 0.3) => {
    if (!color) return 'rgba(0, 0, 0, 0.3)';
    // Convert hex to rgba
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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

  // Check if a song is in favorites
  const isFavorite = (songId) => {
    return favorites && favorites.some(fav => fav._id === songId);
  };

  // Extract colors from image
  const extractColors = (imageElement) => {
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      // Set canvas dimensions
      canvas.width = 50;
      canvas.height = 50;
      
      // Draw image to canvas
      ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      
      // Color analysis
      const colorCounts = {};
      const sampleSize = 50;
      
      for (let i = 0; i < sampleSize; i++) {
        const x = Math.floor(Math.random() * canvas.width);
        const y = Math.floor(Math.random() * canvas.height);
        const index = (y * canvas.width + x) * 4;
        
        const r = imageData[index];
        const g = imageData[index + 1];
        const b = imageData[index + 2];
        
        // Skip transparent pixels
        if (imageData[index + 3] < 128) continue;
        
        // Round colors to reduce unique values
        const roundTo = 16;
        const rRounded = Math.round(r / roundTo) * roundTo;
        const gRounded = Math.round(g / roundTo) * roundTo;
        const bRounded = Math.round(b / roundTo) * roundTo;
        
        const hex = `#${rRounded.toString(16).padStart(2, '0')}${gRounded.toString(16).padStart(2, '0')}${bRounded.toString(16).padStart(2, '0')}`;
        
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }
      
      // Sort colors by frequency
      const sortedColors = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);
      
      // Get top colors
      let colors = sortedColors.slice(0, 2);
      
      // Fallback if not enough colors
      if (colors.length < 2) {
        colors = [...colors, ...['#8E24AA', '#121212'].slice(0, 2 - colors.length)];
      }
      
      // Brighten if too dark
      colors = colors.map(color => {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        if (r + g + b < 120) {
          const newR = Math.min(255, r + 100);
          const newG = Math.min(255, g + 80);
          const newB = Math.min(255, b + 100);
          return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
        }
        
        return color;
      });
      
      return colors;
    } catch (error) {
      console.error("Error extracting colors:", error);
      return ['#8E24AA', '#121212']; // Default fallback
    }
  };

  // Handle image load
  const handleImageLoad = (e) => {
    if (!e.target) return;
    
    try {
      const extractedColors = extractColors(e.target);
      
      setDominantColor(extractedColors[0]);
      setSecondaryColor(extractedColors[1]);
      
      // Apply gradient background
      if (displayRef.current) {
        displayRef.current.style.background = `linear-gradient(135deg, ${extractedColors[0]}, ${extractedColors[1]}, #121212)`;
      }
      
      // Display the extracted colors
      console.log("Extracted colors:", extractedColors);
    } catch (error) {
      console.error("Error processing image colors:", error);
    }
  };

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true);
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
        
        // Fetch artist details
        const artistRes = await axios.get(`${backendUrl}/api/artist/${id}`);
        if (artistRes.data.success) {
          setArtist(artistRes.data.artist);
          
          // Fetch all songs
          const songsRes = await axios.get(`${backendUrl}/api/song/list?all=true`);
          if (songsRes.data.success) {
            // Filter songs by artist ID or by matching artist name in descriptions
            const artistName = artistRes.data.artist.name.toLowerCase();
            const filteredSongs = songsRes.data.songs.filter(song => 
              // Match by artist ID reference
              (song.artist && song.artist === id) || 
              // Match by artist name in song name or description
              (song.name && song.name.toLowerCase().includes(artistName)) ||
              (song.desc && song.desc.toLowerCase().includes(artistName))
            );
            setArtistSongs(filteredSongs);
          }
        }
      } catch (err) {
        console.error("Error fetching artist data:", err);
        setError("Failed to load artist information");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArtistData();
    }
  }, [id]);

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

  // Handlers for song actions
  const handleToggleFavorite = (e, songId) => {
    e.stopPropagation();
    toggleFavorite && toggleFavorite(songId);
  };

  const handleAddToPlaylist = (e, songId) => {
    e.stopPropagation();
    setSelectedSongId(songId);
    setShowPlaylistModal(true);
  };

  const handleAddToQueue = (e, songId) => {
    e.stopPropagation();
    addToQueue && addToQueue(songId);
  };

  const isPlaying = (songId) => {
    return track && track._id === songId && playStatus;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12">
            <Skeleton type="image" className="w-48 h-48 rounded-full" />
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
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white">
        <div className="text-white text-xl">Artist not found</div>
      </div>
    );
  }

  return (
    <div ref={displayRef} className="min-h-screen w-full flex flex-col justify-start items-center pb-40 px-4 content-container transition-all duration-500 pt-6">
      <div className="w-full max-w-6xl mx-auto">
        {/* Back navigation */}
        {/* <Link to="/" className="inline-flex items-center text-white/80 hover:text-white py-4">
          <MdArrowBack className="mr-2" size={20} />
          <span>Back to Home</span>
        </Link> */}

        {/* Artist header */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-48 h-48 rounded-full overflow-hidden border-4 border-fuchsia-500/30 shadow-lg"
          >
            {artist.image ? (
              <img 
                ref={imageRef}
                src={artist.image} 
                alt={artist.name} 
                className="w-full h-full object-cover"
                onLoad={handleImageLoad}
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                <MdPerson className="text-fuchsia-500" size={80} />
              </div>
            )}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 text-center md:text-left"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{artist.name}</h1>
            {artist.bio && (
              <p className="text-neutral-300 text-lg mb-6 max-w-2xl">{artist.bio}</p>
            )}
            
            {artistSongs.length > 0 && (
              <button
                onClick={() => playWithId(artistSongs[0]._id)}
                className="text-white py-2 px-6 rounded-full flex items-center gap-2 transition-colors mx-auto md:mx-0"
                style={{ background: dominantColor }}
              >
                <MdPlayArrow size={24} /> Play Artist
              </button>
            )}
          </motion.div>
        </div>

        {/* Songs section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <MdPlayArrow className="text-fuchsia-500 mr-2" size={24} />
            Songs by {artist.name}
          </h2>

          {/* Grid View (for small screens) */}
          {viewMode === 'grid' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            >
          {artistSongs.length > 0 ? (
                artistSongs.map((song) => (
                  <div 
                    key={song._id} 
                    onClick={() => playWithId(song._id)}
                    className="relative rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 hover:bg-white/10 shadow-lg hover:shadow-xl"
                    style={{
                      background: dominantColor ? 
                        `linear-gradient(135deg, ${getBackgroundColor(dominantColor, 0.2)}, ${getBackgroundColor(secondaryColor, 0.1)})` : 
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
                                 `linear-gradient(135deg, ${getBackgroundColor(dominantColor, 0.3)}, ${getBackgroundColor(secondaryColor, 0.2)})` : 
                                 'rgba(0, 0, 0, 0.3)'
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
                      <p className="text-xs text-neutral-400 truncate mt-1">{song.desc || song.album || "Single"}</p>
                      
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
                         `linear-gradient(135deg, ${getBackgroundColor(dominantColor, 0.2)}, ${getBackgroundColor(secondaryColor, 0.1)})` : 
                         'rgba(0, 0, 0, 0.3)'
                     }}>
                  <MdPlayArrow size={60} className="text-neutral-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No songs found</h3>
                  <p className="text-neutral-400">
                    This artist doesn't have any songs yet.
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
                  `linear-gradient(135deg, ${getBackgroundColor(dominantColor, 0.2)}, ${getBackgroundColor(secondaryColor, 0.1)})` : 
                  'rgba(0, 0, 0, 0.3)'
              }}
            >
              {artistSongs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {artistSongs.map((song, index) => (
                    <div 
                      key={song._id} 
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-all cursor-pointer group"
                      style={{
                        background: dominantColor ? 
                          `linear-gradient(135deg, ${getBackgroundColor(dominantColor, 0.3)}, ${getBackgroundColor(secondaryColor, 0.2)})` : 
                          'rgba(0, 0, 0, 0.3)'
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
                        <p className="text-sm text-neutral-400 truncate">{song.desc || song.album || "Single"}</p>
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
                  <h3 className="text-xl font-semibold text-white mb-2">No songs found</h3>
                  <p className="text-neutral-400">
                    This artist doesn't have any songs yet.
                  </p>
            </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
      
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
    </div>
  );
};

export default ArtistDetail; 