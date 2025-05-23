import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdPerson, MdSearch, MdClear, MdArrowBack } from 'react-icons/md';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Skeleton from './Skeleton';

const Artists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
        const response = await fetch(`${backendUrl}/api/artist/list`);
        const data = await response.json();
        
        if (data.success) {
          setArtists(data.artists);
        } else {
          setError('Failed to load artists');
        }
      } catch (error) {
        console.error('Error fetching artists:', error);
        setError('Failed to load artists');
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  const filteredArtists = artists.filter(artist => 
    artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (artist.bio && artist.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Skeleton type="title" className="w-48" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} type="artist-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-start items-center bg-gradient-to-b from-black via-black to-neutral-900 pb-16 px-4 pt-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Back navigation */}
        {/* <Link to="/" className="inline-flex items-center text-white/80 hover:text-white py-4">
          <MdArrowBack className="mr-2" size={20} />
          <span>Back to Home</span>
        </Link> */}

        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Popular Artists
          </h1>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-10 bg-neutral-800/70 border border-neutral-700 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            />
            <MdSearch className="absolute top-2.5 left-3 text-neutral-400" size={20} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute top-2.5 right-3 text-neutral-400 hover:text-white"
              >
                <MdClear size={20} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Artists Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {filteredArtists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredArtists.map((artist) => (
                <Link
                  key={artist._id}
                  to={`/artist/${artist._id}`}
                  className="group bg-neutral-900/50 backdrop-blur-md rounded-xl p-4 hover:bg-neutral-800/60 transition-all duration-300 border border-white/5 hover:border-fuchsia-500/30 hover:shadow-lg hover:shadow-fuchsia-500/10"
                >
                  <div className="aspect-square rounded-full overflow-hidden mb-4 border-2 border-fuchsia-500/30">
                    {artist.image ? (
                      <img
                        src={artist.image}
                        alt={artist.name}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full bg-neutral-800 flex items-center justify-center">
                        <MdPerson className="text-fuchsia-500" size={50} />
                      </div>
                    )}
                  </div>
                  <h3 className="text-white font-bold text-lg text-center truncate">{artist.name}</h3>
                  {artist.bio && (
                    <p className="text-neutral-400 text-sm mt-1 text-center line-clamp-2">{artist.bio}</p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-neutral-900/50 backdrop-blur-md rounded-xl p-8 text-center border border-white/5">
              <MdPerson size={60} className="text-neutral-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No artists found</h3>
              <p className="text-neutral-400">
                {searchQuery ? 'No artists match your search.' : 'There are no artists to display yet.'}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Artists; 