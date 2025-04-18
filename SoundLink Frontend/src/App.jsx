import React, { useContext } from "react";
import Sidebar from "./components/Sidebar";
import Player from "./components/player";
import { PlayerContext } from "./context/PlayerContext";
import { Routes, Route } from "react-router-dom";
import DisplayHome from "./components/DisplayHome";
import DisplayAlbum from "./components/DisplayAlbum";

const App = () => {
  const { audioRef, track, songsData } = useContext(PlayerContext);

  return (
    <div className="h-screen bg-black">
      {songsData.length !== 0 ? (
        <>
          <div className="h-[90%] flex">
            <Sidebar />
            <div className="w-full m-2 px-6 pt-4 rounded overflow-auto lg:w-[75%] lg:ml-0 text-white transition-all duration-500">
              <Routes>
                <Route path="/" element={<DisplayHome />} />
                <Route path="/album/:id" element={<DisplayAlbum />} />
              </Routes>
            </div>
          </div>
          <Player />
        </>
      ) : (
        <div className="text-white p-4">Loading songs...</div>
      )}

      {track ? (
        <audio ref={audioRef} preload="auto">
          <source src={track.file} type="audio/mp3" />
        </audio>
      ) : (
        <div className="text-white p-4">Please select a track to play.</div>
      )}
    </div>
  );
};

export default App;
