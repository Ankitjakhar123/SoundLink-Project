import React from 'react';
import { MdMovie } from 'react-icons/md';
import { Link } from 'react-router-dom';
import LazyImage from './LazyImage';

const MovieAlbumItem = ({ id, title, image }) => {
  return (
    <div className="group flex-shrink-0 w-[200px] overflow-hidden">
      <Link 
        to={`/movie/${id}`} 
        className="block bg-neutral-900/60 p-2 rounded-xl shadow-lg hover:bg-neutral-900 transition-all duration-300 hover:scale-105 hover:shadow-xl h-full"
      >
        <div className="relative aspect-square overflow-hidden rounded-lg mb-2">
          {image ? (
            <LazyImage 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              fallbackSrc="/default-album.png"
            />
          ) : (
            <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-fuchsia-500">
              <MdMovie size={60} />
            </div>
          )}
        </div>
        <div className="p-2">
          <h3 className="text-white font-bold text-sm sm:text-lg truncate">{title}</h3>
        </div>
      </Link>
    </div>
  );
};

export default MovieAlbumItem; 