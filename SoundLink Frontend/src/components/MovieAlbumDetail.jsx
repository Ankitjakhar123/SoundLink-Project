import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MdArrowBack, MdMovie, MdPlayArrow, MdPause, MdAccessTime, MdFavorite, MdFavoriteBorder, MdPlaylistAdd, MdMoreVert, MdQueueMusic } from 'react-icons/md';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { PlayerContext } from '../context/PlayerContext';
import AddToPlaylistModal from './AddToPlaylistModal';

const MovieAlbumDetail = () => {
  const { id } = useParams();
  const { playWithId, toggleFavorite, favorites, addToQueue, track, playStatus, pause, play } = useContext(PlayerContext);
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
            const songsRes = await axios.get(`${backendUrl}/api/song/list`);
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

  const handleToggleOptions = (e, songId) => {
    e.stopPropagation();
    setShowOptions(showOptions === songId ? null : songId);
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
      <div className="min-h-screen flex justify-center items-center bg-black text-white">
        <div className="animate-pulse text-fuchsia-500 text-xl">Loading movie album...</div>
      </div>
    );
  }

  if (error || !movieAlbum) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-black text-white">
        <div className="text-red-500 mb-4">{error || 'Movie album not found'}</div>
        <Link to="/" className="text-fuchsia-500 hover:text-fuchsia-400">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      ref={displayRef}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen text-white p-4 md:p-8 transition-all duration-500 content-container"
    >
      <Link to="/" className="inline-flex items-center gap-2 text-fuchsia-500 hover:text-fuchsia-400 mb-6">
        <MdArrowBack /> Back to Home
      </Link>
      
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
            <div className="bg-black/30 rounded-xl overflow-hidden">
              <div className="grid grid-cols-4 px-4 py-3 border-b border-neutral-800 text-neutral-400 text-sm">
                <div className="flex items-center"># TITLE</div>
                <div className="hidden md:block">ALBUM</div>
                <div className="hidden md:block">TIME</div>
                <div className="text-right pr-2"></div>
              </div>
              
              {albumSongs.map((song, index) => (
                <div 
                  key={song._id}
                  onClick={() => playWithId(song._id)}
                  className={`grid grid-cols-4 px-4 py-3 hover:bg-white/5 cursor-pointer group border-b border-neutral-800/50 ${isPlaying(song._id) ? 'bg-white/10' : ''}`}
                >
                  <div className="flex items-center gap-4 col-span-3 sm:col-span-1">
                    <div className="w-6 min-w-6 text-neutral-400 flex items-center justify-center">
                      <span className={isPlaying(song._id) ? 'hidden' : 'group-hover:hidden'}>{index + 1}</span>
                      <button 
                        className={isPlaying(song._id) ? 'block' : 'hidden group-hover:block'}
                        onClick={(e) => handlePlayPause(e, song._id)}
                      >
                        {isPlaying(song._id) ? <MdPause className="text-fuchsia-500" /> : <MdPlayArrow />}
                      </button>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium truncate ${isPlaying(song._id) ? 'text-fuchsia-500' : 'text-white'} text-xs sm:text-base`}>{song.name}</div>
                      <div className="text-xs text-neutral-400 truncate hidden xs:block">{song.desc}</div>
                    </div>
                  </div>
                  
                  <div className="hidden md:block text-neutral-400 truncate">
                    {song.album}
                  </div>
                  
                  <div className="hidden md:flex items-center text-neutral-400">
                    {song.duration}
                  </div>
                  
                  <div className="flex items-center justify-end gap-1 sm:gap-3 col-span-1">
                    <button 
                      onClick={(e) => handleToggleFavorite(e, song._id)}
                      className="opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-white"
                    >
                      {isFavorite(song._id) ? 
                        <MdFavorite className="text-fuchsia-500" /> : 
                        <MdFavoriteBorder />
                      }
                    </button>
                    
                    <div className="text-neutral-400 md:hidden text-[14px] sm:text-[15px]">
                      {song.duration}
                    </div>
                    
                    <div className="relative song-options">
                      <button 
                        onClick={(e) => handleToggleOptions(e, song._id)}
                        className="opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-white"
                      >
                        <MdMoreVert />
                      </button>
                      
                      {showOptions === song._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-md shadow-lg z-50 border border-neutral-700 py-1">
                          <button 
                            onClick={(e) => {e.stopPropagation(); handleAddToQueue(e, song._id)}}
                            className="w-full text-left px-4 py-2 text-white hover:bg-neutral-700 flex items-center gap-2"
                          >
                            <MdQueueMusic size={18} />
                            Add to Queue
                          </button>
                          <button 
                            onClick={(e) => {e.stopPropagation(); handleAddToPlaylist(e, song._id)}}
                            className="w-full text-left px-4 py-2 text-white hover:bg-neutral-700 flex items-center gap-2"
                          >
                            <MdPlaylistAdd size={18} />
                            Add to Playlist
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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