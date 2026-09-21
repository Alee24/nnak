import React, { useState, useEffect } from 'react';
import { Map, Calendar, Plus, Clock, Users } from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';

const FacilitiesPage = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getFacilities();
      if (res.data) setFacilities(res.data);
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
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Club Facilities & Bookings</h1>
          <p className="text-xs text-slate-500 font-medium">Conference rooms, swimming pool, tennis courts, function halls</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {facilities.map((fac) => (
          <div key={fac.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 dark:text-white text-sm">{fac.name}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">{fac.status}</span>
            </div>
            <p className="text-xs text-slate-500">Capacity: {fac.capacity} Persons</p>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Rate: KES {Number(fac.member_hourly_rate).toLocaleString()} / hr (Member)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FacilitiesPage;
