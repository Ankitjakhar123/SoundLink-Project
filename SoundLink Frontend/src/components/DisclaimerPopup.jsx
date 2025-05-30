import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DisclaimerPopup = React.memo(() => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    try {
      // Check if disclaimer has been shown before
      const hasSeenDisclaimer = localStorage.getItem('hasSeenDisclaimer');
      if (!hasSeenDisclaimer) {
        setShowDisclaimer(true);
      }
    } catch (err) {
      setError('Failed to check disclaimer status');
      console.error('Disclaimer error:', err);
    }

    // Cleanup function
    return () => {
      setShowDisclaimer(false);
    };
  }, []);
  
  const handleAccept = () => {
    try {
      localStorage.setItem('hasSeenDisclaimer', 'true');
      setShowDisclaimer(false);
    } catch (err) {
      setError('Failed to save disclaimer status');
      console.error('Disclaimer save error:', err);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleAccept();
    }
    if (event.key === 'Escape') {
      setShowDisclaimer(false);
    }
  };

  if (error) {
    return (
      <div role="alert" className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }
  
  return (
    <AnimatePresence mode="wait">
      {showDisclaimer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="disclaimer-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30 
            }}
            className="bg-neutral-900 border-2 border-fuchsia-800 rounded-xl max-w-md w-full p-6 shadow-2xl"
          >
            <h2 
              id="disclaimer-title"
              className="text-2xl font-bold text-white mb-4 text-center"
            >
              Educational Purpose Disclaimer
            </h2>
            
            <div 
              className="text-white/80 mb-6 space-y-4"
              role="document"
            >
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
                onKeyDown={handleKeyPress}
                className="bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white font-bold py-2 px-6 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
                aria-label="Accept disclaimer"
              >
                I Understand
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

DisclaimerPopup.displayName = 'DisclaimerPopup';

export default DisclaimerPopup; 