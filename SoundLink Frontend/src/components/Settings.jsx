import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaSun, FaMoon, FaBell, FaBellSlash, FaLock, FaCheck, FaEye, FaEyeSlash, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import axios from 'axios';

const Settings = () => {
  const { token } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    privateAccount: false,
    showListeningActivity: true,
    autoplay: true,
    crossfade: false,
    normalizeVolume: false,
    language: 'english',
    quality: 'high'
  });

  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!token) return;
      
      setIsLoading(true);
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
        // You may need to create this endpoint in your backend
        const response = await axios.get(`${backendUrl}/api/user/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success && response.data.settings) {
          setSettings(prev => ({ ...prev, ...response.data.settings }));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        // If no settings found, we'll use the defaults
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserSettings();
  }, [token]);

  const saveSettings = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
      // You may need to create this endpoint in your backend
      const response = await axios.post(
        `${backendUrl}/api/user/settings`,
        { settings },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setMessage({ text: 'Settings saved successfully!', type: 'success' });
      } else {
        setMessage({ text: 'Failed to save settings.', type: 'error' });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ text: 'Failed to save settings. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    }
  };

  const handleToggle = (setting) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleChange = (setting, value) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-4">
            <FaArrowLeft className="mr-2" size={18} />
            <span>Back</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">Settings</h1>
          <p className="text-neutral-400 mt-2">Customize your SoundLink experience</p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div 
            className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-800/50 text-green-300' : 'bg-red-800/50 text-red-300'}`}
          >
            {message.text}
          </div>
        )}

        {/* Settings Sections */}
        <div className="grid gap-8">
          {/* Appearance Section */}
          <SettingsSection title="Appearance">
            <div className="space-y-4">
              <ToggleSetting 
                icon={settings.darkMode ? <FaMoon className="text-purple-400" /> : <FaSun className="text-yellow-400" />}
                title="Dark Mode" 
                description="Use dark theme across the application" 
                isActive={settings.darkMode}
                onToggle={() => handleToggle('darkMode')}
              />
            </div>
          </SettingsSection>

          {/* Notification Section */}
          <SettingsSection title="Notifications">
            <div className="space-y-4">
              <ToggleSetting 
                icon={settings.notifications ? <FaBell className="text-blue-400" /> : <FaBellSlash className="text-neutral-500" />}
                title="Push Notifications" 
                description="Receive notifications about new songs, artist updates, and more" 
                isActive={settings.notifications}
                onToggle={() => handleToggle('notifications')}
              />
            </div>
          </SettingsSection>

          {/* Privacy Section */}
          <SettingsSection title="Privacy">
            <div className="space-y-4">
              <ToggleSetting 
                icon={settings.privateAccount ? <FaLock className="text-green-400" /> : <FaLock className="text-neutral-500" />}
                title="Private Account" 
                description="Only approved followers can see your activity" 
                isActive={settings.privateAccount}
                onToggle={() => handleToggle('privateAccount')}
              />
              <ToggleSetting 
                icon={settings.showListeningActivity ? <FaEye className="text-cyan-400" /> : <FaEyeSlash className="text-neutral-500" />}
                title="Listening Activity" 
                description="Share what you're listening to with followers" 
                isActive={settings.showListeningActivity}
                onToggle={() => handleToggle('showListeningActivity')}
              />
            </div>
          </SettingsSection>

          {/* Playback Section */}
          <SettingsSection title="Playback">
            <div className="space-y-4">
              <ToggleSetting 
                icon={settings.autoplay ? <FaCheck className="text-green-400" /> : <FaCheck className="text-neutral-500" />}
                title="Autoplay" 
                description="Automatically play similar songs when your music ends" 
                isActive={settings.autoplay}
                onToggle={() => handleToggle('autoplay')}
              />
              <ToggleSetting 
                icon={settings.normalizeVolume ? <FaVolumeUp className="text-orange-400" /> : <FaVolumeMute className="text-neutral-500" />}
                title="Normalize Volume" 
                description="Set the same volume level for all tracks" 
                isActive={settings.normalizeVolume}
                onToggle={() => handleToggle('normalizeVolume')}
              />
            </div>
          </SettingsSection>

          {/* Language & Quality Section */}
          <SettingsSection title="Language & Quality">
            <div className="space-y-6">
              <SelectSetting 
                title="Language" 
                value={settings.language}
                onChange={(value) => handleChange('language', value)}
                options={[
                  { value: 'english', label: 'English' },
                  { value: 'spanish', label: 'Spanish' },
                  { value: 'french', label: 'French' },
                  { value: 'german', label: 'German' },
                  { value: 'japanese', label: 'Japanese' },
                  { value: 'chinese', label: 'Chinese' },
                ]}
              />
              <SelectSetting 
                title="Audio Quality" 
                value={settings.quality}
                onChange={(value) => handleChange('quality', value)}
                options={[
                  { value: 'low', label: 'Low (64 kbps)' },
                  { value: 'medium', label: 'Medium (128 kbps)' },
                  { value: 'high', label: 'High (256 kbps)' },
                  { value: 'ultra', label: 'Ultra (320 kbps)' },
                ]}
              />
            </div>
          </SettingsSection>
        </div>

        {/* Save Button */}
        <div className="mt-10 mb-20">
          <button
            onClick={saveSettings}
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:from-fuchsia-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center
              ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const SettingsSection = ({ title, children }) => (
  <section className="border-b border-neutral-800 pb-6">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {children}
  </section>
);

const ToggleSetting = ({ icon, title, description, isActive, onToggle }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-neutral-400">{description}</p>
      </div>
    </div>
    <button 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isActive ? 'bg-fuchsia-600' : 'bg-neutral-700'}`}
    >
      <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
    </button>
  </div>
);

const SelectSetting = ({ title, value, onChange, options }) => (
  <div>
    <h3 className="font-medium mb-2">{title}</h3>
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-neutral-800 text-white py-2 px-3 rounded-lg border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default Settings; 