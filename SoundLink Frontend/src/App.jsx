import React, { useContext, useState, useEffect, useRef } from "react";
import Sidebar from "./components/Layout/Sidebar";
import PremiumPlayer from "./components/Player/PremiumPlayer";
import YouTubePremiumPlayer from "./components/Player/YouTubePremiumPlayer";
import BottomNavigation from "./components/Layout/BottomNavigation";
import { PlayerContext } from "./context/PlayerContext";
import { RadioContext } from "./context/RadioContext";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import DisplayHome from "./components/Pages/DisplayHome";
import DisplayAlbum from "./components/Pages/DisplayAlbum";
import { AuthContext } from "./context/AuthContext";
import AuthPage from "./components/Pages/AuthPage";
import AdminDashboard from "./components/Admin/Dashboard/AdminDashboard.jsx";
import SearchAdmin from "./components/Admin/Dashboard/SearchAdmin.jsx";
import FavoritesAdmin from "./components/Admin/Dashboard/FavoritesAdmin";
import CommentsAdmin from "./components/Admin/Dashboard/CommentsAdmin";
import AdminArtists from "./components/Admin/Artists/AdminArtists";
import ListAlbum from "./components/Admin/Albums/ListAlbum";
import AddAlbum from "./components/Admin/Albums/AddAlbum";
import ListMovieAlbum from "./components/Admin/Albums/ListMovieAlbum";
import AddMovieAlbum from "./components/Admin/Albums/AddMovieAlbum";
import ListSong from "./components/Admin/Songs/ListSong";
import AddSong from "./components/Admin/Songs/AddSong";
import BulkUpload from "./components/Admin/Songs/BulkUpload";
import BulkSongUpload from "./components/Admin/Songs/BulkSongUpload";
import Navbar from "./components/Layout/Navbar";
import PlaylistView from "./components/PlaylistView";
import PlaylistsPage from "./components/Pages/PlaylistsPage";
import Profile from "./components/Pages/Profile";
import EditAlbum from "./components/EditAlbum";
import EditSong from "./components/EditSong";
import ArtistDetail from "./components/Pages/ArtistDetail";
import MovieAlbumDetail from "./components/Pages/MovieAlbumDetail";
import Favorites from "./components/Favorites";
import Artists from "./components/Pages/Artists";
import TrendingSongs from "./components/Pages/TrendingSongs";
import Settings from "./components/Pages/Settings";
import Premium from "./components/Pages/Premium";
import About from "./components/Pages/About";
import Terms from "./components/Pages/Terms";
import Privacy from "./components/Pages/Privacy";
import Contact from "./components/Pages/Contact";
import DisclaimerPopup from "./components/DisclaimerPopup";
import SearchPage from "./components/Pages/SearchPage";
import Library from "./components/Pages/Library";
import InstallPwaPrompt from "./components/InstallPwaPrompt";
import InstallPWAButton from "./components/InstallPWAButton";
import PremiumLoading from './components/PremiumLoading';
import RadioStation from './components/RadioStation';
import PremiumRadioPlayer from './components/Player/PremiumRadioPlayer';
import SongDetail from './components/SongDetail';
import ResetPasswordForm from "./components/ResetPasswordForm";

// Protected route component that requires authentication
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  if (!user) {
    // Redirect to auth page if not logged in
    return <Navigate to="/auth" />;
  }
  
  return children;
};

