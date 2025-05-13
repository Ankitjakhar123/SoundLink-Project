import React, { useContext, useEffect } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { FaPlay, FaTrash, FaArrowUp, FaArrowDown, FaPause } from "react-icons/fa";
import { MdQueueMusic, MdClose, MdDragHandle } from "react-icons/md";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";

const QueueComponent = ({ isOpen, onClose }) => {
  const {
    songsData,
    track,
    playWithId,
    queueSongs,
    removeFromQueue,
    clearQueue,
    themeColors,
    getArtistName,
  } = useContext(PlayerContext);
  
  useEffect(() => {
    if (track && songsData.length > 0) {
      // If we have queue songs, show those
      if (queueSongs && queueSongs.length > 0) {
        // Queue songs already available in the context
      } else {
        // Otherwise show next songs from the current list
        const currentIndex = songsData.findIndex(item => item._id === track._id);
        if (currentIndex !== -1 && currentIndex < songsData.length - 1) {
          // Next songs are available from songsData
        }
      }
    }
  }, [track, songsData, queueSongs]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 bottom-0 w-full md:w-96 z-50 shadow-2xl"
        style={{ 
          backgroundColor: themeColors.secondary,
          color: themeColors.text,
          borderLeft: `1px solid ${themeColors.text}20`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" 
          style={{ borderColor: `${themeColors.text}20` }}>
          <h2 className="text-lg font-bold" style={{ color: themeColors.text }}>Queue</h2>
          <div className="flex gap-4">
            <button 
              onClick={clearQueue}
              className="text-sm px-3 py-1 rounded-full"
              style={{ 
                backgroundColor: `${themeColors.text}20`,
                color: themeColors.text
              }}
            >
              Clear
            </button>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full"
              style={{ 
                backgroundColor: `${themeColors.text}20`,
                color: themeColors.text
              }}
            >
              <MdClose />
            </button>
          </div>
        </div>

        {/* Now Playing */}
        {track && (
          <div className="p-4 border-b" style={{ borderColor: `${themeColors.text}20` }}>
            <p className="text-xs mb-2" style={{ color: `${themeColors.text}80` }}>Now Playing</p>
            <div className="flex items-center gap-3">
              <img 
                src={track.image} 
                alt={track.name}
                className="w-12 h-12 rounded object-cover" 
              />
              <div>
                <p className="font-medium" style={{ color: themeColors.text }}>{track.name}</p>
                <p className="text-sm" style={{ color: `${themeColors.text}80` }}>{getArtistName(track)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Queue List */}
        <div className="overflow-y-auto h-[calc(100%-140px)]">
          {queueSongs.length > 0 ? (
            <div className="p-2">
              {queueSongs.map((song, index) => (
                <div 
                  key={`${song._id}-${index}`}
                  className="flex items-center gap-3 p-2 rounded-lg mb-1 cursor-pointer hover:bg-opacity-10"
                  style={{ 
                    backgroundColor: `${themeColors.text}05`,
                    borderLeft: `3px solid ${themeColors.primary}80`
                  }}
                  onClick={() => playWithId(song._id)}
                >
                  <MdDragHandle className="text-lg cursor-grab" style={{ color: `${themeColors.text}60` }} />
                  <img 
                    src={song.image} 
                    alt={song.name}
                    className="w-10 h-10 rounded object-cover" 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: themeColors.text }}>{song.name}</p>
                    <p className="text-xs truncate" style={{ color: `${themeColors.text}80` }}>{song.artist || song.album}</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(index);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full"
                    style={{ 
                      backgroundColor: `${themeColors.text}20`,
                      color: themeColors.text
                    }}
                  >
                    <MdClose size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <p className="text-lg font-medium mb-2" style={{ color: themeColors.text }}>Your queue is empty</p>
              <p className="text-sm" style={{ color: `${themeColors.text}80` }}>
                Add songs to your queue by clicking the "Add to Queue" option on any song
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QueueComponent; 