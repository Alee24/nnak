import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, Flag, Award } from 'lucide-react';
import AdminAPI from '../services/api';

const LeaderboardPage = () => {
  const [competitions, setCompetitions] = useState([]);
  const [selectedComp, setSelectedComp] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCompetitions();
  }, []);

  useEffect(() => {
    if (selectedComp) fetchLeaderboard(selectedComp);
  }, [selectedComp]);

  const loadCompetitions = async () => {
    try {
      const res = await AdminAPI.getCompetitions();
      if (res.data && res.data.length > 0) {
        setCompetitions(res.data);
        setSelectedComp(res.data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLeaderboard = async (compId) => {
    setLoading(true);
    try {
      const res = await AdminAPI.getCompetitionLeaderboard(compId);
      if (res.data) setLeaderboard(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Live Competition Leaderboard</h1>
          <p className="text-xs text-slate-500 font-medium">Real-time scoring, rankings, gross/net & Stableford points</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedComp}
            onChange={(e) => setSelectedComp(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none font-bold"
          >
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.competition_date})</option>
            ))}
          </select>
          <button
            onClick={() => selectedComp && fetchLeaderboard(selectedComp)}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-400 hover:text-emerald-600"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Updating leaderboard...</div>
        ) : leaderboard.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No scorecards recorded yet for this tournament</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="p-4 w-16">Pos</th>
                  <th className="p-4">Player</th>
                  <th className="p-4">Handicap</th>
                  <th className="p-4">Gross</th>
                  <th className="p-4">Net</th>
                  <th className="p-4">Points</th>
                  <th className="p-4">To Par</th>
                  <th className="p-4">Thru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {leaderboard.map((row) => (
                  <tr key={row.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${row.position <= 3 ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''}`}>
                    <td className="p-4 font-black">
                      {row.position === 1 ? '🥇 1' : row.position === 2 ? '🥈 2' : row.position === 3 ? '🥉 3' : row.position}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {row.first_name} {row.last_name} ({row.membership_number})
                    </td>
                    <td className="p-4">{row.handicap_at_registration || 0}</td>
                    <td className="p-4 font-bold">{row.gross_score || '-'}</td>
                    <td className="p-4 font-bold text-emerald-600">{row.net_score || '-'}</td>
                    <td className="p-4 font-bold text-amber-600">{row.stableford_points || '-'}</td>
                    <td className="p-4 font-bold">{row.score_to_par || '-'}</td>
                    <td className="p-4 text-slate-500">{row.thru || 0}/18</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
