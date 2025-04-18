import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { url } from "../App";

const AddSong = () => {
  const [image, setImage] = useState(null);
  const [song, setSong] = useState(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [album, setAlbum] = useState("none");
  const [loading, setLoading] = useState(false);
  const [albumData, setAlbumData] = useState([]);

  // Fetch album list from backend
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const res = await axios.get(`${url}/api/album/list`);
        if (res.data.success && res.data.albums) {
          setAlbumData(res.data.albums);
        } else {
          toast.error("Failed to load albums");
        }
      } catch ( error ) {
        toast.error("Error fetching albums");
      }
    };

    fetchAlbums();
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!song || !image) {
      toast.warning("Please upload both an image and a song file.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("desc", desc);
      formData.append("image", image);
      formData.append("audio", song);
      formData.append("album", album);

      const res = await axios.post(`${url}/api/song/add`, formData);

      if (res.data.success) {
        toast.success("Song added successfully!");

        // Reset form
        setName("");
        setDesc("");
        setAlbum("none");
        setImage(null);
        setSong(null);
      } else {
        toast.error(res.data.message || "Something went wrong.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const loadAlbumData = async () => {
    try {
      const response = await axios.get(`${url}/api/album/list`);

      if(response.data.success) {
        setAlbumData(response.data.albums);
      }

      else{
        toast.error("Unable to load albums data")
      }

    } catch (error) {
      toast.error("Error occur")
      
    }
  }

  useEffect(()=>{
  loadAlbumData();
},[])

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
            onChange={(e) => setSong(e.target.files[0])}
          />
          <label htmlFor="song">
            <img
              src={song ? assets.upload_added : assets.upload_song}
              className="w-24 cursor-pointer"
              alt="Upload Song"
            />
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
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_area}
              className="w-24 h-24 object-cover rounded cursor-pointer"
              alt="Upload Artwork"
            />
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
          className="bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[150px]"
        >
          <option value="none">None</option>
          {albumData.map((item,index) => (
            <option key={index} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
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
