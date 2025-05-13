import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { PlayerContext } from "../context/PlayerContext";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const Player = () => {
  const {
    track,
    seekBar,
    seekBg,
    playStatus,
    play,
    pause,
    time,
    Previous,
    Next,
    seekSong,
    shuffle,
    toggleLoop,
    changeVolume,
    volumeRef,
    loop,
    getArtistName,
  } = useContext(PlayerContext);

  return track ? (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="h-20 bg-black/90 flex justify-between items-center text-white px-4 rounded-xl shadow-2xl"
    >
      {/* Left - Song Info */}
      <div className="hidden lg:flex items-center gap-4 w-[20%]">
        <img className="w-12" src={track.image} alt={track.name} />
        <div>
          <p>{track.name}</p>
          <p className="text-sm text-gray-400">{getArtistName(track)}</p>
        </div>
      </div>

      {/* Center - Controls */}
      <div className="flex flex-col items-center gap-1 w-[60%] m-auto">
        {/* Control Icons */}
        <div className="flex items-center gap-5">
          <img
            className="w-4 cursor-pointer"
            src={assets.shuffle_icon}
            onClick={shuffle}
            alt="Shuffle"
          />
          <img
            className="w-4 cursor-pointer"
            src={assets.prev_icon}
            onClick={Previous}
            alt="Previous"
          />
          {playStatus ? (
            <img
              onClick={pause}
              className="w-4 cursor-pointer"
              src={assets.pause_icon}
              alt="Pause"
            />
          ) : (
            <img
              onClick={play}
              className="w-4 cursor-pointer"
              src={assets.play_icon}
              alt="Play"
            />
          )}
          <img
            className="w-4 cursor-pointer"
            src={assets.next_icon}
            onClick={Next}
            alt="Next"
          />
          <img
            className={`w-4 cursor-pointer ${loop ? "opacity-100" : "opacity-40"}`}
            onClick={toggleLoop}
            src={assets.loop_icon}
            alt="Loop"
          />
        </div>

        {/* Seek Bar */}
        <div className="flex items-center gap-3 text-xs">
          <p>
            {time.currentTime.minute}:{time.currentTime.second.toString().padStart(2, "0")}
          </p>
          <div
            ref={seekBg}
            onClick={seekSong}
            className="w-[60vw] max-w-[500px] bg-gray-300 rounded-full cursor-pointer"
          >
            <hr
              ref={seekBar}
              className="h-1 border-none w-0 bg-green-800 rounded-full"
            />
          </div>
          <p>
            {time.totalTime.minute}:{time.totalTime.second.toString().padStart(2, "0")}
          </p>
        </div>
      </div>

      {/* Right - Extra Icons */}
      <div className="hidden lg:flex items-center gap-4 w-[20%] justify-end">
        <img className="w-4 cursor-pointer" src={assets.mic_icon} alt="Mic" />
        <img className="w-4 cursor-pointer" src={assets.queue_icon} alt="Queue" />
        <img className="w-4 cursor-pointer" src={assets.mini_player_icon} alt="" />
        <div className="flex items-center gap-2">
          <img className="w-4" src={assets.speaker_icon} alt="Volume" />
          <input
            ref={volumeRef}
            type="range"
            min="0"
            max="100"
            defaultValue="100"
            onChange={changeVolume}
            className="w-20"
          />
        </div>
        <img className="w-4 cursor-pointer" src={assets.zoom_icon} alt="" />
      </div>
    </motion.div>
  ) : null;
};

export default Player;
