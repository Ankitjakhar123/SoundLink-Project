import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import AdminDashboard from "../Admin/Dashboard/AdminDashboard";
import axios from 'axios';
import Skeleton from '../Skeleton';

const Profile = () => {
  const { user, updateUserData } = useContext(AuthContext);
  const [preview, setPreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(user || {});

  // Display any loaded image immediately for debugging
  useEffect(() => {
    console.log("User data in profile:", user);
    if (user?.image) console.log("User image URL:", user.image);
    if (user?.avatar) console.log("User avatar URL:", user.avatar);
    
    // Log localStorage token for debugging auth issues
    console.log("Auth token exists:", !!localStorage.getItem('token'));
  }, [user]);

  // Set initial preview from user image/avatar with improved logging
  useEffect(() => {
    if (user?.avatar || user?.image) {
      const avatarUrl = user.avatar || user.image;
      console.log("Setting preview from:", avatarUrl);
      
      // Handle Cloudinary URLs
      if (avatarUrl && avatarUrl.includes('cloudinary.com')) {
        const fixedUrl = avatarUrl.replace('http://', 'https://');
        console.log("Using Cloudinary URL:", fixedUrl);
        setPreview(fixedUrl);
      } 
      // Handle local uploads by prepending backend URL
      else if (avatarUrl && avatarUrl.startsWith('/uploads')) {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
        const fullUrl = `${backendUrl}${avatarUrl}`;
        console.log("Using local upload URL:", fullUrl);
        setPreview(fullUrl);
      }
      else {
        console.log("Using direct URL:", avatarUrl);
        setPreview(avatarUrl);
      }
    } else {
      console.log("No avatar URL found in user data");
    }
  }, [user?.image, user?.avatar]);

  // Update local state when user context changes
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setUserData(user);
    }
  }, [user]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Log the selected file info
      console.log("Selected file:", file.name, file.type, file.size);
      
      // Create blob URL for preview
      const objectUrl = URL.createObjectURL(file);
      console.log("Created object URL for preview:", objectUrl);
      
      // Set the preview image
      setPreview(objectUrl);
      setSelectedImage(file);
      
      // Validate image
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        console.warn("Warning: Selected file may not be a supported image type:", file.type);
      }
      
      if (file.size > 5 * 1024 * 1024) {
        console.warn("Warning: Image is large (>5MB) and may fail to upload");
      }
    }
  };

  // Add cache-busting parameter to URLs
  const addCacheBuster = (url) => {
    if (!url) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${new Date().getTime()}`;
  };

  // Real profile update
  const handleSave = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      if (selectedImage) {
        formData.append('image', selectedImage);
        console.log('Image added to form data:', selectedImage.name, selectedImage.type, selectedImage.size);
      } else {
        console.log('No new image selected for upload');
      }
      
      // Debug - log what we're sending
      console.log('Sending username:', username);
      console.log('Sending email:', email);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setIsLoading(false);
        return;
      }
      
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
      console.log('Using backend URL:', backendUrl);
      
      console.log('Sending profile update request...');
      const res = await axios.post(
        `${backendUrl}/api/user/update`,
        formData,
        { 
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('Response received:', res);
      console.log('User data in response:', res.data.user);
      
      if (res.status === 200 && res.data.success && res.data.user) {
        setSuccess('Profile updated successfully!');
        
        // Update local state
        setUserData(res.data.user);
        console.log('Updated local userData with:', res.data.user);
        
        // Update the AuthContext with new user data
        updateUserData(res.data.user);
        console.log('Updated AuthContext with:', res.data.user);
        
        // Update preview with the Cloudinary URL if available
        if (res.data.user.image || res.data.user.avatar) {
          const avatarUrl = res.data.user.image || res.data.user.avatar;
          console.log('Setting new avatar preview from response:', avatarUrl);
          
          // Handle Cloudinary URLs
          if (avatarUrl && avatarUrl.includes('cloudinary.com')) {
            const fixedUrl = avatarUrl.replace('http://', 'https://');
            console.log("Using Cloudinary URL from response:", fixedUrl);
            // Add cache buster to prevent browser caching
            setPreview(addCacheBuster(fixedUrl));
          } 
          // Handle local uploads by prepending backend URL
          else if (avatarUrl && avatarUrl.startsWith('/uploads')) {
            const fullUrl = `${backendUrl}${avatarUrl}`;
            console.log("Using local upload URL from response:", fullUrl);
            // Add cache buster to prevent browser caching
            setPreview(addCacheBuster(fullUrl));
          }
          else {
            console.log("Using direct URL from response:", avatarUrl);
            // Add cache buster to prevent browser caching
            setPreview(addCacheBuster(avatarUrl));
          }
        } else {
          console.log('No avatar/image found in response data');
        }
        
        // Reload user data from server to ensure everything is in sync
        try {
          console.log('Reloading user data after profile update...');
          const userRes = await axios.get(`${backendUrl}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (userRes.data.success) {
            console.log('Reloaded user data:', userRes.data.user);
            updateUserData(userRes.data.user);
          }
        } catch (reloadErr) {
          console.error('Error reloading user data after profile update:', reloadErr);
        }
      } else {
        setError(res.data.message || 'Update failed');
        console.error('Update failed, response data:', res.data);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      
      if (err.response) {
        console.log('Error response status:', err.response.status);
        console.log('Error response data:', err.response.data);
        setError(err.response.data?.message || `Error ${err.response.status}: Update failed`);
      } else if (err.request) {
        console.log('No response received:', err.request);
        setError('No response from server. Please check your connection.');
      } else {
        setError('Update failed: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Use userData for display instead of user from context
  const displayUser = userData || user;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12">
            <Skeleton type="image" className="w-48 h-48 rounded-full" />
            <div className="flex-1">
              <Skeleton type="title" className="w-64 mb-4" />
              <Skeleton type="text" className="w-48 mb-2" />
              <Skeleton type="text" className="w-32" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton type="text" className="w-full h-12" />
            <Skeleton type="text" className="w-full h-12" />
            <Skeleton type="text" className="w-full h-12" />
          </div>
        </div>
      </div>
    );
  }

  if (!displayUser) return <div className="text-white p-8">No user data found.</div>;

  return (
    <div className="flex-1 min-h-screen bg-black rounded-2xl shadow-2xl p-8 text-white flex flex-col gap-8">
      <h2 className="text-3xl font-bold mb-4">Profile</h2>
      <form className="flex flex-col gap-6" onSubmit={handleSave}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src={addCacheBuster(preview) || '/default-avatar.svg'}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-fuchsia-700 shadow-lg"
              loading="eager"
              onLoad={(e) => {
                console.log("Avatar image loaded successfully:", e.target.src);
              }}
              onError={(e) => {
                console.error("Failed to load avatar:", e.target.src);
                e.target.onerror = null;
                e.target.src = '/default-avatar.svg';
              }}
            />
            <label htmlFor="profile-image-upload" className="absolute bottom-2 right-2 bg-fuchsia-700 text-white px-3 py-1 rounded-full cursor-pointer text-xs font-semibold hover:bg-fuchsia-800 transition">
              Change
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-neutral-400">Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="bg-neutral-900 text-white border border-neutral-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-neutral-400">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-neutral-900 text-white border border-neutral-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-neutral-400">Role</label>
          <input
            type="text"
            value={displayUser.role}
            disabled
            className="bg-neutral-900 text-white border border-neutral-700 rounded px-4 py-2 opacity-60 cursor-not-allowed"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:scale-105 transition-transform mt-4 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
        {success && <div className="text-green-400 text-center">{success}</div>}
        {error && <div className="text-red-400 text-center">{error}</div>}
      </form>
      {displayUser.role === 'admin' && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-4">Admin Dashboard</h3>
          <AdminDashboard token={localStorage.getItem('token')} />
        </div>
      )}
    </div>
  );
};

export default Profile;