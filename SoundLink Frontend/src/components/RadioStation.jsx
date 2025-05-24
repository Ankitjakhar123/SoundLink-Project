import React, { useContext, useState, useEffect } from "react";
import { RadioContext } from "../context/RadioContext";
import { PlayerContext } from "../context/PlayerContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { MdPlayArrow, MdPause, MdRadio, MdMusicNote, MdExpandMore, MdChevronRight, MdSearch, MdLanguage, MdWeb, MdSpeed, MdCode } from "react-icons/md";

const RadioStation = () => {
  const radioContext = useContext(RadioContext);
  const { currentStation, isPlaying, playStation, stopStation } = radioContext || {};
  const [isLoading, setIsLoading] = useState(false);
  const [localPlayingState, setLocalPlayingState] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupedStations, setGroupedStations] = useState({});
  const [expandedGenres, setExpandedGenres] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStations, setExpandedStations] = useState({});
  const STATIONS_PER_PAGE = 10;

  // Sync local state with context state
  useEffect(() => {
    if (currentStation) {
      setLocalPlayingState(prev => ({
        ...prev,
        [currentStation.stationuuid]: isPlaying
      }));
    }
  }, [currentStation, isPlaying]);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://de1.api.radio-browser.info/json/stations/bycountry/India');
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
      Rajasthani: [],
      Bollywood: [],
      Other: []
    };

    allStations.forEach(station => {
      const stationGenres = station.tags ? station.tags.toLowerCase().split(',') : [];
      let addedToGenre = false;

      if (stationGenres.some(tag => tag.trim().includes('hindi') || tag.trim().includes('bollywood'))) {
        genres.Hindi.push(station);
        addedToGenre = true;
      }
      
      if (stationGenres.some(tag => tag.trim().includes('rajasthani'))) {
        genres.Rajasthani.push(station);
        addedToGenre = true;
      }

      if (!addedToGenre && station.name.toLowerCase().includes('bollywood')) {
         genres.Bollywood.push(station);
         addedToGenre = true;
      }

      if (!addedToGenre && stationGenres.some(tag => tag.trim().includes('bollywood'))) {
          genres.Bollywood.push(station);
          addedToGenre = true;
      }

      if (!addedToGenre) {
        genres.Other.push(station);
      }
    });
    
    const orderedGenres = {};
    if (genres.Hindi.length > 0) orderedGenres.Hindi = genres.Hindi;
    if (genres.Rajasthani.length > 0) orderedGenres.Rajasthani = genres.Rajasthani;
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
      setIsLoading(true);
      
      // Check if this station is currently playing
      const isThisStationPlaying = currentStation?.stationuuid === station.stationuuid && isPlaying;
      
      if (isThisStationPlaying) {
        // If this station is playing, stop it
        stopStation();
        setLocalPlayingState(prev => ({
          ...prev,
          [station.stationuuid]: false
        }));
      } else {
        // Create a proper station object with required fields
        const stationData = {
          stationuuid: station.stationuuid || station._id,
          name: station.name,
          url_resolved: station.url_resolved || station.streamUrl,
          favicon: station.favicon || station.image,
          bitrate: station.bitrate || '128',
          codec: station.codec || 'MP3',
          country: station.country || 'IN',
          language: station.language || 'Hindi'
        };
        
        // Stop any currently playing station
        if (isPlaying) {
          stopStation();
        }
        
        // Play the new station
        playStation(stationData);
        setLocalPlayingState(prev => ({
          ...prev,
          [stationData.stationuuid]: true
        }));
      }
    } catch (error) {
      console.error('Error handling radio station:', error);
      toast.error('Failed to play radio station. Please try again.');
      // Reset local state on error
      setLocalPlayingState(prev => ({
        ...prev,
        [station.stationuuid || station._id]: false
      }));
    } finally {
      setIsLoading(false);
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
              <div key={genre} className="mb-8 border border-neutral-800 rounded-lg overflow-hidden">
                {/* Genre Header */}
                <motion.div 
                  className="flex items-center justify-between p-4 bg-neutral-900 cursor-pointer"
                  onClick={() => toggleGenreExpanded(genre)}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-white">{genre} ({filteredStations.length})</h2>
                  <motion.div
                    animate={{ rotate: expandedGenres[genre] ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {expandedGenres[genre] ? <MdExpandMore size={24} /> : <MdChevronRight size={24} />}
                  </motion.div>
                </motion.div>

                {/* Stations List - Collapsible */}
                <AnimatePresence initial={false}>
                  {expandedGenres[genre] && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="px-4 py-2"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {visibleStations.map((station) => {
                          const isStationPlaying = localPlayingState[station.stationuuid] || 
                            (currentStation?.stationuuid === station.stationuuid && isPlaying);

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
                                  {isLoading ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : isStationPlaying ? (
                                    <MdPause className="text-white" size={24} />
                                  ) : (
                                    <MdPlayArrow className="text-white" size={24} />
                                  )}
                                </button>
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RadioStation; 