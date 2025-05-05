import React, { useState, useEffect } from 'react';

const InstallPWAButton = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
      return;
    }

    // Create a custom installation experience
    const handleBeforeInstallPrompt = (event) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      event.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(event);
    };

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsAppInstalled(true);
      setInstallPrompt(null);
      console.log('PWA was installed');
    });

    // Clean up
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      console.log('Installation prompt not available');
      return;
    }

    // Show the installation prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the installation prompt');
    } else {
      console.log('User dismissed the installation prompt');
    }
    
    // Clear the saved prompt since it can't be used twice
    setInstallPrompt(null);
  };

  if (isAppInstalled || !installPrompt) {
    return null; // Don't show button if already installed or can't install
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-medium rounded-full hover:shadow-lg shadow-md transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 17V3" />
          <path d="m6 11 6 6 6-6" />
          <path d="M19 21H5" />
        </svg>
        Install App
      </button>
    </div>
  );
};

export default InstallPWAButton; 