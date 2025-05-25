import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import { PlayerContext } from './PlayerContext';
import { toast } from 'react-toastify';
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { API_BASE_URL } from "../utils/api";

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
  const { token } = useContext(AuthContext);

  // Fetch radio favorites from backend
  const getRadioFavorites = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/favorite/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const radioFavs = response.data.favorites.filter(fav => fav.radioStation);
        setFavorites(radioFavs.map(fav => fav.radioStation));
      }
    } catch {
      // handle error
    }
  };

  useEffect(() => {
    if (token) {
      getRadioFavorites();
    }
  }, [token]);

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
      // Don't clear the current station when audio ends
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
        console.log('Pausing premium player');
        playerContext.pause();
      }
      // Also clear the current song and reset the premium player audio element
      if (playerContext?.setTrack) {
        console.log('Clearing premium player track');
        playerContext.setTrack(null);
      }
      if (playerContext?.audioRef?.current) {
        console.log('Resetting premium player audio element');
        playerContext.audioRef.current.pause();
        playerContext.audioRef.current.currentTime = 0;
        playerContext.audioRef.current.src = '';
        playerContext.audioRef.current.load();
        playerContext.audioRef.current.removeAttribute('src');
      }
      // Fallback: pause all audio elements on the page
      console.log('Pausing all audio elements on the page');
      document.querySelectorAll('audio').forEach(a => {
        a.pause();
        a.currentTime = 0;
        a.src = '';
        a.load();
      });

      // Set up the radio station
      setCurrentStation(station);
      
      // Configure audio element
      const audio = audioRef.current;
      audio.src = station.url_resolved;
      audio.crossOrigin = 'anonymous';
      audio.volume = isMuted ? 0 : volume;

      // Set up media session metadata for lockscreen controls
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: station.name,
          artist: 'Live Radio',
          album: station.language || 'Radio Station',
          artwork: [
            { 
              src: station.favicon || station.logo || 'https://your-default-radio-logo.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        });

        // Set up media session action handlers
        navigator.mediaSession.setActionHandler('play', () => {
          playStation(station);
        });

        navigator.mediaSession.setActionHandler('pause', () => {
          stopStation();
        });

        // Update playback state
        navigator.mediaSession.playbackState = 'playing';
      }
      
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
    // Update media session state
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
    setIsPlaying(false);
    setError(null);
    setIsLoading(false);
    // Don't clear the current station when pausing
  };

  const forceStopRadio = () => {
    console.log("forceStopRadio called");
    console.log("audioRef.current:", audioRef.current);
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
    // Fallback: pause all audio elements on the page
    document.querySelectorAll('audio').forEach(a => {
      a.pause();
      a.currentTime = 0;
      a.src = '';
      a.load();
    });
    setIsPlaying(false);
    setCurrentStation(null);
    setError(null);
    setIsLoading(false);
  };

  const clearRadio = () => {
    forceStopRadio();
  };

  // Toggle favorite for radio station
  const toggleFavorite = async (station) => {
    if (!token) {
      toast.info('Please log in to add favorites.');
      return;
    }
    // If logged in, sync with backend
    const isFavorite = favorites.some(s => s.stationuuid === station.stationuuid);
    if (isFavorite) {
      await axios.post(`${API_BASE_URL}/api/favorite/unlike`, { radioStation: { stationuuid: station.stationuuid } }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(prev => prev.filter(s => s.stationuuid !== station.stationuuid));
      toast.info('Removed from favorites');
    } else {
      await axios.post(`${API_BASE_URL}/api/favorite/like`, { radioStation: station }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(prev => [...prev, station]);
      toast.success('Added to favorites');
    }
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