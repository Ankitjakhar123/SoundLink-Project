import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateProfile } = useContext(AuthContext);
  
  // Mock user data
  const [userData, setUserData] = useState({
    username: 'musiclover99',
    email: 'user@example.com',
    fullName: 'Alex Johnson',
    profileImage: 'https://via.placeholder.com/150',
    followers: 124,
    following: 256,
    playlists: 12,
  });

  // Settings state
  const [settings, setSettings] = useState({
    darkMode: true,
    downloadOverWifi: true,
    highQualityStreaming: false,
    notifications: true,
    privateAccount: false,
  });

  // Edit profile modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editableUserData, setEditableUserData] = useState({ ...userData });
  
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await logout();
              // Navigation will be handled by the AuthContext
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    setEditableUserData({ ...userData });
    setModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      // In a real app, you would send this data to your backend
      // await updateProfile(editableUserData);
      
      // Update local state
      setUserData(editableUserData);
      setModalVisible(false);
      
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to allow access to your photos to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setEditableUserData({ ...editableUserData, profileImage: result.assets[0].uri });
    }
  };

  const toggleSetting = (setting) => {
    setSettings({ ...settings, [setting]: !settings[setting] });
  };

  const renderSettingItem = (icon, title, value, onToggle) => (
    <View style={styles.settingItem}>
      <MaterialIcons name={icon} size={24} color="#BBBBBB" style={styles.settingIcon} />
      <Text style={styles.settingText}>{title}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#767577', true: '#9C27B0' }}
        thumbColor="#f4f3f4"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: userData.profileImage }}
            style={styles.profileImage}
          />
          <Text style={styles.username}>{userData.username}</Text>
          <Text style={styles.email}>{userData.email}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.playlists}</Text>
              <Text style={styles.statLabel}>Playlists</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Settings</Text>

          {renderSettingItem(
            'brightness-6',
            'Dark Mode',
            settings.darkMode,
            () => toggleSetting('darkMode')
          )}
          
          {renderSettingItem(
            'wifi',
            'Download Over WiFi Only',
            settings.downloadOverWifi,
            () => toggleSetting('downloadOverWifi')
          )}
          
          {renderSettingItem(
            'high-quality',
            'High Quality Streaming',
            settings.highQualityStreaming,
            () => toggleSetting('highQualityStreaming')
          )}
          
          {renderSettingItem(
            'notifications',
            'Notifications',
            settings.notifications,
            () => toggleSetting('notifications')
          )}
          
          {renderSettingItem(
            'lock',
            'Private Account',
            settings.privateAccount,
            () => toggleSetting('privateAccount')
          )}
        </View>

        {/* Support & About */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Support & About</Text>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialIcons name="help" size={24} color="#BBBBBB" style={styles.menuIcon} />
            <Text style={styles.menuText}>Help & Support</Text>
            <MaterialIcons name="chevron-right" size={24} color="#BBBBBB" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <MaterialIcons name="info" size={24} color="#BBBBBB" style={styles.menuIcon} />
            <Text style={styles.menuText}>About</Text>
            <MaterialIcons name="chevron-right" size={24} color="#BBBBBB" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <MaterialIcons name="description" size={24} color="#BBBBBB" style={styles.menuIcon} />
            <Text style={styles.menuText}>Terms & Privacy Policy</Text>
            <MaterialIcons name="chevron-right" size={24} color="#BBBBBB" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <MaterialIcons name="exit-to-app" size={20} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.profileImageContainer}
              onPress={handlePickImage}
            >
              <Image
                source={{ uri: editableUserData.profileImage }}
                style={styles.editProfileImage}
              />
              <View style={styles.cameraIconContainer}>
                <MaterialIcons name="camera-alt" size={18} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={editableUserData.username}
                onChangeText={(text) => setEditableUserData({...editableUserData, username: text})}
                placeholderTextColor="#757575"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={editableUserData.fullName}
                onChangeText={(text) => setEditableUserData({...editableUserData, fullName: text})}
                placeholderTextColor="#757575"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={editableUserData.email}
                onChangeText={(text) => setEditableUserData({...editableUserData, email: text})}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#757575"
              />
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveProfile}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#BBBBBB',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#BBBBBB',
  },
  editProfileButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#9C27B0',
  },
  editProfileButtonText: {
    color: '#9C27B0',
    fontSize: 16,
    fontWeight: '500',
  },
  settingsContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  settingIcon: {
    marginRight: 15,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 25,
    marginHorizontal: 20,
    padding: 12,
    backgroundColor: '#9C27B0',
    borderRadius: 30,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  versionText: {
    fontSize: 14,
    color: '#757575',
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
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  editProfileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#9C27B0',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#BBBBBB',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 10,
    color: '#FFFFFF',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 30,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileScreen; 