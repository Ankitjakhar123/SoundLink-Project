import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const EditDeleteManager = ({ token, type }) => {
  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const url = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const endpoint = type === "album" ? "/api/album/list" : "/api/song/list";
    const res = await axios.get(`${url}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems(type === "album" ? res.data.albums : res.data.songs);
    setLoading(false);
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setEditData(item);
  };

  const handleSave = async () => {
    const endpoint = type === "album" ? "/api/album/edit" : "/api/song/edit";
    await axios.post(`${url}${endpoint}`, editData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setEditId(null);
    fetchItems();
  };

  const handleDelete = async (id) => {
    const endpoint = type === "album" ? "/api/album/remove" : "/api/song/remove";
    await axios.post(`${url}${endpoint}`, { id }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchItems();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-black/90 rounded-xl shadow-2xl p-8 w-full max-w-2xl mx-auto flex flex-col gap-6 mt-8"
    >
      <h2 className="text-2xl font-bold text-white mb-4">
        {type === "album" ? "Manage Albums" : "Manage Songs"}
      </h2>
      {loading ? (
        <div className="text-white">Loading...</div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item._id}
              className="bg-neutral-900 rounded-lg px-4 py-3 flex justify-between items-center"
            >
              {editId === item._id ? (
                <>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="bg-neutral-800 text-white border border-neutral-700 rounded px-2 py-1"
                  />
                  <button
                    onClick={handleSave}
                    className="bg-fuchsia-600 text-white px-3 py-1 rounded ml-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditId(null)}
                    className="bg-neutral-700 text-white px-3 py-1 rounded ml-2"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="text-white">{item.name}</span>
                  <div>
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-fuchsia-600 text-white px-3 py-1 rounded ml-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded ml-2"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default EditDeleteManager; 