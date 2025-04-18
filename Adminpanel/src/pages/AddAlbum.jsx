import React, { useState } from "react";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import axios from "axios";
import { url } from "../App";

const AddAlbum = () => {
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

      const response = await axios.post(`${url}/api/album/add`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Album added successfully!");

        // Reset form fields after successful submission
        setName("");
        setDesc("");
        setImage(null); // Reset image
        setColour("#121212"); // Reset background color to default
      } else {
        toast.error(response.data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error adding album:", error); // Log the actual error for debugging
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
        {/* Image Upload */}
        <div className="flex flex-col gap-4">
          <p>Upload Image</p>
          <input
            type="file"
            id="image"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setImage(file); // Set selected file
              }
            }}
          />
          <label htmlFor="image">
            <img
              src={image ? URL.createObjectURL(image) : assets.upload_area}
              className="w-24 h-24 object-cover rounded cursor-pointer"
              alt="Upload Album Artwork"
            />
          </label>
        </div>
      </div>

      {/* Album Name */}
      <div className="flex flex-col gap-2.5">
        <p>Album Name</p>
        <input
          type="text"
          required
          placeholder="Type here"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[max(40vw,250px)]"
        />
      </div>

      {/* Album Description */}
      <div className="flex flex-col gap-2.5">
        <p>Album Description</p>
        <input
          type="text"
          required
          placeholder="Type here"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[max(40vw,250px)]"
        />
      </div>

      {/* Background Color Selection */}
      <div className="flex flex-col gap-2.5">
        <p>Select Background Colour</p>
        <input
          type="colour"
          value={colour} // Use the correct state variable
          onChange={(e) => setColour(e.target.value)}
          className="w-24 h-12 cursor-pointer"
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

export default AddAlbum;
