import React, { useContext } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerContext } from '../context/PlayerContext';
import { FaHeart, FaRegHeart, FaPlus, FaEllipsisH } from 'react-icons/fa';
import { 
  MdOutlineQueueMusic, 
  MdRadio, 
  MdOutlineShare, 
  MdPerson, 
  MdAlbum,
  MdDownload,
  MdClose
} from 'react-icons/md';

const MoreOptionsSheet = ({ isOpen, onClose, trackId }) => {
  const { toggleFavorite, isFavorite, track, themeColors, getArtistName, getAlbumName } = useContext(PlayerContext);

  if (!isOpen || !track) return null;

  const optionItems = [
    {
      icon: isFavorite(trackId) ? <FaHeart /> : <FaRegHeart />,
      label: isFavorite(trackId) ? 'Remove from Liked Songs' : 'Like',
      action: () => {
        toggleFavorite(trackId);
        onClose();
      }
    },
    {
      icon: <FaPlus />,
      label: 'Add to playlist',
      action: () => {
        console.log('Add to playlist');
        onClose();
      }
    },
    {
      icon: <MdOutlineQueueMusic />,
      label: 'Add to queue',
      action: () => {
        console.log('Add to queue');
        onClose();
      }
    },
    {
      icon: <MdRadio />,
      label: 'Go to radio',
      action: () => {
        console.log('Go to radio');
        onClose();
      }
    },
    {
      icon: <MdPerson />,
      label: 'Go to artist',
      action: () => {
        console.log('Go to artist');
        onClose();
      }
    },
    {
      icon: <MdAlbum />,
      label: 'Go to album',
      action: () => {
        console.log('Go to album');
        onClose();
      }
    },
    {
      icon: <MdOutlineShare />,
      label: 'Share',
      action: () => {
        console.log('Share song');
        onClose();
      }
    },
    {
      icon: <MdDownload />,
      label: 'Download',
      action: () => {
        console.log('Download song');
        onClose();
      }
    },
    {
      icon: <FaEllipsisH />,
      label: 'About recommendations',
      action: () => {
        console.log('About recommendations');
        onClose();
      }
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50"
            onClick={onClose}
          />
          
          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-xl"
            style={{ 
              backgroundColor: themeColors.secondary,
              color: themeColors.text
            }}
          >
            {/* Sheet handle */}
            <div className="w-full flex justify-center py-2">
              <div className="w-10 h-1 rounded-full bg-gray-400/30"></div>
            </div>
            
            {/* Track header */}
            <div className="flex items-center px-4 py-3 border-b" style={{ borderColor: `${themeColors.text}20` }}>
              <div className="w-12 h-12 rounded overflow-hidden mr-3">
                <img 
                  src={track.image} 
                  alt={track.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold truncate" style={{ color: themeColors.text }}>
                  {track.name}
                </h3>
                <p className="text-sm truncate" style={{ color: `${themeColors.text}99` }}>
                  {getArtistName(track)} • {getAlbumName(track)}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ backgroundColor: `${themeColors.text}10` }}
              >
                <MdClose size={18} style={{ color: themeColors.text }} />
              </button>
            </div>
            
            {/* Options list */}
            <div className="py-2">
              {optionItems.map((item, index) => (
                <button
                  key={index}
                  className="w-full flex items-center px-4 py-3 hover:bg-white/5"
                  onClick={item.action}
                >
                  <div className="w-8 h-8 flex items-center justify-center mr-4" style={{ color: item.label.includes('Like') && isFavorite(trackId) ? themeColors.accent : themeColors.text }}>
                    {item.icon}
                  </div>
                  <span className="text-base" style={{ color: themeColors.text }}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Safe area padding for iOS */}
            <div className="h-6"></div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MoreOptionsSheet; 