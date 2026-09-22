import React, { useEffect, useState } from "react";
import { Flag, Trophy, Clock, UserCheck, Plus, CheckCircle, Target, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminAPI from "../services/api";

const GolfProDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [stats, setStats] = useState({ tee_times_today: 18, golfers_on_course: 24, tournaments_active: 2, pending_scorecards: 6 });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white">Golf Operations & Head Pro Hub</h1>
                    <p className="text-xs text-slate-500 font-medium">Welcome back, {user.first_name || "Head Golf Professional"} • Tee Sheet, Handicapping & Tournaments</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigate("/dashboard/tee-times")} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2">
                        <Clock size={14} /> Tee Sheet
                    </button>
                    <button onClick={() => navigate("/dashboard/competitions")} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2">
                        <Trophy size={14} /> Tournaments
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Flights Booked Today</span>
                    <div className="text-2xl font-black text-emerald-600">{stats.tee_times_today} Flights</div>
                    <span className="text-[10px] text-emerald-600 font-bold">Championship 18 Course</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Golfers Currently On Course</span>
                    <div className="text-2xl font-black text-blue-600">{stats.golfers_on_course} Players</div>
                    <span className="text-[10px] text-blue-500 font-bold">6 Active Flights</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active Tournaments</span>
                    <div className="text-2xl font-black text-amber-600">{stats.tournaments_active} Events</div>
                    <span className="text-[10px] text-amber-500 font-bold">Monthly Mug Scheduled</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pending Scorecards</span>
                    <div className="text-2xl font-black text-purple-600">{stats.pending_scorecards} Cards</div>
                    <span className="text-[10px] text-purple-500 font-bold">WHS Attestation Required</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                <h3 className="font-serif font-black text-slate-900 dark:text-white text-base flex items-center gap-2"><Clock size={18} className="text-emerald-600" /> Today Morning Tee Sheet (Hole #1 & #10)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-400 font-black uppercase">
                            <tr><th className="p-3">Time</th><th className="p-3">Tee Box</th><th className="p-3">Golfers / Flight</th><th className="p-3">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {[
                                { time: '06:30 AM', hole: 'Hole #1', players: 'Dr. Arthur Mwangi (8.4), Peter Kiprono (11.0)', status: 'On Course' },
                                { time: '06:42 AM', hole: 'Hole #1', players: 'David Mutua, Kevin O., Brian L., Samuel K.', status: 'On Course' },
                                { time: '07:18 AM', hole: 'Hole #1', players: 'Sarah Wanjiku, Faith Chebet, Lucy Auma', status: 'On Course' },
                                { time: '07:42 AM', hole: 'Hole #10', players: 'Alex Metto (6.4), George Otieno (3.2), Collins Korir (9.0)', status: 'On Course' }
                            ].map((f, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{f.time}</td>
                                    <td className="p-3 font-bold text-emerald-600">{f.hole}</td>
                                    <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{f.players}</td>
                                    <td className="p-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">{f.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GolfProDashboard;
