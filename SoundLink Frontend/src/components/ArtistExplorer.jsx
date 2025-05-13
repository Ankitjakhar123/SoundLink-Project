import React, { useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const ArtistExplorer = ({ track }) => {
  const { themeColors, getArtistName } = useContext(PlayerContext);
  
  const artistName = getArtistName(track);
  const songName = track?.name || 'This Song';

  return (
    <div className="mb-4">
      <h3 className="text-base font-bold mb-3" style={{ color: themeColors.text }}>
        Explore
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {/* Songs by Artist card */}
        <div className="min-w-[120px] h-[160px] rounded-md overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
          <img 
            src={`https://source.unsplash.com/random/300x400/?music,artist,songs&${artistName}`} 
            alt="Artist songs" 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 p-3 z-20">
            <p className="text-white text-xs">Songs by</p>
            <p className="text-white text-sm font-bold">{artistName}</p>
          </div>
        </div>
        
        {/* Similar Artists card */}
        <div className="min-w-[120px] h-[160px] rounded-md overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
          <img 
            src={`https://source.unsplash.com/random/300x400/?music,similar,artists&${artistName}`} 
            alt="Similar artists" 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 p-3 z-20">
            <p className="text-white text-xs">Similar to</p>
            <p className="text-white text-sm font-bold">{artistName}</p>
          </div>
        </div>
        
        {/* Similar Songs card */}
        <div className="min-w-[120px] h-[160px] rounded-md overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
          <img 
            src={`https://source.unsplash.com/random/300x400/?music,similar,songs&${songName}`} 
            alt="Similar songs" 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 p-3 z-20">
            <p className="text-white text-xs">Similar to</p>
            <p className="text-white text-sm font-bold truncate max-w-[100px]">{songName}</p>
          </div>
        </div>
        
        {/* Artist Radio card */}
        <div className="min-w-[120px] h-[160px] rounded-md overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
          <img 
            src={`https://source.unsplash.com/random/300x400/?music,radio,station&${artistName}`} 
            alt="Artist radio" 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 p-3 z-20">
            <p className="text-white text-xs">Radio based on</p>
            <p className="text-white text-sm font-bold">{artistName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistExplorer; 