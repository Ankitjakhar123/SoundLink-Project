import React, { useEffect, useState } from "react";
import { MdMusicNote, MdFileUpload } from 'react-icons/md';
import axios from "axios";
import { toast } from "react-toastify";
import { parseBlob } from 'music-metadata-browser';
const url = import.meta.env.VITE_BACKEND_URL;

const AddSong = () => {
  const [image, setImage] = useState(null);
  const [song, setSong] = useState(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [album, setAlbum] = useState("none");
  const [lyrics, setLyrics] = useState("");
  const [loading, setLoading] = useState(false);
  const [albumData, setAlbumData] = useState([]);
  const [movieAlbumData, setMovieAlbumData] = useState([]);
  const [extractedImage, setExtractedImage] = useState(null);

  // Fetch album list from backend
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        // Fetch regular albums
        const res = await axios.get(`${url}/api/album/list`);
        if (res.data.success && res.data.albums) {
          setAlbumData(res.data.albums);
        } else {
          toast.error("Failed to load albums");
        }

        // Fetch movie albums
        const movieRes = await axios.get(`${url}/api/moviealbum/list`);
        if (movieRes.data.success && movieRes.data.movieAlbums) {
          setMovieAlbumData(movieRes.data.movieAlbums);
        } else {
          toast.error("Failed to load movie albums");
        }
      } catch {
        toast.error("Error fetching albums");
      }
    };

    fetchAlbums();
  }, []);

  // Extract image from audio file
  const handleSongChange = async (file) => {
    setSong(file);
    setExtractedImage(null);
    if (file) {
      try {
        const metadata = await parseBlob(file);
        if (metadata.common.picture && metadata.common.picture[0]) {
          const pic = metadata.common.picture[0];
          const blob = new Blob([pic.data], { type: pic.format });
          setExtractedImage(blob);
        }
      } catch {
        // ignore extraction errors
      }
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!song) {
      toast.warning("Please upload a song file.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("desc", desc);
      // Use user-selected image, else extracted image, else skip
      if (image) {
        formData.append("image", image);
      } else if (extractedImage) {
        formData.append("image", new File([extractedImage], 'cover.jpg', { type: extractedImage.type }));
      }
      formData.append("audio", song);
      formData.append("album", album);
      
      // Add lyrics to form data if provided
      if (lyrics.trim()) {
        formData.append("lyrics", lyrics);
      }

      const res = await axios.post(`${url}/api/song/add`, formData);

      if (res.data.success) {
        toast.success("Song added successfully!");

        // Reset form
        setName("");
        setDesc("");
        setAlbum("none");
        setLyrics("");
        setImage(null);
        setSong(null);
        setExtractedImage(null);
      } else {
        toast.error(res.data.message || "Something went wrong.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <div className="grid place-items-center min-h-[80vh]">
      <div className="w-16 h-16 border-4 border-gray-400 border-t-green-800 rounded-full animate-spin"></div>
    </div>
  ) : (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-start gap-8 text-gray-600"
    >
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
            onChange={(e) => handleSongChange(e.target.files[0])}
          />
          <label htmlFor="song">
            {song ? (
              <MdFileUpload className="w-24 h-24 text-fuchsia-500 mx-auto" />
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
            ) : extractedImage ? (
              <img
                src={URL.createObjectURL(extractedImage)}
                className="w-24 h-24 object-cover rounded cursor-pointer"
                alt="Extracted Artwork"
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

      {/* Song Lyrics */}
      <div className="flex flex-col gap-2.5">
        <p>Song Lyrics (Optional)</p>
        <textarea
          placeholder="Enter song lyrics here..."
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          className="bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[max(40vw,250px)] h-[200px]"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="text-base bg-black text-white py-2.5 px-14 cursor-pointer"
      >
        ADD
      </button>
    </form>
  );
};

export default AddSong; 