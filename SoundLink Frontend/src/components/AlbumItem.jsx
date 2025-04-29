import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAlbum } from 'react-icons/md';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const AlbumItem = ({ id, name, image }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onClick={() => navigate(`/album/${id}`)}
      className='min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26] bg-black/90 shadow-2xl'
    >
      {image ? (
        <img className='rounded w-full object-cover aspect-square' src={image} alt={name} />
      ) : (
        <MdAlbum className='w-24 h-24 text-fuchsia-500 mx-auto' />
      )}
      <p className='font-bold mt-2 mb-1 truncate text-sm sm:text-base'>{name}</p>
    </motion.div>
  );
};

export default AlbumItem;
