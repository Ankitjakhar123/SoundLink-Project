import { createContext, useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../utils/api";
//import { assets } from "../assets/assets";

export const PlayerContext = createContext();

export const PlayerContextProvider = ({ children }) => {
  const audioRef = useRef();
  const seekBg = useRef();
  const seekBar = useRef();
  const volumeRef = useRef();
  const { user, token } = useContext(AuthContext);

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
  const [bufferingStrategy, setBufferingStrategy] = useState('auto'); // 'auto', 'aggressive', 'conservative'
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

  // Initialize the audio context on user interaction
  const initAudioContext = () => {
    // Fix for browsers that require user interaction before audio can play
    if (typeof window !== "undefined") {
      try {
        // Create AudioContext if it doesn't exist
        if (!window._audioContext && 'AudioContext' in window) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          window._audioContext = new AudioContext();
          console.log('New AudioContext created');
        }
        
        // Resume the AudioContext if it's suspended
        if (window._audioContext && window._audioContext.state === 'suspended') {
          window._audioContext.resume()
            .then(() => console.log('AudioContext resumed successfully'))
            .catch(error => console.error('Failed to resume AudioContext:', error));
        }
        
        // iOS Safari specific unlock
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          console.log('iOS device detected, using special audio unlock');
          
          // Create and play a silent buffer for iOS
          const unlockIOSAudio = () => {
            if (window._audioContext) {
              const buffer = window._audioContext.createBuffer(1, 1, 22050);
              const source = window._audioContext.createBufferSource();
              source.buffer = buffer;
              source.connect(window._audioContext.destination);
              source.start(0);
              source.stop(0.001); // Very short play
              console.log('iOS audio unlock attempted');
            }
          };
          
          unlockIOSAudio();
          
          // Create a silent <audio> element as another method for iOS
          const silentSound = document.createElement('audio');
          silentSound.controls = false;
          silentSound.preload = 'auto';
          silentSound.loop = false;
          silentSound.volume = 0.001;
          silentSound.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjMyLjEwNAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACWQBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGD/////////////////////////////////////////AAAAAExhdmM1OC41OQAAAAAAAAAAAAAAACQCRgAAAAAAAAJZFiHN3gAAAAAAAAAAAAAAAAAAAAAA';
          
          // Attempt to play the silent sound
          silentSound.play()
            .then(() => {
              console.log('Silent sound played on iOS');
              setTimeout(() => {
                silentSound.pause();
                silentSound.remove();
              }, 100);
            })
            .catch(e => {
              console.log('Silent sound play failed on iOS:', e);
              silentSound.remove();
            });
        }
        
      } catch (error) {
        console.error('Error initializing audio context:', error);
      }
    }
  };

  // Prefetch a track's audio data
  const prefetchTrack = async (trackId) => {
    // Skip if already prefetched
    if (prefetchedTracks[trackId]) {
      console.log(`Track ${trackId} already prefetched`);
      return;
    }
    
    const trackToPrefetch = songsData.find(song => song._id === trackId);
    if (!trackToPrefetch) {
      console.error(`Cannot prefetch track ${trackId}: not found in songData`);
      return;
    }
    
    console.log(`Prefetching track: ${trackToPrefetch.name}`);
    
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
            console.log(`Prefetching ${trackToPrefetch.name}: ${Math.round(progress)}% complete`);
            
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
        console.log(`Prefetch complete for track: ${trackToPrefetch.name}`);
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
        console.log('Beginning play attempt...');
        
        // Fix for cross-origin issues and potential src problems
        if (!audioRef.current.src || audioRef.current.src === '') {
          console.error('No audio source URL set!');
          if (track && track.file) {
            console.log('Resetting audio source from track:', track.file);
            audioRef.current.src = track.file;
            audioRef.current.load();
          } else {
            console.error('No track or track.file available');
            return;
          }
        }
        
        // Force load if not loaded
        if (audioRef.current.readyState < 2) {
          console.log('Audio not fully loaded, loading...');
          setBuffering(true);
          audioRef.current.load();
          
          // Set a timeout to wait for loading
          setTimeout(() => {
            console.log('Attempting playback after delay');
            audioRef.current.play()
              .then(() => {
                console.log('Delayed playback successful');
                setPlayStatus(true);
                setBuffering(false);
              })
              .catch(err => {
                console.error('Delayed playback failed:', err);
                setPlayStatus(false);
                setBuffering(false);
              });
          }, 500);
          
          // Set playStatus to true immediately for UI feedback
          setPlayStatus(true);
          return;
        }
        
        // Set playStatus to true immediately for UI feedback
        setPlayStatus(true);
        
        console.log('Playing audio source:', audioRef.current.src);
        
        // Try different methods to force play (for different browsers)
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio playing successfully');
              setPlayStatus(true);
              setBuffering(false);
            })
            .catch(error => {
              console.error('Error playing audio:', error);
              
              // Try once more with a delay in case of browser quirks
              setTimeout(() => {
                console.log('Retrying play after error');
                audioRef.current.play()
                  .then(() => {
                    console.log('Retry successful');
                    setPlayStatus(true);
                    setBuffering(false);
                  })
                  .catch(retryError => {
                    console.error('Retry failed:', retryError);
                    setPlayStatus(false);
                    setBuffering(false);
                    
                    // If autoplay is blocked, we need to manually set autoplay to false
                    if (retryError.name === 'NotAllowedError') {
                      setAutoplayEnabled(false);
                      console.log('Autoplay blocked by browser, try interacting with the page first');
                      toast.info("Click the play button to start playing");
                    }
                  });
              }, 200);
            });
        } else {
          // For browsers that don't return a promise
          console.log('Browser did not return play promise, assuming audio is playing');
        }
      } catch (error) {
        console.error('Error playing audio:', error);
        setPlayStatus(false);
        setBuffering(false);
      }
    } else {
      console.error('Audio reference is not available');
    }
  };

  const pause = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        setPlayStatus(false);
      } catch (error) {
        console.error('Error pausing audio:', error);
      }
    }
  };

  // Determine next tracks to prefetch based on current track and buffering strategy
  const prefetchNextTracks = () => {
    if (!track || !bufferingStrategy || songsData.length === 0) return;
    
    const currentIndex = songsData.findIndex(song => song._id === track._id);
    if (currentIndex === -1) return;
    
    let tracksToPreload = [];
    
    // First check queue
    if (queueSongs.length > 0) {
      tracksToPreload.push(queueSongs[0]._id);
      
      // For aggressive strategy, prefetch more from queue
      if (bufferingStrategy === 'aggressive' && queueSongs.length > 1) {
        tracksToPreload.push(queueSongs[1]._id);
      }
    }
    
    // Then add from sequential tracks if queue doesn't have enough
    const remainingSlots = bufferingStrategy === 'conservative' ? 1 : 
                           bufferingStrategy === 'aggressive' ? 3 :
                           2; // default for 'auto'
    
    if (tracksToPreload.length < remainingSlots) {
      // Add next tracks in sequence
      for (let i = 1; i <= remainingSlots - tracksToPreload.length; i++) {
        if (currentIndex + i < songsData.length) {
          tracksToPreload.push(songsData[currentIndex + i]._id);
        }
      }
    }
    
    // Now prefetch the identified tracks
    tracksToPreload.forEach(trackId => {
      prefetchTrack(trackId);
    });
  };

  const playWithId = async (id) => {
    const selectedTrack = songsData.find(item => item._id === id);
    if (selectedTrack) {
      // Log full track structure for debugging
      console.log('Selected track:', selectedTrack);
      console.log('Track file URL:', selectedTrack.file);
      
      // If this is the same track, toggle play/pause
      if (track && track._id === id) {
        console.log('Same track clicked, toggling play/pause', playStatus);
        if (playStatus) {
          pause();
        } else {
          play();
        }
      } else {
        // This is a new track
        console.log('New track selected:', selectedTrack.name);
        console.log('Track audio file URL:', selectedTrack.file);
        
        // Begin buffering indication
        setBuffering(true);
        setLoadingProgress(0);
        
        // Check if we've already prefetched this track
        if (prefetchedTracks[id]) {
          console.log('Using prefetched track data');
        }
        
        setTrack(selectedTrack);
        setPlayStatus(true); // Set playStatus to true immediately for UI feedback
        setAutoplayEnabled(true);
      }
    }
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

  const Next = () => {
    if (queueSongs.length > 0) {
      // Play next from queue
      const nextTrack = queueSongs[0];
      setTrack(nextTrack);
      // Remove from queue
      setQueueSongs(prevQueue => prevQueue.slice(1));
      setAutoplayEnabled(true);
      return;
    }
    
    const currentIndex = songsData.findIndex(item => item._id === track._id);
    if (currentIndex < songsData.length - 1) {
      setTrack(songsData[currentIndex + 1]);
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

  const getSongData = async () => {
    try {
      setLoading(prev => ({...prev, songs: true}));
      setError(prev => ({...prev, songs: null}));
      
      // Use all=true parameter to get all songs without pagination
      const response = await axios.get(`${API_BASE_URL}/api/song/list?all=true`);
      setSongsData(response.data.songs);
      console.log(`Loaded ${response.data.songs.length} total songs from global context`);
      
      if (response.data.songs.length > 0) {
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
        console.log('Invalid audio duration:', duration);
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

      // Debug the time update
      if (currentTime % 5 < 0.1) { // Log only occasionally to avoid console spam
        console.log(`Time update: ${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60)} / ${Math.floor(duration / 60)}:${Math.floor(duration % 60)}`);
      }
    };

    const handleEnded = () => {
      if (!audio.loop) {
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
      console.log('Audio is waiting for more data...');
      setBuffering(true);
    };
    
    // Handle when enough data is available
    const handleCanPlay = () => {
      console.log('Audio can play now');
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
  }, [track]);

  // Modified useEffect to implement lazy loading with prefetching
  useEffect(() => {
    // Add a reference to track the last loaded track to prevent reloading the same track
    if (!window._lastLoadedTrack) {
      window._lastLoadedTrack = null;
    }
    
    if (track && audioRef.current) {
      // Skip if this is the same track that was just loaded (prevents infinite loops)
      if (window._lastLoadedTrack === track._id) {
        console.log('Skipping reload of the same track:', track.name);
        return;
      }
      
      // Log track ID to verify correct track is being loaded
      console.log('Loading track with ID:', track._id);
      
      // Update last loaded track
      window._lastLoadedTrack = track._id;
      
      console.log('Track changed, loading new track:', track.name);
      console.log('Audio source URL:', track.file);
      
      // Reset time information
      audioRef.current.currentTime = 0;
      
      // Set appropriate preload attribute based on buffering strategy
      if (bufferingStrategy === 'conservative') {
        audioRef.current.preload = 'metadata'; // Minimal preloading
      } else if (bufferingStrategy === 'aggressive') {
        audioRef.current.preload = 'auto'; // Full preloading
      } else {
        // Auto strategy - balance between performance and data usage
        audioRef.current.preload = 'auto';
      }
      
      // Force clear the src attribute first to ensure browser recognizes change
      audioRef.current.removeAttribute('src');
      
      // Set the new source
      audioRef.current.src = track.file;
      
      // Need to call load() to refresh the audio element with the new source
      audioRef.current.load();
      
      // Set initial volume (in case it was muted or changed before)
      if (typeof audioRef.current.volume !== 'undefined') {
        audioRef.current.volume = 0.7; // Default volume level
      }
      
      // Debug audio element properties
      console.log('Audio element state after load:', {
        readyState: audioRef.current.readyState,
        paused: audioRef.current.paused,
        currentSrc: audioRef.current.currentSrc,
        src: audioRef.current.src, // This is what the browser actually uses
        error: audioRef.current.error
      });
      
      // Create a flag to track if the audio is ready to play
      let audioReady = false;
      
      // Function to play when audio is ready
      const playWhenReady = () => {
        if (autoplayEnabled && !firstLoad) {
          console.log('Attempting to autoplay after track change');
          play();
        } else {
          console.log('Autoplay disabled or first load, not auto-playing');
        }
        
        // Once current track is playing, prefetch next tracks
        prefetchNextTracks();
      };
      
      // Add event listeners for audio readiness
      const canPlayHandler = () => {
        console.log('Audio canplay event fired - audio is ready to play');
        audioReady = true;
        setBuffering(false);
        // Remove this event listener to avoid multiple plays
        audioRef.current.removeEventListener('canplay', canPlayHandler);
        // Play with a slight delay to ensure readiness
        setTimeout(playWhenReady, 150);
      };
      
      // Listen for the canplay event
      audioRef.current.addEventListener('canplay', canPlayHandler);
      
      // Fallback - if canplay doesn't fire within 3 seconds, try to play anyway
      const readyTimeout = setTimeout(() => {
        if (!audioReady) {
          console.log('Fallback: canplay event did not fire within timeout, attempting to play anyway');
          audioRef.current.removeEventListener('canplay', canPlayHandler);
          playWhenReady();
        }
      }, 3000);
      
      // Cleanup
      return () => {
        clearTimeout(readyTimeout);
        if (audioRef.current) {
          audioRef.current.removeEventListener('canplay', canPlayHandler);
        }
      };
    }
  }, [track, autoplayEnabled, firstLoad, bufferingStrategy]);
  
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
        console.log('Network information:', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        });
        
        // Adjust strategy based on network type
        if (connection.saveData) {
          // User has requested to save data
          console.log('Data saver is enabled, using conservative buffering');
          setBufferingStrategy('conservative');
        } else if (connection.effectiveType === '4g' && connection.downlink > 5) {
          // Fast connection
          console.log('Fast connection detected, using aggressive buffering');
          setBufferingStrategy('aggressive');
        } else if (connection.effectiveType === '2g' || connection.downlink < 1) {
          // Slow connection
          console.log('Slow connection detected, using conservative buffering');
          setBufferingStrategy('conservative');
        }
      } else {
        // Fallback if Network Information API is not available
        // We could add more sophisticated detection here if needed
        console.log('Network Information API not available, using default buffering');
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
    // Buffering and lazy loading related
    buffering,
    loadingProgress,
    bufferingStrategy,
    setBufferingStrategy,
    // Favorites related
    favorites,
    toggleFavorite,
    isFavorite,
    // Playlist related
    playlists,
    getUserPlaylists,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    deletePlaylist,
    // Queue related
    queueSongs,
    addToQueue,
    removeFromQueue,
    moveQueueItem,
    clearQueue,
    // Autoplay settings
    autoplayEnabled,
    setAutoplayEnabled,
    // Player visibility settings
    hidePlayer,
    togglePlayerVisibility
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
      {track && (
        <audio 
          key={track._id}
          ref={audioRef} 
          preload={bufferingStrategy === 'conservative' ? 'metadata' : 'auto'}
          autoPlay={false}
          crossOrigin="anonymous"
          onCanPlay={() => console.log("Audio can play now")}
          onError={(e) => console.error("Audio error:", e.target.error)}
          onLoadedData={() => console.log("Audio data loaded successfully")}
          onLoadStart={() => console.log("Audio loading started")}
          onWaiting={() => console.log("Audio waiting for data")}
          onStalled={() => console.log("Audio playback has stalled")}
          playsInline
        >
          <source key={`${track._id}-mp3`} src={track.file} type="audio/mp3" />
          <source key={`${track._id}-mpeg`} src={track.file} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
    </PlayerContext.Provider>
  );
};
