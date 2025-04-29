import React, { useContext, useState, useEffect } from "react";
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
  } = useContext(PlayerContext);
  
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffleActive, setShuffleActive] = useState(false);
  const [showExtraControls, setShowExtraControls] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

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
  
  // Fix for the play/pause button to correctly toggle
  const handlePlayPause = () => {
    if (playStatus) {
      pause();
    } else {
      play();
    }
  };

  // Add event listeners to help with autoplay restrictions
  useEffect(() => {
    const unlockAudio = () => {
      // This is a common technique to unlock audio on mobile devices
      // that require user interaction before playing audio
      if (audioRef.current) {
        const silentPlay = () => {
          const context = new (window.AudioContext || window.webkitAudioContext)();
          context.resume().then(() => {
            if (!playStatus && audioRef.current) {
              const originalVolume = audioRef.current.volume;
              audioRef.current.volume = 0;
              audioRef.current.play().then(() => {
                audioRef.current.pause();
                audioRef.current.volume = originalVolume;
              }).catch(error => {
                console.error("Silent play failed:", error);
              });
            }
          });
        };

        silentPlay();
      }
    };

    // Listen for user interaction to unlock audio
    const events = ['touchstart', 'touchend', 'mousedown', 'keydown'];
    events.forEach(event => {
      document.documentElement.addEventListener(event, unlockAudio, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.documentElement.removeEventListener(event, unlockAudio);
      });
    };
  }, [audioRef, playStatus]);

  if (!track) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed bottom-0 left-0 w-full z-50"
      >
        {/* Mobile Player (full controls) */}
        {isSmallScreen && showExtraControls && (
          <div className="fixed inset-0 bg-black/95 flex flex-col p-4 z-50">
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
                type="range"
                min={0}
                max={durationSec || 1}
                step={0.1}
                value={currentSec}
                onChange={handleSeek}
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
                <button
                  onClick={handleMute}
                  className="text-xl text-neutral-400"
                >
                  {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
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

        {/* Main player bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-black/95 border-t border-neutral-800 backdrop-blur-xl gap-4">
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
                  {playStatus ? <FaPause /> : <FaPlay />}
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
                  className="w-full accent-fuchsia-600 h-1 cursor-pointer"
                />
                <span className="text-[10px] text-neutral-400 min-w-[28px]">{formatTime(time.totalTime.minute, time.totalTime.second)}</span>
              </div>
            </div>
          )}

          {/* Mobile controls - when not in expanded view */}
          {isSmallScreen && !showExtraControls && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayPause}
                className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white rounded-full p-1.5 text-sm"
              >
                {playStatus ? <FaPause /> : <FaPlay />}
              </button>
              <button 
                onClick={Next}
                className="text-sm text-neutral-400"
              >
                <FaStepForward />
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
                className="w-16 accent-fuchsia-600 cursor-pointer h-1"
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
                      autoplayEnabled ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Queue panel */}
        <QueueComponent isOpen={showQueue} onClose={() => setShowQueue(false)} />
      </div>
    </AnimatePresence>
  );
};

export default PremiumPlayer; 