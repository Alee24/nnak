import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Plus, User, CheckCircle, Flag, Search, Filter } from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';
import { useTheme } from '../context/ThemeContext';

const TeeTimesPage = () => {
  const { theme } = useTheme();
  const [teeTimes, setTeeTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchTeeTimes();
  }, [selectedDate]);

  const fetchTeeTimes = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getTeeTimes({ date: selectedDate });
      if (res.data) setTeeTimes(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (slotId) => {
    try {
      const res = await AdminAPI.bookTeeTime(slotId, {});
      if (res.success) {
        Swal.fire('Success', 'Tee time booked!', 'success');
        fetchTeeTimes();
      }
    } catch (e) {
      Swal.fire('Error', e.message || 'Failed to book', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Tee Time Booking</h1>
          <p className="text-xs text-slate-500 font-medium">Reserve golf tee slots & manage daily tee sheet</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-400">Loading tee sheet...</div>
        ) : teeTimes.length === 0 ? (
          <div className="col-span-full p-8 text-center text-xs text-slate-400">No tee slots available for this date</div>
        ) : (
          teeTimes.map((slot) => (
            <div key={slot.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-emerald-600" />
                  <span className="text-base font-black text-slate-900 dark:text-white">{slot.tee_time}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${slot.status === 'booked' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {slot.booked_players}/{slot.max_players} Players
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium">{slot.course_name} • Hole #{slot.starting_hole}</div>

              {slot.players && slot.players.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                  {slot.players.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{p.first_name} {p.last_name}</span>
                      <span className="text-[10px] text-slate-400">HCP {p.handicap || 0}</span>
                    </div>
                  ))}
                </div>
              )}

              {slot.booked_players < slot.max_players && (
                <button
                  onClick={() => handleBook(slot.id)}
                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl transition-all"
                >
                  Book Slot
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeeTimesPage;
