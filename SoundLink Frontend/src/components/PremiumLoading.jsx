import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { MdMusicNote, MdQueueMusic, MdFavorite, MdPlaylistPlay } from 'react-icons/md';

// Memoize feature items to prevent unnecessary re-renders
const FeatureItem = memo(({ icon, text, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 + index * 0.2 }}
    className="flex flex-col items-center min-w-[64px] md:min-w-[80px]"
  >
    <motion.div
      className="text-xl md:text-2xl text-fuchsia-500 mb-1"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
    >
      {icon}
    </motion.div>
    <span className="text-xs md:text-sm text-neutral-400 text-center">{text}</span>
  </motion.div>
));

const PremiumLoading = () => {
  const features = [
    { icon: <MdMusicNote />, text: "Premium Quality" },
    { icon: <MdQueueMusic />, text: "Smart Queue" },
    { icon: <MdFavorite />, text: "Personalized" },
    { icon: <MdPlaylistPlay />, text: "Playlists" }
  ];

  return (
    <div className="fixed inset-0 bg-black text-white flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black" />
      {/* Reduced number of particles from 6 to 3 */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-fuchsia-500/30 rounded-full"
          initial={{ x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%` }}
          animate={{ 
            x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`], 
            y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`], 
            opacity: [0, 0.3, 0] 
          }}
          transition={{ duration: 4, repeat: Infinity, delay: i * 1 }}
        />
      ))}
      <div className="relative z-10 flex flex-col items-center justify-center p-4 max-w-md w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            SoundLink
          </h1>
          <p className="text-sm text-neutral-400 mb-4">Our free backend is warming up...</p>
          <p className="text-sm text-neutral-400 italic">"Good things come to those who wait, especially when using free servers! 🎵"</p>
        </motion.div>

        <div className="relative w-20 h-20 md:w-24 md:h-24 mb-8">
          <motion.div
            className="absolute inset-0 border-2 border-fuchsia-500/30 rounded-full"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.2, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <MdMusicNote className="text-2xl md:text-3xl text-fuchsia-500" />
          </motion.div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8 w-full">
          {features.map((feature, index) => (
            <FeatureItem 
              key={index}
              icon={feature.icon}
              text={feature.text}
              index={index}
            />
          ))}
        </div>

        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-fuchsia-500"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(PremiumLoading); 