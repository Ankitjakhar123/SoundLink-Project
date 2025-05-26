import React, { useState } from "react";
import { MdLocalMovies, MdFileUpload } from 'react-icons/md';
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import Skeleton from '../../Skeleton';
const url = import.meta.env.VITE_BACKEND_URL;

const AddMovieAlbum = ({ token }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [director, setDirector] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Genre options
  const genres = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", 
    "Documentary", "Drama", "Family", "Fantasy", "Horror",
    "Musical", "Mystery", "Romance", "Sci-Fi", "Thriller", 
    "War", "Western"
  ];

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!title || !director || !year || !description || !genre) {
      toast.warning("Please fill all required fields.");
      return;
    }

    if (!coverImage) {
      toast.warning("Please upload a cover image.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("director", director);
      formData.append("year", year);
      formData.append("description", description);
      formData.append("genre", genre);
      formData.append("coverImage", coverImage);

      const res = await axios.post(`${url}/api/moviealbum/add`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data.success) {
        toast.success("Movie album added successfully!");
        navigate('/admin/moviealbums');
      } else {
        toast.error(res.data.message || "Something went wrong.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred.");
      console.error("Error adding movie album:", error);
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
        <h1 className="text-3xl font-bold mb-8">Add New Movie Album</h1>
        <form onSubmit={onSubmitHandler} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows="4"
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Release Year
            </label>
            <input
              type="number"
              name="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Genre
            </label>
            <select
              name="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              required
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a genre</option>
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">
              Director
            </label>
            <input
              type="text"
              name="director"
              value={director}
              onChange={(e) => setDirector(e.target.value)}
              required
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
              onChange={(e) => setCoverImage(e.target.files[0])}
              required
              className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
          >
            Add Movie Album
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMovieAlbum; 