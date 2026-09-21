import React, { useState, useEffect } from 'react';
import { Flag, Award, TrendingUp, Users } from 'lucide-react';
import AdminAPI from '../services/api';

const HandicapPage = () => {
  const [dist, setDist] = useState([]);

  useEffect(() => {
    fetchDist();
  }, []);

  const fetchDist = async () => {
    try {
      const res = await AdminAPI.getHandicapDistribution();
      if (res.data) setDist(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Handicap Management & Statistics</h1>
        <p className="text-xs text-slate-500 font-medium">Member handicap indexes, revisions & distribution brackets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dist.map((d, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-2">
            <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider">{d.bracket}</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{d.count} Members</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HandicapPage;
