import React, { useContext, useRef, useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { MdTrendingUp, MdAlbum, MdPerson, MdMovie, MdPlayArrow, MdFavorite, MdFavoriteBorder, MdPlaylistAdd, MdQueueMusic, MdPause, MdMoreVert } from "react-icons/md";
import AlbumItem from "./AlbumItem";
import SongItem from "./SongItem";
import MovieAlbumItem from "./MovieAlbumItem";
import { PlayerContext } from "../context/PlayerContext";
import { AuthContext } from "../context/AuthContext";
import AddToPlaylistModal from "./AddToPlaylistModal";
import { toast } from "react-toastify";
import "./MobileStyles.css"; // Import mobile-specific styles
import SEO from './SEO'; // Import SEO component

// Cache for storing fetched data
let cachedData = {
  songs: null,
  movieAlbums: null,
  artists: null,
  trendingSongs: null,
  lastFetch: null
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

const DisplayHome = () => {
  const navigate = useNavigate();
  const { 
    songsData, 
    albumsData, 
    playWithId, 
    toggleFavorite, 
    favorites, 
    setSongsData, 
    addToQueue,
    track, 
    playStatus 
  } = useContext(PlayerContext);
  const { user } = useContext(AuthContext);
  
  // Refs for scrollable sections
  const trendingRef = useRef(null);
  const albumRowRef = useRef(null);
  const artistsRowRef = useRef(null);
  const movieAlbumRowRef = useRef(null);
  const topRef = useRef(null);
  
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [songsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [movieAlbums, setMovieAlbums] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [mainColor, setMainColor] = useState('#8E24AA');
  const [visibleSongs, setVisibleSongs] = useState([]);
  const observerRef = useRef(null);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  // Calculate currentSongs before useEffect hooks
  const indexOfLastSong = currentPage * songsPerPage;
  const indexOfFirstSong = indexOfLastSong - songsPerPage;
  const currentSongs = songsData.slice(indexOfFirstSong, indexOfLastSong);
  const totalPages = Math.ceil(songsData.length / songsPerPage);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const songId = entry.target.dataset.songId;
          if (songId && !visibleSongs.includes(songId)) {
            setVisibleSongs(prev => [...prev, songId]);
          }
        }
      });
    }, options);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Observe song elements
  useEffect(() => {
    const songElements = document.querySelectorAll('.song-item');
    songElements.forEach(element => {
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    });
  }, [currentSongs]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Check if we have valid cached data
      const now = Date.now();
      if (cachedData.lastFetch && (now - cachedData.lastFetch < CACHE_DURATION)) {
        // Use cached data
        setSongsData(cachedData.songs || []);
        setMovieAlbums(cachedData.movieAlbums || []);
        setArtists(cachedData.artists || []);
        setTrendingSongs(cachedData.trendingSongs || []);
        setLoading(false);
        return;
      }

      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
      
      // Fetch movie albums
      const movieRes = await axios.get(`${backendUrl}/api/moviealbum/list`);
      if (movieRes.data.success) {
        setMovieAlbums(movieRes.data.movieAlbums);
        cachedData.movieAlbums = movieRes.data.movieAlbums;
      }
      
      // Fetch songs with pagination
      const songsRes = await axios.get(`${backendUrl}/api/song/list?all=true`);
      if (songsRes.data.success) {
        setSongsData(songsRes.data.songs);
        cachedData.songs = songsRes.data.songs;
        
        // Create trending songs
        if (songsRes.data.songs && songsRes.data.songs.length) {
          // Sort by some criteria to simulate trending
          const sorted = [...songsRes.data.songs].sort(() => Math.random() - 0.5).slice(0, 10);
          setTrendingSongs(sorted);
          cachedData.trendingSongs = sorted;
        }
        
        // Log the total count of songs for debugging
        console.log(`Loaded ${songsRes.data.songs.length} total songs`);
      }
      
      // Fetch artists from the new API endpoint
      const artistsRes = await axios.get(`${backendUrl}/api/artist/list`);
      if (artistsRes.data.success) {
        setArtists(artistsRes.data.artists);
        cachedData.artists = artistsRes.data.artists;
      }
      
      // Set a random vibrant color for the UI
      const colors = ['#8E24AA', '#1E88E5', '#43A047', '#FB8C00', '#E53935', '#3949AB'];
      setMainColor(colors[Math.floor(Math.random() * colors.length)]);
      
      // Update cache timestamp
      cachedData.lastFetch = now;
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Pagination logic
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if a song is in favorites
  const isFavorite = (songId) => {
    return favorites && favorites.some(fav => fav._id === songId);
  };

  // Handlers for song actions
  const handleToggleFavorite = (e, songId) => {
    e.stopPropagation();
    toggleFavorite && toggleFavorite(songId);
  };

  const handleAddToPlaylist = (e, songId) => {
    e.stopPropagation();
    
    if (!user) {
      toast.info(
        <div>
          Please log in to create playlists. 
          <Link to="/auth" className="ml-2 text-fuchsia-400 underline">
            Log in now
          </Link>
        </div>, 
        { autoClose: 5000 }
      );
      return;
    }
    
    setSelectedSongId(songId);
    setShowPlaylistModal(true);
  };

  const handleAddToQueue = (e, songId) => {
    e.stopPropagation();
    addToQueue(songId);
  };

  // Handler for artist click
  const handleArtistClick = (artistId) => {
    navigate(`/artist/${artistId}`);
  };

  // Scroll to top handler
  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Fallback if ref doesn't work
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="p-4 md:p-8">
          {/* Trending Songs Skeleton */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-neutral-800 rounded animate-pulse"></div>
              <div className="h-8 w-48 bg-neutral-800 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-neutral-900/50 rounded-lg overflow-hidden">
                  <div className="aspect-square bg-neutral-800 animate-pulse"></div>
                  <div className="p-3">
                    <div className="h-4 bg-neutral-800 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-neutral-800 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Albums Skeleton */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-neutral-800 rounded animate-pulse"></div>
              <div className="h-8 w-48 bg-neutral-800 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-neutral-900/50 rounded-lg overflow-hidden">
                  <div className="aspect-square bg-neutral-800 animate-pulse"></div>
                  <div className="p-3">
                    <div className="h-4 bg-neutral-800 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-neutral-800 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Artists Skeleton */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-neutral-800 rounded animate-pulse"></div>
              <div className="h-8 w-48 bg-neutral-800 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-neutral-900/50 rounded-lg overflow-hidden">
                  <div className="aspect-square bg-neutral-800 rounded-full animate-pulse"></div>
                  <div className="p-3 text-center">
                    <div className="h-4 bg-neutral-800 rounded w-3/4 mx-auto animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Movie Albums Skeleton */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-neutral-800 rounded animate-pulse"></div>
              <div className="h-8 w-48 bg-neutral-800 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-neutral-900/50 rounded-lg overflow-hidden">
                  <div className="aspect-[16/9] bg-neutral-800 animate-pulse"></div>
                  <div className="p-3">
                    <div className="h-4 bg-neutral-800 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-neutral-800 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <SEO 
        title="SoundLink - Your Premium Music Streaming Experience"
        description="Discover and enjoy high-quality music streaming with SoundLink. Access trending songs, albums, and artists."
      />
      
      <div ref={topRef} className="pt-safe px-4 pb-16 flex-1 content-container bg-black">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.7, ease: 'easeOut' }} 
          className="w-full max-w-7xl flex justify-start mt-6 mb-8 px-2 md:px-0"
        >
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-lg text-left pt-1">
              Welcome back{user?.username ? `, ${user.username}` : ''}
            </h1>
        </motion.div>

        <div className="relative w-full max-w-7xl mx-auto rounded-3xl p-0 flex flex-col gap-8 mt-0">
          {/* Trending Section */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="w-full"
          >
            <h2 className="font-bold text-xl md:text-2xl mb-5 text-white/90 text-left tracking-wide flex items-center gap-2">
              <MdTrendingUp className="text-fuchsia-500" size={26} />
              <span>Trending Now</span>
            </h2>
            
            <div className="relative rounded-xl overflow-hidden"
              style={{ background: `linear-gradient(to right, ${mainColor}22, ${mainColor}66)` }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute bg-white rounded-full"
                    style={{
                      width: `${Math.random() * 5 + 1}px`,
                      height: `${Math.random() * 5 + 1}px`,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                    }}
                  ></div>
                ))}
              </div>
              
              <div ref={trendingRef} className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent py-6 px-4">
                {trendingSongs && trendingSongs.map((song) => (
                  <div 
                    key={song._id}
                    onClick={() => playWithId(song._id)}
                    className={`flex-shrink-0 w-64 ${track && track._id === song._id ? 'bg-fuchsia-900/30' : 'bg-black/30'} backdrop-blur-md p-4 rounded-lg hover:bg-white/10 transition-all cursor-pointer group`}
                  >
                    <div className="flex gap-4 items-center">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden">
                        {song.image ? (
                          <img 
                            src={song.image} 
                            alt={song.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                            <MdPlayArrow className="text-fuchsia-500" size={30} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                          {track && track._id === song._id ? (
                            playStatus ? (
                              <div className="bg-fuchsia-500 rounded-full p-1">
                                <MdPause className="text-white" size={24} />
                              </div>
                            ) : (
                              <div className="bg-fuchsia-500 rounded-full p-1">
                                <MdPlayArrow className="text-white" size={24} />
                              </div>
                            )
                          ) : (
                            <MdPlayArrow className="text-white" size={30} />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-sm truncate">{song.name}</h3>
                        <p className="text-neutral-400 text-xs truncate">{song.desc}</p>
                        
                        <div className="flex items-center mt-2 gap-3">
                          <button 
                            onClick={(e) => handleToggleFavorite(e, song._id)}
                            className="text-white opacity-70 hover:opacity-100 transition-opacity"
                          >
                            {isFavorite(song._id) ? 
                              <MdFavorite className="text-fuchsia-500" size={16} /> : 
                              <MdFavoriteBorder size={16} />
                            }
                          </button>
                          <button 
                            onClick={(e) => handleAddToPlaylist(e, song._id)}
                            className="text-white opacity-70 hover:opacity-100 transition-opacity"
                          >
                            <MdPlaylistAdd size={18} />
                          </button>
                          <button 
                            onClick={(e) => handleAddToQueue(e, song._id)}
                            className="text-white opacity-70 hover:opacity-100 transition-opacity"
                          >
                            <MdQueueMusic size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!trendingSongs || trendingSongs.length === 0) && (
                  <div className="flex-shrink-0 w-full h-48 bg-neutral-900/60 rounded-xl flex items-center justify-center">
                    <p className="text-neutral-400 text-center">No trending songs available</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Collections Section */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
            className="w-full"
          >
            <h2 className="font-bold text-xl md:text-2xl mb-5 text-white/90 text-left tracking-wide flex items-center gap-2">
              <MdAlbum className="text-fuchsia-500" size={24} />
              <span>Music Collections</span>
              </h2>
            
            <div className="relative">
              <div
                ref={albumRowRef}
                className="flex gap-5 overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent py-3 px-1"
                style={{ scrollBehavior: 'smooth' }}
              >
                {albumsData && albumsData.map((item) => (
                  <AlbumItem
                    key={item._id}
                    id={item._id}
                    name={item.name}
                    image={item.image}
                    desc={item.desc}
                  />
                ))}
              
              {(!albumsData || albumsData.length === 0) && (
                <div className="flex-shrink-0 w-48 h-64 bg-neutral-900/60 rounded-xl flex items-center justify-center">
                  <p className="text-neutral-400 text-center px-4">No albums available yet</p>
                </div>
              )}
              </div>
            </div>
          </motion.div>
          
          {/* Artists Section */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
            className="w-full"
          >
            <h2 className="font-bold text-xl md:text-2xl mb-5 text-white/90 text-left tracking-wide flex items-center gap-2">
              <MdPerson className="text-fuchsia-500" size={24} />
              <span>Popular Artists</span>
            </h2>
            
            <div className="relative">
              <div
                ref={artistsRowRef}
                className="flex gap-8 overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent py-4 px-1"
                style={{ scrollBehavior: 'smooth' }}
              >
                {artists && artists.map((artist) => (
                  <div 
                    key={artist._id} 
                    className="flex-shrink-0 flex flex-col items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => handleArtistClick(artist._id)}
                  >
                    <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-fuchsia-500/30 shadow-lg">
                      {artist.image ? (
                        <img 
                          src={artist.image} 
                          alt={artist.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                          <MdPerson className="text-fuchsia-500" size={40} />
                        </div>
                      )}
                    </div>
                    <h3 className="text-white font-medium text-sm text-center">{artist.name}</h3>
                  </div>
                ))}
                
                {(!artists || artists.length === 0) && (
                  <div className="flex-shrink-0 w-full h-32 bg-neutral-900/60 rounded-xl flex items-center justify-center">
                    <p className="text-neutral-400 text-center">No artists available yet</p>
                  </div>
                )}
                </div>
            </div>
          </motion.div>
          
          {/* Movie Albums Section */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
            className="w-full"
          >
            <h2 className="font-bold text-xl md:text-2xl mb-5 text-white/90 text-left tracking-wide flex items-center gap-2">
              <MdMovie className="text-fuchsia-500" size={24} />
              <span>Movie Soundtracks</span>
              </h2>
            
            <div className="relative">
              <div
                ref={movieAlbumRowRef}
                className="flex gap-5 overflow-x-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent py-3 px-1"
                style={{ scrollBehavior: 'smooth' }}
              >
                {movieAlbums && movieAlbums.map((item) => (
                  <MovieAlbumItem
                    key={item._id}
                    id={item._id}
                    title={item.title}
                    image={item.coverImage}
                  />
                ))}
                
                {(!movieAlbums || movieAlbums.length === 0) && (
                  <div className="flex-shrink-0 w-48 h-64 bg-neutral-900/60 rounded-xl flex items-center justify-center">
                    <p className="text-neutral-400 text-center px-4">No movie albums available yet</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* All Songs Section */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.4 }}
            className="w-full"
          >
            <h2 className="font-bold text-xl md:text-2xl mb-5 text-white/90 text-left tracking-wide flex items-center gap-2">
              <MdPlayArrow className="text-fuchsia-500" size={24} />
              <span>All Songs</span>
            </h2>
            
            {/* Songs Grid */}
            <div className="bg-neutral-900/30 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/5">
              {currentSongs && currentSongs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentSongs.map((song) => (
                    <div 
                      key={song._id} 
                      className={`song-item flex items-center gap-3 p-3 rounded-lg ${track && track._id === song._id ? 'bg-fuchsia-900/30' : 'bg-neutral-900/60'} hover:bg-neutral-800 transition-colors cursor-pointer`}
                      data-song-id={song._id}
                      onClick={() => playWithId(song._id)}
                    >
                      <div className="bg-neutral-800 w-12 h-12 rounded flex items-center justify-center relative">
                        {visibleSongs.includes(song._id) && song.image ? (
                          <img 
                            src={song.image} 
                            alt={song.name} 
                            className="w-full h-full object-cover rounded"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-800 rounded flex items-center justify-center">
                            <MdPlayArrow size={24} className="text-fuchsia-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{song.name}</h3>
                        <p className="text-white/60 text-sm truncate">{song.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/60">No songs found</div>
              )}
              
              {/* Mobile Pagination - simplified for touch */}
              {totalPages > 1 && (
                <div className="md:hidden mobile-pagination flex justify-center mt-6 gap-1">
                  <button
                    onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-neutral-800/30 text-neutral-500' : 'bg-fuchsia-600 text-white'}`}
                  >
                    Prev
                  </button>
                  <div className="px-4 py-2 bg-neutral-800/50 rounded-lg">
                    <span className="text-white">{currentPage}</span>
                    <span className="text-neutral-400"> / {totalPages}</span>
                  </div>
                  <button
                    onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-neutral-800/30 text-neutral-500' : 'bg-fuchsia-600 text-white'}`}
                  >
                    Next
                  </button>
                </div>
              )}
              
              {/* Desktop Pagination - only shown on medium screens and up */}
              {totalPages > 1 && (
                <div className="hidden md:flex justify-center mt-8">
                  <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => paginate(i + 1)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          currentPage === i + 1 
                            ? `bg-${mainColor.replace('#', '')} text-white` 
                            : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700'
                        }`}
                        style={currentPage === i + 1 ? { backgroundColor: mainColor } : {}}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              </div>
            </motion.div>
        </div>
        
        {/* Footer */}
        <footer className="w-full bg-black/70 backdrop-blur-sm border-t border-white/10 mt-16 py-10 -mx-4 md:-mx-12 px-4 md:px-12 relative z-10 left-0 right-0 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-0">
            {/* Back to Top Button */}
            <div className="flex justify-center mb-10">
              <button
                onClick={scrollToTop}
                className="group flex flex-col items-center gap-2 transition-transform hover:scale-105"
              >
                <div className="w-10 h-10 bg-fuchsia-600 rounded-full flex items-center justify-center group-hover:bg-fuchsia-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </div>
                <span className="text-white text-sm">Back to Top</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-3">SoundLink</h3>
                <p className="text-neutral-400 text-sm mb-4">Your ultimate music streaming platform with curated playlists, top charts, and personalized recommendations.</p>
                <div className="flex justify-center md:justify-start gap-4 mt-4">
                  <a href="#" className="text-white hover:text-fuchsia-500 transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                    </svg>
                  </a>
                  <a href="#" className="text-white hover:text-fuchsia-500 transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                    </svg>
                  </a>
                  <a href="#" className="text-white hover:text-fuchsia-500 transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                    </svg>
                  </a>
                </div>
              </div>
              
              {/* Explore Links */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Explore</h4>
                <ul className="space-y-3">
                  <li>
                    <a 
                      onClick={() => navigate('/trending')} 
                      className="text-neutral-400 hover:text-fuchsia-500 transition-colors cursor-pointer"
                    >
                      Trending Songs
                    </a>
                  </li>
                  <li>
                    <a 
                      onClick={() => navigate('/artists')} 
                      className="text-neutral-400 hover:text-fuchsia-500 transition-colors cursor-pointer"
                    >
                      Artists
                    </a>
                  </li>
                  <li>
                    <a 
                      onClick={() => navigate('/favorites')} 
                      className="text-neutral-400 hover:text-fuchsia-500 transition-colors cursor-pointer"
                    >
                      My Favorites
                    </a>
                  </li>
                  <li>
                    <a 
                      onClick={() => navigate('/premium')} 
                      className="text-neutral-400 hover:text-fuchsia-500 transition-colors cursor-pointer"
                    >
                      Premium
                    </a>
                  </li>
                </ul>
              </div>
              
              {/* Company Links */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
                <ul className="space-y-3">
                  <li>
                    <a 
                      onClick={() => navigate('/about')} 
                      className="text-neutral-400 hover:text-fuchsia-500 transition-colors cursor-pointer"
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a 
                      onClick={() => navigate('/terms')} 
                      className="text-neutral-400 hover:text-fuchsia-500 transition-colors cursor-pointer"
                    >
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a 
                      onClick={() => navigate('/privacy')} 
                      className="text-neutral-400 hover:text-fuchsia-500 transition-colors cursor-pointer"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a 
                      onClick={() => navigate('/contact')} 
                      className="text-neutral-400 hover:text-fuchsia-500 transition-colors cursor-pointer"
                    >
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>
              
              {/* Account Links */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Account</h4>
                <ul className="space-y-3">
                  <li>
                    <a 
                      onClick={() => navigate('/profile')} 
                      className="text-neutral-400 hover:text-fuchsia-500 transition-colors cursor-pointer"
                    >
                      My Profile
                    </a>
                  </li>
                  <li>
                    <a 
                      onClick={() => navigate('/settings')} 
                      className="text-neutral-400 hover:text-fuchsia-500 transition-colors cursor-pointer"
                    >
                      Account Settings
                    </a>
                  </li>
                  <li>
                    <a 
                      href="mailto:support@soundlink.com" 
                      className="text-neutral-400 hover:text-fuchsia-500 transition-colors"
                    >
                      Get Support
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-white/10 mt-10 pt-8 text-center">
              <p className="text-neutral-500 text-sm">
                © {new Date().getFullYear()} SoundLink Music Streaming Platform. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
        
        {/* Add To Playlist Modal */}
        {showPlaylistModal && (
          <AddToPlaylistModal 
            songId={selectedSongId} 
            onClose={() => setShowPlaylistModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default DisplayHome;
