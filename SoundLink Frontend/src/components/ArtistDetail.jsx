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
  const { playWithId, toggleFavorite, favorites, addToQueue, track, playStatus, pause, play } = useContext(PlayerContext);
  const [artist, setArtist] = useState(null);
  const [artistSongs, setArtistSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOptions, setShowOptions] = useState(null);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [dominantColor, setDominantColor] = useState("#8E24AA");
  const [secondaryColor, setSecondaryColor] = useState("#121212");
  const displayRef = useRef();
  const imageRef = useRef();
  const canvasRef = useRef(document.createElement('canvas'));

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
    <div ref={displayRef} className="min-h-screen w-full flex flex-col justify-start items-center pb-16 px-4 content-container transition-all duration-500 pt-6">
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
            
            {/* Display extracted colors */}
            <div className="flex items-center gap-3 mb-6">
              <div className="text-sm text-white/80">Dominant colors:</div>
              <div className="w-6 h-6 rounded-full" style={{ background: dominantColor }}></div>
              <div className="w-6 h-6 rounded-full" style={{ background: secondaryColor }}></div>
            </div>
            
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

          {artistSongs.length > 0 ? (
            <div className="bg-neutral-900/50 backdrop-blur-md rounded-xl overflow-hidden">
              {/* Desktop header - hidden on mobile */}
              <div className="hidden md:grid grid-cols-4 p-4 border-b border-neutral-900 text-neutral-400 text-sm">
                <div className="flex items-center"># TITLE</div>
                <div className="hidden md:block">ALBUM</div>
                <div className="hidden md:block">DURATION</div>
                <div className="text-right"></div>
              </div>
              
              <div className="divide-y divide-neutral-800/50">
                {artistSongs.map((song, index) => (
                  <div 
                    key={song._id} 
                    className={`grid grid-cols-12 p-4 hover:bg-white/10 transition-all cursor-pointer group ${isPlaying(song._id) ? 'bg-white/10' : ''}`}
                    onClick={() => playWithId(song._id)}
                  >
                    {/* Desktop View - Hidden on mobile */}
                    <div className="hidden md:flex md:col-span-3 items-center gap-3">
                      <div className="w-6 min-w-[24px] text-neutral-400 flex items-center justify-center">
                        <span className={isPlaying(song._id) ? 'hidden' : 'group-hover:hidden'}>{index + 1}</span>
                        <button 
                          className={isPlaying(song._id) ? 'block' : 'hidden group-hover:block'}
                          onClick={(e) => handlePlayPause(e, song._id)}
                        >
                          {isPlaying(song._id) ? <MdPause className="text-fuchsia-500" /> : <MdPlayArrow />}
                        </button>
                      </div>
                      
                      <div className="bg-neutral-800 w-10 h-10 min-w-[40px] rounded flex-shrink-0 overflow-hidden">
                        {song.image ? (
                          <img 
                            src={song.image} 
                            alt={song.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MdPlayArrow size={20} className="text-fuchsia-500" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium truncate ${isPlaying(song._id) ? 'text-fuchsia-500' : 'text-white'}`}>{song.name}</div>
                        <div className="text-xs text-neutral-400 truncate">{song.desc}</div>
                      </div>
                    </div>
                    
                    {/* Mobile View - Only shown on small screens */}
                    <div className="col-span-12 md:hidden flex items-center gap-3">
                      <div className="w-6 min-w-[24px] text-neutral-400 flex items-center justify-center">
                        <span className={isPlaying(song._id) ? 'hidden' : 'group-hover:hidden'}>{index + 1}</span>
                        <button 
                          className={isPlaying(song._id) ? 'block' : 'hidden group-hover:block'}
                          onClick={(e) => handlePlayPause(e, song._id)}
                        >
                          {isPlaying(song._id) ? <MdPause className="text-fuchsia-500" /> : <MdPlayArrow />}
                        </button>
                      </div>
                      
                      <div className="bg-neutral-800 w-14 h-14 min-w-[56px] rounded-lg flex-shrink-0 overflow-hidden relative">
                        {song.image ? (
                          <img 
                            src={song.image} 
                            alt={song.name} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MdPlayArrow size={24} className="text-fuchsia-500" />
                          </div>
                        )}
                        {isPlaying(song._id) && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-fuchsia-500"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-2">
                        <div className={`font-medium truncate ${isPlaying(song._id) ? 'text-fuchsia-500' : 'text-white'} text-sm`}>{song.name}</div>
                        <div className="text-xs text-neutral-400 truncate">{song.desc || song.album || "Single"}</div>
                      </div>
                      
                      {/* Mobile action buttons with heart and three dots side by side */}
                      <div className="flex items-center gap-1 relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const btn = e.currentTarget;
                            btn.classList.add('favorite-animation');
                            setTimeout(() => btn.classList.remove('favorite-animation'), 1000);
                            handleToggleFavorite(e, song._id);
                          }}
                          className="text-lg"
                        >
                          {isFavorite(song._id) ? 
                            <MdFavorite className="text-fuchsia-500" size={20} /> : 
                            <MdFavoriteBorder size={20} className="text-neutral-400" />
                          }
                        </button>
                        
                        <button 
                          onClick={(e) => handleToggleOptions(e, song._id)}
                          className={`text-lg song-options ${showOptions === song._id ? 'text-fuchsia-500' : ''}`}
                        >
                          <MdMoreVert className={showOptions === song._id ? "text-fuchsia-500" : "text-neutral-400"} size={20} />
                        </button>
                        
                        <span className="text-xs text-neutral-400 song-duration ml-1">{song.duration || "--:--"}</span>
                      </div>
                    </div>
                    
                    <div className="hidden md:block md:col-span-3 text-neutral-400 truncate">
                      {song.album || "Single"}
                    </div>
                    
                    <div className="hidden md:flex md:col-span-3 items-center text-neutral-400">
                      {song.duration || "--:--"}
                    </div>
                    
                    <div className="hidden md:flex md:col-span-3 items-center justify-end gap-3">
                      <button 
                        onClick={(e) => handleToggleFavorite(e, song._id)}
                        className="opacity-70 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-white"
                        aria-label="Toggle favorite"
                      >
                        {isFavorite(song._id) ? 
                          <MdFavorite className="text-fuchsia-500" size={18} /> : 
                          <MdFavoriteBorder size={18} />
                        }
                      </button>
                      
                      <div className="relative song-options">
                        <button 
                          onClick={(e) => handleToggleOptions(e, song._id)}
                          className="opacity-70 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-white"
                          aria-label="More options"
                        >
                          <MdMoreVert size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-neutral-900/50 backdrop-blur-md rounded-xl p-8 border border-white/5 text-center">
              <p className="text-neutral-400">No songs available by this artist yet</p>
            </div>
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