import { createContext, useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../utils/api";
import { extractColors } from 'extract-colors';
import { RadioContext } from './RadioContext';
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
  const sleepTimerRef = useRef(null);

  // Add sleep timer function
  const setSleepTimer = (minutes) => {
    // Clear any existing timer
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }

    if (minutes === 0) {
      setSleepTimerState(null);
      return;
    }

    const milliseconds = minutes * 60 * 1000;
    setSleepTimerState(minutes);

    sleepTimerRef.current = setTimeout(() => {
      // Fade out volume over 5 seconds
      const startVolume = audioRef.current?.volume || 1;
      const fadeInterval = setInterval(() => {
        if (audioRef.current && audioRef.current.volume > 0.1) {
          audioRef.current.volume -= 0.1;
        } else {
          clearInterval(fadeInterval);
          pause();
          setSleepTimerState(null);
        }
      }, 500);

      // Clear the timer reference
      sleepTimerRef.current = null;
    }, milliseconds);
  };

  // Clean up sleep timer on unmount
  useEffect(() => {
    return () => {
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
      }
    };
  }, []);

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

  const [songsData, setSongsData] = useState([]);
  const [albumsData, setAlbumsData] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [track, setTrack] = useState(null);
  const [playStatus, setPlayStatus] = useState(false);
  const [loop, setLoop] = useState(false);
  const [queueSongs, setQueueSongs] = useState([]);
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [hidePlayer, setHidePlayer] = useState(false);
  // Buffering and lazy loading states
  const [buffering, setBuffering] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [prefetchedTracks, setPrefetchedTracks] = useState({});
  const [bufferingStrategy, setBufferingStrategy] = useState('conservative'); // Changed to conservative by default
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
    primary: '#a855f7', // Default fuchsia color
    secondary: '#121212',
    text: '#ffffff',
    accent: '#ec4899'
  });

  // Add this after the other state declarations
  const [lastPlayedSong, setLastPlayedSong] = useState(null);

  const [crossfadeDuration] = useState(1000); // 1 second crossfade
  const [isCrossfading, setIsCrossfading] = useState(false);
  const nextAudioRef = useRef(null);

  // Initialize audio context
  const initAudioContext = () => {
    // Only create once
    if (!window._audioContext) {
      try {
        // Create the audio context
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          window._audioContext = new AudioContext();
      } catch {
        // Error handled silently - audio might still work
        }
        
        // Resume the AudioContext if it's suspended
        if (window._audioContext && window._audioContext.state === 'suspended') {
          window._audioContext.resume()
          .then(() => {/* Audio context resumed */})
          .catch(() => {/* Failed to resume, but continue anyway */});
        }
        
        // iOS Safari specific unlock
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          // Create and play a silent buffer for iOS
          const unlockIOSAudio = () => {
            if (window._audioContext) {
              const buffer = window._audioContext.createBuffer(1, 1, 22050);
              const source = window._audioContext.createBufferSource();
              source.buffer = buffer;
              source.connect(window._audioContext.destination);
              source.start(0);
              source.stop(0.001); // Very short play
            }
          };
          
        // Try to unlock on first user interaction
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
        
        // Also try with a silent sound element
          const silentSound = document.createElement('audio');
          silentSound.controls = false;
          silentSound.preload = 'auto';
          silentSound.loop = false;
        silentSound.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RSU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQ19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1/////////////////////////////////8AAAA5TEFNRTMuMTAwAQAAADkAAABRiCJGmDgAAgAAABYAYOoA/////////////////////////////////8wAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'; // empty mp3 file
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

  // Prefetch a track's audio data
  const prefetchTrack = async (trackId) => {
    // Skip if already prefetched
    if (prefetchedTracks[trackId]) {
      return;
    }
    
    const trackToPrefetch = songsData.find(song => song._id === trackId);
    if (!trackToPrefetch) {
      console.error(`Cannot prefetch track ${trackId}: not found in songData`);
      return;
    }
    
    try {
      // Create an audio element for prefetching
      const prefetchAudio = new Audio();
      prefetchAudio.preload = 'metadata';
      
      // Set up progress tracking
      prefetchAudio.addEventListener('progress', () => {
        if (prefetchAudio.buffered.length > 0) {
          const bufferedEnd = prefetchAudio.buffered.end(prefetchAudio.buffered.length - 1);
          const duration = prefetchAudio.duration;
          if (duration > 0) {
            const progress = (bufferedEnd / duration) * 100;
            
            // When prefetch is complete enough, mark as prefetched
            if (progress > 15) {
              setPrefetchedTracks(prev => ({
                ...prev,
                [trackId]: {
                  timestamp: Date.now(),
                  progress
                }
              }));
            }
          }
        }
      });
      
      // Handle successful prefetch
      prefetchAudio.addEventListener('canplaythrough', () => {
        setPrefetchedTracks(prev => ({
          ...prev,
          [trackId]: {
            timestamp: Date.now(),
            progress: 100
          }
        }));
        
        // Remove the temporary audio element
        prefetchAudio.src = '';
        prefetchAudio.remove();
      });
      
      // Start the prefetch
      prefetchAudio.src = trackToPrefetch.file;
      
    } catch (error) {
      console.error(`Error prefetching track ${trackToPrefetch.name}:`, error);
    }
  };

  // Modified play function with audio context initialization and buffering control
  const play = () => {
    initAudioContext(); // Initialize audio context

    if (audioRef.current) {
      try {
        // Fix for cross-origin issues and potential src problems
        if (!audioRef.current.src || audioRef.current.src === '') {
          console.error('No audio source URL set!');
          if (track && track.file) {
            audioRef.current.src = track.file;
            audioRef.current.load();
          } else {
            console.error('No track or track.file available');
            return;
          }
        }
        
        // Set the playing state to true before starting playback
        setPlayStatus(true);
        
        // Set buffering to true - will be set to false when playback starts
        setBuffering(true);
        
        // The actual play call
        const playPromise = audioRef.current.play();
        
        // Modern browsers return a promise
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Playback started successfully
              setBuffering(false);
              setPlayStatus(true);
            })
            .catch(err => {
              console.error('Play promise error:', err);
              // Set playStatus to false if autoplay was prevented
              setPlayStatus(false);
              setBuffering(false);
              
              // Try to resume audio context if it was suspended
              if (window._audioContext && window._audioContext.state === 'suspended') {
                window._audioContext.resume()
                  .then(() => {
                    // Try playing again after resuming context
                    audioRef.current.play()
                      .then(() => {
                        setBuffering(false);
                        setPlayStatus(true);
                      })
                      .catch(retryErr => {
                        console.error('Failed to play after context resume:', retryErr);
                        setPlayStatus(false);
                        setBuffering(false);
                      });
                  })
                  .catch(err => {
                    console.error('Failed to resume audio context:', err);
                    setPlayStatus(false);
                    setBuffering(false);
                  });
              }
            });
        } else {
          // Old browsers might not return a promise
          // Assume playback was successful
          setBuffering(false);
          setPlayStatus(true);
        }
      } catch (error) {
        console.error('Error in play function:', error);
        setPlayStatus(false);
        setBuffering(false);
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        setPlayStatus(false);
        setBuffering(false);
      } catch (error) {
        console.error('Error pausing audio:', error);
        setPlayStatus(false);
        setBuffering(false);
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

  // Modified playWithId function to save the last played song
  const playWithId = async (id) => {
    // First check if we're just reloading the current track
    if (track && track._id === id) {
      if (playStatus) {
        pause();
      } else {
        play();
      }
      return;
    }
    
    // Find the track in our data
    const selectedTrack = songsData.find((song) => song._id === id);
    
    if (!selectedTrack) {
      console.error(`Track with ID ${id} not found in songsData`);
      return;
    }

    // Always force stop any playing radio before playing a song
    if (radioContext?.forceStopRadio) {
      radioContext.forceStopRadio();
    }

    // Add a short delay to ensure currentStation is cleared before setting the new track
    setTimeout(async () => {
      // Reset audio element completely
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
        audioRef.current.load();
        audioRef.current.removeAttribute('src');
      }

      // Set buffering state while we set up the track
      setBuffering(true);
      setLoadingProgress(0);
      
      // Extract colors from the album art to use for UI theming
      try {
        const colorTheme = await extractColorsFromTrack(selectedTrack);
        setThemeColors(colorTheme);
      } catch (error) {
        console.error('Error extracting colors:', error);
        // Use fallback colors if extraction fails
        setThemeColors({
          primary: '#8b5cf6',
          secondary: '#0f172a',
          text: '#ffffff'
        });
      }
      
      // Set the track in state and save as last played
      setTrack(selectedTrack);
      saveLastPlayedSong(selectedTrack);
      
      // Record this song in history if user is logged in
      if (user && user._id && token) {
        try {
          await axios.post(
            `${API_BASE_URL}/api/play/add`,
            { song: id },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (error) {
          // Non-critical error, just log it
          console.error('Failed to record play history:', error);
        }
      }
      
      // Set a short timeout to ensure the track state is updated before playing
      setTimeout(() => {
        if (audioRef.current) {
          // Ensure the audio element has the correct source
          audioRef.current.src = selectedTrack.file;
          audioRef.current.load();
          play();
        }
      }, 100);
      
      // Auto-prefetch the next few songs for smoother playback
      if (selectedTrack && bufferingStrategy === 'aggressive') {
        // Find next songs to prefetch
        // Could be next in album, related by artist, or based on user's history
        const relatedSongs = songsData
          .filter(s => 
            s._id !== selectedTrack._id && // Not the current song
            (s.artist === selectedTrack.artist || s.album === selectedTrack.album) // Same artist or album
          )
          .slice(0, 3); // Limit to 3 songs to prefetch
        
        // Start prefetching them
        relatedSongs.forEach(song => {
          prefetchTrack(song._id);
        });
      }
    }, 50);
  };

  const Previous = () => {
    if (queueSongs.length > 0) {
      // If we have queue songs, stay in the queue
      return;
    }
    
    const currentIndex = songsData.findIndex(item => item._id === track._id);
    if (currentIndex > 0) {
      setTrack(songsData[currentIndex - 1]);
      setAutoplayEnabled(true);
    }
  };

  // Add crossfade function
  const crossfadeToNextTrack = async (nextTrack) => {
    if (!audioRef.current || !nextTrack) return;
    
    setIsCrossfading(true);
    
    // Create a new audio element for the next track
    const nextAudio = new Audio(nextTrack.file);
    nextAudioRef.current = nextAudio;
    nextAudio.volume = 0;
    
    // Start playing the next track
    try {
      await nextAudio.play();
      
      // Crossfade between tracks
      const startTime = Date.now();
      const fadeInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / crossfadeDuration, 1);
        
        // Fade out current track
        audioRef.current.volume = 1 - progress;
        // Fade in next track
        nextAudio.volume = progress;
        
        if (progress >= 1) {
          clearInterval(fadeInterval);
          // Clean up old audio
          audioRef.current.pause();
          audioRef.current.src = '';
          // Set the new audio as current
          audioRef.current = nextAudio;
          nextAudioRef.current = null;
          setIsCrossfading(false);
        }
      }, 20); // Update every 20ms for smooth transition
    } catch (error) {
      console.error('Error during crossfade:', error);
      setIsCrossfading(false);
    }
  };

  // Modify Next function to use crossfade
  const Next = () => {
    if (isCrossfading) return; // Prevent multiple crossfades
    
    if (queueSongs.length > 0) {
      // Play next from queue with crossfade
      const nextTrack = queueSongs[0];
      crossfadeToNextTrack(nextTrack);
      setTrack(nextTrack);
      // Remove from queue
      setQueueSongs(prevQueue => prevQueue.slice(1));
      setAutoplayEnabled(true);
      return;
    }
    
    const currentIndex = songsData.findIndex(item => item._id === track._id);
    if (currentIndex < songsData.length - 1) {
      const nextTrack = songsData[currentIndex + 1];
      crossfadeToNextTrack(nextTrack);
      setTrack(nextTrack);
      setAutoplayEnabled(true);
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      const duration = audio.duration || 0;

      // Ensure we have a valid duration before updating UI
      if (isNaN(duration) || duration === 0 || duration === Infinity) {
        return;
      }

      if (seekBar.current && duration > 0) {
        seekBar.current.style.width = `${(currentTime / duration) * 100}%`;
      }

      // Update the time state with current and total times
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

    const handleEnded = () => {
      if (!audio.loop && !isCrossfading) {
        Next();
      }
    };
    
    // Monitor buffering progress
    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        const duration = audio.duration;
        if (duration > 0) {
          const bufferedPercent = (bufferedEnd / duration) * 100;
          setLoadingProgress(bufferedPercent);
          
          // Consider no longer buffering once we have enough data
          if (bufferedPercent > 15 && buffering) {
            setBuffering(false);
          }
        }
      }
    };
    
    // Handle waiting/buffering events
    const handleWaiting = () => {
      setBuffering(true);
    };
    
    // Handle when enough data is available
    const handleCanPlay = () => {
      setBuffering(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("progress", handleProgress);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("progress", handleProgress);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [track, isCrossfading]);

  // Modified useEffect to implement lazy loading with prefetching
  useEffect(() => {
    // Add a reference to track the last loaded track to prevent reloading the same track
    if (!window._lastLoadedTrack) {
      window._lastLoadedTrack = null;
    }
    
    if (track && audioRef.current) {
      // Skip if this is the same track that was just loaded (prevents infinite loops)
      if (window._lastLoadedTrack === track._id) {
        return;
      }
      
      // Update last loaded track
      window._lastLoadedTrack = track._id;
      
      // Reset time information
      audioRef.current.currentTime = 0;
      
      // Set appropriate preload attribute based on buffering strategy
      if (bufferingStrategy === 'conservative') {
        audioRef.current.preload = 'metadata'; // Minimal preloading
      } else if (bufferingStrategy === 'aggressive') {
        audioRef.current.preload = 'auto'; // Full preloading
      }
      
      // Add event listeners for buffering indication
      const handleLoadStart = () => setBuffering(true);
      const handleCanPlay = () => setBuffering(false);
      const handlePlaying = () => setBuffering(false);
      const handleWaiting = () => setBuffering(true);
      const handleProgress = () => {
        // Update loading progress only if we have a duration
        if (audioRef.current && audioRef.current.duration) {
          if (audioRef.current.buffered.length > 0) {
            const bufferedEnd = audioRef.current.buffered.end(audioRef.current.buffered.length - 1);
            const duration = audioRef.current.duration;
            const loadPercentage = (bufferedEnd / duration) * 100;
            setLoadingProgress(loadPercentage);
            
            // Automatically mark as not buffering if we've loaded enough
            if (loadPercentage > 15) {
              setBuffering(false);
            }
          }
        }
      };
      
      // Register event listeners for buffering state
      audioRef.current.addEventListener('loadstart', handleLoadStart);
      audioRef.current.addEventListener('canplay', handleCanPlay);
      audioRef.current.addEventListener('playing', handlePlaying);
      audioRef.current.addEventListener('waiting', handleWaiting);
      audioRef.current.addEventListener('progress', handleProgress);
      
      // Clean up event listeners
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('loadstart', handleLoadStart);
          audioRef.current.removeEventListener('canplay', handleCanPlay);
          audioRef.current.removeEventListener('playing', handlePlaying);
          audioRef.current.removeEventListener('waiting', handleWaiting);
          audioRef.current.removeEventListener('progress', handleProgress);
        }
      };
    }
  }, [track, bufferingStrategy]);
  
  // Effect for automatically adjusting buffering strategy based on network conditions
  useEffect(() => {
    // Only run this if bufferingStrategy is set to 'auto'
    if (bufferingStrategy !== 'auto') return;
    
    // Function to detect network connection quality
    const detectNetworkQuality = () => {
      // Use the Network Information API if available
      const connection = navigator.connection || 
                         navigator.mozConnection || 
                         navigator.webkitConnection;
      
      if (connection) {
        // Adjust strategy based on network type
        if (connection.saveData) {
          // User has requested to save data
          setBufferingStrategy('conservative');
        } else if (connection.effectiveType === '4g' && connection.downlink > 5) {
          // Fast connection
          setBufferingStrategy('aggressive');
        } else if (connection.effectiveType === '2g' || connection.downlink < 1) {
          // Slow connection
          setBufferingStrategy('conservative');
        }
      } else {
        // Fallback if Network Information API is not available
        // We could add more sophisticated detection here if needed
      }
    };
    
    // Run detection immediately
    detectNetworkQuality();
    
    // Set up event listener for connection changes
    const connection = navigator.connection || 
                      navigator.mozConnection || 
                      navigator.webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', detectNetworkQuality);
      
      // Cleanup
      return () => {
        connection.removeEventListener('change', detectNetworkQuality);
      };
    }
  }, [bufferingStrategy]);

  // Prevent autoplay on initial load
  useEffect(() => {
    if (firstLoad && track) {
      setFirstLoad(false);
      // Don't automatically play the track on first load
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayStatus(false);
      }
    }
  }, [track, firstLoad]);

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
  }, []);

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

  // Add the new buffering states and functions to the context
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
    buffering,
    loadingProgress,
    bufferingStrategy,
    setBufferingStrategy,
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
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
      {track && (
        <audio 
          key={`audio-${track._id}`}
          ref={audioRef} 
          preload={bufferingStrategy === 'conservative' ? 'metadata' : 'auto'}
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
