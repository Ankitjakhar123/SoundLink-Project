import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DisclaimerPopup = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  
  useEffect(() => {
    // Check if disclaimer has been shown before
    const hasSeenDisclaimer = localStorage.getItem('hasSeenDisclaimer');
    
    if (!hasSeenDisclaimer) {
      setShowDisclaimer(true);
    }
  }, []);
  
  const handleAccept = () => {
    localStorage.setItem('hasSeenDisclaimer', 'true');
    setShowDisclaimer(false);
  };
  
  return (
    <AnimatePresence>
      {showDisclaimer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-neutral-900 border-2 border-fuchsia-800 rounded-xl max-w-md w-full p-6 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Educational Purpose Disclaimer
            </h2>
            
            <div className="text-white/80 mb-6 space-y-4">
              <p>
                This SoundLink application is created solely for <span className="font-semibold text-fuchsia-400">educational and portfolio purposes</span>.
              </p>
              <p>
                All media content, including songs, images, and albums featured in this application 
                are used without explicit permission from the copyright holders and are not intended 
                for commercial use or distribution.
              </p>
              <p>
                This project demonstrates technical skills in web development and 
                is not intended to infringe upon any copyrights.
              </p>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleAccept}
                className="bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white font-bold py-2 px-6 rounded-full transition-all"
              >
                I Understand
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DisclaimerPopup; 