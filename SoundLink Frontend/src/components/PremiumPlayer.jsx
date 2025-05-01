import React, { useContext, useState, useEffect, useRef } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { AnimatePresence } from "framer-motion";
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaRandom, FaRedo, FaVolumeUp, FaVolumeMute, FaHeart } from "react-icons/fa";
import { MdQueueMusic, MdDevices, MdShuffle, MdRepeat, MdOutlineLyrics } from "react-icons/md";
import QueueComponent from "./QueueComponent";

const formatTime = (min, sec) => `${min}:${sec < 10 ? "0" : ""}${sec}`;

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
    autoplayEnabled,
    setAutoplayEnabled,
    hidePlayer,
  } = useContext(PlayerContext);
  
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffleActive, setShuffleActive] = useState(false);
  const [showExtraControls, setShowExtraControls] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  
  // Touch gesture variables
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const playerRef = useRef(null);
  const progressBarRef = useRef(null);
  const volumeControlRef = useRef(null);
  const MIN_SWIPE_DISTANCE = 50; // Minimum distance for a swipe to be detected
  const [isTouchingProgressBar, setIsTouchingProgressBar] = useState(false);
  const [isTouchingVolumeControl, setIsTouchingVolumeControl] = useState(false);

  // Handler for touch start
  const handleTouchStart = (e) => {
    // Don't process swipe if user is interacting with progress bar or volume control
    if (e.target.type === 'range') {
      if (e.target.className.includes('volume-slider')) {
        setIsTouchingVolumeControl(true);
      } else {
        setIsTouchingProgressBar(true);
      }
      return;
    }
    
    setTouchStartY(e.touches[0].clientY);
    setTouchStartX(e.touches[0].clientX);
  };

  // Handler for touch end
  const handleTouchEnd = (e) => {
    // Reset touch states for controls
    if (isTouchingProgressBar) {
      setIsTouchingProgressBar(false);
      return;
    }
    
    if (isTouchingVolumeControl) {
      setIsTouchingVolumeControl(false);
      return;
    }
    
    if (!touchStartY || !touchStartX) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    
    const yDistance = touchStartY - touchEndY;
    const xDistance = touchStartX - touchEndX;
    
    // Vertical swipe detection (for showing/hiding player)
    if (Math.abs(yDistance) > Math.abs(xDistance) && Math.abs(yDistance) > MIN_SWIPE_DISTANCE) {
      if (yDistance > 0) {
        // Swipe up - show player if hidden
        if (hidePlayer) setShowExtraControls(true);
      } else {
        // Swipe down - hide player
        setShowExtraControls(false);
      }
    } 
    // Horizontal swipe detection (for changing tracks)
    else if (Math.abs(xDistance) > Math.abs(yDistance) && Math.abs(xDistance) > MIN_SWIPE_DISTANCE) {
      if (xDistance > 0) {
        // Swipe left - next track
        Next();
      } else {
        // Swipe right - previous track
        Previous();
      }
    }
    
    // Reset touch coordinates
    setTouchStartY(0);
    setTouchStartX(0);
  };

  // Add player height to document for styling
  useEffect(() => {
    // If track exists, add a class and style to the body
    if (track) {
      // Add a style tag for the padding
      // For large screens without a player visible, set padding to 0
      const playerHeight = isSmallScreen ? '50px' : hidePlayer ? '0' : '60px';
      const navHeight = isSmallScreen ? '50px' : '0'; // Navigation bar height on mobile
      const totalPadding = isSmallScreen 
        ? (hidePlayer ? navHeight : `calc(${playerHeight} + ${navHeight})`) 
        : playerHeight;
      
      // Use CSS variables instead of direct styling to avoid conflicts
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

  // Toggle autoplay
  const handleAutoplayToggle = () => {
    setAutoplayEnabled(prev => !prev);
  };

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
    console.log('Current playStatus:', playStatus);
    
    // First handle the pause case which doesn't need special handling
    if (playStatus) {
      console.log('Attempting to pause...');
      pause();
      return;
    }
    
    console.log('Attempting to play...');
    
    // Initialize audio context
    if (window._audioContext && window._audioContext.state === 'suspended') {
      console.log('Resuming suspended AudioContext...');
      window._audioContext.resume().catch(() => console.error('Error resuming AudioContext'));
    }
    
    // Create a new audio context if none exists
    if (!window._audioContext && window.AudioContext) {
      try {
        window._audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('Created new AudioContext');
      } catch (err) {
        console.error('Failed to create AudioContext:', err);
      }
    }
    
    // Check audio reference and source
    if (!audioRef.current) {
      console.error('Audio reference not available');
      
      // Attempt to get the track started anyway
      if (track) {
        console.log('Trying to force play even without audio reference');
        setTimeout(() => play(), 100);
      }
      return;
    }
    
    if (!audioRef.current.src && track && track.file) {
      console.log('Setting audio source directly:', track.file);
      audioRef.current.src = track.file;
      audioRef.current.load();
    } else if (!audioRef.current.src) {
      console.error('No audio source available and no track.file to use');
      return;
    }
    
    // Special handling for mobile browsers and Safari
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
        /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
      console.log('Mobile device or Safari detected, using special unlock method');
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
          console.log('Audio unlocked by silent play');
          
          // Now try to play the actual audio
          play();
        }, 20);
      }).catch(e => {
        console.log('Silent play failed:', e);
        document.body.removeChild(silent);
        
        // Try direct play anyway
        play();
      });
    } catch (e) {
      // For browsers that don't support promises on play
      console.log('Silent play failed (no promise support):', e);
      try {
        document.body.removeChild(silent);
      } catch (removeError) {
        console.log('Error removing silent audio element:', removeError);
      }
      
      // Try direct play anyway
      play();
    }
  };

  // Add event listeners to help with autoplay restrictions
  useEffect(() => {
    // Create one-time unlock function for first user interaction
    const unlockAudioOnFirstInteraction = () => {
      console.log('User interaction detected, preparing audio playback capability');
      
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

  // Progress bar on mobile
  const handleProgressTouchStart = (e) => {
    e.stopPropagation();
    setIsTouchingProgressBar(true);
  };

  const handleProgressTouchEnd = (e) => {
    e.stopPropagation();
    setIsTouchingProgressBar(false);
  };

  // Volume control on mobile
  const handleVolumeTouchStart = (e) => {
    e.stopPropagation();
    setIsTouchingVolumeControl(true);
  };

  const handleVolumeTouchEnd = (e) => {
    e.stopPropagation();
    setIsTouchingVolumeControl(false);
  };

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
        
        /* Reduce animation and blur during playback to improve performance */
        .mobile-player-overlay {
          backface-visibility: hidden;
          transform: translateZ(0);
          perspective: 1000;
          will-change: transform;
          transition: transform 0.2s ease-out;
        }
        
        /* Prevent text selection during touch */
        .player-container * {
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
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

  // If there's no track to play, don't render anything
  if (!track) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed left-0 w-full z-50 player-container"
        style={{ bottom: isSmallScreen ? '50px' : '0' }}
        ref={playerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Mobile Player (full controls) */}
        {isSmallScreen && showExtraControls && !hidePlayer && (
          <div className="fixed inset-0 bottom-[50px] bg-black/95 flex flex-col p-4 z-40 mobile-player-overlay">
            {/* Close button */}
            <div className="flex justify-between items-center mb-6">
              <div className="w-8"></div> {/* Spacer */}
              <h3 className="font-bold text-white text-lg">Now Playing</h3>
              <button 
                onClick={() => setShowExtraControls(false)}
                className="w-8 h-8 text-white/80 hover:text-white flex items-center justify-center"
              >
                &times;
              </button>
            </div>
            
            {/* Album art & song info */}
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="w-64 h-64 rounded-lg overflow-hidden shadow-2xl border border-neutral-800">
                <img 
                  src={track.image} 
                  alt={track.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-1">{track.name}</h2>
                <p className="text-neutral-400">{track.artist || track.album}</p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full mb-6">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                <span>{formatTime(time.currentTime.minute, time.currentTime.second)}</span>
                <span>{formatTime(time.totalTime.minute, time.totalTime.second)}</span>
              </div>
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
                className="w-full accent-fuchsia-600 h-1 cursor-pointer"
              />
            </div>
            
            {/* Controls */}
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex items-center justify-evenly">
                <button
                  onClick={() => { shuffle(); handleShuffle(); }}
                  className={`text-2xl ${shuffleActive ? "text-fuchsia-500" : "text-neutral-400"}`}
                >
                  <MdShuffle />
                </button>
                <button 
                  onClick={Previous}
                  className="text-2xl text-neutral-400"
                >
                  <FaStepBackward />
                </button>
                <button
                  onClick={handlePlayPause}
                  className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white rounded-full p-4 shadow-lg text-2xl"
                >
                  {playStatus ? <FaPause /> : <FaPlay />}
                </button>
                <button 
                  onClick={Next}
                  className="text-2xl text-neutral-400"
                >
                  <FaStepForward />
                </button>
                <button
                  onClick={toggleLoop}
                  className={`text-2xl ${loop ? "text-fuchsia-500" : "text-neutral-400"}`}
                >
                  <MdRepeat />
                </button>
              </div>
              
              <div className="flex items-center justify-evenly">
                <button
                  onClick={() => toggleFavorite(track._id)}
                  className={`text-xl ${isFavorite(track._id) ? "text-fuchsia-500" : "text-neutral-400"}`}
                >
                  <FaHeart />
                </button>
                <button
                  onClick={toggleQueue}
                  className={`text-xl ${showQueue ? "text-fuchsia-500" : "text-neutral-400"}`}
                >
                  <MdQueueMusic />
                </button>
                <button
                  onClick={toggleLyrics}
                  className={`text-xl ${showLyrics ? "text-fuchsia-500" : "text-neutral-400"}`}
                >
                  <MdOutlineLyrics />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMute}
                    className="text-xl text-neutral-400"
                  >
                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                  <input
                    ref={volumeControlRef}
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    onTouchStart={handleVolumeTouchStart}
                    onTouchEnd={handleVolumeTouchEnd}
                    className="w-16 accent-fuchsia-600 cursor-pointer h-1 volume-slider"
                    disabled={isMuted}
                  />
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <span className="text-xs">Autoplay</span>
                  <div
                    onClick={handleAutoplayToggle}
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${autoplayEnabled ? "bg-fuchsia-600" : "bg-neutral-600"}`}
                  >
                    <div
                      className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${
                        autoplayEnabled ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main player bar - always visible when track is playing */}
        <div className={`flex items-center justify-between px-4 py-2 bg-black/95 border-t border-neutral-800 backdrop-blur-xl gap-4 ${hidePlayer ? 'compact-player' : ''}`}>
          {/* Song Info - clickable on mobile to show full player */}
          <div 
            className={`flex items-center gap-3 min-w-[80px] ${isSmallScreen ? "flex-1" : "w-[25%]"}`}
            onClick={() => isSmallScreen && setShowExtraControls(true)}
          >
            <img
              src={track.image}
              alt={track.name}
              className="w-10 h-10 rounded object-cover border border-neutral-800"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white truncate max-w-[120px]">{track.name}</span>
              <span className="text-xs text-neutral-400 truncate max-w-[120px]">{track.artist || track.album}</span>
            </div>
            {isSmallScreen && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(track._id);
                }}
                className={`ml-auto ${isFavorite(track._id) ? "text-fuchsia-500" : "text-neutral-400"}`}
              >
                <FaHeart />
              </button>
            )}
          </div>

          {/* Controls + Progress - hidden on small screens when extended view is not shown */}
          {(!isSmallScreen || !showExtraControls) && (
            <div className={`flex flex-col items-center ${isSmallScreen ? "hidden" : "w-[50%] max-w-md"}`}>
            <div className="flex items-center gap-3 mb-0.5">
              <button
                onClick={() => { shuffle(); handleShuffle(); }}
                className={`text-base transition ${shuffleActive ? "text-fuchsia-500" : "text-neutral-400 hover:text-fuchsia-500"}`}
                title="Shuffle"
              >
                <FaRandom />
              </button>
              <button onClick={Previous} className="text-base text-neutral-400 hover:text-fuchsia-500 transition" title="Previous">
                <FaStepBackward />
              </button>
              <button
                  onClick={handlePlayPause}
                className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform border-2 border-fuchsia-800 text-lg"
                title={playStatus ? "Pause" : "Play"}
              >
                  {playStatus ? <FaPause /> : <FaPlay className="relative ml-0.5" />}
              </button>
              <button onClick={Next} className="text-base text-neutral-400 hover:text-fuchsia-500 transition" title="Next">
                <FaStepForward />
              </button>
              <button
                  onClick={toggleLoop}
                className={`text-base transition ${loop ? "text-fuchsia-500" : "text-neutral-400 hover:text-fuchsia-500"}`}
                title="Repeat"
              >
                <FaRedo />
              </button>
            </div>
            {/* Progress Bar */}
            <div className="flex items-center gap-1 w-full">
              <span className="text-[10px] text-neutral-400 min-w-[28px]">{formatTime(time.currentTime.minute, time.currentTime.second)}</span>
              <input
                type="range"
                min={0}
                max={durationSec || 1}
                step={0.1}
                value={currentSec}
                onChange={handleSeek}
                onTouchStart={handleProgressTouchStart}
                onTouchEnd={handleProgressTouchEnd}
                className="w-full accent-fuchsia-600 h-1 cursor-pointer"
              />
              <span className="text-[10px] text-neutral-400 min-w-[28px]">{formatTime(time.totalTime.minute, time.totalTime.second)}</span>
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
                className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white rounded-full p-2 shadow-md flex items-center justify-center w-8 h-8"
              >
                {playStatus ? <FaPause className="text-sm" /> : <FaPlay className="text-sm ml-0.5" />}
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  Next();
                }}
                className="text-sm text-neutral-400 flex items-center justify-center w-6 h-6"
              >
                <FaStepForward />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMute();
                }}
                className="text-sm text-neutral-400 flex items-center justify-center w-6 h-6"
              >
                {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
            </div>
          )}

          {/* Volume + Extras - hidden on mobile */}
          {!isSmallScreen && (
            <div className="flex items-center gap-4 min-w-[90px] w-[25%] justify-end">
              <button 
                onClick={() => toggleFavorite(track._id)}
                className={`text-base transition ${isFavorite(track._id) ? "text-fuchsia-500" : "text-neutral-400 hover:text-fuchsia-500"}`}
                title="Like"
              >
                <FaHeart />
              </button>
              <button 
                onClick={toggleQueue}
                className={`text-base transition ${showQueue ? "text-fuchsia-500" : "text-neutral-400 hover:text-fuchsia-500"}`}
                title="Queue"
              >
                <MdQueueMusic />
              </button>
              <button
                onClick={handleMute}
                className="text-base text-neutral-400 hover:text-fuchsia-500 transition"
                title={isMuted ? "Unmute" : "Mute"}
              >
              {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
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
              className="w-16 accent-fuchsia-600 cursor-pointer h-1 volume-slider"
              disabled={isMuted}
            />
              <button 
                className="text-base text-neutral-400 hover:text-fuchsia-500 transition"
                title="Devices"
              >
                <MdDevices />
              </button>
              <div className="flex items-center gap-1 ml-2 text-neutral-400">
                <span className="text-[10px]">Autoplay</span>
                <div
                  onClick={handleAutoplayToggle}
                  className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${autoplayEnabled ? "bg-fuchsia-600" : "bg-neutral-600"}`}
                >
                  <div
                    className={`absolute w-3 h-3 bg-white rounded-full top-0.5 transition-transform ${
                      autoplayEnabled ? "translate-x-[18px]" : "translate-x-0.5"
                    }`}
                  ></div>
                </div>
              </div>
          </div>
          )}
        </div>
        
        {/* Queue panel */}
        <QueueComponent isOpen={showQueue && !hidePlayer} onClose={() => setShowQueue(false)} />
      </div>
    </AnimatePresence>
  );
};

export default PremiumPlayer; 