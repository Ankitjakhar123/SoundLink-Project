import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import AddSong from "./AddSong";
import AddAlbum from "./AddAlbum";
import ListSong from "./ListSong";
import ListAlbum from "./ListAlbum";
import BulkUpload from "./BulkUpload";
import BulkSongUpload from "./BulkSongUpload";
import AddMovieAlbum from "./AddMovieAlbum";
import ListMovieAlbum from "./ListMovieAlbum";
import AdminArtists from "./AdminArtists";
import { MdMusicNote } from "react-icons/md";
import Skeleton from './Skeleton';

const adminActions = [
  { label: "Add Song", key: "addSong" },
  { label: "Add Album", key: "addAlbum" },
  { label: "List Songs", key: "listSong" },
  { label: "List Albums", key: "listAlbum" },
  { label: "Manage Artists", key: "manageArtists" },
  { label: "Add Movie Album", key: "addMovieAlbum" },
  { label: "List Movie Albums", key: "listMovieAlbum" },
  { label: "Bulk Upload", key: "bulkUpload" },
  { label: "Bulk Song Upload", key: "bulkSongUpload" },
];

const AdminDashboard = ({ token }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const url = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    const res = await axios.get(`${url}/api/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAnalytics(res.data.analytics);
    setLoading(false);
  };

  const renderModalContent = () => {
    switch (modal) {
      case "addSong":
        return <AddSong />;
      case "addAlbum":
        return <AddAlbum token={token} />;
      case "listSong":
        return <ListSong onCloseModal={() => setModal(null)} />;
      case "listAlbum":
        return <ListAlbum onCloseModal={() => setModal(null)} />;
      case "manageArtists":
        return <AdminArtists />;
      case "addMovieAlbum":
        return <AddMovieAlbum token={token} />;
      case "listMovieAlbum":
        return <ListMovieAlbum onCloseModal={() => setModal(null)} />;
      case "bulkUpload":
        return <BulkUpload token={token} type="song" />;
      case "bulkSongUpload":
        return <BulkSongUpload />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-neutral-900/50 rounded-lg p-6">
                <Skeleton type="text" className="w-24 mb-4" />
                <Skeleton type="title" className="w-16" />
              </div>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-neutral-900/50 rounded-lg p-6">
                <Skeleton type="title" className="w-32 mb-4" />
                <div className="space-y-4">
                  <Skeleton type="text" className="w-full" />
                  <Skeleton type="text" className="w-full" />
                  <Skeleton type="text" className="w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-black/90 rounded-xl shadow-2xl p-8 w-full h-full min-h-screen max-w-full mx-auto flex flex-col gap-8 mt-0 overflow-auto"
      style={{ maxHeight: '100vh' }}
    >
      <h2 className="text-2xl font-bold text-white mb-4">Admin Dashboard</h2>
      <div className="flex flex-wrap gap-4 mb-6">
        {adminActions.map((action) => (
          <button
            key={action.key}
            onClick={() => {
              if (action.key === 'listAlbum') navigate('/admin/albums');
              else if (action.key === 'listSong') navigate('/admin/songs');
              else if (action.key === 'manageArtists') navigate('/admin/artists');
              else setModal(action.key);
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-700 to-pink-700 text-white font-semibold shadow-lg border border-fuchsia-900/40 hover:scale-105 transition-transform backdrop-blur-xl"
          >
            {action.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="text-white">Loading analytics...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-neutral-900 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-fuchsia-400">{analytics.totalUsers}</div>
            <div className="text-neutral-400">Users</div>
          </div>
          <div className="bg-neutral-900 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-fuchsia-400">{analytics.totalSongs}</div>
            <div className="text-neutral-400">Songs</div>
          </div>
          <div className="bg-neutral-900 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-fuchsia-400">{analytics.totalAlbums}</div>
            <div className="text-neutral-400">Albums</div>
          </div>
          <div className="bg-neutral-900 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-fuchsia-400">{analytics.totalMovieAlbums || 0}</div>
            <div className="text-neutral-400">Movie Albums</div>
          </div>
          <div className="bg-neutral-900 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-fuchsia-400">{analytics.totalArtists || 0}</div>
            <div className="text-neutral-400">Artists</div>
          </div>
          <div className="bg-neutral-900 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-fuchsia-400">{analytics.totalPlays}</div>
            <div className="text-neutral-400">Total Plays</div>
          </div>
        </div>
      )}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-lg"
            style={{ minHeight: '100vh', minWidth: '100vw' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative bg-black/95 border border-fuchsia-900 rounded-3xl shadow-2xl p-8 w-full max-w-4xl h-[90vh] mx-4 overflow-y-auto"
              style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.7)', maxHeight: '90vh' }}
            >
              <button
                onClick={() => setModal(null)}
                className="absolute top-4 right-4 text-fuchsia-400 hover:text-white bg-neutral-900 rounded-full w-9 h-9 flex items-center justify-center text-xl font-bold border border-fuchsia-800 shadow"
                title="Close"
              >
                ×
              </button>
              {renderModalContent()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminDashboard; 