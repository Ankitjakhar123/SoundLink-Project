import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const CommentsAdmin = ({ token, songId, albumId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const url = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [songId, albumId]);

  const fetchComments = async () => {
    setLoading(true);
    const res = await axios.get(`${url}/api/comment/list`, {
      params: { songId, albumId },
    });
    setComments(res.data.comments || []);
    setLoading(false);
  };

  const handleDelete = async (commentId) => {
    await axios.post(
      `${url}/api/comment/delete`,
      { commentId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchComments();
  };

  if (!songId && !albumId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-black/90 rounded-xl shadow-2xl p-6 w-full max-w-lg mx-auto flex flex-col gap-4 mt-8"
    >
      <h3 className="text-xl font-bold text-white mb-2">Comments</h3>
      {loading ? (
        <div className="text-white">Loading...</div>
      ) : (
        <ul className="space-y-2">
          {comments.map((c) => (
            <li
              key={c._id}
              className="bg-neutral-900 rounded-lg px-4 py-2 flex flex-col"
            >
              <span className="text-white">{c.text}</span>
              <span className="text-xs text-neutral-400">
                by {c.user?.username}
              </span>
              <button
                onClick={() => handleDelete(c._id)}
                className="bg-red-600 text-white px-2 py-1 rounded mt-2 self-end"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default CommentsAdmin; 