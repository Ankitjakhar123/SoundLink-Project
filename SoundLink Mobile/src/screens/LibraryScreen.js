import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const LibraryScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('playlists');

  // Mock data for the library
  const [libraryData, setLibraryData] = useState({
    playlists: [
      {
        id: 'p1',
        title: 'Favorites',
        description: 'Your favorite tracks',
        songCount: 47,
        coverUrl: 'https://via.placeholder.com/200',
      },
      {
        id: 'p2',
        title: 'Running Mix',
        description: 'High energy tracks for your workout',
        songCount: 25,
        coverUrl: 'https://via.placeholder.com/200',
      },
      {
        id: 'p3',
        title: 'Chill Vibes',
        description: 'Relaxing music for your downtime',
        songCount: 32,
        coverUrl: 'https://via.placeholder.com/200',
      },
    ],
    albums: [
      {
        id: 'a1',
        title: 'After Hours',
        artist: 'The Weeknd',
        year: '2020',
        coverUrl: 'https://via.placeholder.com/200',
      },
      {
        id: 'a2',
        title: 'Planet Her',
        artist: 'Doja Cat',
        year: '2021',
        coverUrl: 'https://via.placeholder.com/200',
      },
      {
        id: 'a3',
        title: 'Sour',
        artist: 'Olivia Rodrigo',
        year: '2021',
        coverUrl: 'https://via.placeholder.com/200',
      },
    ],
    artists: [
      {
        id: 'ar1',
        name: 'The Weeknd',
        followers: '38.5M',
        imageUrl: 'https://via.placeholder.com/200',
      },
      {
        id: 'ar2',
        name: 'Doja Cat',
        followers: '25.2M',
        imageUrl: 'https://via.placeholder.com/200',
      },
      {
        id: 'ar3',
        name: 'Drake',
        followers: '65.7M',
        imageUrl: 'https://via.placeholder.com/200',
      },
    ],
    podcasts: [
      {
        id: 'pod1',
        title: 'Tech Talk Weekly',
        author: 'Tech Insights',
        episodes: 156,
        imageUrl: 'https://via.placeholder.com/200',
      },
      {
        id: 'pod2',
        title: 'True Crime Stories',
        author: 'Mystery Network',
        episodes: 89,
        imageUrl: 'https://via.placeholder.com/200',
      },
      {
        id: 'pod3',
        title: 'The Daily',
        author: 'News Today',
        episodes: 1245,
        imageUrl: 'https://via.placeholder.com/200',
      },
    ],
  });

  const onRefresh = () => {
    setRefreshing(true);
    
    // Simulate API call to refresh data
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const renderTabs = () => {
    const tabs = [
      { id: 'playlists', label: 'Playlists', icon: 'queue-music' },
      { id: 'albums', label: 'Albums', icon: 'album' },
      { id: 'artists', label: 'Artists', icon: 'person' },
      { id: 'podcasts', label: 'Podcasts', icon: 'mic' },
    ];

    return (
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <MaterialIcons
              name={tab.icon}
              size={22}
              color={activeTab === tab.id ? '#9C27B0' : '#BBBBBB'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderPlaylists = () => {
    return (
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Your Playlists</Text>
          <TouchableOpacity style={styles.createButton}>
            <MaterialIcons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Create New</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={libraryData.playlists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => navigation.navigate('Playlist', { playlistId: item.id })}
            >
              <Image source={{ uri: item.coverUrl }} style={styles.itemCover} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
                <Text style={styles.itemSubtext}>{item.songCount} songs</Text>
              </View>
              <MaterialIcons name="more-vert" size={24} color="#BBBBBB" />
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderAlbums = () => {
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Your Albums</Text>
        
        <FlatList
          data={libraryData.albums}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => navigation.navigate('Album', { albumId: item.id })}
            >
              <Image source={{ uri: item.coverUrl }} style={styles.itemCover} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription}>{item.artist}</Text>
                <Text style={styles.itemSubtext}>{item.year}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#BBBBBB" />
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderArtists = () => {
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Artists You Follow</Text>
        
        <FlatList
          data={libraryData.artists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => navigation.navigate('Artist', { artistId: item.id })}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={[styles.itemCover, { borderRadius: 50 }]}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemSubtext}>{item.followers} followers</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#BBBBBB" />
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderPodcasts = () => {
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Your Podcasts</Text>
        
        <FlatList
          data={libraryData.podcasts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => {
                // Handle podcast navigation
              }}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.itemCover} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription}>{item.author}</Text>
                <Text style={styles.itemSubtext}>{item.episodes} episodes</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#BBBBBB" />
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Library</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="sort" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {renderTabs()}

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#9C27B0']} />
        }
      >
        {activeTab === 'playlists' && renderPlaylists()}
        {activeTab === 'albums' && renderAlbums()}
        {activeTab === 'artists' && renderArtists()}
        {activeTab === 'podcasts' && renderPodcasts()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#9C27B0',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#BBBBBB',
  },
  activeTabText: {
    color: '#9C27B0',
    fontWeight: '500',
  },
  contentContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  itemCover: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 14,
    color: '#BBBBBB',
    marginBottom: 2,
  },
  itemSubtext: {
    fontSize: 12,
    color: '#999999',
  },
});

export default LibraryScreen; 