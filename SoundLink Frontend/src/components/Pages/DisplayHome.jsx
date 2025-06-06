import React, { useContext, useRef, useEffect, useState, useCallback, useMemo } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { MdTrendingUp, MdAlbum, MdPerson, MdMovie, MdPlayArrow, MdFavorite, MdFavoriteBorder, MdPlaylistAdd, MdQueueMusic, MdPause, MdMoreVert, MdMusicNote } from "react-icons/md";
import AlbumItem from "../AlbumItem";
import SongItem from "../SongItem";
import MovieAlbumItem from "../MovieAlbumItem";
import { PlayerContext } from "../../context/PlayerContext";
import { AuthContext } from "../../context/AuthContext";
import AddToPlaylistModal from "../AddToPlaylistModal";
import { toast } from "react-toastify";
import "../../styles/MobileStyles.css"; // Import mobile-specific styles
import SEO from '../SEO'; // Import SEO component
import Footer from '../Layout/Footer'; // Import Footer component

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cachedData = {
  songs: null,
  movieAlbums: null,
  artists: null,
  trendingSongs: null,
  lastFetch: null
};

// Memoized color array
const THEME_COLORS = Object.freeze(['#8E24AA', '#1E88E5', '#43A047', '#FB8C00', '#E53935', '#3949AB']);

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
  const [mainColor, setMainColor] = useState(THEME_COLORS[0]);
  const [visibleSongs, setVisibleSongs] = useState([]);
  const observerRef = useRef(null);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Memoized calculations
  const { indexOfLastSong, indexOfFirstSong, currentSongs, totalPages } = useMemo(() => {
    const indexOfLast = currentPage * songsPerPage;
    const indexOfFirst = indexOfLast - songsPerPage;
    const current = songsData.slice(indexOfFirst, indexOfLast);
    const total = Math.ceil(songsData.length / songsPerPage);
    return { 
      indexOfLastSong: indexOfLast, 
      indexOfFirstSong: indexOfFirst, 
      currentSongs: current, 
      totalPages: total 
    };
  }, [currentPage, songsPerPage, songsData]);

  // Memoized intersection observer options
  const observerOptions = useMemo(() => ({
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  }), []);

  // Intersection observer callback
  const handleIntersection = useCallback((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const songId = entry.target.dataset.songId;
        if (songId && !visibleSongs.includes(songId)) {
          setVisibleSongs(prev => [...prev, songId]);
        }
      }
    });
  }, [visibleSongs]);

  // Setup intersection observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleIntersection, observerOptions);
    return () => observerRef.current?.disconnect();
  }, [handleIntersection, observerOptions]);

  // Observe song elements
  useEffect(() => {
    const songElements = document.querySelectorAll('.song-item');
    if (observerRef.current) {
      songElements.forEach(element => observerRef.current.observe(element));
    }
    return () => observerRef.current?.disconnect();
  }, [currentSongs]);

  // Data fetching
  const fetchData = useCallback(async () => {
    try {
      const now = Date.now();
      if (cachedData.lastFetch && (now - cachedData.lastFetch < CACHE_DURATION)) {
        setSongsData(cachedData.songs || []);
        setMovieAlbums(cachedData.movieAlbums || []);
        setArtists(cachedData.artists || []);
        setTrendingSongs(cachedData.trendingSongs || []);
        setLoading(false);
        return;
      }

      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
      
      const [movieRes, songsRes, artistsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/moviealbum/list`),
        axios.get(`${backendUrl}/api/song/list?all=true`),
        axios.get(`${backendUrl}/api/artist/list`)
      ]);

      if (movieRes.data.success) {
        setMovieAlbums(movieRes.data.movieAlbums);
        cachedData.movieAlbums = movieRes.data.movieAlbums;
      }

      if (songsRes.data.success) {
        setSongsData(songsRes.data.songs);
        cachedData.songs = songsRes.data.songs;
        
        const sorted = [...songsRes.data.songs]
          .sort(() => Math.random() - 0.5)
          .slice(0, 10);
        setTrendingSongs(sorted);
        cachedData.trendingSongs = sorted;
      }

      if (artistsRes.data.success) {
        setArtists(artistsRes.data.artists);
        cachedData.artists = artistsRes.data.artists;
      }
      
      setMainColor(THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)]);
      cachedData.lastFetch = now;
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [setSongsData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Scroll handlers
  const scrollToTop = useCallback(() => {
    const scrollOptions = { top: 0, left: 0, behavior: 'smooth' };
    document.documentElement.scrollTo(scrollOptions);
    window.scrollTo(scrollOptions);
    topRef.current?.scrollIntoView(scrollOptions);
  }, []);

  useEffect(() => {
    scrollToTop();
    return () => window.scrollTo(0, 0);
  }, [scrollToTop]);

  const paginate = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
    scrollToTop();
  }, [scrollToTop]);

  // Memoized handlers
  const isFavorite = useCallback((songId) => {
    return favorites?.some(fav => fav._id === songId);
  }, [favorites]);

  const handleToggleFavorite = useCallback((e, songId) => {
    e.stopPropagation();
    toggleFavorite?.(songId);
  }, [toggleFavorite]);

  const handleAddToPlaylist = useCallback((e, songId) => {
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
  }, [user]);

  const handleAddToQueue = useCallback((e, songId) => {
    e.stopPropagation();
    addToQueue(songId);
  }, [addToQueue]);

  const handleArtistClick = useCallback((artistId) => {
    navigate(`/artist/${artistId}`);
  }, [navigate]);

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

  const isPlaying = (songId) => {
    return track && track._id === songId && playStatus;
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
            
            {/* Songs Display */}
              {currentSongs && currentSongs.length > 0 ? (
              <>
                {/* Grid View (for small screens) */}
                {viewMode === 'grid' && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                  >
                  {currentSongs.map((song) => (
                    <div 
                      key={song._id} 
                      onClick={() => playWithId(song._id)}
                        className="relative rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 hover:bg-white/10 shadow-lg hover:shadow-xl bg-black"
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
                                   background: mainColor ? 
                                     `linear-gradient(135deg, ${getBackgroundColor(mainColor, 0.3)}, ${getBackgroundColor(mainColor, 0.2)})` : 
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
                    className="backdrop-blur-md rounded-xl p-6 border border-white/5 bg-black"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentSongs.map((song, index) => (
                        <div 
                          key={song._id} 
                          className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition-all cursor-pointer group bg-black"
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
            </motion.div>
        </div>
        
        {/* Footer */}
        <Footer />
        
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

// Memoize the entire component
export default React.memo(DisplayHome);
