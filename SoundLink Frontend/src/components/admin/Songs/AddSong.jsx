import React, { useEffect, useState, useContext } from "react";
import { MdMusicNote, MdFileUpload, MdOutlineLyrics, MdDownload } from 'react-icons/md';
import axios from "axios";
import { toast } from "react-toastify";
import { parseBlob } from 'music-metadata-browser';
import { PlayerContext } from "../../../context/PlayerContext";
import Skeleton from "../../Skeleton";
const url = import.meta.env.VITE_BACKEND_URL;

// Add export functionality
const ExportLrcFile = ({ lyrics, songName }) => {
  const handleExport = () => {
    if (!lyrics) {
      toast.warning("No lyrics to export");
      return;
    }
    
    // Create file content
    const content = lyrics;
    
    // Create a blob from the content
    const blob = new Blob([content], { type: 'text/plain' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create an anchor element for downloading
    const a = document.createElement('a');
    a.href = url;
    a.download = `${songName || 'lyrics'}.lrc`;
    
    // Trigger a click on the anchor element
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    toast.success("Lyrics exported");
  };
  
  return (
    <button
      type="button"
      onClick={handleExport}
      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
    >
      <MdDownload />
      Export .lrc
    </button>
  );
};

const AddSong = () => {
  const { formatLyricsWithTimestamps } = useContext(PlayerContext);
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
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-8">
          <Skeleton type="title" className="w-48 mb-8" />
          <div className="flex gap-8">
            <div className="flex flex-col gap-4">
              <Skeleton type="text" className="w-24" />
              <Skeleton type="image" className="w-24 h-24" />
            </div>
            <div className="flex flex-col gap-4">
              <Skeleton type="text" className="w-24" />
              <Skeleton type="image" className="w-24 h-24" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton type="text" className="w-full h-12" />
            <Skeleton type="text" className="w-full h-12" />
            <Skeleton type="text" className="w-full h-12" />
          </div>
        </div>
      </div>
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
        <div className="flex justify-between items-center">
          <p>Song Lyrics (Optional)</p>
          <div className="flex gap-2">
            <input
              type="file"
              id="lrcFile"
              accept=".lrc"
              hidden
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    if (event.target && event.target.result) {
                      setLyrics(event.target.result.toString());
                      toast.success(`Imported lyrics from ${file.name}`);
                    }
                  };
                  reader.onerror = () => {
                    toast.error("Failed to read LRC file");
                  };
                  reader.readAsText(file);
                }
              }}
            />
            <label 
              htmlFor="lrcFile"
              className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <MdFileUpload />
              Import .lrc
            </label>
            
            {lyrics && <ExportLrcFile lyrics={lyrics} songName={name} />}
            
            {song && (
              <button
                type="button"
                onClick={() => {
                  if (!song) {
                    toast.error("Please upload an audio file first");
                    return;
                  }
                  
                  // Create object URL for the file
                  const audioUrl = URL.createObjectURL(song);
                  const tempAudio = new Audio(audioUrl);
                  
                  // Show loading state
                  toast.info("Syncing lyrics with audio timing...");
                  
                  tempAudio.addEventListener('loadedmetadata', () => {
                    try {
                      const syncedLyrics = formatLyricsWithTimestamps(lyrics, tempAudio);
                      setLyrics(syncedLyrics);
                      toast.success("Lyrics synchronized with estimated timestamps");
                    } catch (error) {
                      toast.error("Failed to sync lyrics");
                      console.error("Lyrics sync error:", error);
                    }
                    // Clean up object URL
                    URL.revokeObjectURL(audioUrl);
                  });
                  
                  tempAudio.addEventListener('error', () => {
                    toast.error("Could not load audio to sync lyrics");
                    URL.revokeObjectURL(audioUrl);
                  });
                  
                  // Load audio to trigger metadata loading
                  tempAudio.load();
                }}
                className="flex items-center gap-1 px-3 py-1 bg-fuchsia-700 text-white rounded-md text-sm hover:bg-fuchsia-800 transition-colors"
              >
                <MdOutlineLyrics />
                Auto-Sync
              </button>
            )}
          </div>
        </div>
        <textarea
          placeholder="Enter song lyrics here..."
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          className="bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[max(40vw,250px)] h-[200px]"
        />
        <p className="mt-1 text-xs text-gray-600">
          For time-synced lyrics that highlight during playback, use format: [mm:ss.xx]Lyrics text<br/>
          Example: [00:05.45]This line will highlight at 5.45 seconds<br/>
          You can also import a .lrc file with timestamps.
        </p>
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