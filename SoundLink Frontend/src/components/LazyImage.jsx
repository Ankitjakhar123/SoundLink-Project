import React, { useState, useEffect, useRef } from 'react';

/**
 * LazyImage - An optimized image component with:
 * - Lazy loading
 * - Blur-up loading effect
 * - Error handling with fallbacks
 * - Automatic WebP detection and usage
 * - Responsive image sizes
 * - Mobile-first optimization
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
  eager = false,
  sizes = '100vw', // Default to full viewport width
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);
  const imgRef = useRef(null);
  
  // Handle different fallback approaches
  const determineFallback = () => {
    if (fallbackSrc) return fallbackSrc;
    
    if (alt?.toLowerCase().includes('avatar') || src?.includes('avatar')) {
      return '/default-avatar.svg';
    } else if (alt?.toLowerCase().includes('album') || src?.includes('album')) {
      return '/default-album.png';
    } else if (alt?.toLowerCase().includes('artist') || src?.includes('artist')) {
      return '/default-artist.png';
    } else {
      return '/default-album.png';
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
  
  // Generate responsive image sizes
  const generateResponsiveSrcSet = (url) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    
    const sizes = [320, 640, 960, 1280, 1920];
    return sizes
      .map(size => `${url.replace('/upload/', `/upload/w_${size},c_scale/`)} ${size}w`)
      .join(', ');
  };
  
  // Optimize image URL for different devices and formats
  const optimizeImageUrl = async (url) => {
    if (!url) return url;
    
    if (url.includes('cloudinary.com')) {
      const webpSupported = await checkWebpSupport();
      const isMobile = window.innerWidth <= 768;
      
      // Base transformations
      let transformations = 'f_auto,q_auto';
      
      // Add format optimization
      if (webpSupported) {
        transformations += ',f_webp';
      }
      
      // Add mobile-specific optimizations
      if (isMobile) {
        transformations += ',w_auto,dpr_auto';
      }
      
      // Apply transformations
      if (url.includes('upload/')) {
        return url.replace('upload/', `upload/${transformations}/`);
      }
    }
    
    return url;
  };
  
  useEffect(() => {
    if (src) {
      setLoaded(false);
      setError(false);
      setUsedFallback(false);
      
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
      const fallback = determineFallback();
      e.target.src = fallback;
      setUsedFallback(true);
    } else {
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
        aspectRatio: !height && width ? '1' : undefined
      }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding={eager ? "sync" : "async"}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        style={{ 
          objectFit, 
          width: '100%', 
          height: '100%' 
        }}
        srcSet={generateResponsiveSrcSet(src)}
        sizes={sizes}
        onLoad={handleImageLoad}
        onError={handleImageError}
        {...props}
      />
    </div>
  );
};

export default LazyImage; 