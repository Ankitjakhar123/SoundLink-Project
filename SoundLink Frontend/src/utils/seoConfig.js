/**
 * SEO Configuration for SoundLink
 * Contains all SEO-related settings, meta tags, and structured data templates
 */

export const SEO_CONFIG = {
  // Site-wide settings
  site: {
    name: 'SoundLink',
    url: 'https://soundlink.netlify.app',
    description: 'Premium music streaming platform offering high-quality audio streaming, trending songs, albums, and artist discovery',
    keywords: 'music streaming, online music, free music, trending songs, music albums, artists, playlists, audio streaming, music platform, SoundLink, music app, streaming service, songs, albums, artists, music discovery',
    author: 'SoundLink',
    image: '/icons/soundlink-icon-512.png',
    twitterHandle: '@soundlink',
    language: 'en',
    locale: 'en_US'
  },

  // Default meta tags for different page types
  pages: {
    home: {
      title: 'SoundLink - Premium Music Streaming Platform | Listen to Trending Songs & Albums',
      description: 'Discover and stream millions of songs, albums, and artists on SoundLink. High-quality music streaming with trending songs, movie albums, and personalized playlists. Free music streaming platform.',
      keywords: 'music streaming, online music, free music, trending songs, music albums, artists, playlists, audio streaming, music platform, SoundLink, music app, streaming service, songs, albums, artists, music discovery',
      type: 'website',
      pageType: 'website'
    },
    
    trending: {
      title: 'Trending Songs | SoundLink - Latest Popular Music',
      description: 'Listen to the latest trending songs and popular music on SoundLink. Discover what\'s hot right now in music with our curated trending playlist.',
      keywords: 'trending songs, popular music, latest hits, top songs, trending playlist, hot music, current hits, popular tracks',
      type: 'website',
      pageType: 'website'
    },
    
    artists: {
      title: 'Artists | SoundLink - Discover Amazing Musicians',
      description: 'Explore and discover amazing artists and musicians on SoundLink. Browse through our collection of talented performers and their music.',
      keywords: 'artists, musicians, singers, bands, music performers, artist discovery, music creators',
      type: 'website',
      pageType: 'website'
    },
    
    premium: {
      title: 'Premium Features | SoundLink - Upgrade Your Music Experience',
      description: 'Upgrade to SoundLink Premium for an enhanced music streaming experience. Enjoy high-quality audio, offline listening, and exclusive features.',
      keywords: 'premium music, music subscription, high quality audio, offline music, exclusive features, music upgrade',
      type: 'website',
      pageType: 'website'
    },
    
    radio: {
      title: 'Radio Stations | SoundLink - Live Music Streaming',
      description: 'Listen to live radio stations and curated music channels on SoundLink. Enjoy continuous music streaming with our radio feature.',
      keywords: 'radio stations, live music, music channels, radio streaming, continuous music, live radio',
      type: 'website',
      pageType: 'website'
    },
    
    about: {
      title: 'About SoundLink | Our Story and Mission',
      description: 'Learn about SoundLink\'s mission to provide the best music streaming experience. Discover our story, values, and commitment to music lovers.',
      keywords: 'about SoundLink, music platform story, company mission, music streaming values',
      type: 'website',
      pageType: 'website'
    },
    
    contact: {
      title: 'Contact Us | SoundLink - Get in Touch',
      description: 'Get in touch with the SoundLink team. We\'re here to help with any questions, feedback, or support you need.',
      keywords: 'contact SoundLink, customer support, help, feedback, music streaming support',
      type: 'website',
      pageType: 'website'
    },
    
    terms: {
      title: 'Terms of Service | SoundLink',
      description: 'Read SoundLink\'s terms of service and user agreement. Understand the rules and guidelines for using our music streaming platform.',
      keywords: 'terms of service, user agreement, SoundLink terms, music platform rules',
      type: 'website',
      pageType: 'website'
    },
    
    privacy: {
      title: 'Privacy Policy | SoundLink',
      description: 'Learn about how SoundLink protects your privacy and handles your data. Read our comprehensive privacy policy.',
      keywords: 'privacy policy, data protection, user privacy, SoundLink privacy, music platform privacy',
      type: 'website',
      pageType: 'website'
    },
    
    auth: {
      title: 'Sign In | SoundLink - Access Your Music',
      description: 'Sign in to your SoundLink account to access your personalized music library, playlists, and favorites.',
      keywords: 'sign in, login, music account, user login, SoundLink login',
      type: 'website',
      pageType: 'website'
    }
  },

  // Structured data templates
  structuredData: {
    // WebApplication schema for the main app
    webApplication: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "SoundLink",
      "description": "Premium music streaming platform offering high-quality audio streaming, trending songs, albums, and artist discovery",
      "url": "https://soundlink.netlify.app",
      "applicationCategory": "MusicApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "author": {
        "@type": "Organization",
        "name": "SoundLink"
      },
      "publisher": {
        "@type": "Organization",
        "name": "SoundLink",
        "logo": {
          "@type": "ImageObject",
          "url": "https://soundlink.netlify.app/icons/soundlink-icon-512.png"
        }
      },
      "screenshot": "https://soundlink.netlify.app/assets/screenshot1.png",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "1250"
      },
      "featureList": [
        "High-quality music streaming",
        "Trending songs and albums",
        "Artist discovery",
        "Personalized playlists",
        "Movie album collections",
        "Cross-platform compatibility",
        "Offline listening",
        "Social sharing features"
      ]
    },

    // Organization schema
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "SoundLink",
      "url": "https://soundlink.netlify.app",
      "logo": "https://soundlink.netlify.app/icons/soundlink-icon-512.png",
      "description": "Premium music streaming platform",
      "sameAs": [
        "https://soundlink.netlify.app"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "url": "https://soundlink.netlify.app/contact"
      }
    },

    // Website schema
    website: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "SoundLink",
      "url": "https://soundlink.netlify.app",
      "description": "Premium music streaming platform",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://soundlink.netlify.app/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },

    // MusicAlbum schema template
    album: (albumData) => ({
      "@context": "https://schema.org",
      "@type": "MusicAlbum",
      "name": albumData.name,
      "description": albumData.description || `Listen to ${albumData.name} on SoundLink`,
      "url": `https://soundlink.netlify.app/album/${albumData._id}`,
      "image": albumData.image || "https://soundlink.netlify.app/icons/soundlink-icon-512.png",
      "publisher": {
        "@type": "Organization",
        "name": "SoundLink"
      },
      "byArtist": albumData.artist ? {
        "@type": "MusicGroup",
        "name": albumData.artist
      } : undefined,
      "numTracks": albumData.songs?.length || 0
    }),

    // MusicGroup schema template
    artist: (artistData) => ({
      "@context": "https://schema.org",
      "@type": "MusicGroup",
      "name": artistData.name,
      "description": artistData.description || `Listen to music by ${artistData.name} on SoundLink`,
      "url": `https://soundlink.netlify.app/artist/${artistData._id}`,
      "image": artistData.image || "https://soundlink.netlify.app/icons/soundlink-icon-512.png",
      "genre": artistData.genre,
      "album": artistData.albums?.map(album => ({
        "@type": "MusicAlbum",
        "name": album.name,
        "url": `https://soundlink.netlify.app/album/${album._id}`
      }))
    }),

    // MusicRecording schema template
    song: (songData) => ({
      "@context": "https://schema.org",
      "@type": "MusicRecording",
      "name": songData.name,
      "description": `Listen to ${songData.name} by ${songData.singer} on SoundLink`,
      "url": `https://soundlink.netlify.app/song/${songData._id}/info`,
      "image": songData.image || "https://soundlink.netlify.app/icons/soundlink-icon-512.png",
      "byArtist": {
        "@type": "MusicGroup",
        "name": songData.singer
      },
      "inAlbum": songData.albumName ? {
        "@type": "MusicAlbum",
        "name": songData.albumName
      } : undefined,
      "duration": songData.duration,
      "genre": songData.genre
    }),

    // ItemList schema template for playlists
    playlist: (playlistData) => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": playlistData.name,
      "description": playlistData.description || `Playlist: ${playlistData.name} on SoundLink`,
      "url": `https://soundlink.netlify.app/playlist/${playlistData._id}`,
      "image": playlistData.image || "https://soundlink.netlify.app/icons/soundlink-icon-512.png",
      "numberOfItems": playlistData.songs?.length || 0,
      "itemListElement": playlistData.songs?.map((song, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "MusicRecording",
          "name": song.name,
          "byArtist": {
            "@type": "MusicGroup",
            "name": song.singer
          }
        }
      })) || []
    })
  },

  // Social media configuration
  social: {
    facebook: {
      appId: '', // Add your Facebook App ID if you have one
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      site: '@soundlink',
      creator: '@soundlink'
    }
  },

  // Performance and caching settings
  performance: {
    cacheControl: {
      html: 'public, max-age=0, must-revalidate',
      assets: 'public, max-age=31536000, immutable',
      images: 'public, max-age=31536000, immutable',
      manifest: 'no-cache, no-store, must-revalidate'
    }
  }
};

/**
 * Helper function to get SEO config for a specific page
 * @param {string} pageName - The name of the page
 * @param {Object} dynamicData - Dynamic data for the page (optional)
 * @returns {Object} SEO configuration for the page
 */
export const getSEOConfig = (pageName, dynamicData = {}) => {
  const baseConfig = SEO_CONFIG.pages[pageName] || SEO_CONFIG.pages.home;
  
  return {
    ...baseConfig,
    ...dynamicData,
    // Ensure we have the full image URL
    image: dynamicData.image || baseConfig.image || SEO_CONFIG.site.image,
    // Ensure we have the full URL
    url: dynamicData.url || `${SEO_CONFIG.site.url}${window.location.pathname}`
  };
};

/**
 * Helper function to get structured data for a specific content type
 * @param {string} type - The type of structured data ('album', 'artist', 'song', 'playlist')
 * @param {Object} data - The data for the structured data
 * @returns {Object} Structured data object
 */
export const getStructuredData = (type, data) => {
  const template = SEO_CONFIG.structuredData[type];
  
  if (typeof template === 'function') {
    return template(data);
  }
  
  return template || SEO_CONFIG.structuredData.website;
};

export default SEO_CONFIG; 