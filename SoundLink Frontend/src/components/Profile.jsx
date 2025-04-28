import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import axios from 'axios';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [preview, setPreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(user || {});

  // Set initial preview from user image
  useEffect(() => {
    if (user?.image) {
      setPreview(user.image);
    }
  }, [user?.image]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setSelectedImage(file);
    }
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
      }
      
      // Debug - log what we're sending
      console.log('Sending username:', username);
      console.log('Sending email:', email);
      console.log('Sending image:', selectedImage);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setIsLoading(false);
        return;
      }
      
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
      console.log('Using backend URL:', backendUrl);
      
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
      
      if (res.status === 200 && res.data.success && res.data.user) {
        setSuccess('Profile updated successfully!');
        setUserData(res.data.user); // Update local state
        
        // Update preview with the Cloudinary URL if available
        if (res.data.user.image) {
          setPreview(res.data.user.image);
        }
        
        // Since we can't directly update the AuthContext, we can force a re-login
        // by logging out and re-logging in, or force a refresh to reload the context
        // window.location.reload(); // Uncomment this if you want to refresh the page
      } else {
        setError(res.data.message || 'Update failed');
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

  if (!displayUser) return <div className="text-white p-8">No user data found.</div>;

  return (
    <div className="flex-1 min-h-screen bg-black rounded-2xl shadow-2xl p-8 text-white flex flex-col gap-8">
      <h2 className="text-3xl font-bold mb-4">Profile</h2>
      <form className="flex flex-col gap-6" onSubmit={handleSave}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src={preview || '/default-avatar.png'}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-fuchsia-700 shadow-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-avatar.png';
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