import React, { useEffect } from 'react';

/**
 * Enhanced SEO Component for better search engine optimization
 * Sets document title, meta tags, and structured data
 */
const SEO = ({ 
  title = 'SoundLink', 
  description = 'Discover and stream music with SoundLink, the premium music streaming platform', 
  keywords = 'music, streaming, audio, songs, artists, albums',
  image = '/icons/soundlink-icon-512.png',
  canonicalUrl,
  type = 'website',
  pageType = 'website', // 'website', 'album', 'artist', 'song', 'playlist'
  structuredData = null,
  noIndex = false,
  publishedTime,
  modifiedTime,
  author = 'SoundLink',
  section = 'Music',
  tags = []
}) => {
  const siteName = 'SoundLink';
  const siteUrl = window.location.origin;
  const pageUrl = canonicalUrl || window.location.href;
  const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
  
  // Ensure we have a proper title
  const pageTitle = title === 'SoundLink' ? title : `${title} | SoundLink`;
  
  useEffect(() => {
    // Set document title
    document.title = pageTitle;
    
    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', author);
    updateMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    
    // Update Open Graph tags
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:url', pageUrl, 'property');
    updateMetaTag('og:title', pageTitle, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', imageUrl, 'property');
    updateMetaTag('og:image:width', '512', 'property');
    updateMetaTag('og:image:height', '512', 'property');
    updateMetaTag('og:image:alt', `${pageTitle} - SoundLink`, 'property');
    updateMetaTag('og:site_name', siteName, 'property');
    updateMetaTag('og:locale', 'en_US', 'property');
    
    // Add article-specific Open Graph tags
    if (type === 'article' && publishedTime) {
      updateMetaTag('og:published_time', publishedTime, 'property');
    }
    if (type === 'article' && modifiedTime) {
      updateMetaTag('og:modified_time', modifiedTime, 'property');
    }
    if (type === 'article' && author) {
      updateMetaTag('og:author', author, 'property');
    }
    if (type === 'article' && section) {
      updateMetaTag('og:section', section, 'property');
    }
    if (type === 'article' && tags.length > 0) {
      updateMetaTag('og:tag', tags.join(', '), 'property');
    }
    
    // Update Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image', 'name');
    updateMetaTag('twitter:url', pageUrl, 'name');
    updateMetaTag('twitter:title', pageTitle, 'name');
    updateMetaTag('twitter:description', description, 'name');
    updateMetaTag('twitter:image', imageUrl, 'name');
    updateMetaTag('twitter:image:alt', `${pageTitle} - SoundLink`, 'name');
    
    // Update canonical URL
    updateCanonicalLink(pageUrl);
    
    // Add structured data if provided
    if (structuredData) {
      addStructuredData(structuredData);
    } else {
      // Add default structured data based on page type
      addDefaultStructuredData();
    }
    
    // Clean up on component unmount
    return () => {
      document.title = 'SoundLink';
      // Remove any added structured data
      removeStructuredData();
    };
  }, [pageTitle, description, keywords, type, pageUrl, imageUrl, siteName, structuredData, noIndex, publishedTime, modifiedTime, author, section, tags]);
  
  // Helper function to update meta tags
  const updateMetaTag = (name, content, attributeName = 'name') => {
    let element = document.querySelector(`meta[${attributeName}="${name}"]`);
    
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attributeName, name);
      document.head.appendChild(element);
    }
    
    element.setAttribute('content', content);
  };
  
  // Helper function to update canonical link
  const updateCanonicalLink = (url) => {
    let element = document.querySelector('link[rel="canonical"]');
    
    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', 'canonical');
      document.head.appendChild(element);
    }
    
    element.setAttribute('href', url);
  };
  
  // Helper function to add structured data
  const addStructuredData = (data) => {
    removeStructuredData();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    script.id = 'seo-structured-data';
    document.head.appendChild(script);
  };
  
  // Helper function to remove structured data
  const removeStructuredData = () => {
    const existingScript = document.getElementById('seo-structured-data');
    if (existingScript) {
      existingScript.remove();
    }
  };
  
  // Helper function to add default structured data based on page type
  const addDefaultStructuredData = () => {
    let data = null;
    
    switch (pageType) {
      case 'album':
        data = {
          "@context": "https://schema.org",
          "@type": "MusicAlbum",
          "name": title,
          "description": description,
          "url": pageUrl,
          "image": imageUrl,
          "publisher": {
            "@type": "Organization",
            "name": "SoundLink"
          }
        };
        break;
        
      case 'artist':
        data = {
          "@context": "https://schema.org",
          "@type": "MusicGroup",
          "name": title,
          "description": description,
          "url": pageUrl,
          "image": imageUrl
        };
        break;
        
      case 'song':
        data = {
          "@context": "https://schema.org",
          "@type": "MusicRecording",
          "name": title,
          "description": description,
          "url": pageUrl,
          "image": imageUrl
        };
        break;
        
      case 'playlist':
        data = {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": title,
          "description": description,
          "url": pageUrl,
          "image": imageUrl
        };
        break;
        
      default:
        data = {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": pageTitle,
          "description": description,
          "url": pageUrl,
          "image": imageUrl,
          "publisher": {
            "@type": "Organization",
            "name": "SoundLink",
            "url": siteUrl
          }
        };
    }
    
    if (data) {
      addStructuredData(data);
    }
  };
  
  // This component doesn't render anything
  return null;
};

export default SEO; 