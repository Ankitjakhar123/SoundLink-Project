import React, { useContext, useState } from "react";
import Sidebar from "./components/Sidebar";
import PremiumPlayer from "./components/PremiumPlayer";
import { PlayerContext } from "./context/PlayerContext";
import { Routes, Route, useLocation } from "react-router-dom";
import DisplayHome from "./components/DisplayHome";
import DisplayAlbum from "./components/DisplayAlbum";
import { AuthContext } from "./context/AuthContext";
import AuthPage from "./components/AuthPage";
import AdminDashboard from "./components/AdminDashboard";
import Navbar from "./components/Navbar";
import PlaylistView from "./components/PlaylistView";
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

const App = () => {
  const { audioRef, track, songsData } = useContext(PlayerContext);
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) {
    return <AuthPage />;
  }

  // If on /admin, render AdminDashboard as a full page (no sidebar, no player)
  if (location.pathname === "/admin") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-start">
        <AdminDashboard token={localStorage.getItem('token')} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className={`flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300 w-full ${mobileOpen ? 'opacity-30 pointer-events-none select-none' : ''} md:opacity-100 md:pointer-events-auto md:select-auto`}>
        <Navbar onHamburgerClick={() => setMobileOpen(true)} />
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={songsData.length !== 0 ? <DisplayHome /> : <div className="text-white p-4">Loading songs...</div>} />
            <Route path="/album/:id" element={<DisplayAlbum />} />
            <Route path="/playlist/:id" element={<PlaylistView />} />
            <Route path="/movie/:id" element={<MovieAlbumDetail />} />
            <Route path="/artist/:id" element={<ArtistDetail />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/trending" element={<TrendingSongs />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<AdminDashboard token={localStorage.getItem('token')} />} />
            <Route path="/admin/albums" element={<ListAlbum />} />
            <Route path="/admin/songs" element={<ListSong />} />
            <Route path="/admin/artists" element={<AdminArtists />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
        <PremiumPlayer />
        {track ? (
          <audio ref={audioRef} preload="auto">
            <source src={track.file} type="audio/mp3" />
          </audio>
        ) : (
          <div className="text-white p-4">Please select a track to play.</div>
        )}
      </div>
    </div>
  );
};

export default App;
