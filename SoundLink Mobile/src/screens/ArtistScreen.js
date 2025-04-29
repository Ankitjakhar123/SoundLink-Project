import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ArtistScreen = ({ route, navigation }) => {
  const { artistId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    // Fetch artist details
    const fetchArtistDetails = async () => {
      try {
        setLoading(true);
        // Mock API call
        setTimeout(() => {
          // Mock artist data
          const artistData = {
            id: artistId || 'ar1',
            name: 'The Weeknd',
            imageUrl: 'https://via.placeholder.com/400',
            bannerUrl: 'https://via.placeholder.com/800x300',
            followers: '38.5M',
            monthlyListeners: '76.2M',
            bio: 'Abel Makkonen Tesfaye, known professionally as the Weeknd, is a Canadian singer, songwriter, and record producer. He is known for his sonic versatility and dark lyricism, his music explores escapism, romance, and melancholia, and is often inspired by personal experiences.',
            genres: ['R&B', 'Pop', 'Alternative R&B'],
          };
          
          setArtist(artistData);
          
          // Mock top tracks data
          const topTracksData = [
            {
              id: 's1',
              title: 'Blinding Lights',
              album: 'After Hours',
              albumId: 'a1',
              coverUrl: 'https://via.placeholder.com/60',
              duration: '3:20',
              plays: 2543000000,
            },
            {
              id: 's2',
              title: 'Save Your Tears',
              album: 'After Hours',
              albumId: 'a1',
              coverUrl: 'https://via.placeholder.com/60',
              duration: '3:35',
              plays: 1876000000,
            },
            {
              id: 's3',
              title: 'Starboy',
              album: 'Starboy',
              albumId: 'a2',
              coverUrl: 'https://via.placeholder.com/60',
              duration: '3:50',
              plays: 2134000000,
            },
            {
              id: 's4',
              title: 'The Hills',
              album: 'Beauty Behind the Madness',
              albumId: 'a3',
              coverUrl: 'https://via.placeholder.com/60',
              duration: '4:02',
              plays: 1954000000,
            },
            {
              id: 's5',
              title: 'Can't Feel My Face',
              album: 'Beauty Behind the Madness',
              albumId: 'a3',
              coverUrl: 'https://via.placeholder.com/60',
              duration: '3:33',
              plays: 1765000000,
            },
          ];
          
          setTopTracks(topTracksData);
          
          // Mock albums data
          const albumsData = [
            {
              id: 'a1',
              title: 'After Hours',
              year: '2020',
              coverUrl: 'https://via.placeholder.com/200',
              trackCount: 14,
            },
            {
              id: 'a2',
              title: 'Starboy',
              year: '2016',
              coverUrl: 'https://via.placeholder.com/200',
              trackCount: 18,
            },
            {
              id: 'a3',
              title: 'Beauty Behind the Madness',
              year: '2015',
              coverUrl: 'https://via.placeholder.com/200',
              trackCount: 14,
            },
            {
              id: 'a4',
              title: 'Kiss Land',
              year: '2013',
              coverUrl: 'https://via.placeholder.com/200',
              trackCount: 10,
            },
            {
              id: 'a5',
              title: 'Trilogy',
              year: '2012',
              coverUrl: 'https://via.placeholder.com/200',
              trackCount: 30,
            },
          ];
          
          setAlbums(albumsData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching artist details:', error);
        setLoading(false);
      }
    };

    fetchArtistDetails();
  }, [artistId]);

  const formatPlays = (plays) => {
    if (plays >= 1000000000) {
      return (plays / 1000000000).toFixed(1) + 'B';
    } else if (plays >= 1000000) {
      return (plays / 1000000).toFixed(1) + 'M';
    } else if (plays >= 1000) {
      return (plays / 1000).toFixed(1) + 'K';
    }
    return plays.toString();
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  const handleSongPress = (songId) => {
    navigation.navigate('SongDetails', { songId });
  };

  const handleAlbumPress = (albumId) => {
    navigation.navigate('Album', { albumId });
  };

  const handlePlayAll = () => {
    // Implement play all functionality
    console.log('Playing all songs from', artist?.name);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
        <Text style={styles.loadingText}>Loading artist...</Text>
      </View>
    );
  }

  if (!artist) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={60} color="#F44336" />
        <Text style={styles.errorText}>Failed to load artist.</Text>
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
        {/* Artist Header with Background */}
        <View style={styles.headerContainer}>
          <Image source={{ uri: artist.bannerUrl }} style={styles.bannerImage} />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.artistHeaderInfo}>
            <Image source={{ uri: artist.imageUrl }} style={styles.artistImage} />
            <Text style={styles.artistName}>{artist.name}</Text>
            <Text style={styles.artistStats}>
              {artist.followers} followers • {artist.monthlyListeners} monthly listeners
            </Text>
            
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={[
                  styles.followButton, 
                  isFollowing ? styles.followingButton : {}
                ]}
                onPress={handleFollowToggle}
              >
                <Text style={styles.followButtonText}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.shuffleButton} onPress={handlePlayAll}>
                <MaterialIcons name="shuffle" size={20} color="#FFFFFF" />
                <Text style={styles.shuffleButtonText}>Shuffle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Popular Tracks */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Popular</Text>
          
          {topTracks.map((track) => (
            <TouchableOpacity 
              key={track.id}
              style={styles.trackItem}
              onPress={() => handleSongPress(track.id)}
            >
              <Image source={{ uri: track.coverUrl }} style={styles.trackCover} />
              
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>{track.title}</Text>
                <Text style={styles.trackSubtitle}>{formatPlays(track.plays)} plays</Text>
              </View>
              
              <Text style={styles.trackDuration}>{track.duration}</Text>
              
              <TouchableOpacity style={styles.trackMoreButton}>
                <MaterialIcons name="more-vert" size={22} color="#BBBBBB" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Albums */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Albums</Text>
          
          <FlatList
            data={albums}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.albumsListContainer}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.albumItem}
                onPress={() => handleAlbumPress(item.id)}
              >
                <Image source={{ uri: item.coverUrl }} style={styles.albumCover} />
                <Text style={styles.albumTitle}>{item.title}</Text>
                <Text style={styles.albumYear}>{item.year} • {item.trackCount} songs</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* About */}
        <View style={styles.aboutContainer}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <Text style={styles.aboutText}>{artist.bio}</Text>
          
          <View style={styles.genresContainer}>
            {artist.genres.map((genre, index) => (
              <View key={index} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Similar Artists */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Fans Also Like</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* These would be populated from API in a real app */}
            <TouchableOpacity style={styles.similarArtistItem}>
              <Image 
                source={{ uri: 'https://via.placeholder.com/150' }} 
                style={styles.similarArtistImage} 
              />
              <Text style={styles.similarArtistName}>Drake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.similarArtistItem}>
              <Image 
                source={{ uri: 'https://via.placeholder.com/150' }} 
                style={styles.similarArtistImage} 
              />
              <Text style={styles.similarArtistName}>Post Malone</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.similarArtistItem}>
              <Image 
                source={{ uri: 'https://via.placeholder.com/150' }} 
                style={styles.similarArtistImage} 
              />
              <Text style={styles.similarArtistName}>Doja Cat</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.similarArtistItem}>
              <Image 
                source={{ uri: 'https://via.placeholder.com/150' }} 
                style={styles.similarArtistImage} 
              />
              <Text style={styles.similarArtistName}>Billie Eilish</Text>
            </TouchableOpacity>
          </ScrollView>
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
  headerContainer: {
    position: 'relative',
    height: 350,
  },
  bannerImage: {
    width: '100%',
    height: 180,
    position: 'absolute',
    top: 0,
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
  },
  artistHeaderInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 20,
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
  },
  artistImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#121212',
    marginBottom: 15,
  },
  artistName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  artistStats: {
    color: '#BBBBBB',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  followButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginRight: 15,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#9C27B0',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  shuffleButton: {
    backgroundColor: '#333333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shuffleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  sectionContainer: {
    paddingHorizontal: 15,
    paddingTop: 25,
    paddingBottom: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  trackCover: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 15,
  },
  trackTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 3,
  },
  trackSubtitle: {
    color: '#BBBBBB',
    fontSize: 12,
  },
  trackDuration: {
    color: '#BBBBBB',
    fontSize: 14,
    marginRight: 15,
  },
  trackMoreButton: {
    padding: 5,
  },
  seeAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 5,
  },
  seeAllText: {
    color: '#9C27B0',
    fontSize: 14,
    fontWeight: '500',
  },
  albumsListContainer: {
    paddingBottom: 10,
  },
  albumItem: {
    marginRight: 15,
    width: 150,
  },
  albumCover: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  albumTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 3,
  },
  albumYear: {
    color: '#BBBBBB',
    fontSize: 12,
  },
  aboutContainer: {
    padding: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  aboutText: {
    color: '#BBBBBB',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreTag: {
    backgroundColor: '#333333',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  similarArtistItem: {
    marginRight: 15,
    alignItems: 'center',
    width: 100,
  },
  similarArtistImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  similarArtistName: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ArtistScreen; 