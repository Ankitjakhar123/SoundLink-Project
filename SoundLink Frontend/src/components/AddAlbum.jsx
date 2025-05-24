import React, { useState } from "react";
import { toast } from "react-toastify";
import { MdAlbum } from 'react-icons/md';
import axios from "axios";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import Skeleton from './Skeleton';
const url = import.meta.env.VITE_BACKEND_URL;

const AddAlbum = ({ token }) => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null); // Image file state
  const [colour, setColour] = useState("#121212"); // Background color state
  const [name, setName] = useState(""); // Album name state
  const [desc, setDesc] = useState(""); // Album description state
  const [loading, setLoading] = useState(false); // Loading state

  // Handle form submission
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Validate that both album name and image are provided
    if (!image) {
      toast.warning("Please upload an album image.");
      return;
    }
    if (!name || !desc) {
      toast.warning("Please fill in all the fields.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("desc", desc);
      formData.append("image", image);
      formData.append("bgColour", colour); // Add selected background color to the form data

      const res = await axios.post(`${url}/api/album/add`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
      });

      if (res.data.success) {
        toast.success("Album added successfully!");
        navigate('/admin/albums');
      } else {
        toast.error(res.data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error adding album:", error); // Log the actual error for debugging
      toast.error(error?.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Skeleton type="title" className="w-48 mb-8" />
          <div className="space-y-6">
            <div>
              <Skeleton type="text" className="w-24 mb-2" />
              <Skeleton type="text" className="w-full h-10" />
            </div>
            <div>
              <Skeleton type="text" className="w-24 mb-2" />
              <Skeleton type="text" className="w-full h-32" />
            </div>
            <div>
              <Skeleton type="text" className="w-24 mb-2" />
              <Skeleton type="text" className="w-full h-10" />
            </div>
            <div>
              <Skeleton type="text" className="w-24 mb-2" />
              <Skeleton type="text" className="w-full h-10" />
            </div>
            <div>
              <Skeleton type="text" className="w-24 mb-2" />
              <Skeleton type="text" className="w-full h-10" />
            </div>
            <div>
              <Skeleton type="text" className="w-24 mb-2" />
              <Skeleton type="image" className="w-full h-48" />
            </div>
            <Skeleton type="text" className="w-32 h-10" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Add New Album</h1>
        <form onSubmit={onSubmitHandler} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
              rows="4"
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Cover Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setImage(file);
                }
              }}
              required
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Background Colour
            </label>
            <input
              type="color"
              value={colour}
              onChange={(e) => setColour(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
          >
            Add Album
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAlbum; 