import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaFire, FaRegClock, FaUser, FaVideo, FaMusic, FaChartBar, FaThLarge, FaHeart, FaStar, FaPodcast, FaPlus, FaListUl, FaBars, FaTimes, FaHome } from 'react-icons/fa';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const url = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (user && token) {
      setLoadingPlaylists(true);
      axios.get(`${url}/api/playlist/my`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => {
        setPlaylists(res.data.playlists || []);
        setLoadingPlaylists(false);
      }).catch(() => setLoadingPlaylists(false));
    }
  }, [user, token]);

  // Sidebar classes for mobile/desktop
  const sidebarClass = `fixed top-0 left-0 h-screen w-64 bg-black text-white flex flex-col shadow-lg z-40 transition-transform duration-300
    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0 md:static md:h-screen`;

  return (
    <>
      {/* Sidebar */}
      <aside className={sidebarClass}>
        {/* Close button for mobile */}
        <button
          className="md:hidden absolute top-4 right-4 z-50 bg-black/80 p-2 rounded-full border border-neutral-800"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
        >
          <FaTimes size={22} />
        </button>
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-neutral-800">
          <span className="text-3xl font-bold">S</span>
          <span className="text-2xl font-bold">Sound Link</span>
        </div>
        {/* Menu */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="mb-4">
            <div className="text-xs text-neutral-400 mb-2">Music</div>
            
            <SidebarItem 
              icon={<FaHome />} 
              label="Home" 
              active={location.pathname === '/'} 
              onClick={() => navigate('/')} 
              highlight={true}
            />
            <SidebarItem 
              icon={<FaFire />} 
              label="Trending" 
              active={location.pathname === '/trending'} 
              onClick={() => navigate('/trending')} 
            />
            <SidebarItem 
              icon={<FaUser />} 
              label="Artists" 
              active={location.pathname === '/artists'} 
              onClick={() => navigate('/artists')}
            />
            <SidebarItem icon={<FaMusic />} label="Playlists" onClick={() => {
              if (playlists.length > 0) {
                navigate(`/playlist/${playlists[0]._id}`);
              } else {
                navigate('/playlist');
              }
            }} />
          </div>
          {/* Playlists Section */}
          {user && (
            <div className="mb-4">
              <div className="text-xs text-neutral-400 mb-2 flex items-center gap-2"><FaListUl /> Playlists</div>
              {loadingPlaylists ? (
                <div className="text-neutral-400 text-sm">Loading...</div>
              ) : (
                playlists.length === 0 ? (
                  <div className="text-neutral-600 text-xs">No playlists yet</div>
                ) : (
                  playlists.map(pl => (
                    <Link
                      key={pl._id}
                      to={`/playlist/${pl._id}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg mb-1 cursor-pointer text-neutral-200 hover:bg-neutral-800"
                    >
                      <FaMusic className="text-fuchsia-400" />
                      <span className="truncate">{pl.name}</span>
                    </Link>
                  ))
                )
              )}
            </div>
          )}
          <div className="mb-4">
            <div className="text-xs text-neutral-400 mb-2">Library</div>
            <SidebarItem 
              icon={<FaHeart />} 
              label="Favorites" 
              active={location.pathname === '/favorites'} 
              onClick={() => navigate('/favorites')} 
            />
          </div>
        </nav>
      </aside>
    </>
  );
}

function SidebarItem({ icon, label, active, highlight, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 cursor-pointer
      ${active ? 'bg-cyan-900 text-cyan-400 font-bold' : ''}
      ${highlight ? 'text-cyan-400' : 'text-neutral-200 hover:bg-neutral-800'}
    `}>
      <span className="text-lg">{icon}</span>
      <span className="text-base">{label}</span>
    </div>
  );
}

export default Sidebar;