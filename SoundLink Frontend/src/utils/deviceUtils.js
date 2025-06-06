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
  document.documentElement.style.setProperty('--computed-safe-area-top', `${insets.top}px`);
  document.documentElement.style.setProperty('--computed-safe-area-right', `${insets.right}px`);
  document.documentElement.style.setProperty('--computed-safe-area-bottom', `${insets.bottom}px`);
  document.documentElement.style.setProperty('--computed-safe-area-left', `${insets.left}px`);
};

// Device detection utilities
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  
  // Check for mobile user agent
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  // Check for touch capability
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check for mobile viewport
  const isMobileViewport = window.innerWidth <= 768;
  
  return mobileRegex.test(userAgent.toLowerCase()) || (hasTouch && isMobileViewport);
};

// Check if device has notch or cutout
const hasNotch = () => {
  if (typeof window === 'undefined') return false;
  
  // Check for iOS devices with notch
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const hasIOSNotch = isIOS && (
    window.screen.height >= 812 || // iPhone X and newer
    window.screen.width >= 812 || // iPhone X and newer in landscape
    window.devicePixelRatio >= 3 // High DPI devices
  );
  
  // Check for Android devices with notch
  const hasAndroidNotch = window.screen.availHeight < window.screen.height;
  
  return hasIOSNotch || hasAndroidNotch;
};

// Check if device supports WebP
const supportsWebP = () => {
  if (typeof window === 'undefined') return false;
  
  const elem = document.createElement('canvas');
  if (elem.getContext && elem.getContext('2d')) {
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
};

// Check if device is in low power mode
const isLowPowerMode = () => {
  if (typeof window === 'undefined') return false;
  
  // Check for battery status
  if ('getBattery' in navigator) {
    return navigator.getBattery().then(battery => {
      return battery.charging === false && battery.level <= 0.2;
    });
  }
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Check for reduced data preference
  const prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches;
  
  return prefersReducedMotion || prefersReducedData;
};

// Check if device has good network connection
const hasGoodConnection = () => {
  if (typeof window === 'undefined') return true;
  
  if ('connection' in navigator) {
    const connection = navigator.connection;
    return connection.effectiveType === '4g' || connection.saveData === false;
  }
  
  return true;
};

// Get device pixel ratio
const getDevicePixelRatio = () => {
  if (typeof window === 'undefined') return 1;
  return window.devicePixelRatio || 1;
};

// Check if device supports hardware acceleration
const supportsHardwareAcceleration = () => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (!gl) return false;
  
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (!debugInfo) return false;
  
  const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
  return renderer.toLowerCase().includes('gpu');
};

// Check if device supports modern CSS features
const supportsModernCSS = () => {
  if (typeof window === 'undefined') return false;
  
  return (
    'CSS' in window &&
    'supports' in window.CSS &&
    window.CSS.supports('display', 'grid') &&
    window.CSS.supports('position', 'sticky')
  );
};

// Get optimal image quality based on device capabilities
const getOptimalImageQuality = () => {
  const dpr = getDevicePixelRatio();
  const hasGoodNet = hasGoodConnection();
  const isLowPower = isLowPowerMode();
  
  if (isLowPower || !hasGoodNet) {
    return Math.min(dpr, 1.5);
  }
  
  return Math.min(dpr, 2);
};

// Export all utilities
export {
  isMobile,
  hasNotch,
  supportsWebP,
  isLowPowerMode,
  hasGoodConnection,
  getDevicePixelRatio,
  supportsHardwareAcceleration,
  supportsModernCSS,
  getOptimalImageQuality
}; 