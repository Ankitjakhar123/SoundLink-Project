import React, { useContext, useEffect, useState, useRef } from 'react';
import Navbar from './Navbar';
import { useParams } from 'react-router-dom';
import { PlayerContext } from '../context/PlayerContext';

const DisplayAlbum = () => {
  const { id } = useParams();
  const [albumData, setAlbumData] = useState(null);
  const displayRef = useRef();
  const { playWithId, albumsData, songsData,  } = useContext(PlayerContext);

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

  useEffect(() => {
    if (displayRef.current) {
      const bgColor = albumData?.bgColour || '#1db954';
      displayRef.current.style.background = `linear-gradient(${bgColor}, #121212)`;
    }
  }, [albumData]);

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

  return (
    <div
      ref={displayRef}
      className="rounded text-white transition-all duration-500"
    >
      <Navbar />
      <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end">
        <img className="w-48 rounded" src={albumData.image} alt={albumData.name} />
        <div className="flex flex-col">
          <p>Playlist</p>
          <h2 className="text-5xl font-bold mb-4 md:text-7xl">{albumData.name}</h2>
          <h4>{albumData.desc}</h4>
          <p className="mt-1">
            {/* <img className="inline-block w-5" src={assets.spotify_logo} alt="Spotify Logo" /> */}
            <b>Spotify</b> • 1,322,222 likes • <b>50 songs,</b> about 2 hr 30 min
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 mt-10 mb-4 pl-2 text-[#a7a7a7]">
        <p><b className="mr-4">#</b>Title</p>
        <p>Album</p>
        <p className="hidden sm:block">Date Added</p>
        {/* <img className="m-auto w-4" src={assets.clock_icon} alt="Clock Icon" /> */}
      </div>

      {songsData.filter((item) => item.album === albumData.name).map((item, index) => (
        <div
          onClick={() => playWithId(item._id)}
          key={item._id}
          className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer"
        >
          <p className="text-white">
            <b className="mr-4 text-[#a7a7a7]">{index + 1}</b>
            <img className="inline w-10 mr-5" src={item.image} alt={item.name} />
            {item.name}
          </p>
          <p className="text-[15px]">{albumData.name}</p>
          <p className="text-[15px] hidden sm:block">5 days ago</p>
          <p className="text-[15px] text-center">{item.duration}</p>
        </div>
      ))}
    </div>
  );
};

export default DisplayAlbum;
