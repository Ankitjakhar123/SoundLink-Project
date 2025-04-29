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
    if (typeof window !== "undefined" && 'AudioContext' in window) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!window._audioContext) {
        window._audioContext = new AudioContext();
      }
      
      if (window._audioContext.state === 'suspended') {
        window._audioContext.resume();
      }
    }
  };

  // Modified play function with audio context initialization
  const play = () => {
    initAudioContext(); // Initialize audio context

    if (audioRef.current) {
      try {
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setPlayStatus(true);
            })
            .catch(error => {
              console.error('Error playing audio:', error);
              setPlayStatus(false);
              
              // If autoplay is blocked, we need to manually set autoplay to false
              if (error.name === 'NotAllowedError') {
                setAutoplayEnabled(false);
              }
            });
        }
      } catch (error) {
        console.error('Error playing audio:', error);
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
      }
    }
  };

  const playWithId = async (id) => {
    const selectedTrack = songsData.find(item => item._id === id);
    if (selectedTrack) {
      if (track && track._id === id) {
        if (playStatus) {
          pause();
        } else {
          play();
        }
      } else {
        setTrack(selectedTrack);
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
      const response = await axios.get(`${API_BASE_URL}/api/song/list`);
      setSongsData(response.data.songs);
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

      if (seekBar.current && duration > 0) {
        seekBar.current.style.width = `${(currentTime / duration) * 100}%`;
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

    const handleEnded = () => {
      if (!audio.loop) {
        Next();
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [track]);

  useEffect(() => {
    if (track && audioRef.current) {
      audioRef.current.load();
      if (autoplayEnabled && !firstLoad) {
        play();
      }
    }
  }, [track, autoplayEnabled]);
  
  // Prevent autoplay on initial load
  useEffect(() => {
    if (firstLoad && track) {
      setFirstLoad(false);
    }
  }, [track, firstLoad]);

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
    setAutoplayEnabled
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
      {track && (
        <audio 
          ref={audioRef} 
          preload="metadata" 
          autoPlay={false}
        >
          <source src={track.audio} type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
      )}
    </PlayerContext.Provider>
  );
};
