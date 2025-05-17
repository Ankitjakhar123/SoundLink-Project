import React, { useContext, useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import PremiumPlayer from "./components/PremiumPlayer";
import BottomNavigation from "./components/BottomNavigation";
import { PlayerContext } from "./context/PlayerContext";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import DisplayHome from "./components/DisplayHome";
import DisplayAlbum from "./components/DisplayAlbum";
import { AuthContext } from "./context/AuthContext";
import AuthPage from "./components/AuthPage";
import AdminDashboard from "./components/AdminDashboard";
import Navbar from "./components/Navbar";
import PlaylistView from "./components/PlaylistView";
import PlaylistsPage from "./components/PlaylistsPage";
import Profile from "./components/Profile";
import EditAlbum from "./components/EditAlbum";
import EditSong from "./components/EditSong";
import ListAlbum from "./components/ListAlbum";
import ListSong from "./components/ListSong";
import AdminArtists from "./components/AdminArtists";
import ArtistDetail from "./components/ArtistDetail";
import MovieAlbumDetail from "./components/MovieAlbumDetail";
import Favorites from "./components/Favorites";
import Artists from "./components/Artists";
import TrendingSongs from "./components/TrendingSongs";
import Settings from "./components/Settings";
import Premium from "./components/Premium";
import About from "./components/About";
import Terms from "./components/Terms";
import Privacy from "./components/Privacy";
import Contact from "./components/Contact";
import DisclaimerPopup from "./components/DisclaimerPopup";
import SearchPage from "./components/SearchPage";
import Library from "./components/Library";
import InstallPwaPrompt from "./components/InstallPwaPrompt";
import InstallPWAButton from "./components/InstallPWAButton";

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
  const { audioRef, track, songsData, play, pause, playStatus, Next, Previous } = useContext(PlayerContext);
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Setup Media Session API for lock screen controls
  useEffect(() => {
    if ('mediaSession' in navigator && track) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.name,
        artist: track.singer || 
               track.artist || 
               track.artistName || 
               (track.metadata && track.metadata.artist) || 
               (track.meta && track.meta.artist) ||
               (track.tags && track.tags.artist) ||
               (track.createdBy && track.createdBy.name) ||
               'Unknown Artist',
        album: track.albumName || 
               track.album || 
               (track.metadata && track.metadata.album) || 
               (track.meta && track.meta.album) ||
               (track.tags && track.tags.album) ||
               'Unknown Album',
        artwork: [
          { src: track.image || '/icons/soundlink-icon.svg?v=2', sizes: '512x512', type: 'image/png' }
        ]
      });
      
      // Define media session actions
      navigator.mediaSession.setActionHandler('play', () => {
        play();
      });
      
      navigator.mediaSession.setActionHandler('pause', () => {
        pause();
      });
      
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        Previous();
      });
      
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        Next();
      });
      
      // Update playback state
      navigator.mediaSession.playbackState = playStatus ? 'playing' : 'paused';
    }
  }, [track, playStatus, play, pause, Next, Previous]);

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
      
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-amber-600 text-black z-50 py-1 px-4 text-center text-sm font-medium">
          You're offline. Some features may be limited.
        </div>
      )}
      
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className={`flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300 w-full content-container bg-black touch-scroll no-scrollbar ${mobileOpen ? 'opacity-30 pointer-events-none select-none' : ''} md:opacity-100 md:pointer-events-auto md:select-auto`}>
        <Navbar onHamburgerClick={() => setMobileOpen(true)} />
        <div id="main-content" tabIndex="-1" className="flex-1 pb-10 pt-16 md:pt-15">
          <Routes>
            {/* Auth page route */}
            <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage />} />
            
            {/* Public routes - no login required */}
            <Route path="/" element={songsData.length !== 0 ? <DisplayHome /> : <div className="text-white p-4">Loading songs...</div>} />
            <Route path="/album/:id" element={<DisplayAlbum />} />
            <Route path="/movie/:id" element={<MovieAlbumDetail onEnterFullscreen={lockOrientation} />} />
            <Route path="/artist/:id" element={<ArtistDetail />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/trending" element={<TrendingSongs />} />
            {/* Redirect search to home since we're using popup search only */}
            <Route path="/search" element={<Navigate to="/" />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Protected routes - login required */}
            <Route path="/playlists" element={<ProtectedRoute><PlaylistsPage /></ProtectedRoute>} />
            <Route path="/playlist/:id" element={<ProtectedRoute><PlaylistView /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
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
        </div>
        {track && <div className="content-fade"></div>}
        <PremiumPlayer />
        {track ? (
          <audio ref={audioRef} preload="auto">
            <source src={track.file} type="audio/mp3" />
          </audio>
        ) : (
          <div className="text-white p-4">Please select a track to play.</div>
        )}
      </div>
      {/* Add bottom navigation for mobile screens */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
};

export default App;
