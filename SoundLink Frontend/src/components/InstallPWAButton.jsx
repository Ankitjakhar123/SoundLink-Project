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

  return 
};

export default InstallPWAButton; 