import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const AlbumScreen = ({ route, navigation }) => {
  const { albumId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    // Fetch album details
    const fetchAlbumDetails = async () => {
      try {
        setLoading(true);
        // Mock API call
        setTimeout(() => {
          // Mock album data
          const albumData = {
            id: albumId || 'a1',
            title: 'After Hours',
            artist: 'The Weeknd',
            artistId: 'ar1',
            releaseYear: '2020',
            coverUrl: 'https://via.placeholder.com/500',
            trackCount: 14,
            duration: '56 min',
            genre: 'Pop, R&B',
            label: 'XO Records',
            description: 'After Hours is the fourth studio album by Canadian singer The Weeknd, released on March 20, 2020. It was primarily produced by The Weeknd and features production from a variety of producers.',
          };
          
          setAlbum(albumData);
          
          // Mock songs data
          const songsData = [
            {
              id: 's1',
              title: 'Alone Again',
              duration: '4:10',
              trackNumber: 1,
              isExplicit: false,
              plays: 56734567,
            },
            {
              id: 's2',
              title: 'Too Late',
              duration: '3:59',
              trackNumber: 2,
              isExplicit: false,
              plays: 43234567,
            },
            {
              id: 's3',
              title: 'Hardest To Love',
              duration: '3:31',
              trackNumber: 3,
              isExplicit: false,
              plays: 47834567,
            },
            {
              id: 's4',
              title: 'Scared To Live',
              duration: '3:11',
              trackNumber: 4,
              isExplicit: false,
              plays: 39034567,
            },
            {
              id: 's5',
              title: 'Snowchild',
              duration: '4:07',
              trackNumber: 5,
              isExplicit: true,
              plays: 52134567,
            },
            {
              id: 's6',
              title: 'Escape From LA',
              duration: '5:56',
              trackNumber: 6,
              isExplicit: true,
              plays: 48934567,
            },
            {
              id: 's7',
              title: 'Heartless',
              duration: '3:18',
              trackNumber: 7,
              isExplicit: true,
              plays: 87634567,
            },
            {
              id: 's8',
              title: 'Faith',
              duration: '4:43',
              trackNumber: 8,
              isExplicit: true,
              plays: 59034567,
            },
            {
              id: 's9',
              title: 'Blinding Lights',
              duration: '3:20',
              trackNumber: 9,
              isExplicit: false,
              plays: 98734567,
            },
            {
              id: 's10',
              title: 'In Your Eyes',
              duration: '3:57',
              trackNumber: 10,
              isExplicit: false,
              plays: 76534567,
            },
          ];
          
          setSongs(songsData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching album details:', error);
        setLoading(false);
      }
    };

    fetchAlbumDetails();
  }, [albumId]);

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

  const handlePlayAlbum = () => {
    // Implement album play functionality
    console.log('Playing album:', album?.title);
  };

  const handleSongPress = (songId) => {
    navigation.navigate('SongDetails', { songId });
  };

  const handleArtistPress = () => {
    navigation.navigate('Artist', { artistId: album?.artistId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
        <Text style={styles.loadingText}>Loading album...</Text>
      </View>
    );
  }

  if (!album) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={60} color="#F44336" />
        <Text style={styles.errorText}>Failed to load album.</Text>
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
      <ScrollView>
        {/* Album Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.albumInfoHeader}>
            <Image source={{ uri: album.coverUrl }} style={styles.albumCover} />
            <View style={styles.albumInfo}>
              <Text style={styles.albumTitle}>{album.title}</Text>
              <TouchableOpacity onPress={handleArtistPress}>
                <Text style={styles.artistName}>{album.artist}</Text>
              </TouchableOpacity>
              <Text style={styles.albumMeta}>{album.releaseYear} • {album.trackCount} songs • {album.duration}</Text>
            </View>
          </View>
          
          <View style={styles.albumActions}>
            <TouchableOpacity style={styles.playButton} onPress={handlePlayAlbum}>
              <MaterialIcons name="play-arrow" size={24} color="#FFFFFF" />
              <Text style={styles.playButtonText}>Play</Text>
            </TouchableOpacity>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialIcons name="favorite-border" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialIcons name="file-download" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialIcons name="more-vert" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Album Tracklist */}
        <View style={styles.tracklistContainer}>
          <Text style={styles.tracklistTitle}>Tracklist</Text>
          
          <FlatList
            data={songs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.songItem}
                onPress={() => handleSongPress(item.id)}
              >
                <Text style={styles.trackNumber}>{item.trackNumber}</Text>
                
                <View style={styles.songDetails}>
                  <View style={styles.songTitleContainer}>
                    <Text style={styles.songTitle}>{item.title}</Text>
                    {item.isExplicit && (
                      <View style={styles.explicitBadge}>
                        <Text style={styles.explicitText}>E</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.songPlays}>{formatPlays(item.plays)} plays</Text>
                </View>
                
                <Text style={styles.songDuration}>{item.duration}</Text>
                
                <TouchableOpacity style={styles.songMoreButton}>
                  <MaterialIcons name="more-vert" size={22} color="#BBBBBB" />
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            scrollEnabled={false}
          />
        </View>

        {/* Album Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>About the Album</Text>
          <Text style={styles.detailsText}>{album.description}</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Genre</Text>
            <Text style={styles.detailValue}>{album.genre}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Label</Text>
            <Text style={styles.detailValue}>{album.label}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Release Date</Text>
            <Text style={styles.detailValue}>{album.releaseYear}</Text>
          </View>
        </View>

        {/* More by Artist */}
        <View style={styles.moreByArtistContainer}>
          <View style={styles.moreByArtistHeader}>
            <Text style={styles.moreByArtistTitle}>More by {album.artist}</Text>
            <TouchableOpacity onPress={handleArtistPress}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* These would be populated from API in a real app */}
            <TouchableOpacity style={styles.moreAlbumItem}>
              <Image 
                source={{ uri: 'https://via.placeholder.com/200' }} 
                style={styles.moreAlbumCover} 
              />
              <Text style={styles.moreAlbumTitle}>Starboy</Text>
              <Text style={styles.moreAlbumYear}>2016</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.moreAlbumItem}>
              <Image 
                source={{ uri: 'https://via.placeholder.com/200' }} 
                style={styles.moreAlbumCover} 
              />
              <Text style={styles.moreAlbumTitle}>Beauty Behind the Madness</Text>
              <Text style={styles.moreAlbumYear}>2015</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.moreAlbumItem}>
              <Image 
                source={{ uri: 'https://via.placeholder.com/200' }} 
                style={styles.moreAlbumCover} 
              />
              <Text style={styles.moreAlbumTitle}>Kiss Land</Text>
              <Text style={styles.moreAlbumYear}>2013</Text>
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
  header: {
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  backButton: {
    marginBottom: 15,
  },
  albumInfoHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  albumCover: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  albumInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  albumTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  artistName: {
    color: '#9C27B0',
    fontSize: 16,
    marginBottom: 5,
  },
  albumMeta: {
    color: '#BBBBBB',
    fontSize: 14,
  },
  albumActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9C27B0',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 20,
  },
  tracklistContainer: {
    paddingTop: 20,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
    paddingBottom: 20,
  },
  tracklistTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  trackNumber: {
    color: '#BBBBBB',
    fontSize: 14,
    width: 30,
    textAlign: 'center',
  },
  songDetails: {
    flex: 1,
    marginLeft: 10,
  },
  songTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  songTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 5,
  },
  explicitBadge: {
    backgroundColor: '#BBBBBB',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  explicitText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  songPlays: {
    color: '#999999',
    fontSize: 12,
  },
  songDuration: {
    color: '#BBBBBB',
    fontSize: 14,
    marginRight: 15,
  },
  songMoreButton: {
    padding: 5,
  },
  detailsContainer: {
    padding: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  detailsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  detailsText: {
    color: '#BBBBBB',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  detailItem: {
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
  moreByArtistContainer: {
    padding: 20,
  },
  moreByArtistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  moreByArtistTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#9C27B0',
    fontSize: 14,
  },
  moreAlbumItem: {
    marginRight: 15,
    width: 120,
  },
  moreAlbumCover: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  moreAlbumTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 3,
  },
  moreAlbumYear: {
    color: '#BBBBBB',
    fontSize: 12,
  },
});

export default AlbumScreen; 