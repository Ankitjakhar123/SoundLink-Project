import React, { useState, useEffect, useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import { FaMusic, FaPlus, FaTimes } from 'react-icons/fa';

const AddToPlaylistModal = ({ songId, onClose }) => {
  const { playlists, getUserPlaylists, createPlaylist, addToPlaylist } = useContext(PlayerContext);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUserPlaylists();
  }, [getUserPlaylists]);

  const handleSubmit = async () => {
    if (!selectedPlaylist) return;
    
    setLoading(true);
    const success = await addToPlaylist(songId, selectedPlaylist);
    setLoading(false);
    
    if (success) {
      onClose();
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    
    setLoading(true);
    const playlist = await createPlaylist(newPlaylistName);
    setLoading(false);
    
    if (playlist) {
      setSelectedPlaylist(playlist._id);
      setShowCreateForm(false);
      setNewPlaylistName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Add to Playlist</h2>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {!showCreateForm ? (
          <>
            <div className="mb-4">
              <label className="block text-neutral-300 mb-2">Select a playlist:</label>
              <select 
                value={selectedPlaylist} 
                onChange={(e) => setSelectedPlaylist(e.target.value)}
                className="w-full bg-neutral-800 text-white border border-neutral-700 rounded px-3 py-2"
              >
                <option value="">-- Select playlist --</option>
                {playlists.map(playlist => (
                  <option key={playlist._id} value={playlist._id}>
                    {playlist.name} ({playlist.songs.length} songs)
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-1 text-fuchsia-400 hover:text-fuchsia-300"
              >
                <FaPlus size={12} /> New Playlist
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-neutral-800 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedPlaylist || loading}
                  className={`px-4 py-2 rounded text-white font-medium ${
                    !selectedPlaylist || loading
                      ? 'bg-neutral-700 cursor-not-allowed'
                      : 'bg-fuchsia-600 hover:bg-fuchsia-700'
                  }`}
                >
                  {loading ? 'Adding...' : 'Add to Playlist'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={handleCreatePlaylist} className="mt-2">
            <div className="mb-4">
              <label className="block text-neutral-300 mb-2">Create new playlist:</label>
              <div className="flex gap-2 items-center">
                <FaMusic className="text-fuchsia-400" />
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Playlist name"
                  className="flex-1 bg-neutral-800 text-white border border-neutral-700 rounded px-3 py-2"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-neutral-800 text-white rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newPlaylistName.trim() || loading}
                className={`px-4 py-2 rounded text-white font-medium ${
                  !newPlaylistName.trim() || loading
                    ? 'bg-neutral-700 cursor-not-allowed'
                    : 'bg-fuchsia-600 hover:bg-fuchsia-700'
                }`}
              >
                {loading ? 'Creating...' : 'Create & Select'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddToPlaylistModal; 