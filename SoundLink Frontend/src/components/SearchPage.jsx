import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MdSearch, MdPlayArrow, MdPause, MdFavorite, MdFavoriteBorder, MdPlaylistAdd, MdMoreVert, MdMusicNote, MdAlbum, MdPerson, MdGroup } from 'react-icons/md';
import { PlayerContext } from '../context/PlayerContext';
import AddToPlaylistModal from './AddToPlaylistModal';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const { playWithId, toggleFavorite, isFavorite, addToQueue, track, playStatus, pause, play } = useContext(PlayerContext);
  
  const [results, setResults] = useState({
    songs: [],
    albums: [],
    artists: [],
    users: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showOptions, setShowOptions] = useState(null);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(query);

  // Perform search when query changes
  useEffect(() => {
    if (!query.trim()) return;
    
    const performSearch = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
        const response = await axios.get(`${backendUrl}/api/search?q=${encodeURIComponent(query)}`);
        
        if (response.data.success) {
          setResults({
            songs: response.data.songs || [],
            albums: response.data.albums || [],
            artists: response.data.artists || [],
            users: response.data.users || []
          });
        } else {
          setError('Search failed. Please try again.');
        }
      } catch (err) {
        console.error('Search error:', err);
        setError('An error occurred while searching. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    performSearch();
  }, [query]);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptions && !event.target.closest('.song-options')) {
        setShowOptions(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showOptions]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
    }
  };

  const handlePlayPause = (e, songId) => {
    e.stopPropagation();
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

  const isPlaying = (songId) => {
    return track && track._id === songId && playStatus;
  };

  const handleToggleFavorite = (e, songId) => {
    e.stopPropagation();
    toggleFavorite(songId);
  };

  const handleAddToPlaylist = (e, songId) => {
    e.stopPropagation();
    setSelectedSongId(songId);
    setShowPlaylistModal(true);
  };

  const handleAddToQueue = (e, songId) => {
    e.stopPropagation();
    addToQueue(songId);
  };

  const handleToggleOptions = (e, songId) => {
    e.stopPropagation();
    setShowOptions(showOptions === songId ? null : songId);
  };

  const hasResults = results.songs.length > 0 || results.albums.length > 0 || results.artists.length > 0 || results.users.length > 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Search</h1>
      
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex items-center gap-2 px-4 py-3 rounded-full bg-neutral-900/80 border border-neutral-800 transition-all duration-300 ring-0 focus-within:border-fuchsia-500 w-full max-w-xl">
          <MdSearch className="text-neutral-400 flex-shrink-0" size={24} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search for songs, albums, artists..."
            className="bg-transparent outline-none border-none text-white flex-1 min-w-0 placeholder-neutral-500 text-lg"
          />
          {loading && (
            <div className="w-5 h-5 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
      </form>
      
      {error && (
        <div className="bg-red-500/20 text-red-200 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Results display */}
      {query && !loading && (
        <div className="mb-8">
          <h2 className="text-white text-xl font-semibold mb-4">
            {hasResults 
              ? `Results for "${query}"` 
              : `No results found for "${query}"`}
          </h2>
          
          {!hasResults && (
            <div className="bg-neutral-900/50 rounded-lg p-8 text-center text-neutral-400">
              Try searching for songs, artists, albums, or users
            </div>
          )}
        </div>
      )}
      
      {/* Songs Results */}
      {results.songs.length > 0 && (
        <div className="mb-10">
          <h3 className="text-white text-xl font-semibold mb-4 flex items-center">
            <MdMusicNote className="mr-2 text-fuchsia-500" />
            Songs
          </h3>
          
          <div className="bg-neutral-900/50 backdrop-blur-md rounded-xl overflow-hidden">
            <div className="grid grid-cols-4 p-4 border-b border-neutral-800 text-neutral-400 text-sm">
              <div className="flex items-center"># TITLE</div>
              <div className="hidden md:block">ALBUM</div>
              <div className="hidden md:block">DURATION</div>
              <div className="text-right"></div>
            </div>
            
            <div className="divide-y divide-neutral-800/50">
              {results.songs.map((song, index) => (
                <div 
                  key={song._id} 
                  className="grid grid-cols-4 p-4 hover:bg-white/10 transition-all cursor-pointer group"
                  onClick={() => playWithId(song._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 text-neutral-400 flex items-center justify-center">
                      <span className="group-hover:hidden">{index + 1}</span>
                      <button 
                        className="hidden group-hover:block"
                        onClick={(e) => handlePlayPause(e, song._id)}
                      >
                        {isPlaying(song._id) ? <MdPause /> : <MdPlayArrow />}
                      </button>
                    </div>
                    
                    <div className="bg-neutral-800 w-10 h-10 rounded flex-shrink-0 overflow-hidden">
                      {song.image ? (
                        <img 
                          src={song.image} 
                          alt={song.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MdMusicNote size={20} className="text-fuchsia-500" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{song.name}</div>
                      <div className="text-xs text-neutral-400 truncate">{song.desc}</div>
                    </div>
                  </div>
                  
                  <div className="hidden md:block text-neutral-400 truncate">
                    {song.album || "Single"}
                  </div>
                  
                  <div className="hidden md:flex items-center text-neutral-400">
                    {song.duration || "--:--"}
                  </div>
                  
                  <div className="flex items-center justify-end gap-3">
                    <button 
                      onClick={(e) => handleToggleFavorite(e, song._id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-white"
                      aria-label="Toggle favorite"
                    >
                      {isFavorite(song._id) ? 
                        <MdFavorite className="text-fuchsia-500" size={20} /> : 
                        <MdFavoriteBorder size={20} />
                      }
                    </button>
                    
                    <div className="text-neutral-400 md:hidden">
                      {song.duration || "--:--"}
                    </div>
                    
                    <div className="relative song-options">
                      <button 
                        onClick={(e) => handleToggleOptions(e, song._id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-white"
                        aria-label="More options"
                      >
                        <MdMoreVert size={20} />
                      </button>
                      
                      {showOptions === song._id && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-800 rounded-md shadow-lg py-1 z-50 border border-neutral-700">
                          <button 
                            onClick={(e) => {e.stopPropagation(); handleAddToQueue(e, song._id)}}
                            className="w-full text-left px-4 py-2 text-white hover:bg-neutral-700 flex items-center gap-2"
                          >
                            <MdPlayArrow size={18} />
                            Add to Queue
                          </button>
                          <button 
                            onClick={(e) => {e.stopPropagation(); handleAddToPlaylist(e, song._id)}}
                            className="w-full text-left px-4 py-2 text-white hover:bg-neutral-700 flex items-center gap-2"
                          >
                            <MdPlaylistAdd size={18} />
                            Add to Playlist
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Albums Results */}
      {results.albums.length > 0 && (
        <div className="mb-10">
          <h3 className="text-white text-xl font-semibold mb-4 flex items-center">
            <MdAlbum className="mr-2 text-fuchsia-500" />
            Albums
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.albums.map(album => (
              <div 
                key={album._id}
                onClick={() => navigate(`/album/${album._id}`)} 
                className="bg-neutral-900/50 rounded-lg p-3 hover:bg-neutral-800 transition-all cursor-pointer"
              >
                <div className="aspect-square rounded bg-neutral-800 mb-3 overflow-hidden">
                  {album.image ? (
                    <img 
                      src={album.image} 
                      alt={album.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MdAlbum size={40} className="text-fuchsia-500/50" />
                    </div>
                  )}
                </div>
                <h4 className="text-white font-medium truncate">{album.name}</h4>
                <p className="text-neutral-400 text-sm truncate">{album.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Artists Results */}
      {results.artists.length > 0 && (
        <div className="mb-10">
          <h3 className="text-white text-xl font-semibold mb-4 flex items-center">
            <MdPerson className="mr-2 text-fuchsia-500" />
            Artists
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.artists.map(artist => (
              <div 
                key={artist._id}
                onClick={() => navigate(`/artist/${artist._id}`)} 
                className="bg-neutral-900/50 rounded-lg p-3 hover:bg-neutral-800 transition-all cursor-pointer text-center"
              >
                <div className="aspect-square rounded-full bg-neutral-800 mb-3 overflow-hidden mx-auto w-4/5">
                  {artist.image ? (
                    <img 
                      src={artist.image} 
                      alt={artist.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MdPerson size={40} className="text-fuchsia-500/50" />
                    </div>
                  )}
                </div>
                <h4 className="text-white font-medium truncate">{artist.name}</h4>
                <p className="text-neutral-400 text-sm truncate">Artist</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Users Results */}
      {results.users.length > 0 && (
        <div className="mb-10">
          <h3 className="text-white text-xl font-semibold mb-4 flex items-center">
            <MdGroup className="mr-2 text-fuchsia-500" />
            Users
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.users.map(user => (
              <div 
                key={user._id}
                onClick={() => navigate(`/profile/${user._id}`)} 
                className="bg-neutral-900/50 rounded-lg p-3 hover:bg-neutral-800 transition-all cursor-pointer text-center"
              >
                <div className="aspect-square rounded-full bg-neutral-800 mb-3 overflow-hidden mx-auto w-4/5">
                  {user.image ? (
                    <img 
                      src={user.image} 
                      alt={user.username} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MdPerson size={40} className="text-fuchsia-500/50" />
                    </div>
                  )}
                </div>
                <h4 className="text-white font-medium truncate">{user.username}</h4>
                <p className="text-neutral-400 text-sm truncate">User</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Playlist Modal */}
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