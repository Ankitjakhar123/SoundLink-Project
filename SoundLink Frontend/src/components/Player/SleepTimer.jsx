import React, { useState, useRef, useEffect } from 'react';
import { FaMoon } from 'react-icons/fa';

const SleepTimer = ({ sleepTimer, setSleepTimer, themeColors }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="text-base transition mr-3"
        style={{ color: sleepTimer ? themeColors.primary : `${themeColors.text}99` }}
        title="Sleep Timer"
      >
        <FaMoon size={18} />
      </button>
      
      {showMenu && (
        <div className="absolute bottom-full right-0 mb-2 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 p-2 min-w-[150px]">
          <div className="text-xs text-neutral-400 mb-2 px-2">Sleep Timer</div>
          {[15, 30, 45, 60, 90].map((minutes) => (
            <button
              key={minutes}
              onClick={() => {
                setSleepTimer(minutes);
                setShowMenu(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-neutral-700 transition-colors ${
                sleepTimer === minutes ? 'text-fuchsia-400' : 'text-white'
              }`}
            >
              {minutes} minutes
            </button>
          ))}
          {sleepTimer && (
            <button
              onClick={() => {
                setSleepTimer(0);
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-2 text-sm rounded hover:bg-neutral-700 transition-colors text-red-400 mt-1 border-t border-neutral-700"
            >
              Cancel Timer
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SleepTimer; 