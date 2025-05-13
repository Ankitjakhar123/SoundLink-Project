import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const url = import.meta.env.VITE_BACKEND_URL;

const ListSong = () => {
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', album: '', lyrics: '' });
  const [showLyrics, setShowLyrics] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  // Fetch all songs
  const fetchSongs = async () => {
    try {
      const response = await axios.get(`${url}/api/song/list?all=true`);
      if (response.data.success) {
        setData(response.data.songs);
      } else {
        toast.error("Failed to load songs.");
      }
    } catch (error) {
      toast.error("Error fetching songs.");
      console.error("Failed to fetch songs:", error);
    }
  };

  // Remove a song from the database and state
  const removeSong = async (id) => {
    try {
      const response = await axios.post(`${url}/api/song/remove`, { id });
      if (response.data.success) {
        // Remove the deleted song from the local state
        setData((prevData) => prevData.filter((song) => song._id !== id));
        toast.success("Song deleted successfully!");
      } else {
        toast.error("Failed to delete song.");
      }
    } catch (error) {
      toast.error("Error deleting song.");
      console.error("Error deleting song:", error);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditId(null);
    setEditData({ name: '', album: '', lyrics: '' });
  };

  // Save edited song
  const saveEdit = async (id) => {
    try {
      const payload = {
        id,
        name: editData.name,
        album: editData.album,
        lyrics: editData.lyrics
      };
      
      const response = await axios.post(`${url}/api/song/edit`, payload);
      if (response.data.success) {
        toast.success('Song updated successfully!');
        fetchSongs();
        cancelEdit();
      } else {
        toast.error(response.data.message || 'Failed to update song.');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error updating song.');
    }
  };

  // View lyrics
  const viewLyrics = (song) => {
    setSelectedSong(song);
    setShowLyrics(true);
  };

  // Close lyrics modal
  const closeLyricsModal = () => {
    setShowLyrics(false);
    setSelectedSong(null);
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto rounded-3xl p-8 flex flex-col gap-6 bg-black/90 shadow-2xl">
      <p className="text-xl font-semibold mb-4">All Songs List</p>

      {/* Table header */}
      <div className="sm:grid hidden grid-cols-[0.3fr_0.7fr_1fr_2fr_1fr_2fr] items-center gap-2.5 p-3 border border-gray-800 text-sm bg-black text-white font-medium rounded-t-lg">
        <span>#</span>
        <span>Image</span>
        <span>Name</span>
        <span>Album</span>
        <span>Duration</span>
        <span>Action</span>
      </div>

      {data.length > 0 ? (
        data.map((item, index) => (
          <div
            key={item._id}
            className="grid grid-cols-1 sm:grid-cols-[0.3fr_0.7fr_1fr_2fr_1fr_2fr] items-center gap-2.5 p-3 border border-gray-800 hover:bg-black/40 transition duration-300 rounded-md text-white"
          >
            <span className="hidden sm:block">{index + 1}</span>
            <div className="w-14 h-14 rounded-lg overflow-hidden block">
              <img
                src={item.image}
                className="w-full h-full object-cover"
                alt={item.name}
              />
            </div>
            {editId === item._id ? (
              <input
                className="p-2 bg-gray-900 border border-gray-700 rounded"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
            ) : (
              <div className="font-medium">{item.name}</div>
            )}
            {editId === item._id ? (
              <input
                className="p-2 bg-gray-900 border border-gray-700 rounded"
                value={editData.album}
                onChange={(e) => setEditData({ ...editData, album: e.target.value })}
              />
            ) : (
              <div className="opacity-80">{item.album}</div>
            )}
            <div className="opacity-80">{item.duration}</div>
            
            {editId === item._id ? (
              <div className="flex flex-col gap-4">
                <textarea
                  className="p-2 bg-gray-900 border border-gray-700 rounded h-24"
                  placeholder="Enter song lyrics"
                  value={editData.lyrics}
                  onChange={(e) => setEditData({ ...editData, lyrics: e.target.value })}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    className="text-green-400 bg-black border border-green-400 hover:bg-green-900 px-4 py-2 rounded font-semibold transition"
                    onClick={() => saveEdit(item._id)}
                  >
                    Save
                  </button>
                  <button
                    className="text-gray-300 bg-black border border-gray-600 hover:bg-gray-800 px-4 py-2 rounded font-semibold transition"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 justify-end">
                <button
                  className="text-blue-500 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded font-semibold transition text-sm"
                  onClick={() => { 
                    setEditId(item._id); 
                    setEditData({ 
                      name: item.name, 
                      album: item.album,
                      lyrics: item.lyrics || "" 
                    }); 
                  }}
                >
                  Edit
                </button>
                <button
                  className="text-purple-500 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded font-semibold transition text-sm"
                  onClick={() => viewLyrics(item)}
                >
                  Lyrics
                </button>
                <button
                  className="text-red-500 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded font-semibold transition text-sm"
                  onClick={() => removeSong(item._id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="mt-4 text-gray-500">No songs found.</p>
      )}
      
      {/* Lyrics Modal */}
      {showLyrics && selectedSong && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">{selectedSong.name} - Lyrics</h3>
              <button 
                onClick={closeLyricsModal}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <button
                className="text-blue-400 bg-blue-900/40 hover:bg-blue-800/60 px-4 py-2 rounded font-semibold transition mb-4"
                onClick={() => { 
                  setEditId(selectedSong._id); 
                  setEditData({ 
                    name: selectedSong.name, 
                    album: selectedSong.album,
                    lyrics: selectedSong.lyrics || "" 
                  });
                  closeLyricsModal();
                }}
              >
                Edit Lyrics
              </button>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 whitespace-pre-line text-white">
              {selectedSong.lyrics ? selectedSong.lyrics : "No lyrics available for this song."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListSong; 