import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const AnalyticsChart = ({ token }) => {
  const [data, setData] = useState([]);
  const url = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line
  }, []);

  const fetchAnalytics = async () => {
    const res = await axios.get(`${url}/api/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setData(res.data.analytics.mostPlayed.map(mp => ({
      name: mp.song.name,
      plays: mp.count,
    })));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-black/90 rounded-xl shadow-2xl p-8 w-full max-w-2xl mx-auto flex flex-col gap-6 mt-8"
    >
      <h2 className="text-2xl font-bold text-white mb-4">Most Played Songs</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip />
          <Bar dataKey="plays" fill="#d946ef" />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default AnalyticsChart; 