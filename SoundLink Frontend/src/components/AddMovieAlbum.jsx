import React, { useState } from "react";
import { MdLocalMovies, MdFileUpload } from 'react-icons/md';
import axios from "axios";
import { toast } from "react-toastify";
const url = import.meta.env.VITE_BACKEND_URL;

const AddMovieAlbum = () => {
  // State variables
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

      const token = localStorage.getItem('token');
      const res = await axios.post(`${url}/api/moviealbum/add`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.data.success) {
        toast.success("Movie album added successfully!");

        // Reset form
        setTitle("");
        setDirector("");
        setYear("");
        setDescription("");
        setGenre("");
        setCoverImage(null);
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

  return loading ? (
    <div className="grid place-items-center min-h-[80vh]">
      <div className="w-16 h-16 border-4 border-gray-400 border-t-green-800 rounded-full animate-spin"></div>
    </div>
  ) : (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Movie Album</h2>
      
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col items-start gap-6 text-gray-600"
      >
        {/* Cover Image Upload */}
        <div className="flex flex-col gap-3 w-full">
          <p className="font-medium">Upload Cover Image</p>
          <input
            type="file"
            id="coverImage"
            accept="image/*"
            hidden
            onChange={(e) => setCoverImage(e.target.files[0])}
          />
          <label htmlFor="coverImage" className="cursor-pointer">
            {coverImage ? (
              <div className="relative">
                <img
                  src={URL.createObjectURL(coverImage)}
                  className="w-48 h-64 object-cover rounded shadow-md"
                  alt="Movie Cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm">Change image</span>
                </div>
              </div>
            ) : (
              <div className="w-48 h-64 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center">
                <MdLocalMovies className="w-12 h-12 text-gray-400" />
                <MdFileUpload className="w-10 h-10 text-gray-400 mt-2" />
                <p className="text-gray-500 mt-2 text-sm text-center">Click to upload movie poster</p>
              </div>
            )}
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="font-medium">Movie Title</label>
            <input
              type="text"
              id="title"
              required
              placeholder="Enter movie title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent outline-green-600 border-2 border-gray-300 p-2.5 rounded"
            />
          </div>

          {/* Director */}
          <div className="flex flex-col gap-2">
            <label htmlFor="director" className="font-medium">Director</label>
            <input
              type="text"
              id="director"
              required
              placeholder="Enter director name"
              value={director}
              onChange={(e) => setDirector(e.target.value)}
              className="bg-transparent outline-green-600 border-2 border-gray-300 p-2.5 rounded"
            />
          </div>

          {/* Year */}
          <div className="flex flex-col gap-2">
            <label htmlFor="year" className="font-medium">Release Year</label>
            <input
              type="number"
              id="year"
              required
              placeholder="YYYY"
              min="1900"
              max={new Date().getFullYear()}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-transparent outline-green-600 border-2 border-gray-300 p-2.5 rounded"
            />
          </div>

          {/* Genre */}
          <div className="flex flex-col gap-2">
            <label htmlFor="genre" className="font-medium">Genre</label>
            <select
              id="genre"
              required
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="bg-transparent outline-green-600 border-2 border-gray-300 p-2.5 rounded"
            >
              <option value="">Select a genre</option>
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="description" className="font-medium">Description</label>
          <textarea
            id="description"
            required
            placeholder="Enter movie description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="bg-transparent outline-green-600 border-2 border-gray-300 p-2.5 rounded w-full"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-4 text-base bg-black text-white py-3 px-8 rounded hover:bg-gray-800 transition-colors"
        >
          Add Movie Album
        </button>
      </form>
    </div>
  );
};

export default AddMovieAlbum; 