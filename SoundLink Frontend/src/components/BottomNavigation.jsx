import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PlayerContext } from '../context/PlayerContext';
import { AiFillHome, AiFillDatabase } from 'react-icons/ai';
import { MdQueueMusic, MdMoreHoriz } from 'react-icons/md';
import { IoMusicalNotesSharp } from 'react-icons/io5';

const BottomNavigation = () => {
  const { themeColors, setShowExtraControls } = useContext(PlayerContext);
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const handlePlayerClick = () => {
    setShowExtraControls(true);
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 h-[50px] flex items-center justify-between px-6 py-1 z-50 border-t"
      style={{ 
        backgroundColor: '#121212',
        borderColor: 'rgba(255,255,255,0.1)'
      }}
    >
      {/* Home Button */}
      <Link to="/" className="flex flex-col items-center justify-center">
        <AiFillHome 
          size={22} 
          color={isActive('/') ? themeColors.primary : '#aaa'} 
        />
        <span className="text-[10px] mt-0.5" style={{ color: isActive('/') ? themeColors.primary : '#aaa' }}>
          Home
        </span>
      </Link>
      
      {/* Library Button */}
      <Link to="/library" className="flex flex-col items-center justify-center">
        <AiFillDatabase 
          size={22} 
          color={isActive('/library') ? themeColors.primary : '#aaa'} 
        />
        <span className="text-[10px] mt-0.5" style={{ color: isActive('/library') ? themeColors.primary : '#aaa' }}>
          Library
        </span>
      </Link>
      
      {/* Player Button */}
      <button 
        onClick={handlePlayerClick}
        className="flex flex-col items-center justify-center"
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: themeColors.primary }}
        >
          <IoMusicalNotesSharp size={16} color="#fff" />
        </div>
        <span className="text-[10px] mt-0.5" style={{ color: '#aaa' }}>
          Player
        </span>
      </button>
      
      {/* Queue Button */}
      <Link to="/queue" className="flex flex-col items-center justify-center">
        <MdQueueMusic 
          size={22} 
          color={isActive('/queue') ? themeColors.primary : '#aaa'} 
        />
        <span className="text-[10px] mt-0.5" style={{ color: isActive('/queue') ? themeColors.primary : '#aaa' }}>
          Queue
        </span>
      </Link>
      
      {/* More Button */}
      <Link to="/more" className="flex flex-col items-center justify-center">
        <MdMoreHoriz 
          size={22} 
          color={isActive('/more') ? themeColors.primary : '#aaa'} 
        />
        <span className="text-[10px] mt-0.5" style={{ color: isActive('/more') ? themeColors.primary : '#aaa' }}>
          More
        </span>
      </Link>
    </div>
  );
};

export default BottomNavigation; 