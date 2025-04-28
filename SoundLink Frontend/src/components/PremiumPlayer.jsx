import React, { useContext, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { AnimatePresence } from "framer-motion";
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaRandom, FaRedo, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { MdDevices } from "react-icons/md";

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
    setLoop,
    audioRef,
    time,
  } = useContext(PlayerContext);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffleActive, setShuffleActive] = useState(false);

  // Volume control
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, audioRef]);

  const handleMute = () => setIsMuted((m) => !m);
  const handleShuffle = () => setShuffleActive((s) => !s);

  // Seek bar logic
  const durationSec = (time.totalTime.minute * 60) + time.totalTime.second;
  const currentSec = (time.currentTime.minute * 60) + time.currentTime.second;
  const handleSeek = (e) => {
    const val = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = val;
  };

  if (!track) return null;

  return (
    <AnimatePresence>
      <div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed bottom-0 left-0 w-full z-50"
      >
        <div className="flex items-center justify-between px-4 py-2 bg-black/95 border-t border-neutral-800 backdrop-blur-xl gap-4 h-16">
          {/* Song Info */}
          <div className="flex items-center gap-3 min-w-[120px] w-[25%]">
            <img
              src={track.image}
              alt={track.name}
              className="w-8 h-8 rounded object-cover border border-neutral-800"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate max-w-[80px]">{track.name}</span>
              <span className="text-[10px] text-neutral-400 truncate max-w-[80px]">{track.artist || track.album}</span>
            </div>
          </div>
          {/* Controls + Progress */}
          <div className="flex flex-col items-center w-[50%] max-w-md">
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
                onClick={playStatus ? pause : play}
                className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform border-2 border-fuchsia-800 text-lg"
                title={playStatus ? "Pause" : "Play"}
              >
                {playStatus ? <FaPause /> : <FaPlay />}
              </button>
              <button onClick={Next} className="text-base text-neutral-400 hover:text-fuchsia-500 transition" title="Next">
                <FaStepForward />
              </button>
              <button
                onClick={() => setLoop(!loop)}
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
          {/* Volume + Devices */}
          <div className="flex items-center gap-2 min-w-[90px] w-[25%] justify-end">
            <button onClick={handleMute} className="text-base text-neutral-400 hover:text-fuchsia-500 transition" title={isMuted ? "Unmute" : "Mute"}>
              {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-12 accent-fuchsia-600 cursor-pointer"
              disabled={isMuted}
            />
            <button className="text-base text-neutral-400 hover:text-fuchsia-500 transition" title="Devices"><MdDevices /></button>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default PremiumPlayer; 