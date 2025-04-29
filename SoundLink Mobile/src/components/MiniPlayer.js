import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { State } from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import FastImage from 'react-native-fast-image';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { PlayerContext } from '../context/PlayerContext';

const { width } = Dimensions.get('window');

const MiniPlayer = () => {
  const navigation = useNavigation();
  
  const {
    currentSong,
    playbackState,
    progress,
    playPause,
    skipToNext,
    skipToPrevious,
  } = useContext(PlayerContext);
  
  if (!currentSong) return null;
  
  const isPlaying = playbackState?.state === State.Playing;
  
  // Format time from seconds to MM:SS
  const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Calculate progress percentage
  const progressPercentage = progress.duration > 0 
    ? (progress.position / progress.duration) * 100 
    : 0;
  
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.mainContainer}
        onPress={() => navigation.navigate('SongDetails', { songId: currentSong.id })}
      >
        {/* Song Info */}
        <View style={styles.songInfo}>
          {currentSong.artwork ? (
            <FastImage
              source={{ uri: currentSong.artwork }}
              style={styles.artwork}
            />
          ) : (
            <View style={styles.defaultArtwork}>
              <MaterialIcons name="music-note" size={20} color="#9C27B0" />
            </View>
          )}
          
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {currentSong.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentSong.artist}
            </Text>
          </View>
        </View>
        
        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={skipToPrevious} style={styles.controlButton}>
            <MaterialIcons name="skip-previous" size={28} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={playPause} style={styles.playButton}>
            <MaterialIcons 
              name={isPlaying ? 'pause' : 'play-arrow'} 
              size={28} 
              color="#fff" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={skipToNext} style={styles.controlButton}>
            <MaterialIcons name="skip-next" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </Pressable>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${progressPercentage}%` }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#1E1E1E',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  defaultArtwork: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: '#aaa',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#9C27B0',
  },
});

export default MiniPlayer; 