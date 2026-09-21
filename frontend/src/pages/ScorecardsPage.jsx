import React, { useState, useEffect } from 'react';
import { FileText, Plus, CheckCircle, Flag } from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';

const ScorecardsPage = () => {
  const [scorecards, setScorecards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScorecards();
  }, []);

  const fetchScorecards = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getScorecards();
      if (res.data) setScorecards(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Digital Scorecards</h1>
        <p className="text-xs text-slate-500 font-medium">Record strokes, putts, GIR, Stableford points & approvals</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading scorecards...</div>
        ) : scorecards.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No scorecards submitted yet</div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase tracking-wider text-slate-400">
                <th className="p-4">Player</th>
                <th className="p-4">Course</th>
                <th className="p-4">Date</th>
                <th className="p-4">Gross</th>
                <th className="p-4">Net</th>
                <th className="p-4">Points</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {scorecards.map((sc) => (
                <tr key={sc.id}>
                  <td className="p-4 font-bold">{sc.first_name} {sc.last_name}</td>
                  <td className="p-4">{sc.course_name}</td>
                  <td className="p-4">{sc.play_date}</td>
                  <td className="p-4 font-bold">{sc.gross_score || '-'}</td>
                  <td className="p-4 font-bold text-emerald-600">{sc.net_score || '-'}</td>
                  <td className="p-4 font-bold text-amber-600">{sc.stableford_points || '-'}</td>
                  <td className="p-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">{sc.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ScorecardsPage;
