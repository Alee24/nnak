import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Clock, LogOut, CheckCircle, ShieldAlert } from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';

const CheckInPage = () => {
  const [query, setQuery] = useState('');
  const [purpose, setPurpose] = useState('Golf');
  const [todayCheckIns, setTodayCheckIns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchToday();
  }, []);

  const fetchToday = async () => {
    try {
      const res = await AdminAPI.getTodayCheckIns();
      if (res.data) setTodayCheckIns(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await AdminAPI.checkIn({ search_query: query, purpose });
      if (res.success) {
        Swal.fire('Checked In!', `${res.member.first_name} ${res.member.last_name} checked in for ${purpose}`, 'success');
        setQuery('');
        fetchToday();
      }
    } catch (err) {
      Swal.fire('Check-in Failed', err.message || 'Member not found or suspended', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await AdminAPI.checkOut(id);
      fetchToday();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Fast Member Check-In</h1>
        <p className="text-xs text-slate-500 font-medium">Verify membership, check in for Golf, Restaurant, Events or Gym</p>
      </div>

      {/* Search & Action Form */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
        <form onSubmit={handleCheckIn} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Enter Membership #, Phone, ID or Email..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="Golf">Golf Course</option>
              <option value="Restaurant">Restaurant / Bar</option>
              <option value="Event">Club Event</option>
              <option value="Gym">Gym / Pool</option>
              <option value="Meeting">Meeting Room</option>
              <option value="General">General Visit</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all uppercase tracking-wider"
            >
              {loading ? 'Verifying...' : 'Check In'}
            </button>
          </div>
        </form>
      </div>

      {/* Today's Check-ins */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white">Today's Checked-In Members ({todayCheckIns.length})</h3>
        {todayCheckIns.length === 0 ? (
          <div className="text-xs text-slate-400 text-center py-6">No members checked in today yet</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
            {todayCheckIns.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 flex items-center justify-center font-bold">
                    {item.first_name[0]}{item.last_name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{item.first_name} {item.last_name} ({item.membership_number})</div>
                    <div className="text-[10px] text-slate-400">{item.purpose} • Checked in at {new Date(item.check_in_time).toLocaleTimeString()}</div>
                  </div>
                </div>
                {!item.check_out_time ? (
                  <button
                    onClick={() => handleCheckOut(item.id)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                  >
                    <LogOut size={12} /> Check Out
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400">Out at {new Date(item.check_out_time).toLocaleTimeString()}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInPage;
