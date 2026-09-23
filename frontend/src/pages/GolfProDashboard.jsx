import React, { useState } from "react";
import { Clock, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader, Button, DataTable, StatusBadge } from "../components/ui/Primitives";

const GolfProDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [stats] = useState({ tee_times_today: 18, golfers_on_course: 24, tournaments_active: 2, pending_scorecards: 6 });

    return (
        <div className="space-y-5">
            <PageHeader
                title="Golf Operations & Head Pro Workbench"
                subtitle={`Welcome back, ${user.first_name || 'Head Golf Professional'} • Course Management, WHS Handicapping & Tournament Control`}
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Golf Operations' }]}
                actions={
                    <>
                        <Button variant="secondary" size="sm" onClick={() => navigate("/dashboard/competitions")}>
                            <Trophy size={13} /> Tournaments
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => navigate("/dashboard/tee-times")}>
                            <Clock size={13} /> Tee Sheet
                        </Button>
                    </>
                }
            />

            {/* Metric Summary Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">Flights Booked Today</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100 block mt-1">{stats.tee_times_today} Flights</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium block mt-0.5">Championship 18 Course</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">Golfers On Course</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100 block mt-1">{stats.golfers_on_course} Players</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">6 Active Flights</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">Active Tournaments</span>
                    <span className="text-xl font-bold text-amber-700 dark:text-amber-400 block mt-1">{stats.tournaments_active} Events</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Monthly Mug Scheduled</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">Pending Scorecards</span>
                    <span className="text-xl font-bold text-purple-700 dark:text-purple-400 block mt-1">{stats.pending_scorecards} Cards</span>
                    <span className="text-[10px] text-purple-600 block mt-0.5">WHS Attestation</span>
                </div>
            </div>

            {/* Live Tee Sheet Table */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                        Live Flight Sheet (Tee #1 & #10)
                    </h3>
                    <button onClick={() => navigate("/dashboard/tee-times")} className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline">
                        Full Schedule
                    </button>
                </div>

                <DataTable
                    headers={[
                        { label: 'Time' },
                        { label: 'Tee Box' },
                        { label: 'Golfers / Flight' },
                        { label: 'Status', className: 'text-center' },
                    ]}
                >
                    {[
                        { time: '06:30 AM', hole: 'Hole #1', players: 'Dr. Arthur Mwangi (8.4), Peter Kiprono (11.0)', status: 'On Course' },
                        { time: '06:42 AM', hole: 'Hole #1', players: 'David Mutua, Kevin O., Brian L., Samuel K.', status: 'On Course' },
                        { time: '07:18 AM', hole: 'Hole #1', players: 'Sarah Wanjiku, Faith Chebet, Lucy Auma', status: 'On Course' },
                        { time: '07:42 AM', hole: 'Hole #10', players: 'Alex Metto (6.4), George Otieno (3.2), Collins Korir (9.0)', status: 'On Course' }
                    ].map((f, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="px-3.5 py-2 font-mono font-semibold text-slate-900 dark:text-slate-100">{f.time}</td>
                            <td className="px-3.5 py-2 font-semibold text-emerald-700 dark:text-emerald-400">{f.hole}</td>
                            <td className="px-3.5 py-2 text-slate-600">{f.players}</td>
                            <td className="px-3.5 py-2 text-center">
                                <StatusBadge variant="success">
                                    {f.status}
                                </StatusBadge>
                            </td>
                        </tr>
                    ))}
                </DataTable>
            </div>
        </div>
    );
};

export default GolfProDashboard;
