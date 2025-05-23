import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdMusicNote, MdFileUpload, MdOutlineLyrics, MdDownload } from 'react-icons/md';
import axios from "axios";
import { toast } from "react-toastify";
import { PlayerContext } from "../context/PlayerContext";
import Skeleton from './Skeleton';
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

const EditSong = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatLyricsWithTimestamps } = useContext(PlayerContext);
  const [image, setImage] = useState(null);
  const [song, setSong] = useState(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [album, setAlbum] = useState("none");
  const [lyrics, setLyrics] = useState("");
  const [albumData, setAlbumData] = useState([]);
  const [movieAlbumData, setMovieAlbumData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState("");
  const [currentAudio, setCurrentAudio] = useState("");
  const [syncingLyrics, setSyncingLyrics] = useState(false);

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
            setLyrics(found.lyrics || "");
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
      formData.append("lyrics", lyrics);
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
    );
  }

  return (
    <form
      className="mx-auto max-w-4xl p-8 bg-gray-100/5 rounded-3xl backdrop-blur-sm shadow-2xl flex flex-col gap-10 items-start"
      onSubmit={onSubmitHandler}
    >
      <div className="text-2xl font-bold">Edit Song</div>
      <div className="flex gap-8">
        {/* Song Upload */}
        <div className="flex flex-col gap-2">
          <p>Change Audio</p>
          <input
            type="file"
            accept="audio/*"
            id="audioFile"
            hidden
            onChange={(e) => setSong(e.target.files[0])}
          />
          <label htmlFor="audioFile" className="cursor-pointer">
            {song ? (
              <MdFileUpload className="w-24 h-24 text-fuchsia-500 mx-auto" />
            ) : currentAudio ? (
              <div className="w-24 h-24 grid place-items-center text-fuchsia-500 bg-fuchsia-100 rounded">
                <MdMusicNote className="w-12 h-12 text-fuchsia-500" />
              </div>
            ) : (
              <MdFileUpload className="w-24 h-24 text-gray-300 mx-auto" />
            )}
          </label>
        </div>

        {/* Image Upload */}
        <div className="flex flex-col gap-2">
          <p>Change Image</p>
          <input
            type="file"
            accept="image/*"
            id="imageFile"
            hidden
            onChange={(e) => setImage(e.target.files[0])}
          />
          <label htmlFor="imageFile" className="cursor-pointer">
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                className="w-24 h-24 object-cover rounded"
                alt="Selected Thumbnail"
              />
            ) : currentImage ? (
              <img
                src={currentImage}
                className="w-24 h-24 object-cover rounded"
                alt="Current Thumbnail"
              />
            ) : (
              <MdMusicNote className="w-24 h-24 text-gray-300 mx-auto" />
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
          <p>Song Lyrics</p>
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
            
            <button
              type="button"
              onClick={() => {
                if (!currentAudio) {
                  toast.error("No audio file available to sync lyrics");
                  return;
                }
                
                setSyncingLyrics(true);
                // Create a temporary audio element to get song duration
                const tempAudio = new Audio(currentAudio);
                
                tempAudio.addEventListener('loadedmetadata', () => {
                  try {
                    const syncedLyrics = formatLyricsWithTimestamps(lyrics, tempAudio);
                    setLyrics(syncedLyrics);
                    toast.success("Lyrics synchronized with estimated timestamps");
                  } catch (error) {
                    toast.error("Failed to sync lyrics");
                    console.error("Lyrics sync error:", error);
                  } finally {
                    setSyncingLyrics(false);
                  }
                });
                
                tempAudio.addEventListener('error', () => {
                  toast.error("Could not load audio to sync lyrics");
                  setSyncingLyrics(false);
                });
                
                // Load audio to trigger metadata loading
                tempAudio.load();
              }}
              disabled={syncingLyrics}
              className="flex items-center gap-1 px-3 py-1 bg-fuchsia-700 text-white rounded-md text-sm hover:bg-fuchsia-800 transition-colors"
            >
              <MdOutlineLyrics />
              {syncingLyrics ? "Syncing..." : "Auto-Sync"}
            </button>
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
        className="px-8 py-2 bg-gradient-to-r from-fuchsia-700 to-pink-700 text-white rounded-lg font-medium shadow-lg hover:from-fuchsia-800 hover:to-pink-800 transition-all"
      >
        Save Changes
      </button>
    </form>
  );
};

export default EditSong; 