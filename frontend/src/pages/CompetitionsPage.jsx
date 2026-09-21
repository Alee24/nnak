import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Calendar, Flag, Users, DollarSign, Award } from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';

const CompetitionsPage = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getCompetitions();
      if (res.data) setCompetitions(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (compId) => {
    try {
      const res = await AdminAPI.registerForCompetition(compId, {});
      if (res.success) {
        Swal.fire('Success', 'Registered for competition!', 'success');
        fetchCompetitions();
      }
    } catch (e) {
      Swal.fire('Error', e.message || 'Registration failed', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Golf Competitions</h1>
          <p className="text-xs text-slate-500 font-medium">Tournaments, registration, starting sheets, prizes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-400">Loading competitions...</div>
        ) : competitions.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-400">No competitions found</div>
        ) : (
          competitions.map((comp) => (
            <div key={comp.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{comp.name}</h3>
                  <p className="text-xs text-emerald-600 font-bold mt-0.5">{comp.format.toUpperCase()} • Sponsor: {comp.sponsor || 'Club'}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                  {comp.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-white/5 text-center text-xs">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Date</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{comp.competition_date}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Entry Fee</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">KES {Number(comp.entry_fee).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Players</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{comp.registered_count || 0}/{comp.max_participants}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href={`/dashboard/leaderboard?comp=${comp.id}`}
                  className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                >
                  View Leaderboard →
                </a>
                <button
                  onClick={() => handleRegister(comp.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
                >
                  Register Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CompetitionsPage;
