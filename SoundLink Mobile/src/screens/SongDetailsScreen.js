import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Share,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const SongDetailsScreen = ({ route, navigation }) => {
  const { songId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [song, setSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 3 minutes in seconds
  const [lyrics, setLyrics] = useState([]);

  useEffect(() => {
    // Fetch song details from API
    const fetchSongDetails = async () => {
      try {
        setLoading(true);
        // Mock API call
        setTimeout(() => {
          // Mock data
          const songData = {
            id: songId || 's1',
            title: 'Blinding Lights',
            artist: 'The Weeknd',
            album: 'After Hours',
            year: '2020',
            duration: 180, // in seconds
            coverUrl: 'https://via.placeholder.com/500',
            genre: 'Pop, R&B',
            plays: 827564123,
            releaseDate: 'November 29, 2019',
          };
          
          setSong(songData);
          setDuration(songData.duration);
          
          // Mock lyrics
          setLyrics([
            { time: 0, text: "Yeah" },
            { time: 5, text: "I've been tryna call" },
            { time: 10, text: "I've been on my own for long enough" },
            { time: 15, text: "Maybe you can show me how to love, maybe" },
            { time: 20, text: "I'm going through withdrawals" },
          ]);
          
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching song details:', error);
        setLoading(false);
      }
    };

    fetchSongDetails();
  }, [songId]);

  useEffect(() => {
    // Simulate playing when isPlaying is true
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prevTime => {
          if (prevTime >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prevTime + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this song: ${song?.title} by ${song?.artist}`,
        url: 'https://soundlink.com/song/' + songId,
      });
    } catch (error) {
      console.error('Error sharing song:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getCurrentLyrics = () => {
    if (!lyrics.length) return '';
    
    // Find the lyric that corresponds to the current time
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        return lyrics[i].text;
      }
    }
    
    return lyrics[0].text;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
        <Text style={styles.loadingText}>Loading song...</Text>
      </View>
    );
  }

  if (!song) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={60} color="#F44336" />
        <Text style={styles.errorText}>Failed to load song.</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Now Playing</Text>
          <TouchableOpacity onPress={handleShare}>
            <MaterialIcons name="share" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Album Artwork */}
        <View style={styles.artworkContainer}>
          <Image source={{ uri: song.coverUrl }} style={styles.artwork} />
        </View>

        {/* Song Info */}
        <View style={styles.songInfoContainer}>
          <Text style={styles.songTitle}>{song.title}</Text>
          <Text style={styles.artistName}>{song.artist}</Text>
          <Text style={styles.albumName}>{song.album} • {song.year}</Text>
        </View>

        {/* Lyrics Display */}
        <View style={styles.lyricsContainer}>
          <Text style={styles.currentLyrics}>{getCurrentLyrics()}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${(currentTime / duration) * 100}%` }]} />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Playback Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton}>
            <MaterialIcons name="shuffle" size={28} color="#BBBBBB" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <MaterialIcons name="skip-previous" size={40} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
            <MaterialIcons 
              name={isPlaying ? "pause" : "play-arrow"} 
              size={50} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <MaterialIcons name="skip-next" size={40} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <MaterialIcons name="repeat" size={28} color="#BBBBBB" />
          </TouchableOpacity>
        </View>

        {/* Additional Controls */}
        <View style={styles.additionalControlsContainer}>
          <TouchableOpacity onPress={toggleFavorite}>
            <MaterialIcons 
              name={isFavorite ? "favorite" : "favorite-border"} 
              size={28} 
              color={isFavorite ? "#F44336" : "#FFFFFF"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity>
            <MaterialIcons name="playlist-add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity>
            <MaterialIcons name="more-horiz" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Song Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Song Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Genre</Text>
            <Text style={styles.detailValue}>{song.genre}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Release Date</Text>
            <Text style={styles.detailValue}>{song.releaseDate}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Plays</Text>
            <Text style={styles.detailValue}>{song.plays.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 15,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  errorText: {
    color: '#FFFFFF',
    marginTop: 15,
    fontSize: 18,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#333333',
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 5,
  },
  screenTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  artworkContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  artwork: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 10,
  },
  songInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  songTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  artistName: {
    color: '#BBBBBB',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 5,
  },
  albumName: {
    color: '#999999',
    fontSize: 14,
    textAlign: 'center',
  },
  lyricsContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 30,
    minHeight: 60,
  },
  currentLyrics: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#9C27B0',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginTop: 8,
  },
  timeText: {
    color: '#BBBBBB',
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  controlButton: {
    padding: 10,
  },
  playButton: {
    backgroundColor: '#9C27B0',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  additionalControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 50,
    marginBottom: 30,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  detailsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  detailLabel: {
    color: '#BBBBBB',
    fontSize: 14,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default SongDetailsScreen; 