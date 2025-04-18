import React, { useEffect, useState } from "react";
import axios from "axios";
import { url } from "../App";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ListSong = () => {
  const [data, setData] = useState([]);

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

  useEffect(() => {
    fetchSongs();
  }, []);

  return (
    <div className="p-5">
      <p className="text-xl font-semibold mb-4">All Songs List</p>

      {/* Table header */}
      <div className="sm:grid hidden grid-cols-[0.3fr_0.7fr_1fr_2fr_1fr_0.7fr] items-center gap-2.5 p-3 border border-gray-300 text-sm bg-gray-100 font-medium">
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
            className="sm:grid hidden grid-cols-[0.3fr_0.7fr_1fr_2fr_1fr_0.7fr] items-center gap-2.5 p-3 border-b border-gray-200 text-sm"
          >
            <p>{index + 1}</p>
            <img
              src={item.image}
              alt={item.name}
              className="w-12 h-12 object-cover rounded"
            />
            <p>{item.name}</p>
            <p>{item.album}</p>
            <p>{item.duration}</p>
            <button
              className="text-red-500 hover:underline"
              onClick={() => removeSong(item._id)} // Use removeSong instead of deleteSong
            >
              Delete
            </button>
          </div>
        ))
      ) : (
        <p className="mt-4 text-gray-500">No songs found.</p>
      )}
    </div>
  );
};

export default ListSong;
