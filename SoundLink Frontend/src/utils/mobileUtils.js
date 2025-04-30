/**
 * Mobile utility functions for SoundLink
 * Provides helpers for device detection, battery status, and interaction optimizations
 */

/**
 * Detect if the current device is a mobile device
 * @returns {boolean} True if the device is mobile
 */
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Detect if the device is iOS
 * @returns {boolean} True if the device is an iOS device
 */
export const isIOSDevice = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

/**
 * Detect if the device is in standalone mode (installed as a PWA)
 * @returns {boolean} True if the app is running in standalone mode
 */
export const isStandaloneMode = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone || 
         document.referrer.includes('android-app://');
};

/**
 * Get the browser name
 * @returns {string} The name of the browser
 */
export const getBrowserName = () => {
  const ua = navigator.userAgent.toLowerCase();
  
  if (/chrome|chromium|crios/.test(ua)) return 'chrome';
  if (/firefox|fxios/.test(ua)) return 'firefox';
  if (/safari/.test(ua)) return 'safari';
  if (/edge|edg/.test(ua)) return 'edge';
  if (/opera|opr/.test(ua)) return 'opera';
  
  return 'unknown';
};

/**
 * Vibrate the device with a pattern
 * @param {Array|number} pattern Vibration pattern in milliseconds
 * @returns {boolean} True if vibration is supported and executed
 */
export const vibrateDevice = (pattern = 50) => {
  if (!navigator.vibrate) return false;
  
  navigator.vibrate(pattern);
  return true;
};

/**
 * Predefined vibration patterns
 */
export const vibrationPatterns = {
  success: [50],
  error: [100, 50, 100],
  warning: [50, 30, 50],
  notification: [50, 20, 20, 20, 50],
  buttonPress: [10],
  longPress: [30, 50]
};

/**
 * Check if battery is low (if Battery API is supported)
 * @returns {Promise<boolean>} True if battery level is below 15%
 */
export const isBatteryLow = async () => {
  if (!navigator.getBattery) return false;
  
  try {
    const battery = await navigator.getBattery();
    return battery.level < 0.15 && !battery.charging;
  } catch (error) {
    console.error('Battery status check failed:', error);
    return false;
  }
};

/**
 * Enable battery-aware mode (reduce animations/effects when battery is low)
 * @returns {Promise<void>}
 */
export const enableBatteryAwareMode = async () => {
  const lowBattery = await isBatteryLow();
  
  if (lowBattery) {
    document.body.classList.add('battery-saving-mode');
    
    // Disable non-essential animations
    const elements = document.querySelectorAll('.battery-aware');
    elements.forEach(el => {
      el.style.animation = 'none';
      el.style.transition = 'none';
    });
  }
};

/**
 * Share content using the Web Share API with fallback
 * @param {Object} content Content to share (title, text, url)
 * @param {Function} fallbackFn Function to call if Web Share API is not available
 * @returns {Promise<boolean>} True if sharing was successful
 */
export const shareContent = async (content, fallbackFn) => {
  if (navigator.share) {
    try {
      await navigator.share(content);
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
      if (fallbackFn) fallbackFn();
      return false;
    }
  } else {
    if (fallbackFn) fallbackFn();
    return false;
  }
};

/**
 * Lock screen orientation (for video playback)
 * @param {string} orientation Orientation to lock to ('landscape' or 'portrait')
 * @returns {Promise<boolean>} True if orientation was locked
 */
export const lockScreenOrientation = async (orientation = 'landscape') => {
  try {
    if (!screen.orientation || !screen.orientation.lock) {
      return false;
    }
    
    await screen.orientation.lock(orientation);
    return true;
  } catch (error) {
    console.error('Screen orientation lock failed:', error);
    return false;
  }
};

/**
 * Detect data saver mode
 * @returns {boolean} True if data saver is enabled
 */
export const isDataSaverEnabled = () => {
  return navigator.connection && navigator.connection.saveData === true;
};

/**
 * Get current network type (if available)
 * @returns {string} Network type (4g, 3g, 2g, etc.) or 'unknown'
 */
export const getNetworkType = () => {
  if (navigator.connection && navigator.connection.effectiveType) {
    return navigator.connection.effectiveType;
  }
  return 'unknown';
};

/**
 * Helper for creating bottom sheet components
 * @param {HTMLElement} element The bottom sheet element
 * @returns {Object} Methods to control the bottom sheet
 */
export const createBottomSheet = (element) => {
  if (!element) return null;
  
  // Create backdrop if it doesn't exist
  let backdrop = document.querySelector('.bottom-sheet-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'bottom-sheet-backdrop';
    document.body.appendChild(backdrop);
  }
  
  // Add drag indicator if it doesn't exist
  if (!element.querySelector('.bottom-sheet-drag')) {
    const dragIndicator = document.createElement('div');
    dragIndicator.className = 'bottom-sheet-drag';
    element.insertBefore(dragIndicator, element.firstChild);
  }
  
  // Touch drag handling
  let startY = 0;
  let currentY = 0;
  
  const handleTouchStart = (e) => {
    startY = e.touches[0].clientY;
  };
  
  const handleTouchMove = (e) => {
    currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    if (diff > 0) {
      element.style.transform = `translateY(${diff}px)`;
    }
  };
  
  const handleTouchEnd = (e) => {
    const diff = currentY - startY;
    
    if (diff > element.offsetHeight / 3) {
      // Swipe down - close the sheet
      close();
    } else {
      // Return to open position
      element.style.transform = 'translateY(0)';
    }
  };
  
  // Add touch event listeners
  element.addEventListener('touchstart', handleTouchStart);
  element.addEventListener('touchmove', handleTouchMove);
  element.addEventListener('touchend', handleTouchEnd);
  
  // Methods to control the bottom sheet
  const open = () => {
    element.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  
  const close = () => {
    element.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  };
  
  // Click outside to close
  backdrop.addEventListener('click', close);
  
  return {
    open,
    close,
    element
  };
}; 