const App = () => {
  const { 
    audioRef, 
    track, 
    play, 
    pause, 
    playStatus, 
    Next, 
    Previous,
    getArtistName,
    getAlbumName,
    useYouTubePlayer,
    currentYouTubeVideo,
    setUseYouTubePlayer
  } = useContext(PlayerContext);
  const radioContext = useContext(RadioContext);
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [retryCount, setRetryCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const MAX_RETRIES = 3;
  const INITIAL_DELAY = 1000;
  const RETRY_DELAY = 1000;
  const contentContainerRef = useRef(null);

  // Scroll to top on route change
  useEffect(() => {
    if (contentContainerRef.current) {
      contentContainerRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  // Setup Media Session API for lock screen controls
  useEffect(() => {
    if ('mediaSession' in navigator) {
      // Determine current media source (Radio, YouTube, or regular track)
      let currentTrack;
      
      if (radioContext?.isPlaying && radioContext?.currentStation) {
        currentTrack = {
          name: radioContext.currentStation.name,
          singer: radioContext.currentStation.language || 'Live Radio',
          albumName: 'Radio Station',
          image: '/live-radio-artwork.svg',
          isRadio: true
        };
      } else if (useYouTubePlayer && currentYouTubeVideo) {
        currentTrack = {
          name: currentYouTubeVideo.title,
          singer: currentYouTubeVideo.channelTitle,
          albumName: 'YouTube',
          image: currentYouTubeVideo.thumbnail,
          isYouTube: true
        };
      } else if (track) {
        currentTrack = track;
      }

      if (currentTrack) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.name,
          artist: currentTrack.isRadio ? 
                 (currentTrack.singer || 'Live Radio') : 
                 currentTrack.isYouTube ?
                 currentTrack.singer :
                 (getArtistName(currentTrack) || 'Unknown Artist'),
          album: currentTrack.isRadio ? 
                 'Radio Station' : 
                 currentTrack.isYouTube ?
                 'YouTube' :
                 (getAlbumName(currentTrack) || 'Unknown Album'),
          artwork: [
            { src: currentTrack.image || '/icons/soundlink-icon.svg?v=2', sizes: '512x512', type: currentTrack.isRadio ? 'image/svg+xml' : 'image/png' }
          ]
        });
        
        // Define media session actions
        navigator.mediaSession.setActionHandler('play', () => {
          if (currentTrack.isRadio) {
            radioContext?.playStation(radioContext.currentStation);
          } else {
            play();
          }
        });
        
        navigator.mediaSession.setActionHandler('pause', () => {
          if (currentTrack.isRadio) {
            radioContext?.stopStation();
          } else {
            pause();
          }
        });

        // Add seek functionality for non-radio content
        if (!currentTrack.isRadio && audioRef.current) {
          navigator.mediaSession.setActionHandler('seekto', (details) => {
            if (details.seekTime !== undefined) {
              audioRef.current.currentTime = details.seekTime;
            }
          });

          navigator.mediaSession.setActionHandler('seekforward', (details) => {
            const seekTime = details.seekTime || 10; // Default 10 seconds
            audioRef.current.currentTime = Math.min(
              audioRef.current.duration,
              audioRef.current.currentTime + seekTime
            );
          });

          navigator.mediaSession.setActionHandler('seekbackward', (details) => {
            const seekTime = details.seekTime || 10; // Default 10 seconds
            audioRef.current.currentTime = Math.max(
              0,
              audioRef.current.currentTime - seekTime
            );
          });
        }
        
        // Only set up track navigation for non-radio content
        if (!currentTrack.isRadio) {
          navigator.mediaSession.setActionHandler('previoustrack', () => {
            Previous();
          });
          
          navigator.mediaSession.setActionHandler('nexttrack', () => {
            Next();
          });
        }
        
        // Update playback state
        const isPlaying = currentTrack.isRadio ? radioContext?.isPlaying : playStatus;
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

        // Update position state for non-radio content
        if (!currentTrack.isRadio && audioRef.current) {
          const updatePositionState = () => {
            if (audioRef.current && audioRef.current.duration) {
              navigator.mediaSession.setPositionState({
                duration: audioRef.current.duration,
                playbackRate: audioRef.current.playbackRate,
                position: audioRef.current.currentTime
              });
            }
          };

          // Update position state periodically
          const positionInterval = setInterval(updatePositionState, 1000);
          return () => clearInterval(positionInterval);
        }
      }
    }
  }, [track, playStatus, play, pause, Next, Previous, radioContext?.currentStation, radioContext?.isPlaying, radioContext?.playStation, radioContext?.stopStation, useYouTubePlayer, currentYouTubeVideo]);

  // Screen orientation lock for landscape mode on video playback
  const lockOrientation = () => {
    try {
      if (document.documentElement.requestFullscreen && screen.orientation && screen.orientation.lock) {
        document.documentElement.requestFullscreen();
        screen.orientation.lock('landscape');
      }
    } catch (err) {
      console.error('Orientation lock failed:', err);
    }
  };

  // Add this useEffect to check backend status with retries
  useEffect(() => {
    let timeoutId;

    const checkBackendStatus = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
        const response = await fetch(`${backendUrl}/api/health`);
        if (response.ok) {
          setBackendStatus('ready');
          setRetryCount(0); // Reset retry count on success
          setIsInitialLoad(false); // Mark initial load as complete
        } else {
          throw new Error('Backend health check failed');
        }
      } catch (error) {
        console.error('Backend health check failed:', error);
        if (retryCount < MAX_RETRIES) {
          // Retry after delay
          timeoutId = setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, retryCount === 0 ? INITIAL_DELAY : RETRY_DELAY);
        } else {
          setBackendStatus('error');
          setIsInitialLoad(false); // Mark initial load as complete even on error
        }
      }
    };

    // Initial delay before first check
    if (retryCount === 0) {
      timeoutId = setTimeout(checkBackendStatus, INITIAL_DELAY);
    } else {
      checkBackendStatus();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [retryCount]); // Retry when retryCount changes

  // If on /admin, render AdminDashboard as a full page (no sidebar, no player)
  if (location.pathname === "/admin") {
    // Admin routes should require login
    if (!user) {
      return <AuthPage />;
    }
    
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-start">
        <AdminDashboard token={localStorage.getItem('token')} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black">
      <DisclaimerPopup />
      <InstallPwaPrompt />
      <InstallPWAButton />
      
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div ref={contentContainerRef} className={`flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300 w-full content-container bg-black touch-scroll no-scrollbar ${mobileOpen ? 'opacity-30 pointer-events-none select-none' : ''} md:opacity-100 md:pointer-events-auto md:select-auto`}>
        <Navbar onHamburgerClick={() => setMobileOpen(true)} />
        <div id="main-content" tabIndex="-1" className="flex-1 pt-[calc(56px+env(safe-area-inset-top))] md:pt-[calc(56px+env(safe-area-inset-top))]">
          {backendStatus === 'checking' && isInitialLoad ? (
            <PremiumLoading />
          ) : (
            <Routes>
              {/* Auth page route */}
              <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage />} />
              
              {/* Public routes - no login required */}
              <Route path="/" element={<DisplayHome />} />
              <Route path="/album/:id" element={<DisplayAlbum />} />
              <Route path="/movie/:id" element={<MovieAlbumDetail onEnterFullscreen={lockOrientation} />} />
              <Route path="/artist/:id" element={<ArtistDetail />} />
              <Route path="/song/:id/info" element={<SongDetail />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/trending" element={<TrendingSongs />} />
              <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
              {/* Redirect search to home since we're using popup search only */}
              <Route path="/search" element={<Navigate to="/" />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/radio" element={<RadioStation />} />
              
              {/* Protected routes - login required */}
              <Route path="/playlists" element={<ProtectedRoute><PlaylistsPage /></ProtectedRoute>} />
              <Route path="/playlist/:id" element={<ProtectedRoute><PlaylistView /></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
              <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings useYouTubePlayer={useYouTubePlayer} setUseYouTubePlayer={setUseYouTubePlayer} /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              
              {/* Admin routes - login required */}
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard token={localStorage.getItem('token')} /></ProtectedRoute>} />
              <Route path="/admin/albums" element={<ProtectedRoute><ListAlbum /></ProtectedRoute>} />
              <Route path="/admin/songs" element={<ProtectedRoute><ListSong /></ProtectedRoute>} />
              <Route path="/admin/artists" element={<ProtectedRoute><AdminArtists /></ProtectedRoute>} />
              
              {/* Login and Signup routes - redirect to AuthPage */}
              <Route path="/login" element={<AuthPage />} />
              <Route path="/signup" element={<AuthPage />} />
            </Routes>
          )}
        </div>
        {track && <div className="content-fade"></div>}
        {useYouTubePlayer && <div className="content-fade youtube-content-fade"></div>}
        {/* Only one player at a time: radio or premium */}
        {useYouTubePlayer ? (
          <YouTubePremiumPlayer useYouTubePlayer={useYouTubePlayer} currentYouTubeVideo={currentYouTubeVideo} />
        ) : radioContext?.isPlaying ? (
          <PremiumRadioPlayer />
        ) : track ? (
          <PremiumPlayer />
        ) : null}
        {track && !radioContext?.currentStation ? (
          <audio ref={audioRef} preload="auto">
            <source src={track.file} type="audio/mp3" />
          </audio>
        ) : null}
      </div>
      {/* Add bottom navigation for mobile screens */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
};

export default App;
