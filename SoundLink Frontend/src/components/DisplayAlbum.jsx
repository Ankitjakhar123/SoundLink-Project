import React, { useContext, useEffect, useState, useRef } from 'react';
// import Navbar from './Navbar';
import { useParams, Link } from 'react-router-dom';
import { PlayerContext } from '../context/PlayerContext';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useExtractColors } from 'react-extract-colors';
import { MdPlayArrow, MdPause, MdFavorite, MdFavoriteBorder, MdPlaylistAdd, MdMoreVert, MdArrowBack } from 'react-icons/md';
import AddToPlaylistModal from './AddToPlaylistModal';

const DisplayAlbum = () => {
  const { id } = useParams();
  const [albumData, setAlbumData] = useState(null);
  const displayRef = useRef();
  const { playWithId, albumsData, songsData, toggleFavorite, isFavorite, addToQueue, track, playStatus, pause, play } = useContext(PlayerContext);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [showOptions, setShowOptions] = useState(null);

  useEffect(() => {
    console.log('Album ID from URL:', id);
    console.log('Available Albums:', albumsData);
    if (albumsData && albumsData.length > 0) {
      const foundAlbum = albumsData.find(album => album._id === id);
      if (foundAlbum) {
        setAlbumData(foundAlbum);
      } else {
        setAlbumData(null);
      }
    }
  }, [id, albumsData]);

  // Extract dominant color from album image
  const { dominantColor, darkerColor } = useExtractColors(albumData?.image);

  useEffect(() => {
    if (displayRef.current && dominantColor && darkerColor) {
      displayRef.current.style.background = `linear-gradient(135deg, ${dominantColor}, ${darkerColor}, #121212)`;
    }
  }, [dominantColor, darkerColor]);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptions && !event.target.closest('.song-options')) {
        setShowOptions(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showOptions]);

  const handleToggleFavorite = (e, songId) => {
    e.stopPropagation();
    toggleFavorite(songId);
  };

  const handleAddToPlaylist = (e, songId) => {
    e.stopPropagation();
    setSelectedSongId(songId);
    setShowPlaylistModal(true);
  };

  const handleAddToQueue = (e, songId) => {
    e.stopPropagation();
    addToQueue(songId);
  };

  const handleToggleOptions = (e, songId) => {
    e.stopPropagation();
    setShowOptions(showOptions === songId ? null : songId);
  };

  const isPlaying = (songId) => {
    return track && track._id === songId && playStatus;
  };

  const handlePlayPause = (e, songId) => {
    e.stopPropagation();
    if (track && track._id === songId) {
      if (playStatus) {
        pause();
      } else {
        play();
      }
    } else {
      playWithId(songId);
    }
  };

  if (!albumsData) {
    return <div className="text-white p-4">Loading albums data...</div>;
  }

  if (!albumsData.length) {
    return <div className="text-white p-4">No albums available.</div>;
  }

  if (!albumData) {
    return <div className="text-white p-4">Album not found. ID: {id}</div>;
  }

  if (!albumData.image || !albumData.name) {
    return <div className="text-white p-4">Album data is incomplete.</div>;
  }

  // Filter songs that belong to this album
  const albumSongs = songsData.filter((item) => item.album === albumData.name);

  return (
    <>
      <motion.div
        ref={displayRef}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded text-white transition-all duration-500 shadow-2xl p-4 md:p-8 w-full mx-auto flex flex-col gap-6 mt-[-15px] content-container"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mt-4">
          <MdArrowBack /> Back to Home
        </Link>

        <div className="mt-6 flex gap-8 flex-col md:flex-row md:items-end">
          <img className="w-48 h-48 rounded shadow-2xl object-cover" src={albumData.image} alt={albumData.name} />
          <div className="flex flex-col">
            <p className="text-neutral-400">Album</p>
            <h2 className="text-4xl md:text-6xl font-bold mb-4">{albumData.name}</h2>
            <h4 className="text-neutral-300">{albumData.desc}</h4>
            <div className="flex items-center gap-2 mt-2">
              <button 
                onClick={() => albumSongs.length > 0 && playWithId(albumSongs[0]._id)}
                className="mt-4 bg-fuchsia-600 hover:bg-fuchsia-700 text-white py-2 px-6 rounded-full flex items-center gap-2 transition-colors"
              >
                <MdPlayArrow size={24} /> Play
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 mt-10 mb-4 pl-2 text-[#a7a7a7]">
          <p><b className="mr-4">#</b>Title</p>
          <p className="hidden md:block">Album</p>
          <p className="hidden md:block">Date Added</p>
          <p className="text-center"><MdPlayArrow className="inline-block" /></p>
        </div>

        {albumSongs.map((item, index) => (
          <div
            onClick={() => playWithId(item._id)}
            key={item._id}
            className={`grid grid-cols-4 gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer group rounded ${isPlaying(item._id) ? 'bg-[#ffffff15]' : ''}`}
          >
            <div className="flex items-center text-white col-span-3 sm:col-span-1">
              <div className="w-6 min-w-6 mr-2 text-center">
                <span className={isPlaying(item._id) ? 'hidden' : 'group-hover:hidden'}>{index + 1}</span>
                <button 
                  className={isPlaying(item._id) ? 'block' : 'hidden group-hover:block'}
                  onClick={(e) => handlePlayPause(e, item._id)}
                >
                  {isPlaying(item._id) ? <MdPause className="text-fuchsia-500" /> : <MdPlayArrow className="text-white" />}
                </button>
              </div>
              <img className="w-10 h-10 min-w-[40px] mr-3 rounded" src={item.image} alt={item.name} />
              <div className="flex-1 min-w-0">
                <p className={`truncate ${isPlaying(item._id) ? 'text-fuchsia-500' : 'text-white'} text-xs sm:text-base`}>{item.name}</p>
                <p className="text-xs truncate hidden xs:block">{item.desc}</p>
              </div>
            </div>
            <p className="text-[15px] hidden md:block truncate">{albumData.name}</p>
            <p className="text-[15px] hidden md:block">5 days ago</p>
            <div className="flex items-center justify-end gap-1 sm:gap-3 pr-2 col-span-1">
              <button 
                onClick={(e) => handleToggleFavorite(e, item._id)}
                className="opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {isFavorite(item._id) ? 
                  <MdFavorite className="text-fuchsia-500" size={18} /> : 
                  <MdFavoriteBorder size={18} />
                }
              </button>
              <span className="text-[14px] sm:text-[15px]">{item.duration}</span>
              <div className="relative song-options">
                <button 
                  onClick={(e) => handleToggleOptions(e, item._id)}
                  className="opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MdMoreVert size={18} />
                </button>
                {showOptions === item._id && (
                  <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-md shadow-lg py-1 z-50 border border-neutral-700">
                    <button 
                      onClick={(e) => {e.stopPropagation(); handleAddToQueue(e, item._id)}}
                      className="w-full text-left px-4 py-2 text-white hover:bg-neutral-700 flex items-center gap-2"
                    >
                      Add to Queue
                    </button>
                    <button 
                      onClick={(e) => {e.stopPropagation(); handleAddToPlaylist(e, item._id)}}
                      className="w-full text-left px-4 py-2 text-white hover:bg-neutral-700 flex items-center gap-2"
                    >
                      Add to Playlist
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {showPlaylistModal && (
        <AddToPlaylistModal 
          songId={selectedSongId} 
          onClose={() => setShowPlaylistModal(false)} 
        />
      )}
    </>
  );
};

export default DisplayAlbum;
