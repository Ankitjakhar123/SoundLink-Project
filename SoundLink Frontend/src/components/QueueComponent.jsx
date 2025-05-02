import React, { useContext, useState, useEffect } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { FaPlay, FaTrash, FaArrowUp, FaArrowDown, FaPause } from "react-icons/fa";
import { MdQueueMusic } from "react-icons/md";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";

const QueueComponent = ({ isOpen, onClose }) => {
  const {
    songsData,
    track,
    playWithId,
    queueSongs,
    removeFromQueue,
    moveQueueItem,
    clearQueue,
    playStatus
  } = useContext(PlayerContext);
  
  const [upNext, setUpNext] = useState([]);
  
  useEffect(() => {
    if (track && songsData.length > 0) {
      // If we have queue songs, show those
      if (queueSongs && queueSongs.length > 0) {
        setUpNext(queueSongs);
      } else {
        // Otherwise show next songs from the current list
        const currentIndex = songsData.findIndex(item => item._id === track._id);
        if (currentIndex !== -1 && currentIndex < songsData.length - 1) {
          setUpNext(songsData.slice(currentIndex + 1, currentIndex + 11));
        }
      }
    }
  }, [track, songsData, queueSongs]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-16 right-0 w-full md:w-[400px] max-h-[70vh] overflow-y-auto bg-black/95 border border-neutral-800 backdrop-blur-xl rounded-t-xl md:rounded-tr-none shadow-xl z-[70]"
      >
        <div className="sticky top-0 flex items-center justify-between p-4 bg-neutral-900 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <MdQueueMusic size={20} className="text-fuchsia-500" />
            <h3 className="font-bold text-white">Queue</h3>
          </div>
          <div className="flex items-center gap-2">
            {queueSongs && queueSongs.length > 0 && (
              <button 
                onClick={clearQueue}
                className="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded-full hover:bg-neutral-800 transition-colors"
              >
                Clear
              </button>
            )}
            <button 
              onClick={onClose}
              className="text-neutral-400 hover:text-white"
            >
              &times;
            </button>
          </div>
        </div>
        
        <div className="p-2">
          {/* Currently playing */}
          {track && (
            <div className="mb-4">
              <div className="text-xs text-neutral-400 uppercase mb-2 px-2">Now Playing</div>
              <div className="flex items-center gap-3 bg-neutral-800/50 p-2 rounded-lg">
                <div className="relative">
                  <img 
                    src={track.image} 
                    alt={track.name} 
                    className="w-10 h-10 object-cover rounded-md"
                  />
                  {playStatus && (
                    <div className="absolute right-0 bottom-0 bg-fuchsia-500 rounded-full p-0.5 -mr-1 -mb-1 border border-black">
                      <FaPause size={8} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{track.name}</div>
                  <div className="text-xs text-neutral-400 truncate">{track.artist || track.album}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Up next */}
          {upNext.length > 0 && (
            <div>
              <div className="text-xs text-neutral-400 uppercase mb-2 px-2">Up Next</div>
              <div className="space-y-1">
                {upNext.map((song, index) => (
                  <div 
                    key={`${song._id}_${index}`}
                    className={`flex items-center gap-2 p-2 ${track && track._id === song._id ? 'bg-fuchsia-900/30' : 'hover:bg-neutral-800/30'} rounded-lg transition-colors group`}
                  >
                    <div className="w-8 h-8 bg-neutral-800 rounded-md overflow-hidden relative">
                      <img 
                        src={song.image} 
                        alt={song.name} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button
                          onClick={() => playWithId(song._id)}
                          className="text-white"
                          title="Play"
                        >
                          <FaPlay size={12} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{song.name}</div>
                      <div className="text-xs text-neutral-400 truncate">{song.artist || song.album}</div>
                    </div>
                    
                    {queueSongs && queueSongs.length > 0 && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {index > 0 && (
                          <button
                            onClick={() => moveQueueItem(index, index - 1)}
                            className="text-neutral-400 hover:text-white"
                            title="Move up"
                          >
                            <FaArrowUp size={12} />
                          </button>
                        )}
                        
                        {index < queueSongs.length - 1 && (
                          <button
                            onClick={() => moveQueueItem(index, index + 1)}
                            className="text-neutral-400 hover:text-white"
                            title="Move down"
                          >
                            <FaArrowDown size={12} />
                          </button>
                        )}
                        
                        <button
                          onClick={() => removeFromQueue(index)}
                          className="text-neutral-400 hover:text-red-500"
                          title="Remove from queue"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {upNext.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-neutral-400">No songs in queue</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QueueComponent; 