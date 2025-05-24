import React, { useState, useEffect, useRef } from 'react';
import { MdSearch, MdPlayArrow, MdPause, MdFavorite, MdFavoriteBorder, MdPlaylistAdd, MdQueueMusic } from 'react-icons/md';
import { useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import AddToPlaylistModal from './AddToPlaylistModal';
import SEO from './SEO';
import AccessibleFormInput from './AccessibleFormInput';
import AccessibleIconButton from './AccessibleIconButton';
import Skeleton from './Skeleton';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ songs: [], albums: [], artists: [], movieAlbums: [] });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const searchInputRef = useRef(null);
  const location = useLocation();
  
  const { playWithId, favorites, toggleFavorite, addToQueue, track, playStatus, play, pause } = useContext(PlayerContext);
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    // Load recent searches from localStorage on component mount
    const storedSearches = localStorage.getItem('recentSearches');
    if (storedSearches) {
      setRecentSearches(JSON.parse(storedSearches));
    }
    
    // Get search query from URL if present
    const searchParams = new URLSearchParams(location.search);
    const queryParam = searchParams.get('q');
    
    if (queryParam) {
      setQuery(queryParam);
      // Trigger search with URL parameter
      setTimeout(() => {
        handleSearch(null, queryParam);
      }, 0);
    } else {
      // Focus the search input on page load if no query parameter
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  }, [location.search]);
  
  // Save recent searches to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);
  
  const handleSearch = async (e, searchQuery = null) => {
    e?.preventDefault(); // Optional event parameter
    
    const searchTerm = searchQuery || query;
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
      const response = await axios.get(`${backendUrl}/api/search?q=${encodeURIComponent(searchTerm)}`);
      
      if (response.data.success) {
        setResults(response.data);
        
        // Add to recent searches if not already present
        if (!recentSearches.includes(searchTerm.trim())) {
          const updatedSearches = [searchTerm.trim(), ...recentSearches.slice(0, 4)];
          setRecentSearches(updatedSearches);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRecentSearchClick = (searchTerm) => {
    setQuery(searchTerm);
    // Move this search to the top of the list
    const updatedSearches = [
      searchTerm,
      ...recentSearches.filter(item => item !== searchTerm)
    ];
    setRecentSearches(updatedSearches);
    
    // Trigger search
    setTimeout(() => handleSearch(), 0);
  };
  
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };
  
  const handleAddToPlaylist = (e, songId) => {
    e.stopPropagation();
    
    if (!user) {
      return;
    }
    
    setSelectedSongId(songId);
    setShowPlaylistModal(true);
  };
  
  const handleAddToQueue = (e, songId) => {
    e.stopPropagation();
    addToQueue && addToQueue(songId);
  };
  
  const isFavorite = (songId) => {
    return favorites && favorites.some(fav => fav._id === songId);
  };
  
  const handleToggleFavorite = (e, songId) => {
    e.stopPropagation();
    toggleFavorite && toggleFavorite(songId);
  };
  
  const handlePlayPause = (songId) => {
    if (track && track._id === songId) {
      if (playStatus) {
        pause();
      } else {
        play();
      }
    } else {
      playWithId(songId);
    }
  };
  
  const getTotalResults = () => {
    return results.songs.length + results.albums.length + results.artists.length + results.movieAlbums.length;
  };
  
  return (
    <div className="min-h-screen w-full flex flex-col justify-start items-center pb-16 px-4">
      {/* SEO Component */}
      <SEO 
        title="Search | SoundLink"
        description="Search for your favorite songs, albums, artists, and movies on SoundLink."
        keywords="music search, song search, artist search, album search, music streaming"
      />
      
      <div className="w-full max-w-6xl mx-auto mt-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8 w-full">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdSearch className="text-gray-400" size={24} />
            </div>
            
            <AccessibleFormInput
              ref={searchInputRef}
              type="search"
              name="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search songs, albums, artists, or playlists"
              label="Search"
              labelClassName="sr-only" // Visually hidden but accessible
              inputClassName="pl-10 w-full py-3"
              aria-label="Search music"
            />
            
            <button 
              type="submit" 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-fuchsia-600 text-white px-4 py-1 rounded-md hover:bg-fuchsia-700 transition-colors"
              aria-label="Submit search"
            >
              Search
            </button>
          </div>
        </form>
        
        {/* Recent Searches */}
        {!loading && query === '' && recentSearches.length > 0 && (
          <div className="mb-8 bg-neutral-900/60 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold">Recent Searches</h2>
              <button 
                onClick={clearRecentSearches}
                className="text-neutral-400 text-sm hover:text-white transition-colors"
                aria-label="Clear recent searches"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="bg-neutral-800 text-white px-3 py-1 rounded-full text-sm hover:bg-fuchsia-900/60 transition-colors"
                  aria-label={`Search again for ${search}`}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Loading Indicator */}
        {loading && (
          <div className="space-y-8">
            {/* Songs Skeleton */}
            <div>
              <Skeleton type="title" className="w-32 mb-6" />
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-neutral-800/50 rounded-lg">
                    <Skeleton type="image" className="w-16 h-16" />
                    <div className="flex-1">
                      <Skeleton type="text" className="w-48 mb-2" />
                      <Skeleton type="text" className="w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Albums Skeleton */}
            <div>
              <Skeleton type="title" className="w-32 mb-6" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} type="card" />
                ))}
              </div>
            </div>

            {/* Artists Skeleton */}
            <div>
              <Skeleton type="title" className="w-32 mb-6" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} type="artist-card" />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Search Results */}
        {!loading && query !== '' && getTotalResults() === 0 && (
          <div className="text-center py-10">
            <h2 className="text-white text-xl mb-2">No results found</h2>
            <p className="text-neutral-400">Try a different search term or check spelling</p>
          </div>
        )}
        
        {/* Results Tabs */}
        {!loading && query !== '' && getTotalResults() > 0 && (
          <div className="mb-6">
            <div className="border-b border-neutral-900 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`py-3 px-1 text-sm font-medium border-b-2 ${
                    activeTab === 'all' 
                      ? 'border-fuchsia-500 text-fuchsia-500' 
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                  aria-current={activeTab === 'all' ? 'page' : undefined}
                >
                  All ({getTotalResults()})
                </button>
                {results.songs.length > 0 && (
                  <button
                    onClick={() => setActiveTab('songs')}
                    className={`py-3 px-1 text-sm font-medium border-b-2 ${
                      activeTab === 'songs' 
                        ? 'border-fuchsia-500 text-fuchsia-500' 
                        : 'border-transparent text-neutral-400 hover:text-white'
                    }`}
                    aria-current={activeTab === 'songs' ? 'page' : undefined}
                  >
                    Songs ({results.songs.length})
                  </button>
                )}
                {results.albums.length > 0 && (
                  <button
                    onClick={() => setActiveTab('albums')}
                    className={`py-3 px-1 text-sm font-medium border-b-2 ${
                      activeTab === 'albums' 
                        ? 'border-fuchsia-500 text-fuchsia-500' 
                        : 'border-transparent text-neutral-400 hover:text-white'
                    }`}
                    aria-current={activeTab === 'albums' ? 'page' : undefined}
                  >
                    Albums ({results.albums.length})
                  </button>
                )}
                {results.artists.length > 0 && (
                  <button
                    onClick={() => setActiveTab('artists')}
                    className={`py-3 px-1 text-sm font-medium border-b-2 ${
                      activeTab === 'artists' 
                        ? 'border-fuchsia-500 text-fuchsia-500' 
                        : 'border-transparent text-neutral-400 hover:text-white'
                    }`}
                    aria-current={activeTab === 'artists' ? 'page' : undefined}
                  >
                    Artists ({results.artists.length})
                  </button>
                )}
              </nav>
            </div>
            
            {/* Results Display */}
            <div aria-live="polite">
              {/* Songs Results */}
              {(activeTab === 'all' || activeTab === 'songs') && results.songs.length > 0 && (
                <div className="mb-8">
                  {activeTab === 'all' && <h2 className="text-white text-xl font-bold mb-4">Songs</h2>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.songs.map(song => (
                      <div 
                        key={song._id} 
                        className={`flex items-center gap-3 p-3 rounded-lg ${track && track._id === song._id ? 'bg-fuchsia-900/30' : 'bg-neutral-900/60'} hover:bg-neutral-800 transition-colors cursor-pointer`}
                        onClick={() => handlePlayPause(song._id)}
                      >
                        <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden">
                          {song.image ? (
                            <img 
                              src={song.image} 
                              alt={song.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-fuchsia-500">
                              <MdPlayArrow size={24} />
                            </div>
                          )}
                          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center ${track && track._id === song._id && playStatus ? 'opacity-100' : 'opacity-0 hover:opacity-100'} transition-opacity`}>
                            {track && track._id === song._id && playStatus ? (
                              <MdPause className="text-white" size={24} />
                            ) : (
                              <MdPlayArrow className="text-white" size={24} />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium text-sm truncate max-w-[200px]">{song.name}</h3>
                          <p className="text-neutral-400 text-xs truncate max-w-[200px]">{song.singer || song.artist || song.artistName || 'Unknown Artist'}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <AccessibleIconButton
                            onClick={(e) => handleToggleFavorite(e, song._id)}
                            ariaLabel={isFavorite(song._id) ? "Remove from favorites" : "Add to favorites"}
                            className="p-1 text-neutral-400 hover:text-white"
                          >
                            {isFavorite(song._id) ? (
                              <MdFavorite className="text-fuchsia-500" size={18} />
                            ) : (
                              <MdFavoriteBorder size={18} />
                            )}
                          </AccessibleIconButton>
                          
                          <AccessibleIconButton
                            onClick={(e) => handleAddToPlaylist(e, song._id)}
                            ariaLabel="Add to playlist"
                            className="p-1 text-neutral-400 hover:text-white"
                          >
                            <MdPlaylistAdd size={20} />
                          </AccessibleIconButton>
                          
                          <AccessibleIconButton
                            onClick={(e) => handleAddToQueue(e, song._id)}
                            ariaLabel="Add to queue"
                            className="p-1 text-neutral-400 hover:text-white"
                          >
                            <MdQueueMusic size={18} />
                          </AccessibleIconButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Albums Results */}
              {(activeTab === 'all' || activeTab === 'albums') && results.albums.length > 0 && (
                <div className="mb-8">
                  {activeTab === 'all' && <h2 className="text-white text-xl font-bold mb-4">Albums</h2>}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {results.albums.map(album => (
                      <Link 
                        key={album._id} 
                        to={`/album/${album._id}`}
                        className="block group"
                      >
                        <div className="bg-neutral-900/60 p-3 rounded-lg hover:bg-neutral-800 transition-colors">
                          <div className="aspect-square mb-3 rounded-md overflow-hidden bg-neutral-800">
                            {album.image ? (
                              <img 
                                src={album.image} 
                                alt={album.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-fuchsia-500">
                                <MdPlayArrow size={40} />
                              </div>
                            )}
                          </div>
                          <h3 className="text-white font-medium text-sm truncate max-w-[200px]">{album.name}</h3>
                          <p className="text-neutral-400 text-xs truncate max-w-[200px]">{album.type || 'Album'}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Artists Results */}
              {(activeTab === 'all' || activeTab === 'artists') && results.artists.length > 0 && (
                <div className="mb-8">
                  {activeTab === 'all' && <h2 className="text-white text-xl font-bold mb-4">Artists</h2>}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {results.artists.map(artist => (
                      <Link 
                        key={artist._id} 
                        to={`/artist/${artist._id}`}
                        className="block group"
                      >
                        <div className="bg-neutral-900/60 p-3 rounded-lg hover:bg-neutral-800 transition-colors flex flex-col items-center">
                          <div className="w-24 h-24 rounded-full overflow-hidden mb-3 bg-neutral-800">
                            {artist.image ? (
                              <img 
                                src={artist.image} 
                                alt={artist.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-fuchsia-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <h3 className="text-white font-medium text-sm text-center truncate max-w-[200px] mx-auto">{artist.name}</h3>
                          <p className="text-neutral-400 text-xs text-center">Artist</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Add To Playlist Modal */}
      {showPlaylistModal && (
        <AddToPlaylistModal 
          songId={selectedSongId} 
          onClose={() => setShowPlaylistModal(false)}
        />
      )}
    </div>
  );
};

export default SearchPage; 