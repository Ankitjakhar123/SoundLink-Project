import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MdArrowBack, MdMovie, MdPlayArrow, MdPause, MdAccessTime, MdFavorite, MdFavoriteBorder, MdPlaylistAdd, MdMoreVert, MdQueueMusic, MdMusicNote } from 'react-icons/md';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { PlayerContext } from '../context/PlayerContext';
import AddToPlaylistModal from './AddToPlaylistModal';
import Skeleton from './Skeleton';

const MovieAlbumDetail = () => {
  const { id } = useParams();
  const { playWithId, toggleFavorite, favorites, addToQueue, track, playStatus } = useContext(PlayerContext);
  const [movieAlbum, setMovieAlbum] = useState(null);
  const [albumSongs, setAlbumSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bgColors, setBgColors] = useState(['#1e1e1e', '#121212']);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showOptions, setShowOptions] = useState(null);
  const displayRef = useRef();
  const imageRef = useRef();
  const canvasRef = useRef(document.createElement('canvas'));
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  useEffect(() => {
    const fetchMovieAlbum = async () => {
      try {
        setLoading(true);
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
        const res = await axios.get(`${backendUrl}/api/moviealbum/${id}`);
        
        if (res.data.success) {
          setMovieAlbum(res.data.movieAlbum);
          
          // After getting the movie album, fetch songs associated with this album
          try {
            // Use the all=true parameter to get all songs without pagination
            const songsRes = await axios.get(`${backendUrl}/api/song/list?all=true`);
            if (songsRes.data.success) {
              // Filter songs that belong to this movie album (prefixed with [Movie])
              const albumName = `[Movie] ${res.data.movieAlbum.title}`;
              const filteredSongs = songsRes.data.songs.filter(song => song.album === albumName);
              setAlbumSongs(filteredSongs);
            }
          } catch (songErr) {
            console.error('Error fetching songs:', songErr);
          }
        } else {
          setError('Failed to load movie album');
        }
      } catch (err) {
        console.error('Error fetching movie album:', err);
        setError('Failed to load movie album');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieAlbum();
  }, [id]);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptions && !event.target.closest('.song-options')) {
        setShowOptions(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showOptions]);

  // Extract colors from the album cover image
  const extractColorsFromImage = (img) => {
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      // Set canvas size to a manageable analysis size (smaller for performance)
      canvas.width = 50;
      canvas.height = 50;
      
      // Draw image on canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Get pixel data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      
      // Color buckets for analysis (simple approach)
      const colorCounts = {};
      const sampleSize = 50; // Sample pixels for better performance
      
      // Sample pixels from different parts of the image
      for (let i = 0; i < sampleSize; i++) {
        const x = Math.floor(Math.random() * canvas.width);
        const y = Math.floor(Math.random() * canvas.height);
        const index = (y * canvas.width + x) * 4;
        
        const r = imageData[index];
        const g = imageData[index + 1];
        const b = imageData[index + 2];
        
        // Skip transparent pixels
        if (imageData[index + 3] < 128) continue;
        
        // Convert to hex (with some rounding to reduce unique colors)
        const roundTo = 16; // Round to reduce unique colors
        const rRounded = Math.round(r / roundTo) * roundTo;
        const gRounded = Math.round(g / roundTo) * roundTo;
        const bRounded = Math.round(b / roundTo) * roundTo;
        
        const hex = `#${rRounded.toString(16).padStart(2, '0')}${gRounded.toString(16).padStart(2, '0')}${bRounded.toString(16).padStart(2, '0')}`;
        
        // Count occurrences
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }
      
      // Get top colors by frequency
      const sortedColors = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);
      
      // Ensure we have at least two colors
      let colors = sortedColors.slice(0, 2);
      
      // If we don't have enough colors, add defaults
      if (colors.length < 2) {
        colors = [...colors, ...['#5E35B1', '#121212'].slice(0, 2 - colors.length)];
      }
      
      // Use vibrant colors and avoid too dark ones
      colors = colors.map(color => {
        // Simple check for very dark colors (can be improved)
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        // If the color is too dark, lighten it
        if (r + g + b < 120) {
          // Generate a more vibrant color based on the extracted one
          const newR = Math.min(255, r + 100);
          const newG = Math.min(255, g + 80);
          const newB = Math.min(255, b + 100);
          return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
        }
        
        return color;
      });
      
      return colors;
    } catch (error) {
      console.error('Error extracting colors:', error);
      return ['#5E35B1', '#121212']; // Default fallback colors
    }
  };

  // Handle image load and extract colors
  const handleImageLoad = (e) => {
    if (!e.target) return;
    
    try {
      // Extract colors from the loaded image
      const extractedColors = extractColorsFromImage(e.target);
      
      // Update state with extracted colors
      setBgColors(extractedColors);
      
      // Apply color to the background
      if (displayRef.current) {
        displayRef.current.style.background = `linear-gradient(135deg, ${extractedColors[0]}, ${extractedColors[1]}, #121212)`;
      }
    } catch (error) {
      console.error('Error in image color processing:', error);
      // Fallback colors
      setBgColors(['#5E35B1', '#121212']);
      if (displayRef.current) {
        displayRef.current.style.background = 'linear-gradient(135deg, #5E35B1, #121212)';
      }
    }
  };

  const isFavorite = (songId) => {
    return favorites && favorites.some(fav => fav._id === songId);
  };

  const handleToggleFavorite = (e, songId) => {
    e.stopPropagation(); // Prevent triggering the song play
    toggleFavorite && toggleFavorite(songId);
  };

  const handleAddToPlaylist = (e, songId) => {
    e.stopPropagation(); // Prevent triggering the song play
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

  // Function to get background color with opacity
  const getBackgroundColor = (color, opacity = 0.3) => {
    if (!color) return 'rgba(0, 0, 0, 0.3)';
    // Convert hex to rgba
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12">
            <Skeleton type="movie-card" className="w-64" />
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

  if (error || !movieAlbum) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-black text-white">
        <div className="text-red-500 mb-4">{error || 'Movie album not found'}</div>
        {/* <Link to="/" className="text-fuchsia-500 hover:text-fuchsia-400">
          Return to Home
        </Link> */}
      </div>
    );
  }

  return (
    <motion.div
      ref={displayRef}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen text-white p-4 md:p-8 transition-all duration-500 content-container pb-40 mb-8"
    >
      {/* <Link to="/" className="inline-flex items-center gap-2 text-fuchsia-500 hover:text-fuchsia-400 mb-6">
        <MdArrowBack /> Back to Home
      </Link> */}
      
      <div className="max-w-6xl mx-auto">
        <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end">
          {movieAlbum.coverImage ? (
            <img 
              ref={imageRef}
              src={movieAlbum.coverImage} 
              alt={movieAlbum.title} 
              className="w-48 h-48 rounded shadow-2xl object-cover"
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-album.png';
              }}
            />
          ) : (
            <div 
              className="w-48 h-48 rounded shadow-2xl bg-neutral-900 flex items-center justify-center text-fuchsia-500"
            >
              <MdMovie size={60} />
            </div>
          )}
          
          <div className="flex flex-col">
            <p className="text-neutral-400">Movie Album</p>
            <h2 className="text-4xl md:text-6xl font-bold mb-4">{movieAlbum.title}</h2>
            <h4 className="text-neutral-300">Directed by {movieAlbum.director}</h4>
            <div className="flex items-center gap-3 mt-2">
              {movieAlbum.year && (
                <span className="bg-neutral-800/50 px-3 py-1 rounded-full text-sm">{movieAlbum.year}</span>
              )}
              {movieAlbum.genre && (
                <span className="bg-neutral-800/50 px-3 py-1 rounded-full text-sm">{movieAlbum.genre}</span>
              )}
            </div>
            <div className="mt-4">
              {albumSongs.length > 0 && (
                <button
                  onClick={() => playWithId(albumSongs[0]._id)}
                  className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white py-2 px-6 rounded-full flex items-center gap-2 transition-colors"
                  style={{ backgroundColor: bgColors[0] }}
                >
                  <MdPlayArrow size={24} /> Play Soundtrack
                </button>
              )}
            </div>
          </div>
        </div>

        {movieAlbum.description && (
          <div className="mt-8 p-4 bg-black/30 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">About the Movie</h3>
            <p className="text-neutral-300">{movieAlbum.description}</p>
          </div>
        )}
        
        <div className="mt-10">
          <h3 className="text-2xl font-semibold mb-4 flex items-center">
            <MdQueueMusic className="mr-2 text-fuchsia-500" />
            Soundtrack
          </h3>
          
          {albumSongs.length > 0 ? (
            <>
              {/* Grid View (for small screens) */}
              {viewMode === 'grid' && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                >
                  {albumSongs.map((song) => (
                <div 
                  key={song._id}
                  onClick={() => playWithId(song._id)}
                      className="relative rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 hover:bg-white/10 shadow-lg hover:shadow-xl"
                      style={{
                        background: bgColors[0] ? 
                          `linear-gradient(135deg, ${getBackgroundColor(bgColors[0], 0.2)}, ${getBackgroundColor(bgColors[1], 0.1)})` : 
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
                                 background: bgColors[0] ? 
                                   `linear-gradient(135deg, ${getBackgroundColor(bgColors[0], 0.3)}, ${getBackgroundColor(bgColors[1], 0.2)})` : 
                                   'rgba(0, 0, 0, 0.3)'
                               }}>
                            <MdMusicNote size={60} />
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
                  ))}
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
                    background: bgColors[0] ? 
                      `linear-gradient(135deg, ${getBackgroundColor(bgColors[0], 0.2)}, ${getBackgroundColor(bgColors[1], 0.1)})` : 
                      'rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {albumSongs.map((song, index) => (
                      <div 
                        key={song._id} 
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-all cursor-pointer group"
                        style={{
                          background: bgColors[0] ? 
                            `linear-gradient(135deg, ${getBackgroundColor(bgColors[0], 0.3)}, ${getBackgroundColor(bgColors[1], 0.2)})` : 
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
                </motion.div>
              )}
            </>
          ) : (
            <div className="bg-black/30 rounded-lg p-8 text-center text-neutral-400">
              No soundtrack available for this movie yet
            </div>
          )}
        </div>
      </div>
      
      {showPlaylistModal && (
        <AddToPlaylistModal 
          songId={selectedSongId} 
          onClose={() => setShowPlaylistModal(false)} 
        />
      )}
    </motion.div>
  );
};

export default MovieAlbumDetail; 