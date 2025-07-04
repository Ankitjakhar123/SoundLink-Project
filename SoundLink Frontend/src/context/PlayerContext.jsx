import { createContext, useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../utils/api";
import { extractColors } from 'extract-colors';
import { RadioContext } from './RadioContext';
import YouTubeService from '../utils/youtubeService';
//import { assets } from "../assets/assets";

export const PlayerContext = createContext();

export const PlayerContextProvider = ({ children }) => {
  const audioRef = useRef();
  const seekBg = useRef();
  const seekBar = useRef();
  const volumeRef = useRef();
  const { user, token } = useContext(AuthContext);
  const radioContext = useContext(RadioContext);

  // Add sleep timer state
  const [sleepTimer, setSleepTimerState] = useState(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(null);
  const sleepTimerRef = useRef(null);
  const sleepTimerIntervalRef = useRef(null);
  const sleepTimerEndTimeRef = useRef(null);

  // Add sleep timer function
  const setSleepTimer = (minutes) => {
    // Clear any existing timers
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    if (sleepTimerIntervalRef.current) {
      clearInterval(sleepTimerIntervalRef.current);
      sleepTimerIntervalRef.current = null;
    }

    if (minutes === 0) {
      setSleepTimerState(null);
      setSleepTimerRemaining(null);
      sleepTimerEndTimeRef.current = null;
      return;
    }

    const milliseconds = minutes * 60 * 1000;
    setSleepTimerState(minutes);
    setSleepTimerRemaining(minutes * 60); // Set initial remaining time in seconds
    sleepTimerEndTimeRef.current = Date.now() + milliseconds;

    // Start countdown interval
    sleepTimerIntervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((sleepTimerEndTimeRef.current - Date.now()) / 1000));
      setSleepTimerRemaining(remaining);
      
      if (remaining <= 0) {
        clearInterval(sleepTimerIntervalRef.current);
        sleepTimerIntervalRef.current = null;
      }
    }, 1000);

    // Start the main timer
    sleepTimerRef.current = setTimeout(() => {
      // Fade out volume over 5 seconds
      let currentVolume = audioRef.current?.volume || 1;
      const fadeInterval = setInterval(() => {
        if (audioRef.current && currentVolume > 0.1) {
          currentVolume -= 0.1;
          audioRef.current.volume = currentVolume;
        } else {
          clearInterval(fadeInterval);
          pause();
          setSleepTimerState(null);
          setSleepTimerRemaining(null);
          sleepTimerEndTimeRef.current = null;
        }
      }, 500);

      // Clear the timer reference
      sleepTimerRef.current = null;
    }, milliseconds);

    // Add visibility change handler for iOS
    const handleVisibilityChange = () => {
      if (document.hidden && sleepTimerEndTimeRef.current) {
        const remainingTime = sleepTimerEndTimeRef.current - Date.now();
        if (remainingTime <= 0) {
          // Timer has expired while in background
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.volume = 1;
          }
          setSleepTimerState(null);
          setSleepTimerRemaining(null);
          sleepTimerEndTimeRef.current = null;
        } else {
          // Reschedule the timer
          if (sleepTimerRef.current) {
            clearTimeout(sleepTimerRef.current);
          }
          sleepTimerRef.current = setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.volume = 1;
            }
            setSleepTimerState(null);
            setSleepTimerRemaining(null);
            sleepTimerEndTimeRef.current = null;
          }, remainingTime);
        }
      }
    };

    // Add event listener for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
      }
      if (sleepTimerIntervalRef.current) {
        clearInterval(sleepTimerIntervalRef.current);
      }
    };
  };

  // Add effect to handle sleep timer cleanup
  useEffect(() => {
    return () => {
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
      }
      if (sleepTimerIntervalRef.current) {
        clearInterval(sleepTimerIntervalRef.current);
      }
    };
  }, []);

  // Add effect to handle sleep timer state persistence
  useEffect(() => {
    if (sleepTimer) {
      // Store sleep timer state
      localStorage.setItem('sleepTimer', JSON.stringify({
        minutes: sleepTimer,
        endTime: sleepTimerEndTimeRef.current
      }));
    } else {
      localStorage.removeItem('sleepTimer');
    }
  }, [sleepTimer]);

  // Add effect to restore sleep timer state on mount
  useEffect(() => {
    const savedSleepTimer = localStorage.getItem('sleepTimer');
    if (savedSleepTimer) {
      try {
        const { minutes, endTime } = JSON.parse(savedSleepTimer);
        const remainingTime = endTime - Date.now();
        if (remainingTime > 0) {
          setSleepTimerState(minutes);
          setSleepTimerRemaining(Math.floor(remainingTime / 1000));
          sleepTimerEndTimeRef.current = endTime;
          
          // Restart countdown interval
          sleepTimerIntervalRef.current = setInterval(() => {
            const remaining = Math.max(0, Math.floor((sleepTimerEndTimeRef.current - Date.now()) / 1000));
            setSleepTimerRemaining(remaining);
            
            if (remaining <= 0) {
              clearInterval(sleepTimerIntervalRef.current);
              sleepTimerIntervalRef.current = null;
            }
          }, 1000);

          sleepTimerRef.current = setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.volume = 1;
            }
            setSleepTimerState(null);
            setSleepTimerRemaining(null);
            sleepTimerEndTimeRef.current = null;
          }, remainingTime);
        } else {
          localStorage.removeItem('sleepTimer');
        }
      } catch (error) {
        console.error('Error restoring sleep timer:', error);
        localStorage.removeItem('sleepTimer');
      }
    }
  }, []);

  // Format remaining time for display
  const formatRemainingTime = (seconds) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Helper function to extract the artist name from any possible field
  const getArtistName = (trackObj) => {
    if (!trackObj) {
      return 'Unknown Artist';
    }
    
    // Check each field in priority order
    if (trackObj.artist && typeof trackObj.artist === 'object' && trackObj.artist.name) {
      return trackObj.artist.name;
    }
    
    if (trackObj.singer) {
      return trackObj.singer;
    }
    
    if (trackObj.artist && typeof trackObj.artist === 'string') {
      return trackObj.artist;
    }
    
    if (trackObj.artistName) {
      return trackObj.artistName;
    }
    
    // Use description field directly as artist name since that's where we store it
    // in the bulk upload and custom artist input
    if (trackObj.desc && typeof trackObj.desc === 'string') {
      return trackObj.desc;
    }
    
    if (trackObj.metadata && trackObj.metadata.artist) {
      return trackObj.metadata.artist;
    }
    
    if (trackObj.meta && trackObj.meta.artist) {
      return trackObj.meta.artist;
    }
    
    if (trackObj.tags && trackObj.tags.artist) {
      return trackObj.tags.artist;
    }
    
    if (trackObj.createdBy && trackObj.createdBy.name) {
      return trackObj.createdBy.name;
    }
    
    return 'Unknown Artist';
  };
  
  // Helper function to extract the album name from any possible field
  const getAlbumName = (trackObj) => {
    if (!trackObj) {
      return 'Unknown Album';
    }
    
    // Check each field in priority order
    if (trackObj.albumName) {
      return trackObj.albumName;
    }
    
    if (trackObj.album) {
      return trackObj.album;
    }
    
    if (trackObj.metadata && trackObj.metadata.album) {
      return trackObj.metadata.album;
    }
    
    if (trackObj.meta && trackObj.meta.album) {
      return trackObj.meta.album;
    }
    
    if (trackObj.tags && trackObj.tags.album) {
      return trackObj.tags.album;
    }
    
    return 'Unknown Album';
  };

  // Remove unused state variables
  const [songsData, setSongsData] = useState([]);
  const [albumsData, setAlbumsData] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [track, setTrack] = useState(null);
  const [playStatus, setPlayStatus] = useState(false);
  const [loop, setLoop] = useState(false);
  const [queueSongs, setQueueSongs] = useState([]);
  const [autoplayEnabled, setAutoplayEnabled] = useState(() => {
    // Get saved preference from localStorage, default to true if not set
    const savedAutoplay = localStorage.getItem('autoplayEnabled');
    return savedAutoplay === null ? true : savedAutoplay === 'true';
  });
  const [hidePlayer, setHidePlayer] = useState(false);
  const [loading, setLoading] = useState({
    songs: true,
    albums: true,
    favorites: false,
    playlists: false
  });
  const [error, setError] = useState({
    songs: null,
    albums: null,
    favorites: null,
    playlists: null
  });
  const [time, setTime] = useState({
    currentTime: { second: 0, minute: 0 },
    totalTime: { second: 0, minute: 0 }
  });
  
  // Theme colors extracted from album art
  const [themeColors, setThemeColors] = useState({
    primary: '#a855f7',
    secondary: '#121212',
    text: '#ffffff',
    accent: '#ec4899'
  });

  // Add this after the other state declarations
  const [lastPlayedSong, setLastPlayedSong] = useState(null);

  const [crossfadeDuration] = useState(1000);
  const [isCrossfading, setIsCrossfading] = useState(false);
  const nextAudioRef = useRef(null);

  const [useYouTubePlayer, setUseYouTubePlayer] = useState(false);
  const [currentYouTubeVideo, setCurrentYouTubeVideo] = useState(null);
  const [youtubeQueue, setYoutubeQueue] = useState([]);

  // Initialize audio context
  const initAudioContext = () => {
    if (!window._audioContext) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        window._audioContext = new AudioContext();
      } catch {
        // Error handled silently - audio might still work
      }
      
      if (window._audioContext && window._audioContext.state === 'suspended') {
        window._audioContext.resume()
          .then(() => {/* Audio context resumed */})
          .catch(() => {/* Failed to resume, but continue anyway */});
      }
      
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        const unlockIOSAudio = () => {
          if (window._audioContext) {
            const buffer = window._audioContext.createBuffer(1, 1, 22050);
            const source = window._audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(window._audioContext.destination);
            source.start(0);
            source.stop(0.001);
          }
        };
        
        const unlockOnFirstTouch = () => {
          unlockIOSAudio();
          document.body.removeEventListener('touchstart', unlockOnFirstTouch);
          document.body.removeEventListener('touchend', unlockOnFirstTouch);
          document.body.removeEventListener('mousedown', unlockOnFirstTouch);
          document.body.removeEventListener('mouseup', unlockOnFirstTouch);
          document.body.removeEventListener('click', unlockOnFirstTouch);
        };
        
        document.body.addEventListener('touchstart', unlockOnFirstTouch, false);
        document.body.addEventListener('touchend', unlockOnFirstTouch, false);
        document.body.addEventListener('mousedown', unlockOnFirstTouch, false);
        document.body.addEventListener('mouseup', unlockOnFirstTouch, false);
        document.body.addEventListener('click', unlockOnFirstTouch, false);
        
        const silentSound = document.createElement('audio');
        silentSound.controls = false;
        silentSound.preload = 'auto';
        silentSound.loop = false;
        silentSound.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RSU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQ19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1/////////////////////////////////8AAAA5TEFNRTMuMTAwAQAAADkAAABRiCJGmDgAAgAAABYAYOoA/////////////////////////////////8wAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
        silentSound.setAttribute('style', 'display: none;');
        document.body.appendChild(silentSound);
        
        silentSound.play()
          .then(() => {
            setTimeout(() => {
              silentSound.pause();
              silentSound.remove();
            }, 1000);
          })
          .catch(() => {
            silentSound.remove();
          });
      }
    }
  };

  // Modified play function with audio context initialization and buffering control
  const play = () => {
    initAudioContext();

    if (audioRef.current) {
      try {
        if (!audioRef.current.src || audioRef.current.src === '') {
          if (track && track.file) {
            audioRef.current.src = track.file;
            audioRef.current.load();
          } else {
            console.error('No track or track.file available');
            return;
          }
        }
        
        // Ensure audio is loaded before playing
        if (audioRef.current.readyState < 3) { // HAVE_FUTURE_DATA
          audioRef.current.load();
        }
        
        setPlayStatus(true);
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setPlayStatus(true);
            })
            .catch(err => {
              console.error('Play promise error:', err);
              setPlayStatus(false);
              
              // Try to resume audio context if it was suspended
              if (window._audioContext && window._audioContext.state === 'suspended') {
                window._audioContext.resume()
                  .then(() => {
                    // Try playing again after resuming context
                    audioRef.current.play()
                      .then(() => setPlayStatus(true))
                      .catch(retryErr => {
                        console.error('Failed to play after context resume:', retryErr);
                        setPlayStatus(false);
                      });
                  })
                  .catch(err => {
                    console.error('Failed to resume audio context:', err);
                    setPlayStatus(false);
                  });
              }
            });
        }
      } catch (error) {
        console.error('Error in play function:', error);
        setPlayStatus(false);
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        setPlayStatus(false);
      } catch (error) {
        console.error('Error pausing audio:', error);
        setPlayStatus(false);
      }
    }
  };

  // Helper function to calculate brightness
  const getBrightness = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  };

  // Helper function to lighten a color
  const lightenColor = (hex, amount) => {
    try {
      // Convert hex to RGB
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      
      // Increase RGB values
      const newR = Math.min(255, r + amount);
      const newG = Math.min(255, g + amount);
      const newB = Math.min(255, b + amount);
      
      // Convert back to hex
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    } catch (error) {
      console.error('Error lightening color:', error);
      return hex;
    }
  };

  // Extract color theme from track for UI theming
  const extractColorsFromTrack = async (trackObj) => {
    if (!trackObj || !trackObj.image) {
      return {
        primary: '#8b5cf6',   // Default purple
        secondary: '#0f172a', // Default dark blue/black
        text: '#ffffff'       // Default white
      };
    }
    
    try {
      // Use react-extract-colors to get palette
      const colors = await extractColors(trackObj.image, {
        crossOrigin: 'anonymous',
        pixels: 10000,
        distance: 0.2,
        saturationDistance: 0.2,
        lightnessDistance: 0.2,
        hueDistance: 0.1
      });
      
      if (colors && colors.length > 0) {
        // Get the most vibrant color for primary
        const sortedByVibrance = [...colors].sort((a, b) => {
          // Calculate color vibrance (saturation × brightness)
          const aVibrance = a.saturation * a.lightness;
          const bVibrance = b.saturation * b.lightness;
          return bVibrance - aVibrance;
        });
        
        // Get primary color and make it brighter
        let primary = sortedByVibrance[0].hex;
        primary = lightenColor(primary, 20); // Reduced from 40 to 20
        
        // Get a darker color for background/secondary
        const sortedByDarkness = [...colors].sort((a, b) => {
          return a.lightness - b.lightness;
        });
        
        // Get secondary color and lighten it substantially
        let secondary = sortedByDarkness[0].hex;
        secondary = lightenColor(secondary, 25); // Reduced from 60 to 25 for a darker background
        
        // Determine text color based on background
        const textColor = getBrightness(secondary) > 170 ? '#000000' : '#ffffff';
        
        return {
          primary,
          secondary,
          text: textColor,
          accent: lightenColor(primary, 15) // Reduced from 30 to 15
        };
      }
    } catch (error) {
      console.error('Error extracting colors:', error);
    }
    
    // Fallback if extraction fails
    return {
      primary: '#8b5cf6',
      secondary: '#0f172a',
      text: '#ffffff',
      accent: '#ec4899'
    };
  };

  // Add this function after the other functions
  const saveLastPlayedSong = (song) => {
    if (song) {
      localStorage.setItem('lastPlayedSong', JSON.stringify(song));
      setLastPlayedSong(song);
    }
  };

  // Modify playWithId function to fetch song data if needed
  const playWithId = async (id) => {
    console.log('playWithId called with id:', id);
    
    if (track && track._id === id) {
      console.log('Same track, toggling play state');
      if (playStatus) {
        pause();
      } else {
        play();
      }
      return;
    }
    
    let selectedTrack = songsData.find((song) => song._id === id);
    console.log('Found track in songsData:', selectedTrack);
    
    // If track not found in songsData, fetch it from the API
    if (!selectedTrack) {
      try {
        console.log('Track not found in songsData, fetching from API');
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
        const response = await axios.get(`${backendUrl}/api/songs/${id}`);
        if (response.data.success) {
          selectedTrack = response.data.song;
          // Add to songsData to avoid future fetches
          setSongsData(prev => [...prev, selectedTrack]);
          console.log('Successfully fetched track from API:', selectedTrack);
        } else {
          console.error(`Failed to fetch song with ID ${id}`);
          return;
        }
      } catch (error) {
        console.error(`Error fetching song with ID ${id}:`, error);
        return;
      }
    }

    if (radioContext?.forceStopRadio) {
      console.log('Stopping radio playback');
      radioContext.forceStopRadio();
    }

    // Stop YouTube playback if active
    if (useYouTubePlayer) {
      console.log('Stopping YouTube playback');
      setUseYouTubePlayer(false);
      setCurrentYouTubeVideo(null);
    }

    // Immediately pause current track and reset state
    if (audioRef.current) {
      console.log('Pausing current track');
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      audioRef.current.load();
    }

    try {
      console.log('Extracting colors from track');
      const colorTheme = await extractColorsFromTrack(selectedTrack);
      setThemeColors(colorTheme);
    } catch (error) {
      console.error('Error extracting colors:', error);
      setThemeColors({
        primary: '#8b5cf6',
        secondary: '#0f172a',
        text: '#ffffff'
      });
    }
    
    console.log('Setting new track:', selectedTrack);
    setTrack(selectedTrack);
    saveLastPlayedSong(selectedTrack);
    
    if (user && user._id && token) {
      try {
        console.log('Recording play history');
        await axios.post(
          `${API_BASE_URL}/api/play/add`,
          { song: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Failed to record play history:', error);
      }
    }
    
    // Set up new track
    setTimeout(() => {
      if (audioRef.current) {
        console.log('Setting up new track for playback');
        audioRef.current.src = selectedTrack.file;
        audioRef.current.load();
        
        // Set up media session
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: selectedTrack.title,
            artist: getArtistName(selectedTrack),
            album: getAlbumName(selectedTrack),
            artwork: [
              { src: selectedTrack.image || '/default-album.png' }
            ]
          });
        }
        
        // Start playback
        console.log('Starting playback');
        play();
      }
    }, 100);
  };

  const Previous = () => {
    if (queueSongs.length > 0) {
      // If we have queue songs, stay in the queue
      return;
    }
    
    const currentIndex = songsData.findIndex(item => item._id === track._id);
    if (currentIndex > 0) {
      // Immediately pause current track
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      // Reset time state
      setTime({
        currentTime: { second: 0, minute: 0 },
        totalTime: { second: 0, minute: 0 }
      });
      
      // Reset seek bar
      if (seekBar.current) {
        seekBar.current.style.width = '0%';
      }
      
      const previousTrack = songsData[currentIndex - 1];
      setTrack(previousTrack);
      setAutoplayEnabled(true);
      
      // Small delay to ensure state updates before playing
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = previousTrack.file;
          audioRef.current.load();
          play();
        }
      }, 50);
    }
  };

  // Modify Next function to be simpler
  const Next = () => {
    if (isCrossfading) return;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    setTime({
      currentTime: { second: 0, minute: 0 },
      totalTime: { second: 0, minute: 0 }
    });
    
    if (seekBar.current) {
      seekBar.current.style.width = '0%';
    }
    
    if (queueSongs.length > 0) {
      const nextTrack = queueSongs[0];
      setTrack(nextTrack);
      setQueueSongs(prevQueue => prevQueue.slice(1));
      setAutoplayEnabled(true);
      
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = nextTrack.file;
          audioRef.current.load();
          play();
        }
      }, 50);
      return;
    }
    
    const currentIndex = songsData.findIndex(item => item._id === track._id);
    if (currentIndex < songsData.length - 1) {
      const nextTrack = songsData[currentIndex + 1];
      setTrack(nextTrack);
      setAutoplayEnabled(true);
      
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = nextTrack.file;
          audioRef.current.load();
          play();
        }
      }, 50);
    }
  };

  const shuffle = () => {
    const randomIndex = Math.floor(Math.random() * songsData.length);
    setTrack(songsData[randomIndex]);
    setAutoplayEnabled(true);
  };

  const toggleLoop = () => {
    audioRef.current.loop = !audioRef.current.loop;
    setLoop(audioRef.current.loop);
  };

  const seekSong = (e) => {
    const width = seekBg.current.offsetWidth;
    const offsetX = e.nativeEvent.offsetX;
    const duration = audioRef.current.duration;
    audioRef.current.currentTime = (offsetX / width) * duration;
  };

  const changeVolume = (e) => {
    audioRef.current.volume = e.target.value / 100;
  };

  // Queue management functions
  const addToQueue = (songId) => {
    const songToAdd = songsData.find(song => song._id === songId);
    if (songToAdd) {
      setQueueSongs(prevQueue => [...prevQueue, songToAdd]);
      toast.success("Added to queue");
      return true;
    }
    return false;
  };

  const removeFromQueue = (index) => {
    setQueueSongs(prevQueue => prevQueue.filter((_, i) => i !== index));
  };

  const moveQueueItem = (fromIndex, toIndex) => {
    setQueueSongs(prevQueue => {
      const newQueue = [...prevQueue];
      const [removed] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, removed);
      return newQueue;
    });
  };

  const clearQueue = () => {
    setQueueSongs([]);
    toast.success("Queue cleared");
  };

  // Fetch user's favorites
  const getFavorites = async () => {
    if (!token) return;
    
    try {
      setLoading(prev => ({...prev, favorites: true}));
      setError(prev => ({...prev, favorites: null}));
      
      const response = await axios.get(`${API_BASE_URL}/api/favorite/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Extract songs from favorites
        const favoriteSongs = response.data.favorites
          .filter(fav => fav.song)
          .map(fav => fav.song);
          
        setFavorites(favoriteSongs);
      }
    } catch (error) {
      setError(prev => ({...prev, favorites: error.message}));
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(prev => ({...prev, favorites: false}));
    }
  };

  // Toggle favorite status for a song
  const toggleFavorite = async (songId) => {
    if (!token) {
      // Store the action for post-login completion
      localStorage.setItem('pendingAction', JSON.stringify({
        type: 'favorite',
        songId
      }));
      
      // Show toast with link to login page
      toast.info(
        <div>
          Please log in to add favorites. 
          <a href="/auth" className="ml-2 text-fuchsia-400 underline">
            Log in now
          </a>
        </div>, 
        { autoClose: 5000 }
      );
      
      return false;
    }
    
    try {
      const isFav = favorites.some(fav => fav._id === songId);
      
      if (isFav) {
        // Remove from favorites
        await axios.post(`${API_BASE_URL}/api/favorite/unlike`, { songId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFavorites(prevFavs => prevFavs.filter(fav => fav._id !== songId));
        toast.success("Removed from favorites");
      } else {
        // Add to favorites
        await axios.post(`${API_BASE_URL}/api/favorite/like`, { songId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Find the song and add it to favorites
        const song = songsData.find(song => song._id === songId);
        if (song) {
          setFavorites(prevFavs => [...prevFavs, song]);
        }
        toast.success("Added to favorites");
      }
      return true;
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites");
      return false;
    }
  };

  // Check if a song is in favorites
  const isFavorite = (songId) => {
    return favorites && favorites.some(fav => fav._id === songId);
  };

  // Fetch user's playlists
  const getUserPlaylists = async () => {
    if (!token) return;
    
    try {
      setLoading(prev => ({...prev, playlists: true}));
      setError(prev => ({...prev, playlists: null}));
      
      const response = await axios.get(`${API_BASE_URL}/api/playlist/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPlaylists(response.data.playlists);
      }
    } catch (error) {
      setError(prev => ({...prev, playlists: error.message}));
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(prev => ({...prev, playlists: false}));
    }
  };

  // Create a new playlist
  const createPlaylist = async (name) => {
    if (!token) {
      toast.warning("Please log in to create playlists");
      return null;
    }
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/playlist/create`, 
        { name }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setPlaylists(prevPlaylists => [...prevPlaylists, response.data.playlist]);
        toast.success(`Playlist "${name}" created`);
        return response.data.playlist;
      }
      return null;
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast.error("Failed to create playlist");
      return null;
    }
  };

  // Add a song to a playlist
  const addToPlaylist = async (songId, playlistId) => {
    if (!token) {
      // Store the action for post-login completion
      localStorage.setItem('pendingAction', JSON.stringify({
        type: 'playlist',
        songId,
        playlistId
      }));
      
      // Show toast with link to login page
      toast.info(
        <div>
          Please log in to add to playlists. 
          <a href="/auth" className="ml-2 text-fuchsia-400 underline">
            Log in now
          </a>
        </div>, 
        { autoClose: 5000 }
      );
      
      return false;
    }
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/playlist/add-song`, 
        { songId, playlistId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Update the playlists state
        getUserPlaylists();
        toast.success("Added to playlist");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding to playlist:", error);
      toast.error("Failed to add to playlist");
      return false;
    }
  };

  // Remove a song from a playlist
  const removeFromPlaylist = async (songId, playlistId) => {
    if (!token) return false;
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/playlist/remove-song`, 
        { songId, playlistId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Update the playlists state
        getUserPlaylists();
        toast.success("Removed from playlist");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error removing from playlist:", error);
      toast.error("Failed to remove from playlist");
      return false;
    }
  };

  // Delete a playlist
  const deletePlaylist = async (playlistId) => {
    if (!token) return false;
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/playlist/delete`, 
        { playlistId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setPlaylists(prevPlaylists => prevPlaylists.filter(pl => pl._id !== playlistId));
        toast.success("Playlist deleted");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting playlist:", error);
      toast.error("Failed to delete playlist");
      return false;
    }
  };

  // Modify the getSongData function to load the last played song
  const getSongData = async () => {
    try {
      setLoading(prev => ({...prev, songs: true}));
      setError(prev => ({...prev, songs: null}));
      
      // Use all=true parameter to get all songs without pagination
      const response = await axios.get(`${API_BASE_URL}/api/song/list?all=true`);
      setSongsData(response.data.songs);
      
      // Try to load the last played song from localStorage
      const savedLastPlayed = localStorage.getItem('lastPlayedSong');
      if (savedLastPlayed) {
        try {
          const lastPlayed = JSON.parse(savedLastPlayed);
          // Verify the song still exists in our data
          const songExists = response.data.songs.some(song => song._id === lastPlayed._id);
          if (songExists) {
            setTrack(lastPlayed);
            setLastPlayedSong(lastPlayed);
          } else {
            // If the saved song doesn't exist anymore, set the first song
            setTrack(response.data.songs[0]);
          }
        } catch (error) {
          console.error('Error loading last played song:', error);
          setTrack(response.data.songs[0]);
        }
      } else if (response.data.songs.length > 0) {
        setTrack(response.data.songs[0]);
      }
    } catch (error) {
      setError(prev => ({...prev, songs: error.message}));
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(prev => ({...prev, songs: false}));
    }
  };

  const getAlbumsData = async () => {
    try {
      setLoading(prev => ({...prev, albums: true}));
      setError(prev => ({...prev, albums: null}));
      const response = await axios.get(`${API_BASE_URL}/api/album/list`);
      setAlbumsData(response.data.albums);
    } catch (error) {
      setError(prev => ({...prev, albums: error.message}));
      console.error('Error fetching albums:', error);
    } finally {
      setLoading(prev => ({...prev, albums: false}));
    }
  };

  useEffect(() => {
    getSongData();
    getAlbumsData();
  }, []);

  // Fetch favorites and playlists when user changes
  useEffect(() => {
    if (user) {
      getFavorites();
      getUserPlaylists();
    } else {
      setFavorites([]);
      setPlaylists([]);
    }
  }, [user, token]);

  // Simplify the time update handler
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      const duration = audio.duration || 0;

      if (isNaN(duration) || duration === 0 || duration === Infinity) {
        return;
      }

      if (seekBar.current) {
        const progress = (currentTime / duration) * 100;
        seekBar.current.style.width = `${progress}%`;
      }

      setTime({
        currentTime: {
          second: Math.floor(currentTime % 60),
          minute: Math.floor(currentTime / 60),
        },
        totalTime: {
          second: Math.floor(duration % 60),
          minute: Math.floor(duration / 60),
        },
      });
    };

    const handleLoadedMetadata = () => {
      setTime({
        currentTime: { second: 0, minute: 0 },
        totalTime: { second: 0, minute: 0 }
      });
      
      if (seekBar.current) {
        seekBar.current.style.width = '0%';
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [track]);

  // Load and manage player visibility preference
  useEffect(() => {
    const savedPref = localStorage.getItem('hidePlayer');
    if (savedPref !== null) {
      setHidePlayer(savedPref === 'true');
    }
  }, []);

  // Toggle player visibility function
  const togglePlayerVisibility = () => {
    const newState = !hidePlayer;
    setHidePlayer(newState);
    localStorage.setItem('hidePlayer', String(newState));
    
    // Update CSS variable immediately for responsive layout
    const isSmallScreen = window.innerWidth < 768;
    const playerHeight = isSmallScreen ? '50px' : newState ? '0' : '60px';
    const navHeight = isSmallScreen ? '50px' : '0'; 
    const totalPadding = isSmallScreen 
      ? (newState ? navHeight : `calc(${playerHeight} + ${navHeight})`) 
      : playerHeight;
    
    document.documentElement.style.setProperty('--player-bottom-padding', totalPadding);
    
    // Dispatch a custom event for any components that need to react
    window.dispatchEvent(new CustomEvent('player-visibility-change', { 
      detail: { isHidden: newState }
    }));
  };

  // Utility function to convert lyrics to/from time-synced format
  const formatLyricsWithTimestamps = (lyrics, audioElement) => {
    // If no lyrics or audio element, return empty string
    if (!lyrics || !audioElement) return '';
    
    // Check if lyrics already have timestamps
    const hasTimestamps = lyrics.split('\n').some(line => /^\[\d{2}:\d{2}\.\d{2}\]/.test(line));
    
    // If already has timestamps, return original lyrics
    if (hasTimestamps) return lyrics;
    
    // Estimate timestamps based on song duration and number of lyrics lines
    const duration = audioElement.duration;
    const lines = lyrics.split('\n').filter(line => line.trim() !== '');
    
    // Skip non-lyric lines like section headers [Verse], [Chorus], etc.
    const actualLyricLines = lines.filter(line => !/^\[.*\]/.test(line));
    
    // If no actual lyrics or invalid duration, return original
    if (actualLyricLines.length === 0 || !duration || duration === Infinity || isNaN(duration)) {
      return lyrics;
    }
    
    // Calculate approximate time per line
    const timePerLine = duration / actualLyricLines.length;
    
    // Format timestamps and add to lyrics
    let formattedLyrics = '';
    let currentTime = 0;
    
    lines.forEach(line => {
      // If it's a section header, add it without timestamp
      if (/^\[.*\]/.test(line)) {
        formattedLyrics += `${line}\n`;
      } else {
        // Format the timestamp
        const minutes = Math.floor(currentTime / 60);
        const seconds = Math.floor(currentTime % 60);
        const hundredths = Math.floor((currentTime % 1) * 100);
        
        const timestamp = `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}]`;
        
        // Add line with timestamp
        formattedLyrics += `${timestamp}${line}\n`;
        
        // Increment time for next line
        currentTime += timePerLine;
      }
    });
    
    return formattedLyrics;
  };

  // Clean up nextAudioRef on unmount
  useEffect(() => {
    return () => {
      if (nextAudioRef.current) {
        nextAudioRef.current.pause();
        nextAudioRef.current.src = '';
      }
    };
  }, []);

  // Initialize media session
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        if (audioRef.current) {
          audioRef.current.play();
          setPlayStatus(true);
        }
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setPlayStatus(false);
        }
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        if (audioRef.current) {
          audioRef.current.currentTime = audioRef.current.duration;
        }
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (audioRef.current && details.seekTime) {
          audioRef.current.currentTime = details.seekTime;
        }
      });
    }
  }, []);

  // Update media session metadata when track changes
  useEffect(() => {
    if ('mediaSession' in navigator && track) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.name,
        artist: getArtistName(track),
        album: getAlbumName(track),
        artwork: [
          { src: track.image, sizes: '512x512', type: 'image/jpeg' }
        ]
      });
    }
  }, [track]);

  // Handle audio state changes
  useEffect(() => {
    if (audioRef.current) {
      const handlePlay = () => {
        setPlayStatus(true);
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
      };

      const handlePause = () => {
        setPlayStatus(false);
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
        }
      };

      const handleEnded = () => {
        setPlayStatus(false);
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'none';
        }
        
        // Check if autoplay is enabled and there's a next song to play
        if (autoplayEnabled) {
          if (queueSongs.length > 0) {
            // Play next song from queue
            const nextTrack = queueSongs[0];
            setTrack(nextTrack);
            setQueueSongs(prevQueue => prevQueue.slice(1));
            
            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.src = nextTrack.file;
                audioRef.current.load();
                play();
              }
            }, 50);
          } else {
            // Play next song from playlist
            const currentIndex = songsData.findIndex(item => item._id === track._id);
            if (currentIndex < songsData.length - 1) {
              const nextTrack = songsData[currentIndex + 1];
              setTrack(nextTrack);
              
              setTimeout(() => {
                if (audioRef.current) {
                  audioRef.current.src = nextTrack.file;
                  audioRef.current.load();
                  play();
                }
              }, 50);
            }
          }
        }
      };

      audioRef.current.addEventListener('play', handlePlay);
      audioRef.current.addEventListener('pause', handlePause);
      audioRef.current.addEventListener('ended', handleEnded);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('play', handlePlay);
          audioRef.current.removeEventListener('pause', handlePause);
          audioRef.current.removeEventListener('ended', handleEnded);
        }
      };
    }
  }, [track, autoplayEnabled]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && audioRef.current && playStatus) {
        // Keep the audio playing in the background
        audioRef.current.play().catch(error => {
          console.error('Error playing audio in background:', error);
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [playStatus]);

  // Handle audio focus
  useEffect(() => {
    const handleAudioFocus = async () => {
      try {
        if (audioRef.current && playStatus) {
          await audioRef.current.play();
        }
      } catch (error) {
        console.error('Error handling audio focus:', error);
      }
    };

    window.addEventListener('focus', handleAudioFocus);
    window.addEventListener('blur', handleAudioFocus);

    return () => {
      window.removeEventListener('focus', handleAudioFocus);
      window.removeEventListener('blur', handleAudioFocus);
    };
  }, [playStatus]);

  // Add event listener for audio loading
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      if (autoplayEnabled) {
        play();
      }
    };

    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [track, autoplayEnabled]);

  const playYouTubeVideo = async (videoId, videoData = null) => {
    console.log('playYouTubeVideo called with:', { videoId, videoData });
    try {
      let videoDetails = videoData;
      if (!videoDetails) {
        console.log('Fetching video details from YouTube API');
        videoDetails = await YouTubeService.getVideoDetails(videoId);
      }

      if (!videoDetails) {
        console.error('Could not load video details');
        throw new Error('Could not load video details');
      }

      console.log('Video details:', videoDetails);

      // Stop any current audio playback
      if (audioRef.current) {
        console.log('Stopping current audio playback');
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
        audioRef.current.load();
      }

      // Stop radio if playing
      if (radioContext?.isPlaying) {
        console.log('Stopping radio playback');
        radioContext.stopStation();
      }

      // Reset track state
      setTrack(null);
      setTime({
        currentTime: { second: 0, minute: 0 },
        totalTime: { second: 0, minute: 0 }
      });

      console.log('Setting YouTube player state');
      setUseYouTubePlayer(true);
      setCurrentYouTubeVideo({
        id: videoId,
        title: videoDetails.snippet.title,
        channelTitle: videoDetails.snippet.channelTitle,
        thumbnail: videoDetails.snippet.thumbnails.high?.url || videoDetails.snippet.thumbnails.default.url
      });

      // Update track info for media session
      if ('mediaSession' in navigator) {
        console.log('Updating media session metadata');
        navigator.mediaSession.metadata = new MediaMetadata({
          title: videoDetails.snippet.title,
          artist: videoDetails.snippet.channelTitle,
          artwork: [
            { src: videoDetails.snippet.thumbnails.high?.url || videoDetails.snippet.thumbnails.default.url }
          ]
        });

        navigator.mediaSession.setActionHandler('play', () => play());
        navigator.mediaSession.setActionHandler('pause', () => pause());
        navigator.mediaSession.setActionHandler('previoustrack', () => Previous());
        navigator.mediaSession.setActionHandler('nexttrack', () => Next());
      }

      // Set playback state
      setPlayStatus(true);
    } catch (error) {
      console.error('Error playing YouTube video:', error);
      toast.error('Failed to play YouTube video');
    }
  };

  const addToYouTubeQueue = (video) => {
    setYoutubeQueue(prev => [...prev, video]);
  };

  const clearYouTubeQueue = () => {
    setYoutubeQueue([]);
  };

  const playNextYouTubeVideo = () => {
    if (youtubeQueue.length > 0) {
      const nextVideo = youtubeQueue[0];
      setYoutubeQueue(prev => prev.slice(1));
      playYouTubeVideo(nextVideo.id.videoId, nextVideo);
    } else {
      setUseYouTubePlayer(false);
      setCurrentYouTubeVideo(null);
      // Resume normal playback if there are songs in the regular queue
      if (queueSongs.length > 0) {
        playWithId(queueSongs[0]._id);
      }
    }
  };

  // Update context value to remove buffering-related values
  const contextValue = {
    audioRef,
    seekBar,
    seekBg,
    volumeRef,
    track,
    playStatus,
    time,
    play,
    pause,
    playWithId,
    Previous,
    Next,
    seekSong,
    changeVolume,
    songsData,
    setSongsData,
    albumsData,
    setAlbumsData,
    shuffle,
    toggleLoop,
    loop,
    loading,
    error,
    getArtistName,
    getAlbumName,
    formatLyricsWithTimestamps,
    favorites,
    toggleFavorite,
    isFavorite,
    playlists,
    getUserPlaylists,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    deletePlaylist,
    queueSongs,
    addToQueue,
    removeFromQueue,
    moveQueueItem,
    clearQueue,
    autoplayEnabled,
    setAutoplayEnabled,
    hidePlayer,
    togglePlayerVisibility,
    themeColors,
    lastPlayedSong,
    saveLastPlayedSong,
    sleepTimer,
    setSleepTimer,
    sleepTimerRemaining,
    formatRemainingTime,
    useYouTubePlayer,
    setUseYouTubePlayer,
    currentYouTubeVideo,
    playYouTubeVideo,
    addToYouTubeQueue,
    clearYouTubeQueue,
    youtubeQueue
  };

  // Add effect to persist autoplay preference
  useEffect(() => {
    localStorage.setItem('autoplayEnabled', autoplayEnabled);
  }, [autoplayEnabled]);

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
      {track && (
        <audio 
          key={`audio-${track._id}`}
          ref={audioRef} 
          preload="metadata"
          autoPlay={false}
          crossOrigin="anonymous"
          onError={(e) => console.error("Audio error:", e.target.error)}
          playsInline
        >
          <source key={`source-${track._id}`} src={track.file} type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
      )}
    </PlayerContext.Provider>
  );
};

export default PlayerContextProvider;
