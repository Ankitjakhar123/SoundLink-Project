import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MdPlayArrow, MdPause, MdRadio, MdMusicNote, MdExpandMore, MdChevronRight, MdSearch } from 'react-icons/md';

const RadioStations = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [groupedStations, setGroupedStations] = useState({});
  const [expandedGenres, setExpandedGenres] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStations, setExpandedStations] = useState({});
  const STATIONS_PER_PAGE = 10;

  useEffect(() => {
    fetchStations();
  }, []);

  // Effect to handle playback when currentStation changes
  useEffect(() => {
    if (audioRef.current && currentStation) {
      audioRef.current.src = currentStation.url;
      audioRef.current.load();

      const onCanPlay = () => {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Playback failed:', error);
            setIsPlaying(false);
            setError('Failed to play station. Please try again.');
          });
        } else {
          setIsPlaying(true);
        }
      };

      audioRef.current.addEventListener('canplay', onCanPlay);
      return () => {
        audioRef.current?.removeEventListener('canplay', onCanPlay);
      };
    } else if (audioRef.current && !currentStation) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  }, [currentStation]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        if (audioRef.current.paused) {
          audioRef.current.play().catch(error => {
            console.error('Playback failed on resume:', error);
            setIsPlaying(false);
            setError('Failed to resume playback.');
          });
        }
      } else {
        if (!audioRef.current.paused) {
          audioRef.current.pause();
        }
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => { console.log('Audio playing'); setIsPlaying(true); };
    const handlePause = () => { console.log('Audio paused'); setIsPlaying(false); };
    const handleEnded = () => { console.log('Audio ended'); setIsPlaying(false); };
    const handleError = () => {
      console.error('Audio error');
      setIsPlaying(false);
      setError('An audio error occurred. Please try another station.');
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleError);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://de1.api.radio-browser.info/json/stations/bycountry/India');
      const data = await response.json();
      
      const validStations = data
        .filter(station => {
          const url = station.url_resolved || station.url;
          return url && (url.endsWith('.mp3') || url.includes('stream'));
        });

      groupStationsByGenre(validStations);
    } catch (err) {
      setError('Failed to fetch radio stations');
      console.error('Error fetching stations:', err);
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

  const handlePlayStation = (station) => {
    if (currentStation && currentStation.stationuuid === station.stationuuid) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentStation(station);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    setIsPlaying(false);
    setError('Failed to play station');
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
          {
            Object.entries(groupedStations).map(([genre, stations]) => {
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
                          {visibleStations.map((station) => (
                            <div
                              key={station.stationuuid}
                              className="bg-neutral-900/50 backdrop-blur-md rounded-xl p-4 border border-white/5 hover:border-fuchsia-500/20 transition-colors cursor-pointer"
                              onClick={() => handlePlayStation(station)}
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-fuchsia-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <MdMusicNote className="text-fuchsia-500" size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-white truncate">{station.name}</h3>
                                  {station.genre && (
                                    <p className="text-sm text-neutral-400 truncate">{station.genre}</p>
                                  )}
                                  {station.tags && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {station.tags.split(',').slice(0, 3).map((tag, index) => (
                                        <span 
                                          key={index}
                                          className="text-xs bg-fuchsia-500/10 text-fuchsia-500 px-2 py-0.5 rounded-full"
                                        >
                                          {tag.trim()}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePlayStation(station)
                                  }}
                                  className={`p-2 rounded-full ${
                                    currentStation?.stationuuid === station.stationuuid && isPlaying
                                      ? 'bg-fuchsia-500'
                                      : 'bg-neutral-800 hover:bg-neutral-700'
                                  }`}
                                >
                                  {currentStation?.stationuuid === station.stationuuid && isPlaying ? (
                                    <MdPause className="text-white" size={24} />
                                  ) : (
                                    <MdPlayArrow className="text-white" size={24} />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
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
            })
          }
        </AnimatePresence>

        {/* Audio Player */}
        <audio
          ref={audioRef}
          onEnded={handleAudioEnded}
          onError={handleAudioError}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default RadioStations; 