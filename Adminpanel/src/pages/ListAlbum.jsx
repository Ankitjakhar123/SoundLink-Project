import React, { useEffect, useState } from "react";
import axios from "axios";
import { url } from "../App";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ListAlbum = () => {
  const [data, setData] = useState([]);

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

  useEffect(() => {
    fetchAlbums();
  }, []);

  return (
    <div className="p-5">
      <p className="text-xl font-semibold mb-4">All Albums List</p>

      {/* Table header */}
      <div className="sm:grid hidden grid-cols-[0.3fr_0.7fr_1fr_2fr_1fr_0.7fr] items-center gap-2.5 p-3 border border-gray-300 text-sm bg-gray-100 font-medium">
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
            className="sm:grid hidden grid-cols-[0.3fr_0.7fr_1fr_2fr_1fr_0.7fr] items-center gap-2.5 p-3 border-b border-gray-200 text-sm"
          >
            <p>{index + 1}</p>
            <img
              src={item.image}
              alt={item.name}
              className="w-12 h-12 object-cover rounded"
            />
            <p>{item.name}</p>
            <p>{item.desc}</p>
            <p>{item.bgColour}</p> {/* Assuming the field for background color is 'bgColour' */}
            <button
              className="text-red-500 hover:underline"
              onClick={() => removeAlbum(item._id)} // Use removeAlbum instead of deleteAlbum
            >
              Delete
            </button>
          </div>
        ))
      ) : (
        <p className="mt-4 text-gray-500">No albums found.</p>
      )}
    </div>
  );
};

export default ListAlbum;
