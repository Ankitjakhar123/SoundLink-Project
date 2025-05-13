import React, { useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { MdClose } from 'react-icons/md';

const LyricsPanel = ({ isOpen, onClose }) => {
  const { track, themeColors, getArtistName } = useContext(PlayerContext);
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-50 bg-black flex flex-col"
          style={{ 
            background: `linear-gradient(to bottom, ${themeColors.secondary}dd, black)`,
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: `${themeColors.text}20` }}>
            <div>
              <h3 className="text-lg font-bold" style={{ color: themeColors.text }}>Lyrics</h3>
              <p className="text-sm" style={{ color: `${themeColors.text}99` }}>{track?.name} • {getArtistName(track)}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${themeColors.text}20`, color: themeColors.text }}
            >
              <MdClose size={20} />
            </button>
          </div>
          
          {/* Lyrics content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-2xl mx-auto space-y-6 py-8">
              {track && track.lyrics ? (
                // Display actual lyrics if available
                track.lyrics.split('\n').map((line, index) => {
                  // Check if the line is a section header like [Verse], [Chorus], etc.
                  const isSectionHeader = /^\[(.*?)\]/.test(line);
                  
                  return isSectionHeader ? (
                    <p key={index} className="text-sm mt-6 mb-4 font-bold" style={{ color: `${themeColors.text}70` }}>
                      {line}
                    </p>
                  ) : (
                    <p key={index} className="text-lg mb-2" style={{ color: themeColors.text }}>
                      {line || ' '} {/* Empty lines render as space */}
                    </p>
                  );
                })
              ) : (
                // Display message when no lyrics are available
                <div className="text-center p-8">
                  <p className="text-xl font-bold mb-2" style={{ color: themeColors.text }}>
                    No lyrics available
                  </p>
                  <p className="text-sm opacity-70" style={{ color: themeColors.text }}>
                    Lyrics for this song have not been added yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LyricsPanel; 