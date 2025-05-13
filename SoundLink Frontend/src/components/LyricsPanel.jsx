import React, { useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { MdClose } from 'react-icons/md';

const LyricsPanel = ({ isOpen, onClose }) => {
  const { track, themeColors, getArtistName, getAlbumName } = useContext(PlayerContext);
  
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
            <div className="max-w-2xl mx-auto space-y-8 text-center py-8">
              {/* Example lyrics - in a real app, these would come from an API */}
              <div className="mb-6">
                <p className="text-sm mb-4 font-bold" style={{ color: `${themeColors.text}70` }}>
                  [Intro]
                </p>
                <p className="text-lg mb-2" style={{ color: themeColors.text }}>
                  This is the intro of {track?.name || 'the song'}
                </p>
                <p className="text-lg mb-2" style={{ color: themeColors.text }}>
                  By {getArtistName(track)}
                </p>
                <p className="text-lg" style={{ color: themeColors.text }}>
                  From the album {getAlbumName(track)}
                </p>
              </div>
              
              <div className="mb-6">
                <p className="text-sm mb-4 font-bold" style={{ color: `${themeColors.text}70` }}>
                  [Verse 1]
                </p>
                <p className="text-lg mb-2" style={{ color: themeColors.text }}>
                  Here are the lyrics for verse one
                </p>
                <p className="text-lg mb-2" style={{ color: themeColors.text }}>
                  They would continue line by line
                </p>
                <p className="text-lg mb-2" style={{ color: themeColors.text }}>
                  With proper spacing and formatting
                </p>
                <p className="text-lg" style={{ color: themeColors.text }}>
                  Just like on real music platforms
                </p>
              </div>
              
              <div className="mb-6">
                <p className="text-sm mb-4 font-bold" style={{ color: `${themeColors.text}70` }}>
                  [Chorus]
                </p>
                <p className="text-lg mb-2" style={{ color: themeColors.text }}>
                  This is the chorus
                </p>
                <p className="text-lg mb-2" style={{ color: themeColors.text }}>
                  It typically repeats throughout the song
                </p>
                <p className="text-lg mb-2" style={{ color: themeColors.text }}>
                  And is often the most memorable part
                </p>
                <p className="text-lg" style={{ color: themeColors.text }}>
                  That listeners can sing along to
                </p>
              </div>
              
              <div className="mb-6">
                <p className="text-sm mb-4 font-bold" style={{ color: `${themeColors.text}70` }}>
                  [Verse 2]
                </p>
                <p className="text-lg mb-2" style={{ color: themeColors.text }}>
                  The second verse continues the story
                </p>
                <p className="text-lg mb-2" style={{ color: themeColors.text }}>
                  Building on themes from the first verse
                </p>
                <p className="text-lg mb-2" style={{ color: themeColors.text }}>
                  With new details and imagery
                </p>
                <p className="text-lg" style={{ color: themeColors.text }}>
                  That develop the song's message
                </p>
              </div>
              
              <div className="mb-6">
                <p className="text-sm mb-4 font-bold" style={{ color: `${themeColors.text}70` }}>
                  [Bridge]
                </p>
                <p className="text-lg mb-2" style={{ color: themeColors.text }}>
                  The bridge provides contrast
                </p>
                <p className="text-lg mb-2" style={{ color: themeColors.text }}>
                  With a different melody or rhythm
                </p>
                <p className="text-lg" style={{ color: themeColors.text }}>
                  Before returning to the chorus
                </p>
              </div>
              
              <div>
                <p className="text-sm mb-4 font-bold" style={{ color: `${themeColors.text}70` }}>
                  [Outro]
                </p>
                <p className="text-lg mb-2" style={{ color: themeColors.text }}>
                  Finally, the outro concludes the song
                </p>
                <p className="text-lg" style={{ color: themeColors.text }}>
                  Often fading out or repeating a phrase
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LyricsPanel; 