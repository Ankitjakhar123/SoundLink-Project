import React, { useContext, useEffect, useState, useRef } from 'react';
import { PlayerContext } from '../context/PlayerContext';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { MdClose } from 'react-icons/md';

const LyricsPanel = ({ isOpen, onClose }) => {
  const { track, themeColors, getArtistName, time } = useContext(PlayerContext);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [parsedLyrics, setParsedLyrics] = useState([]);
  const lyricsContainerRef = useRef(null);
  
  // Parse the lyrics into a time-stamped format if they have timestamps
  useEffect(() => {
    if (!track || !track.lyrics) {
      setParsedLyrics([]);
      setCurrentLineIndex(0);
      return;
    }
    
    const lines = track.lyrics.split('\n');
    
    // Filter out LRC metadata headers
    const filteredLines = lines.filter(line => {
      // Skip LRC metadata headers like [id:], [ar:], [al:], [ti:], [length:], etc.
      const isMetadataHeader = /^\[(id|ar|al|ti|length|by|offset|re|ve):/i.test(line);
      return !isMetadataHeader;
    });
    
    const hasTimestamps = filteredLines.some(line => /^\[\d{2}:\d{2}\.\d{2}\]/.test(line));
    
    if (hasTimestamps) {
      // Parse lyrics with timestamps [mm:ss.xx]
      const formattedLyrics = filteredLines.map((line, index) => {
        const timeMatch = line.match(/^\[(\d{2}):(\d{2})\.(\d{2})\](.*)/);
        if (timeMatch) {
          const minutes = parseInt(timeMatch[1], 10);
          const seconds = parseInt(timeMatch[2], 10);
          const hundredths = parseInt(timeMatch[3], 10);
          const timeInSeconds = minutes * 60 + seconds + hundredths / 100;
          const text = timeMatch[4].trim();
          return { timeInSeconds, text, index };
        }
        // For section headers without timestamps
        const sectionMatch = line.match(/^\[(.*?)\]/);
        if (sectionMatch) {
          return { timeInSeconds: -1, text: line, isSectionHeader: true, index };
        }
        // For lines without timestamps
        return { timeInSeconds: -1, text: line, index };
      });
      
      setParsedLyrics(formattedLyrics);
    } else {
      // For lyrics without timestamps, just show them normally
      const formattedLyrics = filteredLines.map((line, index) => {
        const isSectionHeader = /^\[(.*?)\]/.test(line);
        return { 
          timeInSeconds: -1,
          text: line, 
          isSectionHeader, 
          index 
        };
      });
      setParsedLyrics(formattedLyrics);
    }
  }, [track]);
  
  // Update current line based on current playback time
  useEffect(() => {
    if (!parsedLyrics.length || !isOpen) return;
    
    const currentTimeInSeconds = time.currentTime.minute * 60 + time.currentTime.second;
    
    // Find the correct line based on current time
    const timedLyrics = parsedLyrics.filter(line => line.timeInSeconds >= 0);
    if (timedLyrics.length) {
      // Find the last line whose timestamp is less than or equal to current time
      for (let i = timedLyrics.length - 1; i >= 0; i--) {
        if (timedLyrics[i].timeInSeconds <= currentTimeInSeconds) {
          setCurrentLineIndex(timedLyrics[i].index);
          break;
        }
      }
    }
  }, [time, parsedLyrics, isOpen]);
  
  // Scroll to the active line
  useEffect(() => {
    if (lyricsContainerRef.current && isOpen) {
      const container = lyricsContainerRef.current;
      const activeLine = container.querySelector(`.line-${currentLineIndex}`);
      
      if (activeLine) {
        activeLine.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [currentLineIndex, isOpen]);
  
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
          <div className="flex-1 overflow-y-auto py-4 px-2 sm:px-4" ref={lyricsContainerRef}>
            <div className="max-w-2xl mx-auto space-y-1 py-4">
              {track && track.lyrics ? (
                // Display synchronized lyrics
                parsedLyrics.map((line) => {
                  // Different styling for section headers vs lines
                  if (line.isSectionHeader) {
                    return (
                      <p 
                        key={line.index} 
                        className={`text-sm mt-6 mb-2 font-bold text-center line-${line.index}`} 
                        style={{ color: `${themeColors.text}70` }}
                      >
                        {line.text}
                      </p>
                    );
                  }
                  
                  // Style for the active line vs non-active lines
                  const isActive = line.index === currentLineIndex;
                  
                  return (
                    <div className="flex justify-center">
                      <p 
                        key={line.index} 
                        className={`text-lg mb-1.5 transition-all duration-300 will-change-transform line-${line.index} px-4 py-1.5`}
                        style={{ 
                          color: isActive ? themeColors.primary : themeColors.text,
                          fontSize: isActive ? '1.25rem' : '1rem',
                          fontWeight: isActive ? '700' : '400',
                          transform: isActive ? 'scale(1.05)' : 'scale(1)',
                          transformOrigin: 'center center',
                          textShadow: isActive ? `0 0 10px ${themeColors.primary}40` : 'none',
                        }}
                      >
                        {line.text || ' '} {/* Empty lines render as space */}
                      </p>
                    </div>
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