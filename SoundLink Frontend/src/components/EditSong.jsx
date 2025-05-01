import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdMusicNote, MdFileUpload } from 'react-icons/md';
import axios from "axios";
import { toast } from "react-toastify";
const url = import.meta.env.VITE_BACKEND_URL;

const EditSong = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [song, setSong] = useState(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [album, setAlbum] = useState("none");
  const [albumData, setAlbumData] = useState([]);
  const [movieAlbumData, setMovieAlbumData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState("");
  const [currentAudio, setCurrentAudio] = useState("");

  // Fetch song data and album list
  useEffect(() => {
    const fetchSong = async () => {
      try {
        const res = await axios.get(`${url}/api/song/list?all=true`);
        if (res.data.success && res.data.songs) {
          const found = res.data.songs.find(s => s._id === id);
          if (found) {
            setName(found.name);
            setDesc(found.desc);
            setAlbum(found.album);
            setCurrentImage(found.image);
            setCurrentAudio(found.file);
          } else {
            toast.error("Song not found");
            navigate("/admin/songs");
          }
        }
      } catch {
        toast.error("Error fetching song");
        navigate("/admin/songs");
      } finally {
        setLoading(false);
      }
    };
    const fetchAlbums = async () => {
      try {
        // Fetch regular albums
        const res = await axios.get(`${url}/api/album/list`);
        if (res.data.success && res.data.albums) {
          setAlbumData(res.data.albums);
        }

        // Fetch movie albums
        const movieRes = await axios.get(`${url}/api/moviealbum/list`);
        if (movieRes.data.success && movieRes.data.movieAlbums) {
          setMovieAlbumData(movieRes.data.movieAlbums);
        }
      } catch {
        toast.error("Error fetching albums");
      }
    };
    fetchSong();
    fetchAlbums();
  }, [id, navigate]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("name", name);
      formData.append("desc", desc);
      formData.append("album", album);
      if (image) formData.append("image", image);
      if (song) formData.append("audio", song);
      const res = await axios.post(`${url}/api/song/edit`, formData);
      if (res.data.success) {
        toast.success("Song updated successfully!");
        navigate("/admin/songs");
      } else {
        toast.error(res.data.message || "Failed to update song.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center min-h-[80vh]">
        <div className="w-16 h-16 border-4 border-gray-400 border-t-green-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-start gap-8 text-gray-600 w-full max-w-2xl mx-auto bg-black/90 rounded-3xl p-8 mt-10 shadow-2xl"
    >
      <h2 className="text-2xl font-bold mb-6 text-white">Edit Song</h2>
      {/* Upload Section */}
      <div className="flex gap-8">
        {/* Song Upload */}
        <div className="flex flex-col gap-4">
          <p>Upload Song</p>
          <input
            type="file"
            id="song"
            accept="audio/*"
            hidden
            onChange={(e) => setSong(e.target.files[0])}
          />
          <label htmlFor="song">
            {song ? (
              <MdFileUpload className="w-24 h-24 text-fuchsia-500 mx-auto" />
            ) : currentAudio ? (
              <audio controls src={currentAudio} className="w-24 h-24 mx-auto" />
            ) : (
              <MdFileUpload className="w-24 h-24 text-gray-400 mx-auto" />
            )}
          </label>
        </div>
        {/* Image Upload */}
        <div className="flex flex-col gap-4">
          <p>Upload Image</p>
          <input
            type="file"
            id="image"
            accept="image/*"
            hidden
            onChange={(e) => setImage(e.target.files[0])}
          />
          <label htmlFor="image">
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                className="w-24 h-24 object-cover rounded cursor-pointer"
                alt="Upload Artwork"
              />
            ) : currentImage ? (
              <img
                src={currentImage}
                className="w-24 h-24 object-cover rounded cursor-pointer"
                alt="Current Artwork"
              />
            ) : (
              <MdMusicNote className="w-24 h-24 text-gray-400 mx-auto" />
            )}
          </label>
        </div>
      </div>
      {/* Song Name */}
      <div className="flex flex-col gap-2.5">
        <p>Song Name</p>
        <input
          type="text"
          required
          placeholder="Type here"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[max(40vw,250px)]"
        />
      </div>
      {/* Song Description */}
      <div className="flex flex-col gap-2.5">
        <p>Song Description</p>
        <input
          type="text"
          required
          placeholder="Type here"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[max(40vw,250px)]"
        />
      </div>
      {/* Album Select */}
      <div className="flex flex-col gap-2.5">
        <p>Select Album</p>
        <select
          value={album}
          onChange={(e) => setAlbum(e.target.value)}
          className="bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[max(40vw,250px)]"
        >
          <option value="none">None</option>
          
          {/* Regular Albums Group */}
          {albumData.length > 0 && (
            <optgroup label="Music Albums">
              {albumData.map((item) => (
                <option key={`album-${item._id}`} value={item.name}>
                  {item.name}
                </option>
              ))}
            </optgroup>
          )}
          
          {/* Movie Albums Group */}
          {movieAlbumData.length > 0 && (
            <optgroup label="Movie Albums">
              {movieAlbumData.map((item) => (
                <option key={`movie-${item._id}`} value={`[Movie] ${item.title}`}>
                  {item.title} ({item.director})
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>
      {/* Submit Button */}
      <button
        type="submit"
        className="text-base bg-fuchsia-700 hover:bg-fuchsia-800 text-white py-2.5 px-14 rounded-lg font-bold shadow-lg mt-4"
      >
        Save Changes
      </button>
      <button
        type="button"
        className="text-base bg-gray-700 hover:bg-gray-800 text-white py-2.5 px-8 rounded-lg font-bold shadow-lg mt-2"
        onClick={() => navigate('/admin/songs')}
      >
        Cancel
      </button>
    </form>
  );
};

export default EditSong; 