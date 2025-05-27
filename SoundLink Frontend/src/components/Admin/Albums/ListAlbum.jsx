import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const url = import.meta.env.VITE_BACKEND_URL;

const ListAlbum = () => {
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: '', desc: '', bgColour: '', image: null });
  const [editImagePreview, setEditImagePreview] = useState(null);

  // Fetch all albums
  const fetchAlbums = async () => {
    try {
      const response = await axios.get(`${url}/api/album/list`);
      if (response.data.success) {
        setData(response.data.albums);
      } else {
        toast.error("Failed to load albums.");
      }
    } catch (error) {
      toast.error("Error fetching albums.");
      console.error("Failed to fetch albums:", error);
    }
  };

  // Remove an album from the database and state
  const removeAlbum = async (id) => {
    try {
      const response = await axios.post(`${url}/api/album/remove`, { id });
      if (response.data.success) {
        // Remove the deleted album from the local state
        setData((prevData) => prevData.filter((album) => album._id !== id));
        toast.success("Album deleted successfully!");
      } else {
        toast.error("Failed to delete album.");
      }
    } catch (error) {
      toast.error("Error deleting album.");
      console.error("Error deleting album:", error);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditId(null);
    setEditData({ name: '', desc: '', bgColour: '', image: null });
    setEditImagePreview(null);
  };

  // Save edited album
  const saveEdit = async (id) => {
    try {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('name', editData.name);
      formData.append('desc', editData.desc);
      formData.append('bgColour', editData.bgColour);
      if (editData.image) {
        formData.append('image', editData.image);
      }
      const response = await axios.post(`${url}/api/album/edit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        toast.success('Album updated successfully!');
        fetchAlbums();
        cancelEdit();
      } else {
        toast.error(response.data.message || 'Failed to update album.');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error updating album.');
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto rounded-3xl p-8 flex flex-col gap-6 bg-black/90 shadow-2xl">
      <p className="text-xl font-semibold mb-4">All Albums List</p>

      {/* Table header */}
      <div className="sm:grid hidden grid-cols-[0.3fr_0.7fr_1fr_2fr_1fr_2fr] items-center gap-2.5 p-3 border border-gray-800 text-sm bg-black text-white font-medium rounded-t-lg">
        <span>#</span>
        <span>Image</span>
        <span>Name</span>
        <span>Description</span>
        <span>Background Color</span>
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
            {editId === item._id ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    setEditData({ ...editData, image: e.target.files[0] });
                    setEditImagePreview(URL.createObjectURL(e.target.files[0]));
                  }}
                />
                {editImagePreview && (
                  <img src={editImagePreview} alt="preview" className="w-12 h-12 object-cover rounded" />
                )}
              </>
            ) : (
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 object-cover rounded"
              />
            )}
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
                value={editData.desc}
                onChange={e => setEditData({ ...editData, desc: e.target.value })}
                className="bg-black text-white outline-green-600 border-2 border-gray-600 p-1 w-full rounded"
              />
            ) : (
              <p>{item.desc}</p>
            )}
            {editId === item._id ? (
              <input
                type="color"
                value={editData.bgColour}
                onChange={e => setEditData({ ...editData, bgColour: e.target.value })}
                className="w-12 h-8 cursor-pointer bg-black border border-gray-600"
              />
            ) : (
              <p>{item.bgColour}</p>
            )}
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
                  onClick={() => { setEditId(item._id); setEditData({ name: item.name, desc: item.desc, bgColour: item.bgColour, image: null }); setEditImagePreview(item.image); }}
                >
                  Edit
                </button>
                <button
                  className="text-red-500 bg-red-100 hover:bg-red-200 px-4 py-2 rounded font-semibold transition"
                  onClick={() => removeAlbum(item._id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="mt-4 text-gray-500">No albums found.</p>
      )}
    </div>
  );
};

export default ListAlbum; 