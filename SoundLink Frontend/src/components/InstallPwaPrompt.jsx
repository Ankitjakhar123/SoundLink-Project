import React, { useState, useEffect } from 'react';
import { FaDownload, FaTimes, FaApple, FaAndroid, FaChrome, FaSafari, FaShare } from 'react-icons/fa';

const InstallPwaPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [installEvent, setInstallEvent] = useState(null);
  const [platform, setPlatform] = useState('unknown');
  const [browser, setBrowser] = useState('unknown');
  
  // Check for standalone mode (already installed)
  const isStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
  };

  // Hide this component permanently if dismissed
  const dismissPrompt = () => {
    localStorage.setItem('pwaPromptDismissed', 'true');
    localStorage.setItem('pwaPromptDismissedAt', Date.now().toString());
    setShowPrompt(false);
  };
  
  // Handle install button click
  const handleInstallClick = () => {
    if (installEvent) {
      installEvent.prompt();
      installEvent.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
          setShowPrompt(false);
        } else {
          console.log('User dismissed the install prompt');
        }
        setInstallEvent(null);
      });
    } else {
      // Show instructions for iOS since it doesn't support beforeinstallprompt
      if (platform === 'ios') {
        setShowPrompt(true);
      }
    }
  };
  
  // Detect platform and browser on component mount
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    
    // Detect platform
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios');
    } else if (/android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }
    
    // Detect browser
    if (/chrome|chromium|crios/.test(ua)) {
      setBrowser('chrome');
    } else if (/safari/.test(ua)) {
      setBrowser('safari');
    } else if (/firefox|fxios/.test(ua)) {
      setBrowser('firefox');
    } else if (/edge|edg/.test(ua)) {
      setBrowser('edge');
    }
    
    // Check if already seen and dismissed
    const dismissed = localStorage.getItem('pwaPromptDismissed') === 'true';
    const dismissedAt = localStorage.getItem('pwaPromptDismissedAt');
    const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
    
    const shouldShow = !dismissed || 
                       (dismissedAt && parseInt(dismissedAt) < twoWeeksAgo);
    
    // Don't show if already in standalone mode
    if (!isStandalone() && shouldShow) {
      // iOS doesn't support beforeinstallprompt, so we'll show the prompt
      // after a small delay for a better user experience
      if (platform === 'ios') {
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
      
      // For other platforms, we'll need to wait for the beforeinstallprompt event
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later
        setInstallEvent(e);
        // Show prompt after a delay for better UX
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      });
    }
    
    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      console.log('PWA was successfully installed');
    });
    
    return () => {
      window.removeEventListener('beforeinstallprompt', () => {});
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);
  
  // Don't render anything if prompt shouldn't be shown
  if (!showPrompt) return null;
  
  return (
    <div className="fixed bottom-16 left-0 right-0 mx-4 mb-4 z-50 bg-black rounded-xl overflow-hidden shadow-xl border border-neutral-800 backdrop-blur-lg">
      <div className="p-4 flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <img src="/icons/soundlink-icon.svg?v=2" alt="SoundLink" className="w-12 h-12" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">Install SoundLink App</h3>
          
          <p className="text-neutral-300 text-sm mt-1 mb-3">
            {platform === 'ios' ? (
              <>
                Tap <FaShare className="inline" /> and then "Add to Home Screen" to install
              </>
            ) : (
              "Install our app for the best music experience"
            )}
          </p>
          
          {platform !== 'ios' && (
            <button
              onClick={handleInstallClick}
              className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white py-2 px-4 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <FaDownload />
              Install Now
            </button>
          )}
          
          {platform === 'ios' && (
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <FaSafari className="text-lg" /> Safari browser required
            </div>
          )}
          
          {platform === 'android' && browser !== 'chrome' && (
            <div className="flex items-center gap-2 text-xs text-neutral-400 mt-2">
              <FaChrome className="text-lg" /> Chrome browser recommended
            </div>
          )}
        </div>
        
        <button
          onClick={dismissPrompt}
          className="text-neutral-400 hover:text-white p-1"
          aria-label="Close prompt"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default InstallPwaPrompt; 