import React, { useContext, useEffect } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { FaPlay, FaTrash, FaArrowUp, FaArrowDown, FaPause } from "react-icons/fa";
import { MdQueueMusic, MdClose, MdDragHandle } from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";

const QueueComponent = ({ isOpen, onClose }) => {
  const {
    songsData,
    track,
    playWithId,
    queueSongs,
    removeFromQueue,
    clearQueue,
    getArtistName,
  } = useContext(PlayerContext);

  useEffect(() => {
    if (track && songsData.length > 0) {
      if (queueSongs && queueSongs.length > 0) {
        // Queue songs already available in the context
      } else {
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
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: "25%" }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(event, info) => {
          if (info.offset.y > 200) {
            onClose();
          }
        }}
        className="fixed bottom-0 left-0 right-0 h-[75vh] z-50 rounded-t-2xl shadow-2xl overflow-hidden"
        style={{ 
          backgroundColor: '#000000',
          color: '#ffffff',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          touchAction: 'none'
        }}
      >
        {/* Header with drag handle */}
        <div className="flex flex-col items-center pt-2 pb-1">
          <div className="w-12 h-1 rounded-full bg-white/20 mb-2"></div>
          <div className="flex items-center justify-between w-full px-4">
            <h2 className="text-lg font-bold text-white">Queue</h2>
            <div className="flex gap-4">
              <button 
                onClick={clearQueue}
                className="text-sm px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                Clear
              </button>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <MdClose />
              </button>
            </div>
          </div>
        </div>

        {/* Now Playing */}
        {track && (
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-xs mb-2 text-white/60">Now Playing</p>
            <div className="flex items-center gap-3">
              <img 
                src={track.image} 
                alt={track.name}
                className="w-12 h-12 rounded-lg object-cover shadow-lg" 
              />
              <div>
                <p className="font-medium text-white">{track.name}</p>
                <p className="text-sm text-white/60">{getArtistName(track)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Queue List */}
        <div className="overflow-y-auto h-[calc(100%-140px)] px-2">
          {queueSongs.length > 0 ? (
            <div className="py-2">
              {queueSongs.map((song, index) => (
                <div 
                  key={`${song._id}-${index}`}
                  className="flex items-center gap-3 p-2 rounded-lg mb-1 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => playWithId(song._id)}
                >
                  <MdDragHandle className="text-lg cursor-grab text-white/40" />
                  <img 
                    src={song.image} 
                    alt={song.name}
                    className="w-10 h-10 rounded-lg object-cover shadow-md" 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-white">{song.name}</p>
                    <p className="text-xs truncate text-white/60">{song.artist || song.album}</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(index);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <MdClose size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <MdQueueMusic size={48} className="text-white/20 mb-4" />
              <p className="text-lg font-medium mb-2 text-white">Your queue is empty</p>
              <p className="text-sm text-white/60">
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