import React, { createContext, useState, useEffect, useContext } from 'react';
import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  State,
  useTrackPlayerEvents,
  usePlaybackState,
  useProgress,
} from 'react-native-track-player';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';
import Toast from 'react-native-toast-message';

export const PlayerContext = createContext();

// Configure the track player
const setupPlayer = async () => {
  try {
    await TrackPlayer.setupPlayer({
      maxCacheSize: 1024 * 5, // 5mb
    });

    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
        Capability.SeekTo,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      progressUpdateEventInterval: 2,
    });

    // Set initial repeat mode
    await TrackPlayer.setRepeatMode(RepeatMode.Off);
    
    return true;
  } catch (error) {
    console.error('Error setting up player:', error);
    return false;
  }
};

const API_URL = 'http://10.0.2.2:4000/api'; // Use 10.0.2.2 for Android emulator to access localhost

export const PlayerProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [songsData, setSongsData] = useState([]);
  const [albumsData, setAlbumsData] = useState([]);
  const [artistsData, setArtistsData] = useState([]);
  const [queue, setQueue] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [repeatMode, setRepeatMode] = useState(RepeatMode.Off);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const playbackState = usePlaybackState();
  const progress = useProgress();

  // Initialize player
  useEffect(() => {
    let isMounted = true;
    
    const initializePlayer = async () => {
      try {
        const isSetup = await setupPlayer();
        if (isMounted && isSetup) {
          setIsPlayerReady(true);
        }
      } catch (error) {
        console.error('Error initializing player:', error);
      }
    };

    initializePlayer();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch songs
        const songsRes = await axios.get(`${API_URL}/song/list`);
        if (songsRes.data.success) {
          setSongsData(songsRes.data.songs);
        }
        
        // Fetch albums
        const albumsRes = await axios.get(`${API_URL}/album/list`);
        if (albumsRes.data.success) {
          setAlbumsData(albumsRes.data.albums);
        }
        
        // Fetch artists
        const artistsRes = await axios.get(`${API_URL}/artist/list`);
        if (artistsRes.data.success) {
          setArtistsData(artistsRes.data.artists);
        }
        
        // Fetch favorites if user is logged in
        if (token) {
          const favoritesRes = await axios.get(`${API_URL}/favorite/list`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (favoritesRes.data.success) {
            setFavorites(favoritesRes.data.favorites);
          }
          
          // Fetch playlists
          const playlistsRes = await axios.get(`${API_URL}/playlist/list`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (playlistsRes.data.success) {
            setPlaylists(playlistsRes.data.playlists);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Track player events
  useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack !== undefined) {
      const track = await TrackPlayer.getTrack(event.nextTrack);
      setCurrentSong(track);
      
      // Record play if user is logged in
      if (user && token && track) {
        try {
          await axios.post(
            `${API_URL}/song/play/${track.id}`, 
            {}, 
            { headers: { Authorization: `Bearer ${token}` }}
          );
        } catch (error) {
          console.error('Error recording play:', error);
        }
      }
    }
  });

  // Play a song by ID
  const playWithId = async (songId) => {
    if (!isPlayerReady) return;
    
    try {
      // Find the song in our data
      const songToPlay = songsData.find(song => song._id === songId);
      if (!songToPlay) return;
      
      // Check if song is already in the queue
      const queueIndex = await getTrackIndex(songId);
      
      if (queueIndex !== -1) {
        // Song is in queue, skip to it
        await TrackPlayer.skip(queueIndex);
        await TrackPlayer.play();
      } else {
        // Clear queue and add new song
        await TrackPlayer.reset();
        
        // Add the song to the player
        await TrackPlayer.add({
          id: songToPlay._id,
          url: songToPlay.file,
          title: songToPlay.name,
          artist: songToPlay.artist?.name || 'Unknown Artist',
          artwork: songToPlay.image || require('../assets/default-album-art.png'),
          duration: songToPlay.duration || 0,
        });
        
        await TrackPlayer.play();
      }
    } catch (error) {
      console.error('Error playing song:', error);
      Toast.show({
        type: 'error',
        text1: 'Playback Error',
        text2: 'Unable to play this song',
      });
    }
  };

  // Helper: Get track index in queue by ID
  const getTrackIndex = async (songId) => {
    try {
      const queue = await TrackPlayer.getQueue();
      return queue.findIndex(track => track.id === songId);
    } catch (error) {
      console.error('Error getting track index:', error);
      return -1;
    }
  };

  // Add to queue
  const addToQueue = async (songId) => {
    if (!isPlayerReady) return;
    
    try {
      const songToAdd = songsData.find(song => song._id === songId);
      if (!songToAdd) return;
      
      await TrackPlayer.add({
        id: songToAdd._id,
        url: songToAdd.file,
        title: songToAdd.name,
        artist: songToAdd.artist?.name || 'Unknown Artist',
        artwork: songToAdd.image || require('../assets/default-album-art.png'),
        duration: songToAdd.duration || 0,
      });
      
      Toast.show({
        type: 'success',
        text1: 'Added to Queue',
        text2: `${songToAdd.name} has been added to your queue`,
      });
      
      // Update queue state
      const updatedQueue = await TrackPlayer.getQueue();
      setQueue(updatedQueue);
    } catch (error) {
      console.error('Error adding to queue:', error);
      Toast.show({
        type: 'error',
        text1: 'Queue Error',
        text2: 'Unable to add song to queue',
      });
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (songId) => {
    if (!user || !token) {
      Toast.show({
        type: 'info',
        text1: 'Login Required',
        text2: 'Please log in to add favorites',
      });
      return;
    }
    
    try {
      const isFavorite = favorites.some(fav => fav._id === songId);
      
      if (isFavorite) {
        // Remove from favorites
        const response = await axios.delete(`${API_URL}/favorite/song/${songId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setFavorites(favorites.filter(fav => fav._id !== songId));
          Toast.show({
            type: 'success',
            text1: 'Removed from Favorites',
            text2: 'Song removed from your favorites',
          });
        }
      } else {
        // Add to favorites
        const response = await axios.post(`${API_URL}/favorite/song/${songId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          const song = songsData.find(song => song._id === songId);
          setFavorites([...favorites, song]);
          Toast.show({
            type: 'success',
            text1: 'Added to Favorites',
            text2: 'Song added to your favorites',
          });
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Unable to update favorites',
      });
    }
  };

  // Control functions
  const playPause = async () => {
    try {
      const state = await TrackPlayer.getState();
      if (state === State.Playing) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
    } catch (error) {
      console.error('Error with play/pause:', error);
    }
  };

  const skipToNext = async () => {
    try {
      await TrackPlayer.skipToNext();
    } catch (error) {
      console.error('Error skipping to next:', error);
    }
  };

  const skipToPrevious = async () => {
    try {
      await TrackPlayer.skipToPrevious();
    } catch (error) {
      console.error('Error skipping to previous:', error);
    }
  };

  // Toggle repeat mode
  const toggleRepeat = async () => {
    try {
      let newMode;
      switch (repeatMode) {
        case RepeatMode.Off:
          newMode = RepeatMode.Track;
          break;
        case RepeatMode.Track:
          newMode = RepeatMode.Queue;
          break;
        case RepeatMode.Queue:
          newMode = RepeatMode.Off;
          break;
        default:
          newMode = RepeatMode.Off;
      }
      
      await TrackPlayer.setRepeatMode(newMode);
      setRepeatMode(newMode);
    } catch (error) {
      console.error('Error toggling repeat:', error);
    }
  };

  // Toggle shuffle mode
  const toggleShuffle = async () => {
    try {
      const newShuffleMode = !shuffleMode;
      setShuffleMode(newShuffleMode);
      
      if (newShuffleMode) {
        // Save current queue
        const currentQueue = await TrackPlayer.getQueue();
        const currentIndex = await TrackPlayer.getCurrentTrack();
        const currentTrack = currentQueue[currentIndex];
        
        // Remove current track from the list to shuffle
        const tracksToShuffle = currentQueue.filter((_, index) => index !== currentIndex);
        
        // Shuffle the remaining tracks
        for (let i = tracksToShuffle.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [tracksToShuffle[i], tracksToShuffle[j]] = [tracksToShuffle[j], tracksToShuffle[i]];
        }
        
        // Reset queue and add current track followed by shuffled tracks
        await TrackPlayer.reset();
        await TrackPlayer.add([currentTrack, ...tracksToShuffle]);
        await TrackPlayer.skip(0);
      } else {
        // Restore original queue order (this is simplified - would need to store original order)
        // In a real implementation, you would keep track of the original order
      }
    } catch (error) {
      console.error('Error toggling shuffle:', error);
    }
  };

  // Seek to position
  const seekTo = async (position) => {
    try {
      await TrackPlayer.seekTo(position);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const value = {
    isPlayerReady,
    songsData,
    setSongsData,
    albumsData,
    setAlbumsData,
    artistsData,
    setArtistsData,
    currentSong,
    queue,
    favorites,
    playlists,
    playbackState,
    progress,
    repeatMode,
    shuffleMode,
    loading,
    // Player controls
    playWithId,
    addToQueue,
    toggleFavorite,
    playPause,
    skipToNext,
    skipToPrevious,
    toggleRepeat,
    toggleShuffle,
    seekTo,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}; 