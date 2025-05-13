import React, { useState, useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const CreditsSection = ({ track }) => {
  const { themeColors, getArtistName, getAlbumName } = useContext(PlayerContext);
  const [showAllCredits, setShowAllCredits] = useState(false);
  
  const artistName = getArtistName(track);
  const albumName = getAlbumName(track);
  const releaseYear = track?.year || (track?.metadata && track.metadata.year) || '2023';
  
  // Example credits data - in a real app, this would come from an API
  const basicCredits = [
    { role: 'Artist', name: artistName },
    { role: 'Album', name: albumName },
    { role: 'Released', name: releaseYear },
  ];
  
  const extendedCredits = [
    ...basicCredits,
    { role: 'Writers', name: track?.composer || track?.writer || 'Songwriter 1, Songwriter 2' },
    { role: 'Producers', name: track?.producer || 'Producer Name' },
    { role: 'Label', name: track?.label || (track?.metadata && track.metadata.label) || 'Record Label' },
    { role: 'Mixing', name: track?.engineer || 'Sound Engineer' },
    { role: 'Mastering', name: track?.mastering || 'Mastering Engineer' },
    { role: 'Artwork', name: track?.artwork || 'Graphic Designer' },
  ];
  
  const creditsToShow = showAllCredits ? extendedCredits : basicCredits;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-bold" style={{ color: themeColors.text }}>
          Credits
        </h3>
        <button 
          className="text-xs px-2 py-1 rounded-full"
          style={{ color: themeColors.accent }}
          onClick={() => setShowAllCredits(prev => !prev)}
        >
          {showAllCredits ? 'Show less' : 'Show all'}
        </button>
      </div>
      
      <AnimatePresence>
        <motion.div 
          className="space-y-1"
          initial={{ height: 'auto' }}
          animate={{ height: 'auto' }}
          exit={{ height: 'auto' }}
        >
          {creditsToShow.map((credit, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm opacity-70" style={{ color: themeColors.text }}>
                {credit.role}
              </span>
              <span className="text-sm" style={{ color: themeColors.text }}>
                {credit.name}
              </span>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CreditsSection; 