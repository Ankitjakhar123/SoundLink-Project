import React from 'react';
import { motion } from 'framer-motion';
import { MdMusicNote, MdQueueMusic, MdFavorite, MdPlaylistPlay } from 'react-icons/md';

const PremiumLoading = () => {
  // Feature icons that will animate in sequence
  const features = [
    { icon: <MdMusicNote />, text: "Premium Quality" },
    { icon: <MdQueueMusic />, text: "Smart Queue" },
    { icon: <MdFavorite />, text: "Personalized" },
    { icon: <MdPlaylistPlay />, text: "Playlists" }
  ];

  return (
    <div className="fixed inset-0 bg-black text-white flex items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-fuchsia-900/20 via-purple-900/20 to-pink-900/20"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-fuchsia-500/30 rounded-full"
          initial={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            scale: 0
          }}
          animate={{
            x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            scale: [0, 1, 0],
            opacity: [0, 0.5, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5
          }}
        />
      ))}
      
      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center justify-center p-4 max-w-md w-full">
        {/* Logo and Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.h1 
            className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ['0%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            SoundLink
          </motion.h1>
          <p className="text-sm text-neutral-400 mb-4">
            Our free backend is warming up...
          </p>
          <p className="text-sm text-neutral-400 italic">
            "Good things come to those who wait, especially when using free servers! 🎵"
          </p>
        </motion.div>

        {/* Loading Animation */}
        <div className="relative w-24 h-24 mb-8">
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 border-2 border-fuchsia-500/30 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Middle ring */}
          <motion.div
            className="absolute inset-0 border-2 border-purple-500/30 rounded-full"
            animate={{
              scale: [1.1, 0.9, 1.1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3
            }}
          />
          {/* Inner ring */}
          <motion.div
            className="absolute inset-0 border-2 border-pink-500/30 rounded-full"
            animate={{
              scale: [0.9, 1.1, 0.9],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.6
            }}
          />
          {/* Center icon */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              rotate: 360
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <MdMusicNote className="text-3xl text-fuchsia-500" />
          </motion.div>
        </div>

        {/* Feature Icons */}
        <div className="flex justify-center gap-6 mb-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.2 }}
              className="flex flex-col items-center"
            >
              <motion.div
                className="text-2xl text-fuchsia-500 mb-1"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.3
                }}
              >
                {feature.icon}
              </motion.div>
              <span className="text-xs text-neutral-400">{feature.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Loading dots */}
        <motion.div 
          className="flex items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-fuchsia-500"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumLoading; 