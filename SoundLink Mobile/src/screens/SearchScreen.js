import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Mock categories for filtering results
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'songs', name: 'Songs' },
    { id: 'artists', name: 'Artists' },
    { id: 'albums', name: 'Albums' },
    { id: 'playlists', name: 'Playlists' },
  ];

  // Simulated API call to search content
  const searchContent = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // Here you would make an actual API call to your backend
      // const response = await fetch(`${API_URL}/search?q=${query}`);
      // const data = await response.json();
      
      // Simulated response for demo purposes
      setTimeout(() => {
        const mockResults = [
          // Songs
          {
            id: 's1',
            type: 'song',
            title: 'Blinding Lights',
            artist: 'The Weeknd',
            album: 'After Hours',
            coverUrl: 'https://via.placeholder.com/60',
          },
          {
            id: 's2',
            type: 'song',
            title: 'Save Your Tears',
            artist: 'The Weeknd',
            album: 'After Hours',
            coverUrl: 'https://via.placeholder.com/60',
          },
          // Artists
          {
            id: 'a1',
            type: 'artist',
            name: 'The Weeknd',
            imageUrl: 'https://via.placeholder.com/60',
            followers: '38.5M',
          },
          // Albums
          {
            id: 'al1',
            type: 'album',
            title: 'After Hours',
            artist: 'The Weeknd',
            year: '2020',
            coverUrl: 'https://via.placeholder.com/60',
          },
          // Playlists
          {
            id: 'p1',
            type: 'playlist',
            title: 'Weekend Vibes',
            creator: 'SoundLink',
            songCount: 25,
            coverUrl: 'https://via.placeholder.com/60',
          },
        ].filter(item => {
          if (activeTab === 'all') return true;
          return item.type === activeTab.slice(0, -1); // Remove 's' from the end (songs -> song)
        });
        
        setSearchResults(mockResults);
        
        // Add to recent searches if not already there
        if (query.trim() && !recentSearches.includes(query.trim())) {
          setRecentSearches(prev => [query.trim(), ...prev].slice(0, 5));
        }
        
        setIsLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Search error:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      searchContent(searchQuery);
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, activeTab]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSelectResult = (item) => {
    // Navigate based on the type of the selected item
    switch (item.type) {
      case 'song':
        navigation.navigate('SongDetails', { songId: item.id });
        break;
      case 'artist':
        navigation.navigate('Artist', { artistId: item.id });
        break;
      case 'album':
        navigation.navigate('Album', { albumId: item.id });
        break;
      case 'playlist':
        navigation.navigate('Playlist', { playlistId: item.id });
        break;
      default:
        break;
    }
  };

  const renderSearchResult = ({ item }) => {
    switch (item.type) {
      case 'song':
        return (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleSelectResult(item)}
          >
            <Image source={{ uri: item.coverUrl }} style={styles.thumbnail} />
            <View style={styles.resultInfo}>
              <Text style={styles.resultTitle}>{item.title}</Text>
              <Text style={styles.resultSubtitle}>
                {item.artist} • {item.album}
              </Text>
            </View>
            <MaterialIcons name="play-circle-outline" size={30} color="#9C27B0" />
          </TouchableOpacity>
        );
      
      case 'artist':
        return (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleSelectResult(item)}
          >
            <Image 
              source={{ uri: item.imageUrl }} 
              style={[styles.thumbnail, { borderRadius: 30 }]} 
            />
            <View style={styles.resultInfo}>
              <Text style={styles.resultTitle}>{item.name}</Text>
              <Text style={styles.resultSubtitle}>
                Artist • {item.followers} followers
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={30} color="#757575" />
          </TouchableOpacity>
        );
      
      case 'album':
        return (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleSelectResult(item)}
          >
            <Image source={{ uri: item.coverUrl }} style={styles.thumbnail} />
            <View style={styles.resultInfo}>
              <Text style={styles.resultTitle}>{item.title}</Text>
              <Text style={styles.resultSubtitle}>
                Album • {item.artist} • {item.year}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={30} color="#757575" />
          </TouchableOpacity>
        );
      
      case 'playlist':
        return (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleSelectResult(item)}
          >
            <Image source={{ uri: item.coverUrl }} style={styles.thumbnail} />
            <View style={styles.resultInfo}>
              <Text style={styles.resultTitle}>{item.title}</Text>
              <Text style={styles.resultSubtitle}>
                Playlist • {item.creator} • {item.songCount} songs
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={30} color="#757575" />
          </TouchableOpacity>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={24} color="#757575" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs, artists, albums..."
            placeholderTextColor="#757575"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <MaterialIcons name="close" size={24} color="#757575" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.categoryTabs}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryTab,
                activeTab === item.id && styles.activeTab,
              ]}
              onPress={() => setActiveTab(item.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeTab === item.id && styles.activeTabText,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#9C27B0" />
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={item => `${item.type}-${item.id}`}
          renderItem={renderSearchResult}
          contentContainerStyle={styles.resultsList}
        />
      ) : searchQuery.length > 0 ? (
        <View style={styles.noResultsContainer}>
          <MaterialIcons name="search-off" size={60} color="#757575" />
          <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
          <Text style={styles.noResultsSubtext}>Try different keywords or check your spelling</Text>
        </View>
      ) : recentSearches.length > 0 ? (
        <View style={styles.recentSearchesContainer}>
          <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentSearchItem}
              onPress={() => setSearchQuery(search)}
            >
              <MaterialIcons name="history" size={20} color="#757575" />
              <Text style={styles.recentSearchText}>{search}</Text>
              <TouchableOpacity
                onPress={() => {
                  setRecentSearches(recentSearches.filter((_, i) => i !== index));
                }}
              >
                <MaterialIcons name="close" size={20} color="#757575" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.startSearchContainer}>
          <MaterialIcons name="search" size={60} color="#757575" />
          <Text style={styles.startSearchText}>Search for your favorite music</Text>
          <Text style={styles.startSearchSubtext}>Find songs, artists, albums, and playlists</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  searchHeader: {
    padding: 15,
    paddingTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
  },
  categoryTabs: {
    marginVertical: 5,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#9C27B0',
  },
  categoryText: {
    color: '#E0E0E0',
    fontSize: 14,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  resultsList: {
    paddingVertical: 10,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 15,
  },
  resultTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  resultSubtitle: {
    color: '#BBBBBB',
    fontSize: 14,
    marginTop: 2,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    textAlign: 'center',
  },
  noResultsSubtext: {
    color: '#BBBBBB',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  recentSearchesContainer: {
    padding: 15,
  },
  recentSearchesTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333333',
  },
  recentSearchText: {
    flex: 1,
    color: '#E0E0E0',
    fontSize: 16,
    marginLeft: 15,
  },
  startSearchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  startSearchText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    textAlign: 'center',
  },
  startSearchSubtext: {
    color: '#BBBBBB',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default SearchScreen; 