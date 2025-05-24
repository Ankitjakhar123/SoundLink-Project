import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import { PlayerContext } from './PlayerContext';

export const RadioContext = createContext();

export const RadioContextProvider = ({ children }) => {
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(new Audio());
  const playerContext = useContext(PlayerContext);

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

    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const playStation = (station) => {
    try {
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
      setError(null);
      
      // Configure audio element
      const audio = audioRef.current;
      audio.src = station.url_resolved;
      audio.crossOrigin = 'anonymous';
      
      // Start playback
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
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
            setError('Failed to start playback');
            setIsPlaying(false);
            setCurrentStation(null);
          });
      }
    } catch (error) {
      console.error('Error playing station:', error);
      setError('Failed to play radio station');
      setIsPlaying(false);
      setCurrentStation(null);
    }
  };

  const stopStation = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setCurrentStation(null);
    setError(null);
  };

  const value = {
    currentStation,
    isPlaying,
    error,
    playStation,
    stopStation
  };

  return (
    <RadioContext.Provider value={value}>
      {children}
    </RadioContext.Provider>
  );
}; 