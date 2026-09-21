import React, { useState, useEffect } from 'react';
import { UserPlus, Plus, Search, CheckCircle, Clock, DollarSign } from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';

const GuestsPage = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', visit_date: new Date().toISOString().split('T')[0], purpose: 'Golf', guest_fee: 2500 });

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getGuests();
      if (res.data) setGuests(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await AdminAPI.createGuest(form);
      if (res.success) {
        Swal.fire('Registered!', `Guest pass #${res.guest_pass_number} generated`, 'success');
        setShowModal(false);
        fetchGuests();
      }
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to register guest', 'error');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Guest Management</h1>
          <p className="text-xs text-slate-500 font-medium">Register member guests, passes & guest fee tracking</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
        >
          <Plus size={16} /> Register Guest
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading guests...</div>
        ) : guests.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No guests registered</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="p-4">Pass #</th>
                  <th className="p-4">Guest Name</th>
                  <th className="p-4">Host Member</th>
                  <th className="p-4">Visit Date</th>
                  <th className="p-4">Purpose</th>
                  <th className="p-4">Guest Fee</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {guests.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{g.guest_pass_number}</td>
                    <td className="p-4 font-bold">{g.first_name} {g.last_name}</td>
                    <td className="p-4">{g.host_fn} {g.host_ln}</td>
                    <td className="p-4">{g.visit_date}</td>
                    <td className="p-4">{g.purpose}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">KES {Number(g.guest_fee).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${g.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {g.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-white/10 w-full max-w-md space-y-4">
            <h3 className="text-base font-black uppercase text-slate-900 dark:text-white">Register Guest</h3>
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <input
                type="text" placeholder="First Name" required value={form.first_name}
                onChange={e => setForm({...form, first_name: e.target.value})}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
              <input
                type="text" placeholder="Last Name" required value={form.last_name}
                onChange={e => setForm({...form, last_name: e.target.value})}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
              <input
                type="text" placeholder="Phone Number" value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
              <input
                type="date" value={form.visit_date}
                onChange={e => setForm({...form, visit_date: e.target.value})}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestsPage;
