import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PlayerContext } from '../context/PlayerContext';
import { AiFillHome, AiFillDatabase } from 'react-icons/ai';
import { MdQueueMusic, MdMoreHoriz } from 'react-icons/md';
import { IoMusicalNotesSharp } from 'react-icons/io5';

const BottomNavigation = () => {
  const { themeColors, setShowExtraControls, hidePlayer, track } = useContext(PlayerContext);
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const handlePlayerClick = () => {
    setShowExtraControls(true);
  };
  
  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 h-[50px] flex items-center justify-between px-6 py-1 z-50 border-t backdrop-blur-xl transition-all duration-300 ${hidePlayer && track ? 'bg-gradient-to-r from-[#121212] to-[#1a1a1a]' : 'bg-[#121212]'}`}
      style={{ 
        backgroundColor: hidePlayer && track ? 'transparent' : '#121212',
        borderColor: 'rgba(255,255,255,0.1)',
        background: hidePlayer && track ? `linear-gradient(180deg, ${themeColors.secondary}cc, ${themeColors.secondary}dd)` : undefined,
      }}
    >
      {/* Home Button */}
      <Link to="/" className="flex flex-col items-center">
        <AiFillHome className={`w-5 h-5 ${isActive('/') ? 'text-[#a855f7]' : 'text-white'}`} />
        <span className="text-xs text-white">Home</span>
      </Link>
      
      {/* Library Button */}
      <Link to="/library" className="flex flex-col items-center">
        <AiFillDatabase className={`w-5 h-5 ${isActive('/library') ? 'text-[#a855f7]' : 'text-white'}`} />
        <span className="text-xs text-white">Library</span>
      </Link>
      
      {/* Player Button */}
      <button 
        onClick={handlePlayerClick}
        className="flex flex-col items-center"
      >
        <IoMusicalNotesSharp className="w-5 h-5 text-[#a855f7]" />
        <span className="text-xs text-white">Player</span>
      </button>
      
      {/* Queue Button */}
      <Link to="/queue" className="flex flex-col items-center">
        <MdQueueMusic className={`w-5 h-5 ${isActive('/queue') ? 'text-[#a855f7]' : 'text-white'}`} />
        <span className="text-xs text-white">Queue</span>
      </Link>
      
      {/* More Button */}
      <Link to="/more" className="flex flex-col items-center">
        <MdMoreHoriz className={`w-5 h-5 ${isActive('/more') ? 'text-[#a855f7]' : 'text-white'}`} />
        <span className="text-xs text-white">More</span>
      </Link>
    </div>
  );
};

export default BottomNavigation; 