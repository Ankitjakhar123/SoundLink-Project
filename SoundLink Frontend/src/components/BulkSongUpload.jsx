import React, { useState, useEffect } from "react";
import { MdMusicNote, MdFileUpload, MdEdit, MdImage } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";
import { parseBlob } from 'music-metadata-browser';
const url = import.meta.env.VITE_BACKEND_URL;

const BulkSongUpload = () => {
  const [albums, setAlbums] = useState([]);
  const [movieAlbums, setMovieAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [songs, setSongs] = useState([]); // [{file, title, artist, album, cover, ...}]
  const [uploadProgress, setUploadProgress] = useState([]); // [{percent, status}]
  const [uploading, setUploading] = useState(false);

  // Fetch albums from backend
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        // Fetch regular albums
        const res = await axios.get(`${url}/api/album/list`);
        if (res.data.success && res.data.albums) {
          setAlbums(res.data.albums);
        } else {
          toast.error("Failed to load albums");
        }
        
        // Fetch movie albums
        const movieRes = await axios.get(`${url}/api/moviealbum/list`);
        if (movieRes.data.success && movieRes.data.movieAlbums) {
          setMovieAlbums(movieRes.data.movieAlbums);
        } else {
          toast.error("Failed to load movie albums");
        }
      } catch {
        toast.error("Error fetching albums");
      }
    };
    fetchAlbums();
  }, []);

  // Handle file selection and extract metadata
  const handleFileChange = async (e) => {
    const filesArr = Array.from(e.target.files);
    const newSongs = await Promise.all(filesArr.map(async (file) => {
      let title = file.name.replace(/\.[^/.]+$/, "");
      let artist = "Unknown Artist";
      let album = selectedAlbum ? getSelectedAlbumName(selectedAlbum) : "";
      let cover = null;
      try {
        const metadata = await parseBlob(file);
        if (metadata.common.title) title = metadata.common.title;
        if (metadata.common.artist) artist = metadata.common.artist;
        if (metadata.common.album) album = metadata.common.album;
        if (metadata.common.picture && metadata.common.picture[0]) {
          const pic = metadata.common.picture[0];
          cover = new Blob([pic.data], { type: pic.format });
        }
      } catch {
        // ignore, fallback to defaults
      }
      return {
        file,
        title,
        artist,
        album,
        cover,
        editable: true,
      };
    }));
    setSongs(newSongs);
    setUploadProgress(newSongs.map(() => ({ percent: 0, status: "pending" })));
  };

  // Helper to get album name based on ID
  const getSelectedAlbumName = (id) => {
    // Check if it's a regular album
    const regularAlbum = albums.find(a => a._id === id);
    if (regularAlbum) return regularAlbum.name;
    
    // Check if it's a movie album
    const movieAlbum = movieAlbums.find(a => a._id === id);
    if (movieAlbum) return `[Movie] ${movieAlbum.title}`;
    
    return "";
  };

  // Handle metadata edit
  const handleSongChange = (idx, field, value) => {
    setSongs((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  // Handle cover change
  const handleCoverChange = (idx, file) => {
    setSongs((prev) => prev.map((s, i) => i === idx ? { ...s, cover: file } : s));
  };

  // Handle upload
  const handleUpload = async () => {
    setUploading(true);
    let newProgress = [...uploadProgress];
    for (let i = 0; i < songs.length; i++) {
      newProgress[i] = { percent: 0, status: "uploading" };
      setUploadProgress([...newProgress]);
      const formData = new FormData();
      formData.append("name", songs[i].title);
      formData.append("desc", songs[i].artist); // You may want to add a separate desc field
      formData.append("album", selectedAlbum ? getSelectedAlbumName(selectedAlbum) : songs[i].album);
      formData.append("audio", songs[i].file);
      if (songs[i].cover) formData.append("image", songs[i].cover);
      try {
        await axios.post(`${url}/api/song/add`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            newProgress[i] = { percent, status: "uploading" };
            setUploadProgress([...newProgress]);
          }
        });
        newProgress[i] = { percent: 100, status: "success" };
        setUploadProgress([...newProgress]);
      } catch {
        newProgress[i] = { percent: 100, status: "error" };
        setUploadProgress([...newProgress]);
        toast.error(`Failed to upload: ${songs[i].title}`);
      }
    }
    setUploading(false);
    toast.success("Bulk upload complete!");
  };

  return (
    <div className="max-w-4xl mx-auto bg-black/90 rounded-2xl shadow-2xl p-8 mt-8 border border-neutral-900">
      <h2 className="text-2xl font-bold text-white mb-6">Bulk Upload Songs</h2>
      {/* Album Select */}
      <div className="mb-6">
        <label className="block text-white mb-2">Select Album</label>
        <select
          className="bg-neutral-900 text-white border border-fuchsia-700 rounded px-4 py-2 w-full"
          value={selectedAlbum}
          onChange={e => setSelectedAlbum(e.target.value)}
        >
          <option value="">-- Select Album --</option>
          
          {/* Regular Albums Group */}
          {albums.length > 0 && (
            <optgroup label="Music Albums">
              {albums.map(album => (
                <option key={`album-${album._id}`} value={album._id}>
                  {album.name}
                </option>
              ))}
            </optgroup>
          )}
          
          {/* Movie Albums Group */}
          {movieAlbums.length > 0 && (
            <optgroup label="Movie Albums">
              {movieAlbums.map(album => (
                <option key={`movie-${album._id}`} value={album._id}>
                  {album.title} ({album.director})
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>
      {/* File Input */}
      <div className="mb-8">
        <label className="block text-white mb-2">Select Songs (multiple)</label>
        <input
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          id="bulk-audio-upload"
          onChange={handleFileChange}
        />
        <label htmlFor="bulk-audio-upload" className="flex items-center gap-2 px-6 py-3 bg-fuchsia-700 text-white rounded-lg cursor-pointer hover:bg-fuchsia-800 w-fit">
          <MdFileUpload className="w-6 h-6" />
          Choose Files
        </label>
      </div>
      {/* Song List */}
      {songs.length > 0 && (
        <div className="space-y-6 mb-8">
          {songs.map((song, idx) => (
            <div key={idx} className="flex flex-col md:flex-row items-center gap-6 bg-neutral-900 rounded-xl p-4 border border-fuchsia-900">
              {/* Cover Art */}
              <div className="flex flex-col items-center">
                {song.cover ? (
                  <img src={URL.createObjectURL(song.cover)} alt="cover" className="w-20 h-20 rounded object-cover mb-2" />
                ) : (
                  <MdMusicNote className="w-20 h-20 text-fuchsia-500 mb-2" />
                )}
                <input type="file" accept="image/*" className="hidden" id={`cover-upload-${idx}`} onChange={e => handleCoverChange(idx, e.target.files[0])} />
                <label htmlFor={`cover-upload-${idx}`} className="text-xs text-fuchsia-400 cursor-pointer hover:underline flex items-center gap-1"><MdImage />Change</label>
              </div>
              {/* Editable Fields */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white text-sm mb-1">Title</label>
                  <input type="text" value={song.title} onChange={e => handleSongChange(idx, 'title', e.target.value)} className="bg-neutral-800 text-white border border-fuchsia-700 rounded px-3 py-2 w-full" />
                </div>
                <div>
                  <label className="block text-white text-sm mb-1">Artist</label>
                  <input type="text" value={song.artist} onChange={e => handleSongChange(idx, 'artist', e.target.value)} className="bg-neutral-800 text-white border border-fuchsia-700 rounded px-3 py-2 w-full" />
                </div>
                <div>
                  <label className="block text-white text-sm mb-1">Album</label>
                  <input type="text" value={song.album} onChange={e => handleSongChange(idx, 'album', e.target.value)} className="bg-neutral-800 text-white border border-fuchsia-700 rounded px-3 py-2 w-full" />
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full md:w-32 flex flex-col items-center">
                <div className="w-full bg-neutral-800 rounded-full h-3 mb-1">
                  <div className={`h-3 rounded-full transition-all duration-500 ${uploadProgress[idx]?.status === 'success' ? 'bg-green-500' : uploadProgress[idx]?.status === 'error' ? 'bg-red-500' : 'bg-fuchsia-500'}`} style={{ width: `${uploadProgress[idx]?.percent || 0}%` }}></div>
                </div>
                <span className="text-xs text-white">{uploadProgress[idx]?.percent || 0}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Upload Button */}
      {songs.length > 0 && (
        <button onClick={handleUpload} disabled={uploading} className={`bg-gradient-to-r from-fuchsia-700 to-pink-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg border border-fuchsia-900/40 hover:scale-105 transition-transform ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}>
          {uploading ? 'Uploading...' : 'Upload All'}
        </button>
      )}
    </div>
  );
};

export default BulkSongUpload; 