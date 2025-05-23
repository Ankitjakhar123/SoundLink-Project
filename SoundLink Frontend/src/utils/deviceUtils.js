/**
 * Device detection and safe area utilities
 */

/**
 * Check if the device has a notch or cutout in the display
 * @returns {boolean} True if the device likely has a notch
 */
export const hasNotchOrCutout = () => {
  // iOS devices with notch
  const isiPhoneWithNotch = /iPhone/.test(navigator.userAgent) && 
    window.screen.height >= 812 && window.devicePixelRatio >= 2;
  
  // Check if CSS environment variables are supported and have non-zero values
  const hasSafeAreaInsets = () => {
    if (!window.CSS || !window.CSS.supports) return false;
    
    // Check if CSS environment variables are supported
    const supportsEnv = window.CSS.supports('padding-top: env(safe-area-inset-top)');
    
    if (!supportsEnv) return false;
    
    // Create a test element to check actual values
    const testEl = document.createElement('div');
    testEl.style.paddingTop = 'env(safe-area-inset-top)';
    document.body.appendChild(testEl);
    
    const computedStyle = window.getComputedStyle(testEl);
    const hasSafeArea = computedStyle.paddingTop !== '0px';
    
    document.body.removeChild(testEl);
    return hasSafeArea;
  };
  
  // Android detection - less reliable
  const isAndroidWithCutout = /Android/.test(navigator.userAgent) && 
    (
      // Newer Android versions
      ('ontouchend' in document && window.screen.height / window.screen.width > 2) ||
      // Check for display-cutout API
      (window.CSS && CSS.supports('padding-top: env(safe-area-inset-top)'))
    );
  
  return isiPhoneWithNotch || isAndroidWithCutout || hasSafeAreaInsets();
};

/**
 * Get safe area inset values
 * @returns {Object} Object with top, right, bottom, left inset values
 */
export const getSafeAreaInsets = () => {
  if (!window.CSS || !window.CSS.supports || 
      !window.CSS.supports('padding-top: env(safe-area-inset-top)')) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  // Create test elements to compute actual values
  const el = document.createElement('div');
  el.style.position = 'fixed';
  el.style.left = '0';
  el.style.right = '0';
  el.style.top = '0';
  el.style.bottom = '0';
  
  el.style.paddingTop = 'env(safe-area-inset-top)';
  el.style.paddingRight = 'env(safe-area-inset-right)';
  el.style.paddingBottom = 'env(safe-area-inset-bottom)';
  el.style.paddingLeft = 'env(safe-area-inset-left)';
  
  document.body.appendChild(el);
  const style = window.getComputedStyle(el);
  
  const insets = {
    top: parseInt(style.paddingTop) || 0,
    right: parseInt(style.paddingRight) || 0,
    bottom: parseInt(style.paddingBottom) || 0,
    left: parseInt(style.paddingLeft) || 0
  };
  
  document.body.removeChild(el);
  return insets;
};

/**
 * Apply safe area insets to elements dynamically
 * @param {HTMLElement} element - The element to apply safe area insets to
 * @param {Object} options - Options for which insets to apply
 */
export const applySafeAreaInsets = (element, options = {}) => {
  const { top = true, right = true, bottom = true, left = true } = options;
  
  if (!element) return;
  
  if (top) element.style.paddingTop = 'var(--safe-area-top)';
  if (right) element.style.paddingRight = 'var(--safe-area-right)';
  if (bottom) element.style.paddingBottom = 'var(--safe-area-bottom)';
  if (left) element.style.paddingLeft = 'var(--safe-area-left)';
};

/**
 * Initialize device-specific styles based on detection
 */
export const initializeDeviceStyles = () => {
  const hasNotch = hasNotchOrCutout();
  
  // Add class to body based on notch detection
  if (hasNotch) {
    document.body.classList.add('has-notch');
  }
  
  // Update CSS variables with computed safe area values
  const insets = getSafeAreaInsets();
  document.documentElement.style.setProperty('--safe-area-top', `${insets.top}px`);
  document.documentElement.style.setProperty('--safe-area-right', `${insets.right}px`);
  document.documentElement.style.setProperty('--safe-area-bottom', `${insets.bottom}px`);
  document.documentElement.style.setProperty('--safe-area-left', `${insets.left}px`);
  
  // Add status bar background for notched devices
  if (hasNotch && !document.querySelector('.status-bar-bg')) {
    const statusBar = document.createElement('div');
    statusBar.className = 'status-bar-bg';
    document.body.appendChild(statusBar);
  }
  
  // Listen for orientation changes to update safe areas
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      const newInsets = getSafeAreaInsets();
      document.documentElement.style.setProperty('--safe-area-top', `${newInsets.top}px`);
      document.documentElement.style.setProperty('--safe-area-right', `${newInsets.right}px`);
      document.documentElement.style.setProperty('--safe-area-bottom', `${newInsets.bottom}px`);
      document.documentElement.style.setProperty('--safe-area-left', `${newInsets.left}px`);
    }, 100); // Small delay to ensure orientation change is complete
  });
}; 