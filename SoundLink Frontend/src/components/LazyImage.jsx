import React, { useState, useEffect, useRef } from 'react';

/**
 * LazyImage - An optimized image component with:
 * - Lazy loading
 * - Blur-up loading effect
 * - Error handling with fallbacks
 * - Automatic WebP detection and usage
 */
const LazyImage = ({
  src,
  alt,
  className = '',
  fallbackSrc = '',
  width,
  height,
  loadingStyles = 'bg-neutral-800 animate-pulse',
  objectFit = 'cover',
  onLoad = () => {},
  onError = () => {},
  eager = false, // Set to true for above-the-fold images
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);
  const imgRef = useRef(null);
  
  // Handle different fallback approaches
  const determineFallback = () => {
    if (fallbackSrc) return fallbackSrc;
    
    // Detect the type of image from alt text or src and provide appropriate fallback
    if (alt?.toLowerCase().includes('avatar') || src?.includes('avatar')) {
      return '/default-avatar.svg';
    } else if (alt?.toLowerCase().includes('album') || src?.includes('album')) {
      return '/default-album.png';
    } else if (alt?.toLowerCase().includes('artist') || src?.includes('artist')) {
      return '/default-artist.png';
    } else {
      return '/default-album.png'; // Default fallback
    }
  };
  
  // Support WebP format if browser supports it
  const checkWebpSupport = async () => {
    const webpSupported = localStorage.getItem('webpSupported');
    
    if (webpSupported !== null) {
      return webpSupported === 'true';
    }
    
    return new Promise(resolve => {
      const webP = new Image();
      webP.onload = function() {
        const result = webP.height === 1;
        localStorage.setItem('webpSupported', result ? 'true' : 'false');
        resolve(result);
      };
      webP.onerror = function() {
        localStorage.setItem('webpSupported', 'false');
        resolve(false);
      };
      webP.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    });
  };
  
  // Modify cloudinary URLs to use WebP format if supported
  const optimizeImageUrl = async (url) => {
    if (!url) return url;
    
    // Only transform Cloudinary URLs
    if (url.includes('cloudinary.com')) {
      const webpSupported = await checkWebpSupport();
      
      if (webpSupported) {
        // Convert to WebP format if supported
        if (url.includes('upload/')) {
          return url.replace('upload/', 'upload/f_auto,q_auto/');
        }
      }
      
      // Add quality optimization even if WebP not supported
      if (!url.includes('q_auto')) {
        return url.replace('upload/', 'upload/q_auto/');
      }
    }
    
    return url;
  };
  
  useEffect(() => {
    // Reset states when src changes
    if (src) {
      setLoaded(false);
      setError(false);
      setUsedFallback(false);
      
      // Optimize the image URL if possible
      (async () => {
        if (imgRef.current) {
          const optimizedUrl = await optimizeImageUrl(src);
          imgRef.current.src = optimizedUrl;
        }
      })();
    }
  }, [src]);
  
  const handleImageLoad = (e) => {
    setLoaded(true);
    onLoad(e);
  };
  
  const handleImageError = (e) => {
    if (!usedFallback) {
      // Try the fallback image
      const fallback = determineFallback();
      e.target.src = fallback;
      setUsedFallback(true);
    } else {
      // If even the fallback fails, show error state
      setError(true);
      onError(e);
    }
  };
  
  return (
    <div 
      className={`relative overflow-hidden ${!loaded && !error ? loadingStyles : ''}`}
      style={{ 
        width: width || '100%', 
        height: height || '100%',
        aspectRatio: !height && width ? '1' : undefined  // Maintain aspect ratio if only width provided
      }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        style={{ 
          objectFit, 
          width: '100%', 
          height: '100%' 
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        {...props}
      />
    </div>
  );
};

export default LazyImage; 