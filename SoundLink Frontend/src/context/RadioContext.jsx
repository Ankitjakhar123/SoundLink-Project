import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import { PlayerContext } from './PlayerContext';
import { toast } from 'react-toastify';

export const RadioContext = createContext();

export const RadioContextProvider = ({ children }) => {
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [volume, setVolumeState] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(new Audio());
  const playerContext = useContext(PlayerContext);
  const retryTimeoutRef = useRef(null);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('radioFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('radioFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    
    const handleError = (e) => {
      console.error('Radio playback error:', e);
      setError('Failed to play radio station');
      setIsPlaying(false);
      setCurrentStation(null);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentStation(null);
    };

    const handleVolumeChange = () => {
      audio.volume = isMuted ? 0 : volume;
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
    };

    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('volumechange', handleVolumeChange);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);

    return () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('volumechange', handleVolumeChange);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.pause();
      audio.src = '';
    };
  }, [volume, isMuted]);

  const playStation = async (station, retryCount = 0) => {
    try {
      setIsLoading(true);
      setError(null);

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      // Pause any playing track from PlayerContext if available
      if (playerContext?.pause) {
        playerContext.pause();
      }

      // Set up the radio station
      setCurrentStation(station);
      
      // Configure audio element
      const audio = audioRef.current;
      audio.src = station.url_resolved;
      audio.crossOrigin = 'anonymous';
      audio.volume = isMuted ? 0 : volume;
      
      // Start playback
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Add to recently played
            setRecentlyPlayed(prev => {
              const filtered = prev.filter(s => s.stationuuid !== station.stationuuid);
              return [station, ...filtered].slice(0, 10);
            });
            // Create a track object for the radio station
            const radioTrack = {
              name: station.name,
              file: station.url_resolved,
              image: station.favicon,
              singer: 'Live Radio',
              albumName: 'Radio Station',
              isRadio: true,
              radioStation: station
            };
            // Update the track in PlayerContext if available
            if (playerContext?.setTrack) {
              playerContext.setTrack(radioTrack);
            }
          })
          .catch((error) => {
            console.error('Playback failed:', error);
            if (retryCount < MAX_RETRIES) {
              // Retry after delay
              retryTimeoutRef.current = setTimeout(() => {
                playStation(station, retryCount + 1);
              }, RETRY_DELAY);
            } else {
              setError('Failed to start playback');
              setIsPlaying(false);
            }
          });
      }
    } catch (error) {
      console.error('Error playing station:', error);
      if (retryCount < MAX_RETRIES) {
        // Retry after delay
        retryTimeoutRef.current = setTimeout(() => {
          playStation(station, retryCount + 1);
        }, RETRY_DELAY);
      } else {
        setError('Failed to play radio station');
        setIsPlaying(false);
      }
    }
  };

  const stopStation = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setError(null);
    setIsLoading(false);
  };

  const forceStopRadio = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      audioRef.current.load();
      audioRef.current.removeAttribute('src');
    }
    setIsPlaying(false);
    setCurrentStation(null);
    setError(null);
    setIsLoading(false);
  };

  const clearRadio = () => {
    forceStopRadio();
  };

  const toggleFavorite = (station) => {
    setFavorites(prev => {
      const isFavorite = prev.some(s => s.stationuuid === station.stationuuid);
      if (isFavorite) {
        toast.info('Removed from favorites');
        return prev.filter(s => s.stationuuid !== station.stationuuid);
      } else {
        toast.success('Added to favorites');
        return [...prev, station];
      }
    });
  };

  const isFavorite = (station) => {
    return favorites.some(s => s.stationuuid === station.stationuuid);
  };

  const updateVolume = (newVolume) => {
    setVolumeState(Math.max(0, Math.min(1, newVolume)));
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const value = {
    currentStation,
    isPlaying,
    error,
    volume,
    isMuted,
    favorites,
    recentlyPlayed,
    isLoading,
    playStation,
    stopStation,
    clearRadio,
    forceStopRadio,
    toggleFavorite,
    isFavorite,
    updateVolume,
    toggleMute,
    audioRef
  };

  return (
    <RadioContext.Provider value={value}>
      {children}
    </RadioContext.Provider>
  );
}; 