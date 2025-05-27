import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Skeleton from '../../Skeleton';

const BulkUpload = ({ token, type }) => {
  const [json, setJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const url = import.meta.env.VITE_BACKEND_URL;

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const data = JSON.parse(json);
      const endpoint = type === "album" ? "/api/album/bulk-add" : "/api/song/bulk-add";
      const res = await axios.post(`${url}${endpoint}`, { [type === "album" ? "albums" : "songs"]: data }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(res.data);
    } catch {
      setResult({ success: false, message: "Invalid JSON or upload failed." });
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-black/90 rounded-xl shadow-2xl p-8 w-full max-w-xl mx-auto flex flex-col gap-6 mt-8"
    >
      <h2 className="text-2xl font-bold text-white mb-4">Bulk Upload {type === "album" ? "Albums" : "Songs"}</h2>
      <form onSubmit={handleUpload} className="flex flex-col gap-4">
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          placeholder={`Paste JSON array of ${type === "album" ? "albums" : "songs"} here`}
          className="bg-neutral-900 text-white border border-neutral-700 rounded px-4 py-2 min-h-[120px]"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:scale-105 transition-transform"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Skeleton type="text" className="w-24" />
            </div>
          ) : (
            "Upload"
          )}
        </button>
      </form>
      {result && (
        <div className={result.success ? "text-green-400" : "text-red-400"}>
          {result.message || (result.success ? "Upload successful!" : "Upload failed.")}
        </div>
      )}
    </motion.div>
  );
};

export default BulkUpload; 