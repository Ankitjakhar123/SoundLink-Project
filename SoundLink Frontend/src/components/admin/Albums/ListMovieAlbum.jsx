import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdMovie, MdDelete, MdEdit, MdClose } from 'react-icons/md';

const ListMovieAlbum = ({ onCloseModal }) => {
  const [movieAlbums, setMovieAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    director: '',
    year: '',
    description: '',
    genre: ''
  });

  const url = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  useEffect(() => {
    fetchMovieAlbums();
  }, []);

  const fetchMovieAlbums = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${url}/api/moviealbum/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setMovieAlbums(res.data.movieAlbums || []);
      } else {
        setError('Failed to load movie albums');
      }
    } catch (err) {
      console.error('Error fetching movie albums:', err);
      setError('Failed to load movie albums');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie album?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`${url}/api/moviealbum/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setMovieAlbums(movieAlbums.filter(album => album._id !== id));
      }
    } catch (err) {
      console.error('Error deleting movie album:', err);
      alert('Failed to delete movie album');
    }
  };

  const startEdit = (album) => {
    setEditingId(album._id);
    setEditForm({
      title: album.title,
      director: album.director,
      year: album.year,
      description: album.description,
      genre: album.genre
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${url}/api/moviealbum/${id}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (res.data.success) {
        setMovieAlbums(movieAlbums.map(album => 
          album._id === id ? { ...album, ...editForm } : album
        ));
        setEditingId(null);
      }
    } catch (err) {
      console.error('Error updating movie album:', err);
      alert('Failed to update movie album');
    }
  };

  if (loading) return <div className="text-white">Loading movie albums...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="text-white w-full">
      <div className="flex items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <MdMovie className="text-fuchsia-500 text-2xl" />
          <h2 className="text-2xl font-bold">Movie Albums</h2>
        </div>
        {onCloseModal && (
          <button
            onClick={onCloseModal}
            className="h-8 w-8 rounded-full flex items-center justify-center bg-neutral-800 hover:bg-fuchsia-900 transition"
          >
            <MdClose />
          </button>
        )}
      </div>

      {movieAlbums.length === 0 ? (
        <div className="text-neutral-400 text-center py-8">No movie albums found</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {movieAlbums.map(album => (
            <div key={album._id} className="bg-neutral-900 rounded-lg p-4 relative">
              {editingId === album._id ? (
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-neutral-500">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={editForm.title}
                      onChange={handleEditChange}
                      className="bg-neutral-800 border border-neutral-700 rounded p-2 text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-neutral-500">Director</label>
                    <input
                      type="text"
                      name="director"
                      value={editForm.director}
                      onChange={handleEditChange}
                      className="bg-neutral-800 border border-neutral-700 rounded p-2 text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-neutral-500">Year</label>
                    <input
                      type="number"
                      name="year"
                      value={editForm.year}
                      onChange={handleEditChange}
                      className="bg-neutral-800 border border-neutral-700 rounded p-2 text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-neutral-500">Genre</label>
                    <input
                      type="text"
                      name="genre"
                      value={editForm.genre}
                      onChange={handleEditChange}
                      className="bg-neutral-800 border border-neutral-700 rounded p-2 text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-xs text-neutral-500">Description</label>
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      className="bg-neutral-800 border border-neutral-700 rounded p-2 text-white min-h-[80px]"
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-2 justify-end">
                    <button 
                      type="button" 
                      onClick={() => setEditingId(null)}
                      className="px-4 py-1 bg-neutral-700 rounded text-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      onClick={() => saveEdit(album._id)}
                      className="px-4 py-1 bg-fuchsia-700 rounded text-sm"
                    >
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex gap-4">
                  {album.coverImage && (
                    <img 
                      src={album.coverImage} 
                      alt={album.title}
                      className="w-20 h-20 object-cover rounded-md" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-album.png';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{album.title}</h3>
                    <div className="text-neutral-400">Director: {album.director}</div>
                    <div className="text-neutral-400">Year: {album.year}</div>
                    <div className="text-neutral-400">Genre: {album.genre}</div>
                    <div className="text-neutral-500 mt-2 text-sm">{album.description}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(album)}
                      className="h-8 w-8 rounded-full flex items-center justify-center bg-neutral-800 hover:bg-fuchsia-900 transition"
                    >
                      <MdEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(album._id)}
                      className="h-8 w-8 rounded-full flex items-center justify-center bg-neutral-800 hover:bg-red-900 transition"
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListMovieAlbum; 