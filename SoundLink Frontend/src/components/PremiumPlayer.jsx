import React, { useContext, useState, useEffect, useRef } from "react";
import { PlayerContext } from "../context/PlayerContext";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp, FaVolumeMute, FaHeart } from "react-icons/fa";
import { MdQueueMusic, MdDevices, MdShuffle, MdRepeat, MdOutlineLyrics, MdMoreVert } from "react-icons/md";
import QueueComponent from "./QueueComponent";
import LyricsPanel from "./LyricsPanel";
import ArtistExplorer from "./ArtistExplorer";
import CreditsSection from "./CreditsSection";
import MoreOptionsSheet from "./MoreOptionsSheet";

const formatTime = (min, sec) => `${min}:${sec < 10 ? "0" : ""}${sec}`;

// Premium Player Lyrics Component
const PremiumPlayerLyrics = ({ track, currentTime, themeColors, isVisible }) => {
  const [parsedLyrics, setParsedLyrics] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const lyricsContainerRef = useRef(null);
  
  // Parse lyrics with timestamps
  useEffect(() => {
    if (!track || !track.lyrics) {
      setParsedLyrics([]);
      setCurrentLineIndex(0);
      return;
    }
    
    const lines = track.lyrics.split('\n');
    
    // Filter out LRC metadata headers
    const filteredLines = lines.filter(line => {
      // Skip LRC metadata headers like [id:], [ar:], [al:], [ti:], [length:], etc.
      const isMetadataHeader = /^\[(id|ar|al|ti|length|by|offset|re|ve):/i.test(line);
      return !isMetadataHeader;
    });
    
    const hasTimestamps = filteredLines.some(line => /^\[\d{2}:\d{2}\.\d{2}\]/.test(line));
    
    if (hasTimestamps) {
      // Parse lyrics with timestamps [mm:ss.xx]
      const formattedLyrics = filteredLines.map((line, index) => {
        const timeMatch = line.match(/^\[(\d{2}):(\d{2})\.(\d{2})\](.*)/);
        if (timeMatch) {
          const minutes = parseInt(timeMatch[1], 10);
          const seconds = parseInt(timeMatch[2], 10);
          const hundredths = parseInt(timeMatch[3], 10);
          const timeInSeconds = minutes * 60 + seconds + hundredths / 100;
          const text = timeMatch[4].trim();
          return { timeInSeconds, text, index };
        }
        // For section headers without timestamps
        const sectionMatch = line.match(/^\[(.*?)\]/);
        if (sectionMatch) {
          return { timeInSeconds: -1, text: line, isSectionHeader: true, index };
        }
        // For lines without timestamps
        return { timeInSeconds: -1, text: line, index };
      });
      
      setParsedLyrics(formattedLyrics);
    } else {
      // For lyrics without timestamps, just show them normally
      const formattedLyrics = filteredLines.map((line, index) => {
        const isSectionHeader = /^\[(.*?)\]/.test(line);
        return { 
          timeInSeconds: -1,
          text: line, 
          isSectionHeader, 
          index 
        };
      });
      setParsedLyrics(formattedLyrics);
    }
  }, [track]);
  
  // Update current line based on current playback time
  useEffect(() => {
    if (!parsedLyrics.length || !isVisible) return;
    
    const currentTimeInSeconds = currentTime.minute * 60 + currentTime.second;
    
    // Find the correct line based on current time
    const timedLyrics = parsedLyrics.filter(line => line.timeInSeconds >= 0);
    if (timedLyrics.length) {
      // Find the last line whose timestamp is less than or equal to current time
      for (let i = timedLyrics.length - 1; i >= 0; i--) {
        if (timedLyrics[i].timeInSeconds <= currentTimeInSeconds) {
          setCurrentLineIndex(timedLyrics[i].index);
          break;
        }
      }
    }
  }, [currentTime, parsedLyrics, isVisible]);
  
  // Scroll to the active line with smooth animation
  useEffect(() => {
    if (lyricsContainerRef.current && isVisible) {
      const container = lyricsContainerRef.current;
      const activeLine = container.querySelector(`.line-${currentLineIndex}`);
      
      if (activeLine) {
        activeLine.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [currentLineIndex, isVisible]);
  
  if (!isVisible || !track || !track.lyrics) return null;
  
  // Display a small section of lyrics with focus on the current line
  const visibleLyricsStart = Math.max(0, currentLineIndex - 2);
  const visibleLyricsEnd = Math.min(parsedLyrics.length, currentLineIndex + 3);
  const visibleLyrics = parsedLyrics.slice(visibleLyricsStart, visibleLyricsEnd);
  
  return (
    <motion.div 
      className="w-full h-full flex items-center justify-center py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className="max-w-xl w-full mx-auto overflow-hidden text-center relative h-20"
        ref={lyricsContainerRef}
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)'
        }}
      >
        <div className="flex flex-col items-center space-y-4 py-10">
          {visibleLyrics.length > 0 ? (
            visibleLyrics.map((line) => {
              const isActive = line.index === currentLineIndex;
              
              return (
                <motion.p 
                  key={line.index} 
                  className={`transition-all duration-200 w-full line-${line.index} px-4`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ 
                    y: 0, 
                    opacity: isActive ? 1 : 0.7,
                    scale: isActive ? 1.05 : 1,
                    filter: isActive ? 'none' : 'blur(0.5px)'
                  }}
                  transition={{ 
                    duration: 0.4, 
                    ease: "easeOut",
                    delay: isActive ? 0 : 0.1
                  }}
                  style={{ 
                    color: isActive ? themeColors.primary : `${themeColors.text}cc`,
                    fontWeight: isActive ? '700' : '400',
                    fontSize: isActive ? '1.1rem' : '0.9rem',
                    textShadow: isActive ? `0 0 10px ${themeColors.primary}40` : 'none',
                    letterSpacing: isActive ? '0.02em' : 'normal'
                  }}
                >
                  {line.text || " "} {/* Empty lines render as space */}
                </motion.p>
              );
            })
          ) : (
            <p className="text-sm opacity-70" style={{ color: themeColors.text }}>
              No synced lyrics available
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const PremiumPlayer = () => {
  const {
    track,
    playStatus,
    play,
    pause,
    Next,
    Previous,
    shuffle,
    loop,
    toggleLoop,
    audioRef,
    time,
    toggleFavorite,
    isFavorite,
    // eslint-disable-next-line no-unused-vars
    setAutoplayEnabled,
    hidePlayer,
    buffering,
    loadingProgress,
    setBufferingStrategy,
    bufferingStrategy,
    themeColors,
    songsData,
    getArtistName,
    getAlbumName,
  } = useContext(PlayerContext);
  
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffleActive, setShuffleActive] = useState(false);
  const [showExtraControls, setShowExtraControls] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showBufferingMenu, setShowBufferingMenu] = useState(false);
  const [showInlineLyrics, setShowInlineLyrics] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  
  const playerRef = useRef(null);
  const progressBarRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const volumeControlRef = useRef(null);
  const moreMenuRef = useRef(null);

  // Helper function to check if two tracks have the same artist
  const isSameArtist = (track1, track2) => {
    if (!track1 || !track2) return false;
    
    const artist1 = getArtistName(track1).toLowerCase();
    const artist2 = getArtistName(track2).toLowerCase();
    
    return artist1 === artist2 || 
           artist1.includes(artist2) || 
           artist2.includes(artist1);
  };
  
  // Helper function to check if two tracks are from the same album
  const isSameAlbum = (track1, track2) => {
    if (!track1 || !track2) return false;
    
    const album1 = getAlbumName(track1).toLowerCase();
    const album2 = getAlbumName(track2).toLowerCase();
    
    return album1 === album2 || 
           album1.includes(album2) || 
           album2.includes(album1);
  };

  // Add player height to document for styling
  useEffect(() => {
    // If track exists, set CSS variables for the padding
    if (track) {
      // Set a CSS variable for the player height
      const playerHeight = isSmallScreen ? '50px' : hidePlayer ? '0' : '60px';
      const navHeight = isSmallScreen ? '50px' : '0'; // Navigation bar height on mobile
      const totalPadding = isSmallScreen 
        ? (hidePlayer ? navHeight : `calc(${playerHeight} + ${navHeight})`) 
        : playerHeight;
      
      // Use CSS variables for styling
      document.documentElement.style.setProperty('--player-bottom-padding', totalPadding);
      
      // Cleanup function
      return () => {
        document.documentElement.style.removeProperty('--player-bottom-padding');
      };
    }
  }, [track, isSmallScreen, hidePlayer]);

  // Update screen size state on resize
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Volume control
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, audioRef]);

  const handleMute = () => setIsMuted((m) => !m);
  const handleShuffle = () => setShuffleActive((s) => !s);
  
  // Toggle queue panel
  const toggleQueue = () => {
    setShowQueue(prev => !prev);
    if (showLyrics) setShowLyrics(false);
  };
  
  // Toggle lyrics panel
  const toggleLyrics = () => {
    setShowLyrics(prev => !prev);
    if (showQueue) setShowQueue(false);
  };

  // Seek bar logic
  const durationSec = (time.totalTime.minute * 60) + time.totalTime.second;
  const currentSec = (time.currentTime.minute * 60) + time.currentTime.second;
  const handleSeek = (e) => {
    const val = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = val;
  };

  // Toggle autoplay - commented out to fix linter errors
  // eslint-disable-next-line no-unused-vars
  /* const handleAutoplayToggle = () => {
    setAutoplayEnabled(prev => !prev);
  }; */

  // Add a useEffect to ensure player starts in a paused state on page load
  useEffect(() => {
    // On first load, ensure player is in paused state
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
      if (audioRef.current && playStatus) {
        pause();
      }
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, [pause, playStatus, audioRef]);
  
  // Modified play function to ensure audio context is properly initialized
  const handlePlayPause = () => {
    // First handle the pause case which doesn't need special handling
    if (playStatus) {
      pause();
      return;
    }
    
    // Initialize audio context
    if (window._audioContext && window._audioContext.state === 'suspended') {
      window._audioContext.resume().catch(() => console.error('Error resuming AudioContext'));
    }
    
    // Create a new audio context if none exists
    if (!window._audioContext && window.AudioContext) {
      try {
        window._audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (err) {
        console.error('Failed to create AudioContext:', err);
      }
    }
    
    // Check audio reference and source
    if (!audioRef.current) {
      console.error('Audio reference not available');
      
      // Attempt to get the track started anyway
      if (track) {
        setTimeout(() => play(), 100);
      }
      return;
    }
    
    if (!audioRef.current.src && track && track.file) {
      audioRef.current.src = track.file;
      audioRef.current.load();
    } else if (!audioRef.current.src) {
      console.error('No audio source available and no track.file to use');
      return;
    }
    
    // Special handling for mobile browsers and Safari
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
        /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
      unlockAudio();
    } else {
      // For desktop browsers, just attempt to play
      play();
    }
  };
  
  // Create a silent audio element to help unlock audio on mobile devices
  const unlockAudio = () => {
    const silent = document.createElement('audio');
    silent.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjMyLjEwNAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACWQBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGD/////////////////////////////////////////AAAAAExhdmM1OC41OQAAAAAAAAAAAAAAACQCRgAAAAAAAAJZFiHN3gAAAAAAAAAAAAAAAAAAAAAA';
    document.body.appendChild(silent);
    silent.volume = 0.001;
    
    try {
      silent.play().then(() => {
        setTimeout(() => {
          silent.pause();
          document.body.removeChild(silent);
          
          // Now try to play the actual audio
          play();
        }, 20);
      }).catch(() => {
        document.body.removeChild(silent);
        
        // Try direct play anyway
        play();
      });
    } catch {
      // For browsers that don't support promises on play
      try {
        document.body.removeChild(silent);
      } catch (removeError) {
        console.error('Error removing silent audio element:', removeError);
      }
      
      // Try direct play anyway
      play();
    }
  };

  // Add event listeners to help with autoplay restrictions
  useEffect(() => {
    // Create one-time unlock function for first user interaction
    const unlockAudioOnFirstInteraction = () => {
      // Create and play a silent audio element to unlock audio playback
      const unlockElement = document.createElement('audio');
      unlockElement.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjMyLjEwNAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACWQBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGD/////////////////////////////////////////AAAAAExhdmM1OC41OQAAAAAAAAAAAAAAACQCRgAAAAAAAAJZFiHN3gAAAAAAAAAAAAAAAAAAAAAA';
      unlockElement.volume = 0.001;
      
      try {
        // Resume any existing audio context
        if (window._audioContext && window._audioContext.state === 'suspended') {
          window._audioContext.resume().catch(err => console.error('Failed to resume audio context:', err));
        }
        
        // Create a new audio context if none exists
        if (!window._audioContext && window.AudioContext) {
          window._audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Play the silent sound to unlock audio
        unlockElement.play()
          .then(() => {
            setTimeout(() => {
              unlockElement.pause();
              unlockElement.remove();
              
              // Remove the event listeners as they're no longer needed
              events.forEach(eventType => {
                document.documentElement.removeEventListener(eventType, unlockAudioOnFirstInteraction);
              });
              
              console.log('Audio playback capability unlocked successfully');
            }, 10);
          })
          .catch(err => {
            console.error('Failed to unlock audio:', err);
            unlockElement.remove();
          });
      } catch (error) {
        console.error('Error during audio unlock:', error);
      }
    };

    // Listen for user interaction to unlock audio
    const events = ['touchstart', 'touchend', 'mousedown', 'click', 'keydown'];
    events.forEach(event => {
      document.documentElement.addEventListener(event, unlockAudioOnFirstInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.documentElement.removeEventListener(event, unlockAudioOnFirstInteraction);
      });
    };
  }, []);

  // Progress bar functions
  const handleProgressTouchStart = () => {};
  const handleProgressTouchEnd = () => {};
  const handleVolumeTouchStart = () => {};
  const handleVolumeTouchEnd = () => {};

  // Add styles for better touch interaction on mobile
  useEffect(() => {
    // Add styles to improve touch interactions and reduce blur issues
    const style = document.createElement('style');
    style.id = 'player-touch-styles';
    style.innerHTML = `
      /* Increase touch target sizes on small screens */
      @media (max-width: 768px) {
        input[type="range"] {
          height: 10px !important;
          margin: 8px 0;
          background: rgba(50, 50, 50, 0.3);
          border-radius: 8px;
          -webkit-appearance: none;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: #a855f7;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid #222;
        }
        
        /* Fix volume slider */
        .volume-slider {
          width: 60px !important;
          -webkit-appearance: none;
          height: 4px !important;
          background: rgba(50, 50, 50, 0.6);
          border-radius: 4px;
          margin: 0 8px;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.getElementById('player-touch-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  // Toggle more menu with specific track ID (for song options)
  const toggleOptionsMenu = (e, id = null) => {
    if (e) e.stopPropagation();
    
    // Find the track object for the given ID or use current track
    if (id) {
      const targetTrack = songsData.find(song => song._id === id);
      if (targetTrack) {
        setSelectedTrackId(id);
      } else {
        setSelectedTrackId(track?._id);
      }
    } else {
      setSelectedTrackId(track?._id);
    }
    
    // Close buffering menu if open
    if (showBufferingMenu) {
      setShowBufferingMenu(false);
    }
    
    // Toggle options menu
    setShowOptionsMenu(prev => !prev);
  };

  // Toggle buffering menu (separate from options menu)
  const toggleBufferingMenu = (e) => {
    if (e) e.stopPropagation();
    
    // Close options menu if open
    if (showOptionsMenu) {
      setShowOptionsMenu(false);
    }
    
    // Toggle buffering menu
    setShowBufferingMenu(prev => !prev);
  };

  // Handle buffering strategy change
  const handleBufferingChange = (strategy) => {
    setBufferingStrategy(strategy);
    setShowBufferingMenu(false); // Close menu after selection
    // Save preference to localStorage
    localStorage.setItem('bufferingStrategy', strategy);
  };

  // Update Close more menu when clicking outside for both menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowBufferingMenu(false);
        // Only close options menu if clicking outside both menus
        if (!event.target.closest('.options-sheet')) {
          setShowOptionsMenu(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Generate gradient style based on theme colors
  // eslint-disable-next-line no-unused-vars
  const gradientStyle = {
    background: `linear-gradient(135deg, ${themeColors.primary}88, ${themeColors.secondary}ee)`,
    color: themeColors.text
  };

  // Toggle inline lyrics display
  const toggleInlineLyrics = (e) => {
    if (e) e.stopPropagation();
    setShowInlineLyrics(prev => !prev);
    if (showQueue) setShowQueue(false);
    if (showLyrics) setShowLyrics(false);
  };

  // Add this useEffect in the correct position near other useEffects
  useEffect(() => {
    const savedStrategy = localStorage.getItem('bufferingStrategy');
    if (savedStrategy) {
      setBufferingStrategy(savedStrategy);
    }
  }, [setBufferingStrategy]);

  // If there's no track to play, don't render anything
  if (!track) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed left-0 w-full z-40 player-container"
        style={{ bottom: isSmallScreen ? '50px' : '0', display: isSmallScreen && hidePlayer ? 'none' : 'block' }}
        ref={playerRef}
      >
        {/* Mobile Player (full controls) */}
        {isSmallScreen && showExtraControls && !hidePlayer && (
          <div 
            className="fixed inset-0 bottom-[50px] z-40 mobile-player-overlay overflow-y-auto"
            style={{ 
              color: themeColors.text,
            }}
          >
            {/* Album art background with blur - fixed position */}
            <div 
              className="fixed inset-0 z-0 bg-cover bg-center" 
              style={{ 
                backgroundImage: `url(${track.image})`,
                filter: 'blur(60px) brightness(0.5)',
                transform: 'scale(1.2)', // Prevent blur edges
              }}
            ></div>
            
            {/* Color overlay with gradient from album colors - fixed position */}
            <div 
              className="fixed inset-0 z-0 opacity-90"
              style={{ 
                background: `linear-gradient(167deg, ${themeColors.primary}ee 0%, ${themeColors.secondary} 80%, ${themeColors.secondary} 100%)`,
                mixBlendMode: 'color',
              }}
            ></div>
            
            {/* Dark overlay with gradient - fixed position */}
            <div className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80 z-0"></div>
            
            {/* Additional color boost at top - fixed position */}
            <div 
              className="fixed top-0 left-0 right-0 h-32 z-0"
              style={{ 
                background: `linear-gradient(to bottom, ${themeColors.primary}80 0%, transparent 100%)`,
                opacity: 0.7,
              }}
            ></div>
            
            {/* Content container - now a single scrollable area */}
            <div className="relative z-10 min-h-full pb-20">
              {/* Top navigation row - sticky at top */}
              <div className="sticky top-0 flex justify-between items-center p-5 mb-2 z-20 backdrop-blur-sm bg-black/30">
                <button 
                  className="w-8 h-8 flex items-center justify-center"
                  style={{ color: themeColors.text }}
                  onClick={() => setShowExtraControls(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <div className="text-center">
                  <h3 className="font-bold text-sm opacity-80" style={{ color: themeColors.text }}>
                    {track?.album || "Now Playing"}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={toggleLyrics}
                    className="w-8 h-8 flex items-center justify-center"
                    style={{ color: showLyrics ? themeColors.primary : themeColors.text }}
                    title="Lyrics"
                  >
                    <MdOutlineLyrics size={20} />
                  </button>
                  <button 
                    className="w-8 h-8 flex items-center justify-center"
                    style={{ color: themeColors.text }}
                    onClick={(e) => toggleOptionsMenu(e)}
                    title="More Options"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="19" cy="12" r="1" />
                      <circle cx="5" cy="12" r="1" />
                    </svg>
                  </button>
                </div>
              </div>
            
              {/* Album art */}
              <div className="px-5">
                <div className="relative w-[85vw] h-[85vw] max-w-[350px] max-h-[350px] mx-auto rounded-lg overflow-hidden shadow-2xl border border-white/10 mb-4">
                <img 
                  src={track.image} 
                  alt={track.name} 
                  className="w-full h-full object-cover"
                />
                {buffering && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" 
                        style={{ borderColor: themeColors.primary, borderTopColor: 'transparent' }}></div>
                  </div>
                )}
                </div>
              </div>
              
              {/* Song metadata */}
              <div className="px-5 mb-3">
                <h2 className="text-xl font-bold" style={{ color: themeColors.text }}>{track.name}</h2>
                <p className="text-sm opacity-80" style={{ color: themeColors.text }}>
                  {getArtistName(track)}
                </p>
            </div>
            
              {/* Player controls */}
              <div className="px-5 mb-8">
            {/* Progress bar */}
                <div className="w-full mb-4">
                  <div className="relative w-full h-1 bg-white/20 rounded-full overflow-hidden">
                {/* Buffering Progress Indicator */}
                <div 
                      className="absolute top-0 left-0 h-full rounded-full"
                      style={{ width: `${loadingProgress}%`, backgroundColor: `${themeColors.text}40` }}
                ></div>
                {/* Playback Progress */}
                <input
                  ref={progressBarRef}
                  type="range"
                  min={0}
                  max={durationSec || 1}
                  step={0.1}
                  value={currentSec}
                  onChange={handleSeek}
                  onTouchStart={handleProgressTouchStart}
                  onTouchEnd={handleProgressTouchEnd}
                      className="w-full absolute top-0 left-0 h-1 cursor-pointer opacity-70 z-10"
                      style={{ accentColor: themeColors.primary }}
                />
              </div>
                  <div className="flex items-center justify-between text-xs mt-1" style={{ color: `${themeColors.text}99` }}>
                    <span>{formatTime(time.currentTime.minute, time.currentTime.second)}</span>
                    <span>{formatTime(time.totalTime.minute, time.totalTime.second)}</span>
                  </div>
            </div>
            
            {/* Controls */}
                <div className="flex justify-evenly items-center">
                <button
                  onClick={() => { shuffle(); handleShuffle(); }}
                    className="w-10 h-10 flex items-center justify-center"
                    style={{ color: shuffleActive ? themeColors.primary : `${themeColors.text}99` }}
                >
                    <MdShuffle className="text-xl" />
                </button>
                <button 
                  onClick={Previous}
                    className="w-10 h-10 flex items-center justify-center"
                    style={{ color: themeColors.text }}
                >
                    <FaStepBackward className="text-xl" />
                </button>
                <button
                  onClick={handlePlayPause}
                    className="w-14 h-14 flex items-center justify-center text-white rounded-full shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.accent || themeColors.primary})`,
                      boxShadow: `0 4px 10px ${themeColors.primary}80`
                    }}
                  >
                    {playStatus ? <FaPause className="text-xl" /> : <FaPlay className="text-xl ml-1" />}
                </button>
                <button 
                  onClick={Next}
                    className="w-10 h-10 flex items-center justify-center"
                    style={{ color: themeColors.text }}
                >
                    <FaStepForward className="text-xl" />
                </button>
                <button
                  onClick={toggleLoop}
                    className="w-10 h-10 flex items-center justify-center"
                    style={loop ? { color: themeColors.primary } : { color: `${themeColors.text}99` }}
                >
                    <MdRepeat className="text-xl" />
                </button>
                </div>
              </div>
              
              {/* Divider line */}
              <div className="h-[1px] bg-white/10 mx-5 mb-6"></div>
              
              {/* Lyrics Section with improved transitions */}
              <div className="px-5 py-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-base font-bold" style={{ color: themeColors.text }}>
                    Lyrics
                  </h4>
                  <span 
                    className="text-xs px-2 py-1 rounded-full cursor-pointer"
                    style={{ color: themeColors.primary }}
                    onClick={toggleLyrics}
                  >
                    Full screen
                  </span>
                </div>
                
                <div className="relative flex items-center justify-center h-44 overflow-hidden">
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)'
                    }}
                  ></div>
                  
                  <div className="w-full text-center">
                    {track.lyrics ? (
                      // If track has lyrics, display them with timed highlighting
                      (() => {
                        // Parse the lyrics to find any time-synced lines
                        const lines = track.lyrics.split('\n');
                        // Filter out LRC metadata headers
                        const filteredLines = lines.filter(line => {
                          const isMetadataHeader = /^\[(id|ar|al|ti|length|by|offset|re|ve):/i.test(line);
                          return !isMetadataHeader;
                        });
                        
                        const hasTimestamps = filteredLines.some(line => /^\[\d{2}:\d{2}\.\d{2}\]/.test(line));
                        const currentTimeInSeconds = (time.currentTime.minute * 60) + time.currentTime.second;
                        
                        // For time-synced lyrics
                        if (hasTimestamps) {
                          const parsedLines = filteredLines.map((line, index) => {
                            const timeMatch = line.match(/^\[(\d{2}):(\d{2})\.(\d{2})\](.*)/);
                            if (timeMatch) {
                              const minutes = parseInt(timeMatch[1], 10);
                              const seconds = parseInt(timeMatch[2], 10);
                              const hundredths = parseInt(timeMatch[3], 10);
                              const timeInSeconds = minutes * 60 + seconds + hundredths / 100;
                              const text = timeMatch[4].trim();
                              return { timeInSeconds, text, index };
                            }
                            
                            // For section headers
                            const sectionMatch = line.match(/^\[(.*?)\]/);
                            if (sectionMatch) {
                              return { timeInSeconds: -1, text: line, isSectionHeader: true, index };
                            }
                            
                            // For regular lines
                            return { timeInSeconds: -1, text: line, index };
                          });
                          
                          // Find current active line index
                          let activeIndex = -1;
                          const timedLines = parsedLines.filter(line => line.timeInSeconds >= 0);
                          
                          for (let i = timedLines.length - 1; i >= 0; i--) {
                            if (timedLines[i].timeInSeconds <= currentTimeInSeconds) {
                              activeIndex = timedLines[i].index;
                              break;
                            }
                          }
                          
                          // Only display a small window of lines centered around the active line
                          const visibleLyricsStart = Math.max(0, activeIndex - 1);
                          const visibleLyricsEnd = Math.min(parsedLines.length, activeIndex + 3);
                          const visibleLyrics = parsedLines.slice(visibleLyricsStart, visibleLyricsEnd);
                          
                          // Return the rendered lines with improved animation
                          return (
                            <div className="flex flex-col items-center justify-center h-full py-2 will-change-transform">
                              {visibleLyrics.map((line) => {
                                if (line.isSectionHeader) {
                                  return (
                                    <div key={line.index} className="opacity-70 text-sm my-1.5" style={{ color: `${themeColors.text}` }}>
                                      {line.text}
                                    </div>
                                  );
                                }
                                
                                const isActive = line.index === activeIndex;
                                
                                return (
                                  <div 
                                    key={line.index} 
                                    className="transition-all duration-300 ease-out px-4 py-1 will-change-transform"
                                    style={{ 
                                      color: isActive ? themeColors.primary : `${themeColors.text}${line.index % 2 === 0 ? 'cc' : '99'}`,
                                      fontWeight: isActive ? '700' : '400',
                                      transform: `translate3d(0, 0, 0) scale(${isActive ? 1.05 : 1})`,
                                      transformOrigin: 'center center',
                                      fontSize: isActive ? '1.1rem' : '0.9rem',
                                      textShadow: isActive ? `0 0 8px ${themeColors.primary}30` : 'none',
                                      opacity: isActive ? 1 : 0.7
                                    }}
                                  >
                                    {line.text}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        } else {
                          // For non-timed lyrics, display normally
                          return filteredLines.slice(0, 6).map((line, index) => (
                            <p key={index} className="py-1 transition-colors duration-300" style={{ color: `${themeColors.text}${index % 2 === 0 ? 'ff' : '99'}` }}>
                              {line}
                            </p>
                          ));
                        }
                      })()
                    ) : (
                      // Default lyrics when not available
                      <div className="py-4 space-y-2">
                        <p style={{ color: `${themeColors.text}99` }}>
                          [Verse 1]<br/>
                          <span style={{ color: themeColors.text }}>{track.name} by {getArtistName(track)}</span><br/>
                          This is where the song lyrics will appear<br/>
                          Line by line with proper formatting<br/>
                          For the current song that's playing
                        </p>
                        <p style={{ color: `${themeColors.text}99` }}>
                          [Chorus]<br/>
                          <span style={{ color: themeColors.text }}>The chorus of the song</span><br/>
                          Will be displayed here<br/>
                          With each line properly aligned<br/>
                          For easy readability
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="h-[1px] bg-white/10 mx-5 mb-6"></div>

              {/* Credits section */}
              <div className="px-5 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-base font-bold" style={{ color: themeColors.text }}>
                    Credits
                  </h4>
                  <span 
                    className="text-xs px-2 py-1 rounded-full cursor-pointer"
                    style={{ color: themeColors.primary }}
                  >
                    Show all
                  </span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm opacity-70" style={{ color: themeColors.text }}>Performer</span>
                  <span className="text-sm font-medium" style={{ color: themeColors.text }}>
                    {getArtistName(track)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm opacity-70" style={{ color: themeColors.text }}>Song</span>
                  <span className="text-sm font-medium" style={{ color: themeColors.text }}>
                    {track.title || track.name || (track.metadata && track.metadata.title) || 'Unknown Track'}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm opacity-70" style={{ color: themeColors.text }}>Album</span>
                  <span className="text-sm font-medium" style={{ color: themeColors.text }}>
                    {getAlbumName(track)}
                  </span>
                </div>
                {(track.composer || track.music || (track.metadata && track.metadata.composer)) && (
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm opacity-70" style={{ color: themeColors.text }}>Composer</span>
                    <span className="text-sm font-medium" style={{ color: themeColors.text }}>
                      {track.composer || 
                       track.music || 
                       (track.metadata && track.metadata.composer) ||
                       'Unknown'}
                    </span>
                  </div>
                )}
                {(track.lyricist || (track.metadata && track.metadata.lyricist)) && (
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm opacity-70" style={{ color: themeColors.text }}>Lyricist</span>
                    <span className="text-sm font-medium" style={{ color: themeColors.text }}>
                      {track.lyricist || 
                       (track.metadata && track.metadata.lyricist) ||
                       'Unknown'}
                    </span>
                  </div>
                )}
                {track.producer && (
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm opacity-70" style={{ color: themeColors.text }}>Producer</span>
                    <span className="text-sm font-medium" style={{ color: themeColors.text }}>{track.producer}</span>
                  </div>
                )}
                {(track.year || (track.metadata && track.metadata.year)) && (
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm opacity-70" style={{ color: themeColors.text }}>Released</span>
                    <span className="text-sm font-medium" style={{ color: themeColors.text }}>
                      {track.year || (track.metadata && track.metadata.year)}
                    </span>
                  </div>
                )}
                {(track.genre || (track.metadata && track.metadata.genre)) && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-70" style={{ color: themeColors.text }}>Genre</span>
                    <span className="text-sm font-medium" style={{ color: themeColors.text }}>
                      {track.genre || (track.metadata && track.metadata.genre)}
                    </span>
                  </div>
                )}
              </div>

              <div className="h-[1px] bg-white/10 mx-5 mb-6"></div>

              {/* Related content header */}
              <div className="px-5 mb-3">
                <h4 className="text-base font-bold" style={{ color: themeColors.text }}>
                  {getArtistName(track) !== 'Unknown Artist' ? `More from ${getArtistName(track)}` : 'You might also like'}
                </h4>
              </div>

              {/* Artist's songs - real data from context */}
              <div className="px-5 mb-6">
                <h5 className="text-sm font-semibold mb-2" style={{ color: `${themeColors.text}99` }}>
                  Popular songs
                </h5>
                <div className="space-y-2">
                  {songsData
                    .filter(song => song._id !== track._id && isSameArtist(song, track))
                    .slice(0, 5)
                    .map((song, index) => (
                      <div 
                        key={song._id}
                        className="flex items-center p-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer" 
                        style={{ background: index === 0 ? `${themeColors.primary}15` : 'transparent' }}
                        onClick={() => {
                          // Play the selected song
                          const newTrack = songsData.find(s => s._id === song._id);
                          if (newTrack) {
                            audioRef.current.src = newTrack.file;
                            audioRef.current.play();
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded overflow-hidden mr-3">
                          <img 
                            src={song.image} 
                            alt={song.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: index === 0 ? themeColors.primary : themeColors.text }}>
                            {song.name}
                          </p>
                          <p className="text-xs truncate" style={{ color: `${themeColors.text}70` }}>
                            {getArtistName(song)} • {getAlbumName(song)}
                          </p>
                        </div>
                        <button 
                          className="w-8 h-8 flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOptionsMenu(e, song._id);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: `${themeColors.text}70` }}>
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="19" cy="12" r="1" />
                            <circle cx="5" cy="12" r="1" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    
                  {/* Show message if no songs found */}
                  {songsData.filter(song => song._id !== track._id && isSameArtist(song, track)).length === 0 && (
                    <div className="text-center p-4 text-sm opacity-70" style={{ color: themeColors.text }}>
                      No other songs found from this artist
                    </div>
                  )}
                </div>
              </div>

              {/* Similar tracks based on genre */}
              <div className="px-5 mb-6">
                <h5 className="text-sm font-semibold mb-2" style={{ color: `${themeColors.text}99` }}>
                  You might also like
                </h5>
                <div className="space-y-2">
                  {songsData
                    .filter(song => 
                      song._id !== track._id && 
                      (song.genre === track.genre || isSameArtist(song, track))
                    )
                    .slice(0, 3)
                    .map((song, index) => (
                      <div 
                        key={song._id}
                        className="flex items-center p-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer" 
                        style={{ background: index === 0 ? `${themeColors.primary}15` : 'transparent' }}
                        onClick={() => {
                          // Play the selected song
                          const newTrack = songsData.find(s => s._id === song._id);
                          if (newTrack) {
                            audioRef.current.src = newTrack.file;
                            audioRef.current.play();
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded overflow-hidden mr-3">
                          <img 
                            src={song.image} 
                            alt={song.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: index === 0 ? themeColors.primary : themeColors.text }}>
                            {song.name}
                          </p>
                          <p className="text-xs truncate" style={{ color: `${themeColors.text}70` }}>
                            {getArtistName(song)} • {getAlbumName(song)}
                          </p>
                        </div>
                        <button 
                          className="w-8 h-8 flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleOptionsMenu(e, song._id);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: `${themeColors.text}70` }}>
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="19" cy="12" r="1" />
                            <circle cx="5" cy="12" r="1" />
                          </svg>
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              {/* Albums section */}
              <div className="px-5 mb-20">
                <h5 className="text-sm font-semibold mb-2" style={{ color: `${themeColors.text}99` }}>
                  From the same album
                </h5>
                <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                  {songsData
                    .filter(song => song._id !== track._id && isSameAlbum(song, track))
                    .slice(0, 5)
                    .map((song, index) => (
                      <div 
                        key={song._id} 
                        className="min-w-[120px] cursor-pointer relative group"
                        onClick={() => {
                          // Play the selected song
                          const newTrack = songsData.find(s => s._id === song._id);
                          if (newTrack) {
                            audioRef.current.src = newTrack.file;
                            audioRef.current.play();
                          }
                        }}
                      >
                        <div className="w-[120px] h-[120px] rounded-md overflow-hidden mb-2 border relative" 
                          style={{ borderColor: index === 0 ? themeColors.primary : 'transparent' }}
                        >
                          <img 
                            src={song.image} 
                            alt={song.name} 
                            className="w-full h-full object-cover"
                          />
                          {/* Options button overlay */}
                          <button 
                            className="absolute top-1 right-1 w-8 h-8 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleOptionsMenu(e, song._id);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: themeColors.text }}>
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="19" cy="12" r="1" />
                              <circle cx="5" cy="12" r="1" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs font-medium truncate" style={{ color: index === 0 ? themeColors.primary : themeColors.text }}>
                          {song.name}
                        </p>
                        <p className="text-xs truncate opacity-70" style={{ color: themeColors.text }}>
                          {getArtistName(song)}
                        </p>
                      </div>
                    ))}
                    
                  {/* Show message if no songs found */}
                  {songsData.filter(song => song._id !== track._id && isSameAlbum(song, track)).length === 0 && (
                    <div className="text-center p-4 w-full text-sm opacity-70" style={{ color: themeColors.text }}>
                      No other songs found from this album
                    </div>
                  )}
                </div>
              </div>
              
              {/* Add extra padding at bottom for better scrolling */}
              <div className="h-24"></div>
            </div>
          </div>
        )}

        {/* Main player bar - always visible when track is playing */}
        <div 
          className={`flex flex-col justify-between px-2 sm:px-4 py-2 border-t backdrop-blur-xl ${hidePlayer ? 'compact-player' : ''}`}
          style={{ 
            background: `linear-gradient(180deg, ${themeColors.secondary}dd, ${themeColors.secondary})`,
            borderColor: `${themeColors.text}20`
          }}
        >
          {/* Inline lyrics display */}
          <AnimatePresence>
            {showInlineLyrics && !isSmallScreen && !hidePlayer && track && track.lyrics && (
              <div className="w-full py-2">
                <InlineLyricsDisplay 
                  track={track} 
                  currentTime={time.currentTime} 
                  themeColors={themeColors} 
                />
              </div>
            )}
          </AnimatePresence>
          
          {/* Player controls and info */}
          <div className="flex items-center justify-between">
            {/* Song Info - clickable on mobile to show full player */}
            <div 
              className={`flex items-center gap-3 ${isSmallScreen ? "flex-1" : "w-[20%]"}`}
              onClick={() => isSmallScreen && setShowExtraControls(true)}
            >
              <div className="relative">
                <img
                  src={track.image}
                  alt={track.name}
                  className="w-10 h-10 rounded object-cover border"
                  style={{ borderColor: `${themeColors.text}30` }}
                />
                {buffering && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: themeColors.primary, borderTopColor: 'transparent' }}></div>
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold truncate max-w-[120px]" style={{ color: themeColors.text }}>{track.name}</span>
                <span className="text-xs truncate max-w-[120px]" style={{ color: `${themeColors.text}99` }}>{getArtistName(track)}</span>
              </div>
              {isSmallScreen && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(track._id);
                  }}
                  className="ml-auto"
                  style={isFavorite(track._id) ? { color: themeColors.accent } : { color: `${themeColors.text}99` }}
                >
                  <FaHeart />
                </button>
              )}
            </div>

            {/* Controls + Progress - hidden on small screens when extended view is not shown */}
            {(!isSmallScreen || !showExtraControls) && (
              <div className={`flex flex-col items-center ${isSmallScreen ? "hidden" : "w-[45%] max-w-md mx-auto"}`}>
                <div className="flex items-center justify-center gap-4 mb-1">
                  {/* Playback modifier controls */}
                  <button
                    onClick={() => { shuffle(); handleShuffle(); }}
                    className="text-base transition"
                    style={shuffleActive ? { color: themeColors.primary } : { color: `${themeColors.text}99` }}
                    title="Shuffle"
                  >
                    <MdShuffle size={20} />
                  </button>
                  <button
                    onClick={toggleLoop}
                    className="text-base transition"
                    style={loop ? { color: themeColors.primary } : { color: `${themeColors.text}99` }}
                    title="Repeat"
                  >
                    <MdRepeat size={20} />
                  </button>
                  
                  {/* Main playback controls */}
                  <button 
                    onClick={Previous} 
                    className="text-base transition" 
                    style={{ color: `${themeColors.text}99` }}
                    title="Previous"
                  >
                    <FaStepBackward size={18} />
                  </button>
                  <button
                    onClick={handlePlayPause}
                    className="rounded-full p-3 shadow-lg hover:scale-110 transition-transform border-2 text-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.accent || themeColors.primary})`,
                      borderColor: `${themeColors.primary}80`,
                      color: themeColors.text
                    }}
                    title={playStatus ? "Pause" : "Play"}
                  >
                    {playStatus ? <FaPause className="text-xl" /> : <FaPlay className="relative ml-0.5" size={20} />}
                  </button>
                  <button 
                    onClick={Next} 
                    className="text-base transition" 
                    style={{ color: `${themeColors.text}99` }}
                    title="Next"
                  >
                    <FaStepForward size={18} />
                  </button>
                </div>
                {/* Progress Bar */}
                <div className="flex items-center gap-1 w-full">
                  <span className="text-xs min-w-[28px]" style={{ color: `${themeColors.text}99` }}>
                    {formatTime(time.currentTime.minute, time.currentTime.second)}
                  </span>
                  <div className="relative w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${themeColors.text}30` }}>
                    {/* Buffering Progress Indicator */}
                    <div 
                      className="absolute top-0 left-0 h-full rounded-full"
                      style={{ width: `${loadingProgress}%`, backgroundColor: `${themeColors.text}50` }}
                      title="Buffered amount"
                    ></div>
                    {/* Playback Progress */}
                    <input
                      type="range"
                      min={0}
                      max={durationSec || 1}
                      step={0.1}
                      value={currentSec}
                      onChange={handleSeek}
                      onTouchStart={handleProgressTouchStart}
                      onTouchEnd={handleProgressTouchEnd}
                      className="w-full absolute top-0 left-0 h-1.5 cursor-pointer opacity-70 z-10"
                      style={{ accentColor: themeColors.accent }}
                    />
                    {buffering && (
                      <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: themeColors.accent }}></div>
                      </div>
                    )}
                  </div>
                  <span className="text-xs min-w-[28px]" style={{ color: `${themeColors.text}99` }}>
                    {formatTime(time.totalTime.minute, time.totalTime.second)}
                  </span>
                </div>
              </div>
            )}

            {/* Mobile controls - when not in expanded view */}
            {isSmallScreen && !showExtraControls && (
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPause();
                  }}
                  className="rounded-full p-2 shadow-md flex items-center justify-center w-8 h-8"
                  style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.accent})` }}
                >
                  {playStatus ? <FaPause className="text-sm" /> : <FaPlay className="text-sm ml-0.5" />}
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    Next();
                  }}
                  className="text-sm flex items-center justify-center w-6 h-6"
                  style={{ color: `${themeColors.text}99` }}
                >
                  <FaStepForward />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMute();
                  }}
                  className="text-sm flex items-center justify-center w-6 h-6"
                  style={{ color: `${themeColors.text}99` }}
                >
                  {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
              </div>
            )}

            {/* Volume + Extras - hidden on mobile */}
            {!isSmallScreen && (
              <div className="flex items-center w-[30%] justify-end">
                <button 
                  onClick={toggleInlineLyrics}
                  className="text-base transition mr-3"
                  style={showInlineLyrics ? { color: themeColors.primary } : { color: `${themeColors.text}99` }}
                  title="Quick Lyrics"
                >
                  <MdOutlineLyrics size={20} />
                </button>
                <button 
                  onClick={toggleLyrics}
                  className="text-base transition mr-3"
                  style={showLyrics ? { color: themeColors.primary } : { color: `${themeColors.text}99` }}
                  title="Full Lyrics"
                >
                  <MdOutlineLyrics size={20} />
                </button>
                <button 
                  onClick={() => toggleFavorite(track._id)}
                  className="text-base transition mr-3"
                  style={isFavorite(track._id) ? { color: themeColors.accent } : { color: `${themeColors.text}99` }}
                  title="Like"
                >
                  <FaHeart size={18} />
                </button>
                <button 
                  onClick={toggleQueue}
                  className="text-base transition mr-3"
                  style={showQueue ? { color: themeColors.accent } : { color: `${themeColors.text}99` }}
                  title="Queue"
                >
                  <MdQueueMusic size={20} />
                </button>
                
                {/* Separator */}
                <div className="h-5 w-[1px] bg-white/20 mx-3"></div>
                
                {/* Audio controls */}
                <button
                  onClick={handleMute}
                  className="text-base transition mr-2"
                  style={{ color: `${themeColors.text}99` }}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  onTouchStart={handleVolumeTouchStart}
                  onTouchEnd={handleVolumeTouchEnd}
                  className="w-16 cursor-pointer h-1 volume-slider mr-3"
                  style={{ accentColor: themeColors.accent }}
                  disabled={isMuted}
                />
                <button 
                  className="text-base transition mr-3"
                  style={{ color: `${themeColors.text}99` }}
                  title="Devices"
                >
                  <MdDevices size={20} />
                </button>
                
                {/* Separator */}
                <div className="h-5 w-[1px] bg-white/20 mx-3"></div>
                
                {/* More options button */}
                <button 
                  onClick={(e) => toggleOptionsMenu(e)}
                  className="text-base transition mr-3"
                  style={{ color: `${themeColors.text}99` }}
                  title="More options"
                >
                  <MdMoreVert size={20} />
                </button>
                
                {/* Buffering settings button - separate from song options */}
                <button 
                  onClick={(e) => toggleBufferingMenu(e)}
                  className="text-base transition ml-1"
                  style={{ color: `${themeColors.text}99` }}
                  title="Buffering settings"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Queue panel */}
        <QueueComponent isOpen={showQueue && !hidePlayer} onClose={() => setShowQueue(false)} />

        {/* Lyrics panel */}
        <LyricsPanel isOpen={showLyrics && !hidePlayer} onClose={() => setShowLyrics(false)} />

        {/* More options sheet - now with selected track ID */}
        <MoreOptionsSheet 
          isOpen={showOptionsMenu} 
          onClose={() => setShowOptionsMenu(false)} 
          trackId={selectedTrackId}
        />

        {/* Full screen player content - Artist Explorer and Credits when expanded on mobile */}
        {isSmallScreen && showExtraControls && !hidePlayer && (
          <div className="fixed bottom-0 left-0 right-0 w-full z-30 px-4 pb-4 pt-80 mt-auto"
            style={{
              background: `linear-gradient(to top, ${themeColors.secondary}, transparent)`,
              pointerEvents: 'none'
            }}
          >
            <div className="pointer-events-auto">
              <ArtistExplorer 
                track={track}
              />
              <CreditsSection 
                track={track}
              />
            </div>
          </div>
        )}

        {/* Buffering menu dropdown */}
        {showBufferingMenu && (
          <div 
            className="absolute bottom-full right-0 mb-2 rounded-xl shadow-xl p-3 w-48 z-50"
            style={{ 
              backgroundColor: themeColors.secondary, 
              borderColor: `${themeColors.primary}40`,
              borderWidth: '1px'
            }}
            ref={moreMenuRef}
          >
            <h4 className="text-xs font-bold mb-2 pb-1" 
              style={{ 
                color: themeColors.text,
                borderBottom: `1px solid ${themeColors.text}30`
              }}>
              Buffer Mode
            </h4>
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => handleBufferingChange('auto')}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-sm"
                style={bufferingStrategy === 'auto' 
                  ? { backgroundColor: themeColors.primary, color: themeColors.text } 
                  : { color: themeColors.text, backgroundColor: `${themeColors.text}15` }}
              >
                <span>Auto</span>
                {bufferingStrategy === 'auto' && (
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                )}
              </button>
              <button 
                onClick={() => handleBufferingChange('aggressive')}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-sm"
                style={bufferingStrategy === 'aggressive' 
                  ? { backgroundColor: themeColors.primary, color: themeColors.text } 
                  : { color: themeColors.text, backgroundColor: `${themeColors.text}15` }}
              >
                <span>High Quality</span>
                {bufferingStrategy === 'aggressive' && (
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                )}
              </button>
              <button 
                onClick={() => handleBufferingChange('conservative')}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg text-sm"
                style={bufferingStrategy === 'conservative' 
                  ? { backgroundColor: themeColors.primary, color: themeColors.text } 
                  : { color: themeColors.text, backgroundColor: `${themeColors.text}15` }}
              >
                <span>Data Saver</span>
                {bufferingStrategy === 'conservative' && (
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};

// Inline Lyrics Display component for the Premium Player
const InlineLyricsDisplay = ({ track, currentTime, themeColors }) => {
  const [parsedLyrics, setParsedLyrics] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const lyricsContainerRef = useRef(null);
  
  // Parse the lyrics into a time-stamped format
  useEffect(() => {
    if (!track || !track.lyrics) {
      setParsedLyrics([]);
      setCurrentLineIndex(0);
      return;
    }
    
    const lines = track.lyrics.split('\n');
    
    // Filter out LRC metadata headers
    const filteredLines = lines.filter(line => {
      const isMetadataHeader = /^\[(id|ar|al|ti|length|by|offset|re|ve):/i.test(line);
      return !isMetadataHeader;
    });
    
    const hasTimestamps = filteredLines.some(line => /^\[\d{2}:\d{2}\.\d{2}\]/.test(line));
    
    if (hasTimestamps) {
      // Parse lyrics with timestamps [mm:ss.xx]
      const formattedLyrics = filteredLines.map((line, index) => {
        const timeMatch = line.match(/^\[(\d{2}):(\d{2})\.(\d{2})\](.*)/);
        if (timeMatch) {
          const minutes = parseInt(timeMatch[1], 10);
          const seconds = parseInt(timeMatch[2], 10);
          const hundredths = parseInt(timeMatch[3], 10);
          const timeInSeconds = minutes * 60 + seconds + hundredths / 100;
          const text = timeMatch[4].trim();
          return { timeInSeconds, text, index };
        }
        return { timeInSeconds: -1, text: line, index };
      });
      
      setParsedLyrics(formattedLyrics);
    } else {
      // For lyrics without timestamps
      const formattedLyrics = filteredLines.map((line, index) => {
        return { timeInSeconds: -1, text: line, index };
      });
      setParsedLyrics(formattedLyrics);
    }
  }, [track]);
  
  // Update current line based on playback time
  useEffect(() => {
    if (!parsedLyrics.length) return;
    
    const currentTimeInSeconds = currentTime.minute * 60 + currentTime.second;
    
    // Find the correct line based on current time
    const timedLyrics = parsedLyrics.filter(line => line.timeInSeconds >= 0);
    if (timedLyrics.length) {
      for (let i = timedLyrics.length - 1; i >= 0; i--) {
        if (timedLyrics[i].timeInSeconds <= currentTimeInSeconds) {
          setCurrentLineIndex(timedLyrics[i].index);
          break;
        }
      }
    }
  }, [currentTime, parsedLyrics]);
  
  // Only display a small window of lyrics centered around the current line
  const visibleLyricsStart = Math.max(0, currentLineIndex - 1);
  const visibleLyricsEnd = Math.min(parsedLyrics.length, currentLineIndex + 2);
  const visibleLyrics = parsedLyrics.slice(visibleLyricsStart, visibleLyricsEnd);
  
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <div 
        className="max-w-xl mx-auto overflow-hidden text-center h-16"
        ref={lyricsContainerRef}
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)'
        }}
      >
        <div className="flex flex-col items-center justify-center h-full py-4 space-y-2">
          {visibleLyrics.map((line) => {
            const isActive = line.index === currentLineIndex;
            
            return (
              <motion.p 
                key={line.index} 
                className="w-full px-4 transition-all duration-300 ease-out"
                initial={{ y: 10, opacity: 0 }}
                animate={{ 
                  y: 0, 
                  opacity: isActive ? 1 : 0.6,
                  scale: isActive ? 1.05 : 0.9,
                }}
                style={{ 
                  color: isActive ? themeColors.primary : `${themeColors.text}aa`,
                  fontWeight: isActive ? '700' : '400',
                  fontSize: isActive ? '1.1rem' : '0.9rem',
                  textShadow: isActive ? `0 0 8px ${themeColors.primary}30` : 'none',
                  letterSpacing: isActive ? '0.02em' : 'normal',
                  willChange: 'transform, opacity, color',
                }}
              >
                {line.text || " "}
              </motion.p>
            );
          })}
          
          {visibleLyrics.length === 0 && (
            <p className="text-sm opacity-70" style={{ color: themeColors.text }}>
              No synced lyrics available
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PremiumPlayer; 