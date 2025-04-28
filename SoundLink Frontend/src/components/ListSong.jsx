import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const url = import.meta.env.VITE_BACKEND_URL;

const ListSong = () => {
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', album: '' });

  // Fetch all songs
  const fetchSongs = async () => {
    try {
      const response = await axios.get(`${url}/api/song/list`);
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
    setEditData({ name: '', album: '' });
  };

  // Save edited song
  const saveEdit = async (id) => {
    try {
      const payload = {
        id,
        name: editData.name,
        album: editData.album,
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

      {/* Table rows */}
      {data && data.length > 0 ? (
        data.map((item, index) => (
          <div
            key={item._id}
            className={`sm:grid hidden grid-cols-[0.3fr_0.7fr_1fr_2fr_1fr_2fr] items-center gap-2.5 p-3 border-b border-gray-200 text-sm ${editId === item._id ? 'bg-black text-white rounded-lg shadow-inner' : ''}`}
          >
            <p>{index + 1}</p>
            <img
              src={item.image}
              alt={item.name}
              className="w-12 h-12 object-cover rounded"
            />
            {editId === item._id ? (
              <input
                type="text"
                value={editData.name}
                onChange={e => setEditData({ ...editData, name: e.target.value })}
                className="bg-black text-white outline-green-600 border-2 border-gray-600 p-1 w-full rounded"
              />
            ) : (
              <p>{item.name}</p>
            )}
            {editId === item._id ? (
              <input
                type="text"
                value={editData.album}
                onChange={e => setEditData({ ...editData, album: e.target.value })}
                className="bg-black text-white outline-green-600 border-2 border-gray-600 p-1 w-full rounded"
              />
            ) : (
              <p>{item.album}</p>
            )}
            <p>{item.duration}</p>
            {editId === item._id ? (
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
            ) : (
              <div className="flex gap-2 justify-end">
                <button
                  className="text-blue-500 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded font-semibold transition"
                  onClick={() => { setEditId(item._id); setEditData({ name: item.name, album: item.album }); }}
                >
                  Edit
                </button>
                <button
                  className="text-red-500 bg-red-100 hover:bg-red-200 px-4 py-2 rounded font-semibold transition"
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
    </div>
  );
};

export default ListSong; 