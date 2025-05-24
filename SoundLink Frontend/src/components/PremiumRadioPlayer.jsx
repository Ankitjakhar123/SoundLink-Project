import React, { useContext, useState, useEffect, useRef } from "react";
import { RadioContext } from "../context/RadioContext";
import { AnimatePresence } from "framer-motion";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaBroadcastTower } from "react-icons/fa";
import { toast } from "react-toastify";

const PremiumRadioPlayer = () => {
  const {
    currentStation,
    isPlaying,
    playStation,
    stopStation,
    volume,
    isMuted,
    updateVolume,
    toggleMute,
  } = useContext(RadioContext);

  const [isLoading, setIsLoading] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const playerRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Add media session handling
  useEffect(() => {
    if (!currentStation) return;

    // Set up media session metadata
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentStation.name,
        artist: 'Live Radio',
        album: currentStation.language || 'Radio Station',
        artwork: [
          { 
            src: currentStation.logo || 'https://your-default-radio-logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      });

      // Set up media session action handlers
      navigator.mediaSession.setActionHandler('play', () => {
        playStation(currentStation);
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        stopStation();
      });

      // Update playback state
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }

    // Cleanup function
    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
      }
    };
  }, [currentStation, isPlaying, playStation, stopStation]);

  // Update media session state when playStatus changes
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  // Update screen size state on resize
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const handlePlayPause = async () => {
    if (isLoading) return; // Prevent multiple clicks while loading
    
    setIsLoading(true);
    try {
      if (isPlaying) {
        await stopStation();
      } else {
        // Try to play the station
        await playStation(currentStation);
      }
    } catch (error) {
      console.error("Error toggling playback:", error);
      
      // Show error toast
      toast.error("Failed to play radio station. Please try again.", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // If we were trying to play, attempt to stop any partial playback
      if (!isPlaying) {
        try {
          await stopStation();
        } catch (stopError) {
          console.error("Error stopping station after failed play:", stopError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    updateVolume(newVolume);
  };

  if (!currentStation) return null;

  return (
    <div 
      ref={playerRef}
      className="fixed left-0 w-full z-40 player-container"
      style={{ 
        bottom: isSmallScreen ? '50px' : '0',
        display: 'block',
        opacity: 1,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      <div 
        className="flex flex-col justify-between px-2 sm:px-4 py-2 border-t backdrop-blur-xl"
        style={{ 
          background: 'linear-gradient(180deg, rgba(17, 17, 17, 0.8), rgba(17, 17, 17, 0.9))',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Player controls and info */}
        <div className="flex items-center justify-between">
          {/* Station Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative">
              {/* Radio Logo Container */}
              <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center border"
                style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                <FaBroadcastTower className="text-white" size={20} />
              </div>
              {/* Live Indicator */}
              {isPlaying && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  LIVE
                </div>
              )}
              {/* Loading Spinner */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                  <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: '#a855f7', borderTopColor: 'transparent' }}></div>
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold truncate max-w-[120px] text-white">{currentStation.name}</span>
              <span className="text-xs truncate max-w-[120px] text-neutral-400">{currentStation.language || 'Live Radio'}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              style={{ color: '#a855f7' }}
              disabled={isLoading}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
          </div>

          {/* Volume Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="w-8 h-8 flex items-center justify-center"
              style={{ color: isMuted ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.8)' }}
            >
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 rounded-full appearance-none bg-white/20"
              style={{ accentColor: '#a855f7' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumRadioPlayer; 