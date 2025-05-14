import React, { useEffect } from 'react';

/**
 * SEO Component for better search engine optimization
 * Sets document title and meta tags
 */
const SEO = ({ 
  title = 'SoundLink', 
  description = 'Discover and stream music with SoundLink, the premium music streaming platform', 
  keywords = 'music, streaming, audio, songs, artists, albums',
  image = '/icons/soundlink-icon-512.png',
  canonicalUrl,
  type = 'website'
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
    
    // Update Open Graph tags
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:url', pageUrl, 'property');
    updateMetaTag('og:title', pageTitle, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', imageUrl, 'property');
    updateMetaTag('og:site_name', siteName, 'property');
    
    // Update Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image', 'name');
    updateMetaTag('twitter:url', pageUrl, 'name');
    updateMetaTag('twitter:title', pageTitle, 'name');
    updateMetaTag('twitter:description', description, 'name');
    updateMetaTag('twitter:image', imageUrl, 'name');
    
    // Update canonical URL
    updateCanonicalLink(pageUrl);
    
    // Clean up on component unmount
    return () => {
      document.title = 'SoundLink';
    };
  }, [pageTitle, description, keywords, type, pageUrl, imageUrl, siteName]);
  
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
  
  // This component doesn't render anything
  return null;
};

export default SEO; 