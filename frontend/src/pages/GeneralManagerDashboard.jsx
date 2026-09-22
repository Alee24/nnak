import React, { useEffect, useState } from "react";
import { Users, DollarSign, Clock, Activity, ArrowUpRight, TrendingUp, Flag, Trophy, CheckCircle, AlertCircle, Plus, UserPlus, Calendar, Download, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminAPI from "../services/api";

const GeneralManagerDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total_members: 524, active: 486, pending: 24, revenue_month: 2850000, tee_times_today: 18 });
    const [recentMembers, setRecentMembers] = useState([]);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(false);
                const [statsRes, membersRes] = await Promise.allSettled([
                    AdminAPI.getStats(),
                    AdminAPI.getMembers(1, 5, "")
                ]);
                if (statsRes.status === "fulfilled" && statsRes.value) setStats(prev => ({ ...prev, ...statsRes.value }));
                if (membersRes.status === "fulfilled" && membersRes.value?.members) setRecentMembers(membersRes.value.members);
            } catch (e) { console.error(e); setLoading(false); }
        };
        fetchDashboard();
    }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white">Executive Control & GM Suite</h1>
                    <p className="text-xs text-slate-500 font-medium">Welcome back, {user.first_name || "General Manager"} • Executive Overview & Strategic Performance</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigate("/dashboard/members")} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2">
                        <Users size={14} /> Member Directory
                    </button>
                    <button onClick={() => navigate("/dashboard/analytics")} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2">
                        <Activity size={14} /> Full Analytics
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Membership</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center"><Users size={16} /></div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.total_members}</div>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><ArrowUpRight size={12} /> {stats.active} Active Members</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Monthly Revenue</span>
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center"><DollarSign size={16} /></div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">KES {(stats.revenue_month || 2850000).toLocaleString()}</div>
                    <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1"><TrendingUp size={12} /> +14.2% Growth YTD</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tee Times Today</span>
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center"><Clock size={16} /></div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.tee_times_today} Flights</div>
                    <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1"><Flag size={12} /> 94.5% Occupancy Rate</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pending Approvals</span>
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center"><UserPlus size={16} /></div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.pending} Applications</div>
                    <span className="text-[10px] text-purple-600 font-bold flex items-center gap-1"><AlertCircle size={12} /> Action Required</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-serif font-black text-slate-900 dark:text-white text-base flex items-center gap-2"><Users size={18} className="text-emerald-600" /> Recent Member Registrations</h3>
                        <button onClick={() => navigate("/dashboard/members")} className="text-xs font-bold text-emerald-600 hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-400 font-black uppercase">
                                <tr><th className="p-3">Member</th><th className="p-3">Category</th><th className="p-3">Handicap</th><th className="p-3">Status</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {(recentMembers.length ? recentMembers : [
                                    { first_name: 'Alex', last_name: 'Metto', membership_number: 'MMS-005', role: 'Full Member', handicap_index: 6.4, status: 'active' },
                                    { first_name: 'Dr. Arthur', last_name: 'Mwangi', membership_number: 'MMS-008', role: 'Full Member', handicap_index: 8.4, status: 'active' },
                                    { first_name: 'Sarah', last_name: 'Wanjiku', membership_number: 'MMS-009', role: 'Lady Member', handicap_index: 14.2, status: 'active' }
                                ]).map((m, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                        <td className="p-3 font-bold text-slate-900 dark:text-white">{m.first_name} {m.last_name}<span className="block text-[10px] text-slate-400">{m.membership_number}</span></td>
                                        <td className="p-3 font-medium text-slate-600">{m.role || 'Member'}</td>
                                        <td className="p-3 font-bold text-emerald-600">HCP {m.handicap_index || '0.0'}</td>
                                        <td className="p-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">{m.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                    <h3 className="font-serif font-black text-slate-900 dark:text-white text-base flex items-center gap-2"><Trophy size={18} className="text-amber-500" /> Executive Quick Actions</h3>
                    <div className="space-y-2.5">
                        <button onClick={() => navigate("/dashboard/applications")} className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 hover:text-emerald-800 transition font-bold text-xs">
                            <span className="flex items-center gap-2"><UserPlus size={16} className="text-emerald-600" /> Review Member Applications</span>
                            <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{stats.pending}</span>
                        </button>
                        <button onClick={() => navigate("/dashboard/finance")} className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 hover:text-emerald-800 transition font-bold text-xs">
                            <span className="flex items-center gap-2"><DollarSign size={16} className="text-blue-600" /> Financial Dues & Revenue</span>
                        </button>
                        <button onClick={() => navigate("/dashboard/generate-ids")} className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 hover:text-emerald-800 transition font-bold text-xs">
                            <span className="flex items-center gap-2"><Shield size={16} className="text-purple-600" /> Issue Membership Cards</span>
                        </button>
                        <button onClick={() => navigate("/dashboard/events")} className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 hover:text-emerald-800 transition font-bold text-xs">
                            <span className="flex items-center gap-2"><Calendar size={16} className="text-amber-600" /> Club Tournaments Calendar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralManagerDashboard;
