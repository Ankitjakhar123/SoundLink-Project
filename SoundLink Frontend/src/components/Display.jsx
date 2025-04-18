import React, { useContext, useRef, useEffect } from 'react';
import { Route, Routes, useLocation, useParams } from 'react-router-dom';
import DisplayHome from './DisplayHome';
import DisplayAlbum from './DisplayAlbum';
import { PlayerContext } from '../context/PlayerContext';
//import { assets } from '../assets/assets';

const Display = () => {
  const { albumsData } = useContext(PlayerContext); // Fixed useContext
  const displayRef = useRef();
  const location = useLocation();
  
  const { id } = useParams();  // Getting dynamic route parameter 'id' for album
  const isAlbum = location.pathname.includes('/album/');
  const bgColour = isAlbum && albumsData.length > 0
    ? albumsData.find((x) => x._id === id)?.bgColour || "#121212"
    : "#121212"; // Default background color

  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.style.background = isAlbum && bgColour
        ? `linear-gradient(${bgColour}, #121212)`
        : '#121212'; // Set background color dynamically
    }
  }, [location.pathname, bgColour]);

  return (
    <div
      ref={displayRef}
      className="w-[100%] m-2 px-6 pt-4 rounded overflow-auto lg:w-[75%] lg:ml-0 text-white transition-all duration-500"
    >
      {albumsData.length > 0 ? (
        <Routes>
          <Route path="/" element={<DisplayHome />} />
          <Route path="/album/:id" element={<DisplayAlbum album={albumsData.find((x) => x._id === id)} />} />
        </Routes>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default Display;
