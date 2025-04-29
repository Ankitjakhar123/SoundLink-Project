import React, { useContext, useEffect, useState } from 'react';
import {
  View, 
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';

import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { 
    songsData,
    albumsData,
    artistsData,
    playWithId,
    toggleFavorite,
    favorites,
    addToQueue,
    currentSong,
    playbackState,
    loading,
  } = useContext(PlayerContext);
  
  const { user } = useContext(AuthContext);
  
  const [trendingSongs, setTrendingSongs] = useState([]);
  
  useEffect(() => {
    if (songsData && songsData.length > 0) {
      // Create trending songs from available songs (just a sample for demo)
      const shuffled = [...songsData].sort(() => 0.5 - Math.random());
      setTrendingSongs(shuffled.slice(0, 10));
    }
  }, [songsData]);
  
  const isFavorite = (songId) => {
    return favorites && favorites.some(fav => fav._id === songId);
  };
  
  // Handle navigation to artist screen
  const handleArtistPress = (artistId) => {
    navigation.navigate('Artist', { artistId });
  };
  
  // Handle navigation to album screen
  const handleAlbumPress = (albumId) => {
    navigation.navigate('Album', { albumId });
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome back{user?.username ? `, ${user.username}` : ''}
          </Text>
        </View>
        
        {/* Trending Now Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="trending-up" size={22} color="#9C27B0" />
            <Text style={styles.sectionTitle}>Trending Now</Text>
          </View>
          
          <LinearGradient
            colors={['rgba(156, 39, 176, 0.1)', 'rgba(156, 39, 176, 0.3)']}
            style={styles.gradientContainer}
          >
            <FlatList
              data={trendingSongs}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.trendingItem,
                    currentSong && currentSong.id === item._id && styles.activeItem
                  ]}
                  onPress={() => playWithId(item._id)}
                >
                  <View style={styles.trendingContent}>
                    <View style={styles.trendingImageContainer}>
                      {item.image ? (
                        <FastImage
                          source={{ uri: item.image }}
                          style={styles.trendingImage}
                        />
                      ) : (
                        <View style={styles.defaultImageContainer}>
                          <MaterialIcons name="music-note" size={24} color="#9C27B0" />
                        </View>
                      )}
                      <View style={styles.playIconOverlay}>
                        <MaterialIcons 
                          name={currentSong && currentSong.id === item._id && playbackState.state === 'playing' ? 'pause' : 'play-arrow'} 
                          size={26} 
                          color="#fff" 
                        />
                      </View>
                    </View>
                    
                    <View style={styles.trendingInfo}>
                      <Text style={styles.trendingTitle} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.trendingArtist} numberOfLines={1}>
                        {item.artist?.name || 'Unknown Artist'}
                      </Text>
                      
                      <View style={styles.songActions}>
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => toggleFavorite(item._id)}
                        >
                          <MaterialIcons 
                            name={isFavorite(item._id) ? 'favorite' : 'favorite-border'}
                            size={18}
                            color={isFavorite(item._id) ? "#9C27B0" : "#fff"}
                          />
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => addToQueue(item._id)}
                        >
                          <MaterialIcons name="queue-music" size={18} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.trendingList}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No trending songs available</Text>
              }
            />
          </LinearGradient>
        </View>
        
        {/* Albums Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="album" size={22} color="#9C27B0" />
            <Text style={styles.sectionTitle}>Music Collections</Text>
          </View>
          
          <FlatList
            data={albumsData}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.albumItem}
                onPress={() => handleAlbumPress(item._id)}
              >
                <View style={styles.albumImageContainer}>
                  {item.image ? (
                    <FastImage
                      source={{ uri: item.image }}
                      style={styles.albumImage}
                    />
                  ) : (
                    <View style={styles.defaultAlbumImageContainer}>
                      <MaterialIcons name="album" size={34} color="#9C27B0" />
                    </View>
                  )}
                </View>
                <Text style={styles.albumTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.albumArtist} numberOfLines={1}>{item.desc || 'Various Artists'}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.albumList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No albums available</Text>
            }
          />
        </View>
        
        {/* Artists Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person" size={22} color="#9C27B0" />
            <Text style={styles.sectionTitle}>Popular Artists</Text>
          </View>
          
          <FlatList
            data={artistsData}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.artistItem}
                onPress={() => handleArtistPress(item._id)}
              >
                <View style={styles.artistImageContainer}>
                  {item.image ? (
                    <FastImage
                      source={{ uri: item.image }}
                      style={styles.artistImage}
                    />
                  ) : (
                    <View style={styles.defaultArtistImageContainer}>
                      <MaterialIcons name="person" size={36} color="#9C27B0" />
                    </View>
                  )}
                </View>
                <Text style={styles.artistName}>{item.name}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.artistList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No artists available</Text>
            }
          />
        </View>
        
        {/* All Songs Section */}
        <View style={[styles.section, styles.songsSection]}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="music-note" size={22} color="#9C27B0" />
            <Text style={styles.sectionTitle}>All Songs</Text>
          </View>
          
          <View style={styles.songsList}>
            {songsData && songsData.length > 0 ? (
              songsData.slice(0, 5).map((song) => (
                <TouchableOpacity
                  key={song._id}
                  style={[
                    styles.songItem,
                    currentSong && currentSong.id === song._id && styles.activeSongItem
                  ]}
                  onPress={() => playWithId(song._id)}
                >
                  <View style={styles.songImageContainer}>
                    {song.image ? (
                      <FastImage
                        source={{ uri: song.image }}
                        style={styles.songImage}
                      />
                    ) : (
                      <View style={styles.defaultSongImageContainer}>
                        <MaterialIcons name="music-note" size={18} color="#9C27B0" />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.songInfo}>
                    <Text style={styles.songTitle} numberOfLines={1}>{song.name}</Text>
                    <Text style={styles.songArtist} numberOfLines={1}>
                      {song.artist?.name || 'Unknown Artist'}
                    </Text>
                  </View>
                  
                  <View style={styles.songActions}>
                    <TouchableOpacity onPress={() => toggleFavorite(song._id)}>
                      <MaterialIcons 
                        name={isFavorite(song._id) ? 'favorite' : 'favorite-border'}
                        size={22}
                        color={isFavorite(song._id) ? "#9C27B0" : "#aaa"}
                      />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.queueButton}
                      onPress={() => addToQueue(song._id)}
                    >
                      <MaterialIcons name="queue-music" size={22} color="#aaa" />
                    </TouchableOpacity>
                    
                    <Text style={styles.songDuration}>{song.duration || '--:--'}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No songs available</Text>
            )}
            
            {songsData && songsData.length > 5 && (
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('Library')}
              >
                <Text style={styles.viewAllText}>View All Songs</Text>
                <MaterialIcons name="arrow-forward" size={16} color="#9C27B0" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
  welcomeSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  gradientContainer: {
    borderRadius: 12,
    padding: 12,
    minHeight: 180,
  },
  trendingList: {
    paddingRight: 12,
  },
  trendingItem: {
    width: width * 0.75,
    maxWidth: 280,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    marginRight: 12,
    padding: 12,
  },
  activeItem: {
    backgroundColor: 'rgba(156, 39, 176, 0.2)',
  },
  trendingContent: {
    flexDirection: 'row',
  },
  trendingImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  defaultImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  trendingInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  trendingArtist: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  songActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 16,
  },
  albumList: {
    paddingVertical: 12,
  },
  albumItem: {
    width: 140,
    marginRight: 16,
  },
  albumImageContainer: {
    width: 140,
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  albumImage: {
    width: '100%',
    height: '100%',
  },
  defaultAlbumImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 12,
    color: '#aaa',
  },
  artistList: {
    paddingVertical: 12,
  },
  artistItem: {
    width: 100,
    alignItems: 'center',
    marginRight: 20,
  },
  artistImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(156, 39, 176, 0.3)',
  },
  artistImage: {
    width: '100%',
    height: '100%',
  },
  defaultArtistImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
  },
  songsSection: {
    marginBottom: 16,
  },
  songsList: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 8,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeSongItem: {
    backgroundColor: 'rgba(156, 39, 176, 0.15)',
  },
  songImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 4,
    overflow: 'hidden',
  },
  songImage: {
    width: '100%',
    height: '100%',
  },
  defaultSongImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 13,
    color: '#aaa',
  },
  songActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueButton: {
    marginHorizontal: 16,
  },
  songDuration: {
    fontSize: 12,
    color: '#aaa',
    minWidth: 40,
    textAlign: 'right',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    color: '#9C27B0',
    fontWeight: '600',
    marginRight: 8,
  },
  emptyText: {
    color: '#aaa',
    textAlign: 'center',
    padding: 20,
  },
  bottomSpacing: {
    height: 90, // Extra space for the player at bottom
  },
});

export default HomeScreen; 