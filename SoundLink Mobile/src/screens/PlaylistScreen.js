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
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const PlaylistScreen = ({ route, navigation }) => {
  const { playlistId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    // Fetch playlist details
    const fetchPlaylistDetails = async () => {
      try {
        setLoading(true);
        // Mock API call
        setTimeout(() => {
          // Mock playlist data
          const playlistData = {
            id: playlistId || 'p1',
            title: 'Favorites',
            description: 'My favorite songs collection',
            creator: 'musiclover99',
            coverUrl: 'https://via.placeholder.com/500',
            isOwner: true,
            followers: 12,
            songCount: 47,
            duration: '3h 21m',
            createdAt: 'May 15, 2023',
          };
          
          setPlaylist(playlistData);
          setEditedDescription(playlistData.description);
          setIsEditable(playlistData.isOwner);
          
          // Mock songs data
          const songsData = [
            {
              id: 's1',
              title: 'Blinding Lights',
              artist: 'The Weeknd',
              artistId: 'ar1',
              album: 'After Hours',
              albumId: 'a1',
              coverUrl: 'https://via.placeholder.com/60',
              duration: '3:20',
              addedAt: '3 days ago',
            },
            {
              id: 's2',
              title: 'Save Your Tears',
              artist: 'The Weeknd',
              artistId: 'ar1',
              album: 'After Hours',
              albumId: 'a1',
              coverUrl: 'https://via.placeholder.com/60',
              duration: '3:35',
              addedAt: '5 days ago',
            },
            {
              id: 's3',
              title: 'Levitating',
              artist: 'Dua Lipa',
              artistId: 'ar2',
              album: 'Future Nostalgia',
              albumId: 'a4',
              coverUrl: 'https://via.placeholder.com/60',
              duration: '3:23',
              addedAt: '1 week ago',
            },
            {
              id: 's4',
              title: 'Watermelon Sugar',
              artist: 'Harry Styles',
              artistId: 'ar3',
              album: 'Fine Line',
              albumId: 'a5',
              coverUrl: 'https://via.placeholder.com/60',
              duration: '2:54',
              addedAt: '2 weeks ago',
            },
            {
              id: 's5',
              title: 'Stay',
              artist: 'The Kid LAROI, Justin Bieber',
              artistId: 'ar4',
              album: 'F*CK LOVE 3: OVER YOU',
              albumId: 'a6',
              coverUrl: 'https://via.placeholder.com/60',
              duration: '2:21',
              addedAt: '3 weeks ago',
            },
            {
              id: 's6',
              title: 'good 4 u',
              artist: 'Olivia Rodrigo',
              artistId: 'ar5',
              album: 'SOUR',
              albumId: 'a7',
              coverUrl: 'https://via.placeholder.com/60',
              duration: '2:58',
              addedAt: '1 month ago',
            },
            {
              id: 's7',
              title: 'Montero (Call Me By Your Name)',
              artist: 'Lil Nas X',
              artistId: 'ar6',
              album: 'MONTERO',
              albumId: 'a8',
              coverUrl: 'https://via.placeholder.com/60',
              duration: '2:17',
              addedAt: '1 month ago',
            },
            {
              id: 's8',
              title: 'drivers license',
              artist: 'Olivia Rodrigo',
              artistId: 'ar5',
              album: 'SOUR',
              albumId: 'a7',
              coverUrl: 'https://via.placeholder.com/60',
              duration: '4:02',
              addedAt: '2 months ago',
            },
          ];
          
          setSongs(songsData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching playlist details:', error);
        setLoading(false);
      }
    };

    fetchPlaylistDetails();
  }, [playlistId]);

  const handlePlayPlaylist = () => {
    // Implement playlist play functionality
    console.log('Playing playlist:', playlist?.title);
  };

  const handleSongPress = (songId) => {
    navigation.navigate('SongDetails', { songId });
  };

  const handleArtistPress = (artistId) => {
    navigation.navigate('Artist', { artistId });
  };

  const handleAlbumPress = (albumId) => {
    navigation.navigate('Album', { albumId });
  };

  const handleEditDescription = () => {
    if (!isEditable) return;
    setModalVisible(true);
  };

  const saveDescription = async () => {
    try {
      // In a real app, you would update the playlist on the server
      // await updatePlaylistDescription(playlist.id, editedDescription);
      
      // Update local state
      setPlaylist({ ...playlist, description: editedDescription });
      setModalVisible(false);
      
      Alert.alert('Success', 'Playlist description updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update playlist description');
    }
  };

  const removeSong = (songId) => {
    Alert.alert(
      'Remove Song',
      'Are you sure you want to remove this song from the playlist?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => {
            // Filter out the removed song
            const updatedSongs = songs.filter(song => song.id !== songId);
            setSongs(updatedSongs);
            
            // Update the playlist song count
            setPlaylist({
              ...playlist,
              songCount: playlist.songCount - 1
            });
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderSongOptions = (songId) => {
    if (!isEditable) return null;
    
    return (
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeSong(songId)}
      >
        <MaterialIcons name="delete-outline" size={22} color="#F44336" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
        <Text style={styles.loadingText}>Loading playlist...</Text>
      </View>
    );
  }

  if (!playlist) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={60} color="#F44336" />
        <Text style={styles.errorText}>Failed to load playlist.</Text>
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
        {/* Playlist Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.playlistInfoHeader}>
            <Image source={{ uri: playlist.coverUrl }} style={styles.playlistCover} />
            <View style={styles.playlistInfo}>
              <Text style={styles.playlistTitle}>{playlist.title}</Text>
              <TouchableOpacity onPress={handleEditDescription}>
                <Text style={[styles.playlistDescription, isEditable && styles.editableText]}>
                  {playlist.description}
                  {isEditable && <MaterialIcons name="edit" size={14} color="#9C27B0" />}
                </Text>
              </TouchableOpacity>
              <Text style={styles.playlistMeta}>
                Created by {playlist.creator} • {playlist.followers} followers
              </Text>
              <Text style={styles.playlistStats}>
                {playlist.songCount} songs • {playlist.duration} • Created {playlist.createdAt}
              </Text>
            </View>
          </View>
          
          <View style={styles.playlistActions}>
            <TouchableOpacity style={styles.playButton} onPress={handlePlayPlaylist}>
              <MaterialIcons name="play-arrow" size={24} color="#FFFFFF" />
              <Text style={styles.playButtonText}>Play</Text>
            </TouchableOpacity>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialIcons name="favorite-border" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialIcons name="share" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <MaterialIcons name="more-vert" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Playlist Songs */}
        <View style={styles.songsContainer}>
          {songs.length > 0 ? (
            <FlatList
              data={songs}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <TouchableOpacity 
                  style={styles.songItem}
                  onPress={() => handleSongPress(item.id)}
                >
                  <Text style={styles.songNumber}>{index + 1}</Text>
                  <Image source={{ uri: item.coverUrl }} style={styles.songCover} />
                  
                  <View style={styles.songDetails}>
                    <Text style={styles.songTitle}>{item.title}</Text>
                    <View style={styles.songArtistContainer}>
                      <TouchableOpacity onPress={() => handleArtistPress(item.artistId)}>
                        <Text style={styles.songArtist}>{item.artist}</Text>
                      </TouchableOpacity>
                      <Text style={styles.dot}>•</Text>
                      <TouchableOpacity onPress={() => handleAlbumPress(item.albumId)}>
                        <Text style={styles.songAlbum}>{item.album}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <Text style={styles.songAddedDate}>{item.addedAt}</Text>
                  <Text style={styles.songDuration}>{item.duration}</Text>
                  
                  {renderSongOptions(item.id)}
                </TouchableOpacity>
              )}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptySongsContainer}>
              <MaterialIcons name="music-off" size={60} color="#757575" />
              <Text style={styles.emptySongsText}>No songs in this playlist yet</Text>
              {isEditable && (
                <TouchableOpacity style={styles.addSongsButton}>
                  <Text style={styles.addSongsButtonText}>Add Songs</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Recommended Songs */}
        {songs.length > 0 && (
          <View style={styles.recommendedContainer}>
            <Text style={styles.sectionTitle}>Recommended Songs</Text>
            <Text style={styles.recommendedSubtitle}>Based on the songs in this playlist</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity style={styles.recommendedItem}>
                <Image 
                  source={{ uri: 'https://via.placeholder.com/120' }} 
                  style={styles.recommendedCover} 
                />
                <View style={styles.recommendedInfo}>
                  <Text style={styles.recommendedTitle}>Don't Start Now</Text>
                  <Text style={styles.recommendedArtist}>Dua Lipa</Text>
                </View>
                <TouchableOpacity style={styles.recommendedAddButton}>
                  <MaterialIcons name="add" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.recommendedItem}>
                <Image 
                  source={{ uri: 'https://via.placeholder.com/120' }} 
                  style={styles.recommendedCover} 
                />
                <View style={styles.recommendedInfo}>
                  <Text style={styles.recommendedTitle}>As It Was</Text>
                  <Text style={styles.recommendedArtist}>Harry Styles</Text>
                </View>
                <TouchableOpacity style={styles.recommendedAddButton}>
                  <MaterialIcons name="add" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.recommendedItem}>
                <Image 
                  source={{ uri: 'https://via.placeholder.com/120' }} 
                  style={styles.recommendedCover} 
                />
                <View style={styles.recommendedInfo}>
                  <Text style={styles.recommendedTitle}>Heat Waves</Text>
                  <Text style={styles.recommendedArtist}>Glass Animals</Text>
                </View>
                <TouchableOpacity style={styles.recommendedAddButton}>
                  <MaterialIcons name="add" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Edit Description Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Description</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.descriptionInput}
              value={editedDescription}
              onChangeText={setEditedDescription}
              placeholder="Add a description..."
              placeholderTextColor="#757575"
              multiline={true}
              maxLength={300}
            />
            
            <View style={styles.charCountContainer}>
              <Text style={styles.charCount}>{editedDescription.length}/300</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={saveDescription}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  playlistInfoHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  playlistCover: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  playlistTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  playlistDescription: {
    color: '#BBBBBB',
    fontSize: 14,
    marginBottom: 10,
  },
  editableText: {
    color: '#9C27B0',
  },
  playlistMeta: {
    color: '#BBBBBB',
    fontSize: 12,
    marginBottom: 5,
  },
  playlistStats: {
    color: '#999999',
    fontSize: 12,
  },
  playlistActions: {
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
  songsContainer: {
    paddingTop: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
    paddingBottom: 20,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  songNumber: {
    color: '#BBBBBB',
    fontSize: 14,
    width: 30,
    textAlign: 'center',
  },
  songCover: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
  },
  songDetails: {
    flex: 1,
  },
  songTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 3,
  },
  songArtistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songArtist: {
    color: '#9C27B0',
    fontSize: 12,
  },
  dot: {
    color: '#757575',
    fontSize: 12,
    marginHorizontal: 4,
  },
  songAlbum: {
    color: '#9C27B0',
    fontSize: 12,
  },
  songAddedDate: {
    color: '#757575',
    fontSize: 12,
    marginRight: 10,
  },
  songDuration: {
    color: '#BBBBBB',
    fontSize: 14,
    marginRight: 10,
    width: 40,
    textAlign: 'right',
  },
  removeButton: {
    padding: 5,
  },
  emptySongsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptySongsText: {
    color: '#BBBBBB',
    fontSize: 16,
    marginTop: 15,
    marginBottom: 20,
  },
  addSongsButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  addSongsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  recommendedContainer: {
    padding: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  recommendedSubtitle: {
    color: '#999999',
    fontSize: 14,
    marginBottom: 15,
  },
  recommendedItem: {
    width: 180,
    marginRight: 15,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 10,
  },
  recommendedCover: {
    width: 160,
    height: 160,
    borderRadius: 4,
    marginBottom: 10,
  },
  recommendedInfo: {
    marginBottom: 10,
  },
  recommendedTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 3,
  },
  recommendedArtist: {
    color: '#BBBBBB',
    fontSize: 12,
  },
  recommendedAddButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#9C27B0',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  descriptionInput: {
    backgroundColor: '#333333',
    color: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    minHeight: 120,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  charCountContainer: {
    alignItems: 'flex-end',
    marginTop: 5,
  },
  charCount: {
    color: '#BBBBBB',
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 25,
    padding: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PlaylistScreen; 