import React from 'react';
import { motion } from 'framer-motion';
import { MdMusicNote, MdQueueMusic, MdFavorite, MdPlaylistPlay } from 'react-icons/md';

const PremiumLoading = () => {
  const features = [
    {
      icon: <MdMusicNote className="text-4xl" />,
      text: "High-quality music streaming"
    },
    {
      icon: <MdQueueMusic className="text-4xl" />,
      text: "Smart queue management"
    },
    {
      icon: <MdFavorite className="text-4xl" />,
      text: "Personalized recommendations"
    },
    {
      icon: <MdPlaylistPlay className="text-4xl" />,
      text: "Create and share playlists"
    }
  ];

  // Floating music notes animation
  const floatingNotes = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100 - 50,
    y: Math.random() * 100 - 50,
    delay: i * 0.2,
    duration: 2 + Math.random() * 2,
  }));

  return (
    <div className="fixed inset-0 bg-black-true text-white flex items-center justify-center p-2 pt-40 pb-40 lg:pl-72 lg:pt-20 lg:pb-20 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/20 via-purple-600/20 to-pink-600/20 animate-gradient-shift" />
      
      {/* Floating music notes */}
      {floatingNotes.map((note) => (
        <motion.div
          key={note.id}
          className="absolute text-fuchsia-500/30"
          initial={{ 
            x: `${note.x}%`, 
            y: `${note.y}%`,
            opacity: 0,
            scale: 0.5
          }}
          animate={{ 
            x: [`${note.x}%`, `${note.x + 10}%`, `${note.x}%`],
            y: [`${note.y}%`, `${note.y - 20}%`, `${note.y}%`],
            opacity: [0, 0.5, 0],
            scale: [0.5, 1, 0.5],
            rotate: [0, 360]
          }}
          transition={{
            duration: note.duration,
            repeat: Infinity,
            delay: note.delay,
            ease: "easeInOut"
          }}
        >
          <MdMusicNote className="text-4xl" />
        </motion.div>
      ))}

      <div className="max-w-2xl w-full relative z-10 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto lg:pr-4">
        {/* Logo and Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
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
          <p className="text-lg text-neutral-400">
            Your premium music streaming experience is loading...
          </p>
        </motion.div>

        {/* Loading Animation */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-12"
        >
          <div className="relative">
            {/* Outer ring */}
            <motion.div
              className="absolute inset-0 border-4 border-fuchsia-500/40 rounded-full"
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
              className="absolute inset-0 border-4 border-purple-500/40 rounded-full"
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
              className="absolute inset-0 border-4 border-pink-500/40 rounded-full"
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
              className="w-24 h-24 flex items-center justify-center"
              animate={{
                rotate: 360
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <MdMusicNote className="text-4xl text-fuchsia-500" />
            </motion.div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="bg-neutral-900/50 backdrop-blur-sm p-6 rounded-xl border border-neutral-800 flex flex-col items-center text-center hover:border-fuchsia-500/50 transition-colors"
            >
              <motion.div 
                className="text-fuchsia-500 mb-3"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
              >
                {feature.icon}
              </motion.div>
              <p className="text-neutral-300">{feature.text}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Loading Text */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-8 text-neutral-400"
        >
          <motion.p
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Preparing your premium experience...
          </motion.p>
          <p className="text-sm mt-2">This may take a few moments on first load</p>
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumLoading; 