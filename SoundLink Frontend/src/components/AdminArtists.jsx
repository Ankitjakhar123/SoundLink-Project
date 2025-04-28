import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { MdAdd, MdEdit, MdDelete, MdPerson, MdSearch, MdClear } from 'react-icons/md';

const AdminArtists = () => {
  const { token } = useContext(AuthContext);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [showForm, setShowForm] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    image: null
  });
  const [previewImage, setPreviewImage] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/artist/list`);
      if (response.data.success) {
        setArtists(response.data.artists);
      }
    } catch (error) {
      console.error('Error fetching artists:', error);
      toast.error('Failed to load artists');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      bio: '',
      image: null
    });
    setPreviewImage(null);
  };

  const handleOpenAddForm = () => {
    resetForm();
    setFormMode('add');
    setShowForm(true);
  };

  const handleOpenEditForm = (artist) => {
    setSelectedArtist(artist);
    setFormData({
      name: artist.name,
      bio: artist.bio || '',
      image: null
    });
    setPreviewImage(artist.image);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Artist name is required');
      return;
    }
    
    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('bio', formData.bio);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      
      let response;
      
      if (formMode === 'add') {
        response = await axios.post(
          `${backendUrl}/api/artist/add`,
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.data.success) {
          toast.success('Artist added successfully');
          fetchArtists();
          handleCloseForm();
        }
      } else if (formMode === 'edit') {
        response = await axios.put(
          `${backendUrl}/api/artist/update/${selectedArtist._id}`,
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.data.success) {
          toast.success('Artist updated successfully');
          fetchArtists();
          handleCloseForm();
        }
      }
    } catch (error) {
      console.error('Error saving artist:', error);
      toast.error(error.response?.data?.message || 'Failed to save artist');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArtist = async (artistId) => {
    if (!confirm('Are you sure you want to delete this artist?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.delete(
        `${backendUrl}/api/artist/delete/${artistId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Artist deleted successfully');
        fetchArtists();
      }
    } catch (error) {
      console.error('Error deleting artist:', error);
      toast.error('Failed to delete artist');
    } finally {
      setLoading(false);
    }
  };

  const filteredArtists = artists.filter(artist => 
    artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (artist.bio && artist.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 bg-neutral-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <MdPerson className="mr-2 text-fuchsia-500" size={24} />
        Manage Artists
      </h1>

      {/* Search and Add Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 items-center justify-between">
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 pl-10 bg-neutral-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
          />
          <MdSearch className="absolute top-2.5 left-3 text-neutral-400" size={20} />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute top-2.5 right-3 text-neutral-400 hover:text-white"
            >
              <MdClear size={20} />
            </button>
          )}
        </div>
        <button
          onClick={handleOpenAddForm}
          className="w-full md:w-auto px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 rounded-lg flex items-center justify-center transition-colors"
        >
          <MdAdd className="mr-2" size={20} />
          Add New Artist
        </button>
      </div>

      {/* Artists List */}
      {loading && !showForm ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-fuchsia-500">Loading...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtists.length > 0 ? (
            filteredArtists.map((artist) => (
              <div
                key={artist._id}
                className="bg-neutral-800 rounded-lg overflow-hidden shadow-lg hover:shadow-fuchsia-900/20 transition-shadow"
              >
                <div className="aspect-square overflow-hidden bg-neutral-700">
                  {artist.image ? (
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MdPerson className="text-fuchsia-500" size={80} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2 truncate">{artist.name}</h3>
                  {artist.bio && (
                    <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{artist.bio}</p>
                  )}
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => handleOpenEditForm(artist)}
                      className="p-2 rounded-full bg-neutral-700 hover:bg-neutral-600 transition-colors"
                    >
                      <MdEdit size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteArtist(artist._id)}
                      className="p-2 rounded-full bg-neutral-700 hover:bg-red-600 transition-colors"
                    >
                      <MdDelete size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-12 text-center text-neutral-400">
              {searchQuery
                ? 'No artists found matching your search'
                : 'No artists have been added yet'}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {formMode === 'add' ? 'Add New Artist' : 'Edit Artist'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-2 bg-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                ></textarea>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Image</label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 bg-neutral-700 rounded-lg overflow-hidden flex items-center justify-center"
                  >
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MdPerson className="text-neutral-500" size={32} />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="text-sm text-neutral-300 file:mr-4 file:py-2 file:px-4 
                      file:rounded-full file:border-0 file:text-sm file:bg-fuchsia-600 
                      file:text-white hover:file:bg-fuchsia-700 cursor-pointer w-full"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminArtists; 