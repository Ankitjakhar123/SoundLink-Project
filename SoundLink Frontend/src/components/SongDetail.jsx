import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayerContext } from '../context/PlayerContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { FaArrowLeft, FaPlay, FaHeart, FaRegHeart, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';

const SongDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const { playSong, isFavorite, toggleFavorite, addToPlaylist } = useContext(PlayerContext);
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const fetchSongData = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
        const response = await axios.get(`${backendUrl}/api/song/${id}`);
        if (response.data.success) {
          setSong(response.data.song);
        } else {
          setError('Song not found');
        }
      } catch (error) {
        setError('Failed to load song details');
        console.error('Error fetching song:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSongData();
  }, [id]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!token) return;
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
        const response = await axios.get(`${backendUrl}/api/playlists`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPlaylists(response.data.playlists);
      } catch (error) {
        console.error('Error fetching playlists:', error);
      }
    };

    if (showPlaylistModal) {
      fetchPlaylists();
    }
  }, [token, showPlaylistModal]);

  const handlePlay = () => {
    if (song) {
      playSong(song);
    }
  };

  const handleFavorite = async () => {
    if (!token) {
      toast.info('Please login to add favorites');
      return;
    }
    await toggleFavorite(song);
  };

  const handleAddToPlaylist = async (playlistId) => {
    if (!token) {
      toast.info('Please login to add to playlists');
      return;
    }
    try {
      await addToPlaylist(playlistId, song);
      setShowPlaylistModal(false);
      toast.success('Added to playlist');
    } catch (error) {
      toast.error('Failed to add to playlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-neutral-800 rounded mb-4"></div>
          <div className="h-64 w-full bg-neutral-800 rounded mb-4"></div>
          <div className="h-4 w-3/4 bg-neutral-800 rounded mb-2"></div>
          <div className="h-4 w-1/2 bg-neutral-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white mb-4 hover:text-neutral-300"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-neutral-400">{error || 'Song not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-white mb-4 hover:text-neutral-300"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Song Image */}
          <div className="w-full md:w-1/3">
            <img
              src={song.image || '/default-song.png'}
              alt={song.name}
              className="w-full aspect-square object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Song Details */}
          <div className="w-full md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">{song.name}</h1>
            <p className="text-neutral-400 mb-4">
              {song.desc || 'Unknown Artist'} • {song.album || 'Unknown Album'}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={handlePlay}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-white text-black hover:bg-neutral-200 transition"
              >
                <FaPlay className="w-5 h-5" />
              </button>
              <button
                onClick={handleFavorite}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-800 hover:bg-neutral-700 transition"
              >
                {isFavorite(song) ? (
                  <FaHeart className="w-5 h-5 text-red-500" />
                ) : (
                  <FaRegHeart className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setShowPlaylistModal(true)}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-neutral-800 hover:bg-neutral-700 transition"
              >
                <FaPlus className="w-5 h-5" />
              </button>
            </div>

            {/* Song Information */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2">About</h2>
                <p className="text-neutral-400">
                  {song.description || 'No description available'}
                </p>
              </div>

              {song.lyrics && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Lyrics</h2>
                  <p className="text-neutral-400 whitespace-pre-line">
                    {song.lyrics}
                  </p>
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold mb-2">Details</h2>
                <div className="grid grid-cols-2 gap-4 text-neutral-400">
                  <div>
                    <p className="font-medium">Duration</p>
                    <p>{song.duration || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="font-medium">Genre</p>
                    <p>{song.genre || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="font-medium">Release Date</p>
                    <p>{song.releaseDate || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="font-medium">Language</p>
                    <p>{song.language || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add to Playlist</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {playlists.map((playlist) => (
                <button
                  key={playlist._id}
                  onClick={() => handleAddToPlaylist(playlist._id)}
                  className="w-full text-left p-3 rounded hover:bg-neutral-800 transition"
                >
                  {playlist.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPlaylistModal(false)}
              className="mt-4 w-full p-3 rounded bg-neutral-800 hover:bg-neutral-700 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SongDetail; 