import React, { useContext, useState, useEffect } from "react";
import { RadioContext } from "../context/RadioContext";
import { PlayerContext } from "../context/PlayerContext";
import { AuthContext } from "../context/AuthContext";
import { AnimatePresence } from "framer-motion";
import { MdPlayArrow, MdPause, MdRadio, MdMusicNote, MdExpandMore, MdChevronRight, MdSearch, MdLanguage, MdWeb, MdSpeed, MdCode, MdStar, MdStarBorder, MdKeyboardArrowDown, MdFavorite, MdFavoriteBorder } from "react-icons/md";
import PremiumRadioPlayer from "./Player/PremiumRadioPlayer";
import { toast } from 'react-toastify';

const RadioStation = () => {
  const radioContext = useContext(RadioContext);
  const { currentStation, isPlaying, playStation, stopStation, isLoading, toggleFavorite, isFavorite } = radioContext || {};
  const { token } = useContext(AuthContext);
  const [localPlayingState, setLocalPlayingState] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupedStations, setGroupedStations] = useState({});
  const [expandedGenres, setExpandedGenres] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStations, setExpandedStations] = useState({});
  const [pinnedGenres, setPinnedGenres] = useState([]);
  const [isQuickSelectOpen, setIsQuickSelectOpen] = useState(false);
  const STATIONS_PER_PAGE = 10;

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(const response = await fetch('https://corsproxy.io/?https://de1.api.radio-browser.info/json/stations/bycountry/India'); 
      if (!response.ok) {
        throw new Error('Failed to fetch radio stations');
      }
      const data = await response.json();
      
      // Filter and validate stations
      const validStations = data
        .filter(station => {
          const url = station.url_resolved || station.url;
          return url && (
            url.endsWith('.mp3') || 
            url.includes('stream') || 
            url.includes('icecast') ||
            url.includes('radio')
          );
        })
        .map(station => ({
          ...station,
          stationuuid: station.stationuuid || station._id,
          url_resolved: station.url_resolved || station.url,
          favicon: station.favicon || station.image || 'https://via.placeholder.com/150',
          bitrate: station.bitrate || '128',
          codec: station.codec || 'MP3',
          country: station.country || 'IN',
          language: station.language || 'Hindi'
        }));

      if (validStations.length === 0) {
        throw new Error('No valid radio stations found');
      }

      groupStationsByGenre(validStations);
    } catch (err) {
      console.error('Error fetching stations:', err);
      setError(err.message || 'Failed to fetch radio stations');
    } finally {
      setLoading(false);
    }
  };

  const groupStationsByGenre = (allStations) => {
    const genres = {
      Hindi: [],
      Bollywood: [],
      Haryanvi: [],
      Rajasthani: [],
      DJ: [],
      Punjabi: [],
      Other: []
    };

    allStations.forEach(station => {
      const stationGenres = station.tags ? station.tags.toLowerCase().split(',') : [];
      let addedToGenre = false;

      // Check for Haryanvi stations first
      if (stationGenres.some(tag => 
        tag.trim().includes('haryanvi') || 
        tag.trim().includes('haryana') || 
        station.name.toLowerCase().includes('haryanvi') ||
        station.name.toLowerCase().includes('haryana')
      )) {
        genres.Haryanvi.push(station);
        addedToGenre = true;
      }
      // Check for Rajasthani stations
      else if (stationGenres.some(tag => 
        tag.trim().includes('rajasthani') || 
        tag.trim().includes('rajasthan') || 
        station.name.toLowerCase().includes('rajasthani') ||
        station.name.toLowerCase().includes('rajasthan')
      )) {
        genres.Rajasthani.push(station);
        addedToGenre = true;
      }
      // Check for DJ stations
      else if (stationGenres.some(tag => 
        tag.trim().includes('dj') || 
        tag.trim().includes('disc jockey') || 
        station.name.toLowerCase().includes('dj') ||
        station.name.toLowerCase().includes('disc jockey')
      )) {
        genres.DJ.push(station);
        addedToGenre = true;
      }
      // Check for Punjabi stations
      else if (stationGenres.some(tag => 
        tag.trim().includes('punjabi') || 
        tag.trim().includes('punjab') || 
        station.name.toLowerCase().includes('punjabi') ||
        station.name.toLowerCase().includes('punjab')
      )) {
        genres.Punjabi.push(station);
        addedToGenre = true;
      }
      // Then check for Hindi stations
      else if (stationGenres.some(tag => tag.trim().includes('hindi'))) {
        genres.Hindi.push(station);
        addedToGenre = true;
      }
      // Then check for Bollywood stations
      else if (stationGenres.some(tag => tag.trim().includes('bollywood')) || 
               station.name.toLowerCase().includes('bollywood')) {
        genres.Bollywood.push(station);
        addedToGenre = true;
      }

      if (!addedToGenre) {
        genres.Other.push(station);
      }
    });
    
    const orderedGenres = {};
    if (genres.Haryanvi.length > 0) orderedGenres.Haryanvi = genres.Haryanvi;
    if (genres.Rajasthani.length > 0) orderedGenres.Rajasthani = genres.Rajasthani;
    if (genres.DJ.length > 0) orderedGenres.DJ = genres.DJ;
    if (genres.Punjabi.length > 0) orderedGenres.Punjabi = genres.Punjabi;
    if (genres.Hindi.length > 0) orderedGenres.Hindi = genres.Hindi;
    if (genres.Bollywood.length > 0) orderedGenres.Bollywood = genres.Bollywood;
    if (genres.Other.length > 0) orderedGenres.Other = genres.Other;

    setGroupedStations(orderedGenres);
    const initialExpandedState = {};
    Object.keys(orderedGenres).forEach(genre => {
      initialExpandedState[genre] = true;
    });
    setExpandedGenres(initialExpandedState);
  };

  const handlePlayPause = async (station) => {
    try {
      const isThisStationPlaying = currentStation?.stationuuid === station.stationuuid && isPlaying;

      if (isThisStationPlaying) {
        stopStation();
        setLocalPlayingState(prev => ({
          ...prev,
          [station.stationuuid]: false
        }));
      } else {
        // Stop any currently playing station
        if (isPlaying && currentStation) {
          setLocalPlayingState({}); // Reset all
        }

        // Play the new station
        await playStation(station);

        // Set only the new station as playing
        setLocalPlayingState({
          [station.stationuuid]: true
        });
      }
    } catch {
      setLocalPlayingState(prev => ({
        ...prev,
        [station.stationuuid]: false
      }));
    }
  };

  const toggleGenreExpanded = (genre) => {
    setExpandedGenres(prevState => ({
      ...prevState,
      [genre]: !prevState[genre]
    }));
  };

  const toggleShowMore = (genre) => {
    setExpandedStations(prevState => ({
      ...prevState,
      [genre]: !prevState[genre]
    }));
  };

  const filterStations = (stations) => {
    if (!searchQuery) return stations;
    return stations.filter(station => 
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (station.tags && station.tags.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const togglePinGenre = (genre) => {
    setPinnedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      } else {
        return [...prev, genre].slice(0, 2); // Keep only top 2 pinned genres
      }
    });
  };

  const scrollToGenre = (genre) => {
    const element = document.getElementById(`genre-${genre}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black">
        <div className="text-fuchsia-500 text-xl animate-pulse">Loading radio stations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-start items-center bg-gradient-to-b from-black via-black to-neutral-900 pb-16 px-4 pt-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-10">
          <div className="flex items-center gap-3">
            <MdRadio className="text-fuchsia-500" size={32} />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Indian Radio Stations
            </h1>
          </div>
          <p className="text-neutral-400">
            Listen to live radio stations from India
          </p>
        </div>

        {/* Quick Selection Dropdown */}
        <div className="mb-8 relative">
          <button
            onClick={() => setIsQuickSelectOpen(!isQuickSelectOpen)}
            className="w-full bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 flex items-center justify-between text-white hover:bg-neutral-800/50 transition-colors"
          >
            <span className="font-semibold">Quick Selection</span>
            <MdKeyboardArrowDown 
              size={24} 
              className={`transform transition-transform ${isQuickSelectOpen ? 'rotate-180' : ''}`}
            />
          </button>
          
          {isQuickSelectOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900/95 border border-neutral-800 rounded-lg p-4 z-10 backdrop-blur-sm">
              <div className="flex flex-wrap gap-2">
                {Object.keys(groupedStations).map((genre) => (
                  <button
                    key={genre}
                    onClick={() => {
                      scrollToGenre(genre);
                      setIsQuickSelectOpen(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                      pinnedGenres.includes(genre)
                        ? 'bg-fuchsia-500 text-white'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    <span>{genre}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePinGenre(genre);
                      }}
                      className="p-1 hover:bg-white/10 rounded-full"
                    >
                      {pinnedGenres.includes(genre) ? (
                        <MdStar className="text-yellow-400" size={20} />
                      ) : (
                        <MdStarBorder className="text-neutral-400" size={20} />
                      )}
                    </button>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Favorites Section */}
        {radioContext.favorites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Favorites</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {radioContext.favorites.map((station) => (
                <div
                  key={`favorite-${station.stationuuid}`}
                  className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-800 hover:border-fuchsia-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">{station.name}</h3>
                      {station.genre && (
                        <p className="text-sm text-neutral-400 truncate">{station.genre}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Favorite button clicked', token, station);
                        if (!token) {
                          toast.info('Please log in to add favorites.');
                          return;
                        }
                        toggleFavorite(station);
                      }}
                      className="p-1 hover:bg-white/10 rounded-full ml-2"
                    >
                      {isFavorite(station) ? (
                        <MdFavorite className="text-fuchsia-500" size={20} />
                      ) : (
                        <MdFavoriteBorder className="text-neutral-400" size={20} />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                      {station.bitrate && (
                        <span className="flex items-center gap-1">
                          <MdSpeed size={14} />
                          {station.bitrate}kbps
                        </span>
                      )}
                      {station.codec && (
                        <span className="flex items-center gap-1">
                          <MdCode size={14} />
                          {station.codec}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handlePlayPause(station)}
                      className={`p-2 rounded-full ${
                        localPlayingState[station.stationuuid]
                          ? 'bg-fuchsia-500'
                          : 'bg-neutral-700 hover:bg-neutral-600'
                      }`}
                    >
                      {localPlayingState[station.stationuuid] ? (
                        <MdPause className="text-white" size={20} />
                      ) : (
                        <MdPlayArrow className="text-white" size={20} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pinned Genres Section */}
        {pinnedGenres.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Pinned Genres</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pinnedGenres.map((genre) => (
                <div
                  key={`pinned-${genre}`}
                  className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-800"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{genre}</h3>
                    <button
                      onClick={() => togglePinGenre(genre)}
                      className="p-1 hover:bg-white/10 rounded-full"
                    >
                      <MdStar className="text-yellow-400" size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {groupedStations[genre]?.slice(0, 3).map((station) => (
                      <div
                        key={station.stationuuid}
                        className="flex items-center justify-between p-2 bg-neutral-800/50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-white truncate">{station.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => togglePinGenre(station)}
                            className="p-1 hover:bg-white/10 rounded-full"
                          >
                            <MdStarBorder className="text-neutral-400" size={16} />
                          </button>
                          <button
                            onClick={() => handlePlayPause(station)}
                            className={`p-2 rounded-full ${
                              localPlayingState[station.stationuuid]
                                ? 'bg-fuchsia-500'
                                : 'bg-neutral-700 hover:bg-neutral-600'
                            }`}
                          >
                            {localPlayingState[station.stationuuid] ? (
                              <MdPause className="text-white" size={16} />
                            ) : (
                              <MdPlayArrow className="text-white" size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={24} />
            <input
              type="text"
              placeholder="Search stations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900/50 border border-neutral-800 rounded-lg py-3 pl-12 pr-4 text-white placeholder-neutral-400 focus:outline-none focus:border-fuchsia-500/50"
            />
          </div>
        </div>

        {/* Stations by Genre */}
        <AnimatePresence>
          {Object.entries(groupedStations).map(([genre, stations]) => {
            const filteredStations = filterStations(stations);
            const visibleStations = expandedStations[genre] 
              ? filteredStations 
              : filteredStations.slice(0, STATIONS_PER_PAGE);

            if (filteredStations.length === 0) return null;

            return (
              <div 
                key={genre} 
                id={`genre-${genre}`}
                className="mb-8 border border-neutral-800 rounded-lg overflow-hidden"
              >
                {/* Genre Header */}
                <div 
                  className="flex items-center justify-between p-4 bg-neutral-900 cursor-pointer"
                  onClick={() => toggleGenreExpanded(genre)}
                >
                  <h2 className="text-xl font-bold text-white">{genre} ({filteredStations.length})</h2>
                  <div
                    className={`${expandedGenres[genre] ? 'rotate-180' : ''}`}
                  >
                    {expandedGenres[genre] ? <MdExpandMore size={24} /> : <MdChevronRight size={24} />}
                  </div>
                </div>

                {/* Stations List */}
                <AnimatePresence initial={false}>
                  {expandedGenres[genre] && (
                    <div className="px-4 py-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {visibleStations.map((station) => {
                          const isStationPlaying = currentStation?.stationuuid === station.stationuuid && isPlaying;
                          const isThisStationLoading = isLoading && currentStation?.stationuuid === station.stationuuid;

                          return (
                            <div
                              key={station.stationuuid}
                              className="bg-neutral-900/50 backdrop-blur-md rounded-xl p-4 border border-white/5 hover:border-fuchsia-500/20 transition-colors cursor-pointer"
                              onClick={() => handlePlayPause(station)}
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-fuchsia-600/20 rounded-lg flex items-center justify-center flex-shrink-0 relative">
                                  {isStationPlaying ? (
                                    <>
                                      <div className="w-full h-full flex items-center justify-center bg-fuchsia-600/20 rounded-lg">
                                        <MdMusicNote className="text-fuchsia-500" size={24} />
                                      </div>
                                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                                        LIVE
                                      </div>
                                    </>
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-fuchsia-600/20 rounded-lg">
                                      <MdMusicNote className="text-fuchsia-500" size={24} />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-white truncate">{station.name}</h3>
                                  {station.genre && (
                                    <p className="text-sm text-neutral-400 truncate">{station.genre}</p>
                                  )}
                                  
                                  {/* Station Metadata */}
                                  <div className="mt-2 space-y-1">
                                    {station.language && (
                                      <div className="flex items-center gap-1 text-xs text-neutral-400">
                                        <MdLanguage size={14} />
                                        <span>{station.language}</span>
                                      </div>
                                    )}
                                    {station.bitrate && (
                                      <div className="flex items-center gap-1 text-xs text-neutral-400">
                                        <MdSpeed size={14} />
                                        <span>{station.bitrate}kbps</span>
                                      </div>
                                    )}
                                    {station.codec && (
                                      <div className="flex items-center gap-1 text-xs text-neutral-400">
                                        <MdCode size={14} />
                                        <span>{station.codec}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log('Favorite button clicked', token, station);
                                      if (!token) {
                                        toast.info('Please log in to add favorites.');
                                        return;
                                      }
                                      toggleFavorite(station);
                                    }}
                                    className="p-1 hover:bg-white/10 rounded-full"
                                  >
                                    {isFavorite(station) ? (
                                      <MdFavorite className="text-fuchsia-500" size={20} />
                                    ) : (
                                      <MdFavoriteBorder className="text-neutral-400" size={20} />
                                    )}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePlayPause(station);
                                    }}
                                    className={`p-2 rounded-full ${
                                      isStationPlaying
                                        ? 'bg-fuchsia-500'
                                        : 'bg-neutral-800 hover:bg-neutral-700'
                                    }`}
                                  >
                                    {isThisStationLoading ? (
                                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : isStationPlaying ? (
                                      <MdPause className="text-white" size={24} />
                                    ) : (
                                      <MdPlayArrow className="text-white" size={24} />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Show More Button */}
                      {filteredStations.length > STATIONS_PER_PAGE && (
                        <div className="mt-4 flex justify-center">
                          <button
                            onClick={() => toggleShowMore(genre)}
                            className="px-4 py-2 bg-fuchsia-500/10 text-fuchsia-500 rounded-lg hover:bg-fuchsia-500/20 transition-colors"
                          >
                            {expandedStations[genre] ? 'Show Less' : 'Show More'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Premium Radio Player */}
      {currentStation && isPlaying && <PremiumRadioPlayer />}
    </div>
  );
};

export default RadioStation; 