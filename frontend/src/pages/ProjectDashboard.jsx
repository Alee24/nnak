import React, { useState, useEffect } from 'react';
import {
    Plus,
    MoreHorizontal,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Clock,
    CheckCircle2,
    Circle,
    MoreVertical,
    Search,
    Bell,
    Play
} from 'lucide-react';
import AdminAPI from '../services/api';

const ProjectDashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        fetchStats();
        return () => clearInterval(timer);
    }, []);

    const fetchStats = async () => {
        try {
            const data = await AdminAPI.getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    };

    const metrics = stats ? [
        { label: 'Total Members', value: stats.summary.total, trend: '', isUp: true },
        { label: 'Active Members', value: stats.summary.active, trend: '', isUp: true },
        { label: 'Pending Apps', value: stats.summary.pending, trend: '', isUp: false },
        { label: 'Total CPD', value: stats.total_cpd, trend: '', isUp: true },
    ] : [
        { label: 'Total Members', value: '...', trend: '', isUp: true },
        { label: 'Active Members', value: '...', trend: '', isUp: true },
        { label: 'Pending Apps', value: '...', trend: '', isUp: false },
        { label: 'Total CPD', value: '...', trend: '', isUp: true },
    ];

    const activeProjectHeaders = {
        title: "Recent Applications",
        plusAction: () => window.location.href = '/dashboard/applications'
    };

    const recentApplications = stats?.recent_applications || [];

    const analyticsData = stats?.analytics || [
        { label: 'M', count: 0 },
        { label: 'T', count: 0 },
        { label: 'W', count: 0 },
        { label: 'T', count: 0 },
        { label: 'F', count: 0 },
        { label: 'S', count: 0 },
        { label: 'S', count: 0 },
    ];

    const maxAnalytics = Math.max(...analyticsData.map(d => d.count), 1);

    return (
        <div className="space-y-8 pb-10">
            {/* Top Row: Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                    <div key={index} className="donezo-card p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-gray-500 text-sm font-medium">{metric.label}</span>
                            <div className={`flex items-center gap-1 text-xs font-bold ${metric.isUp ? 'text-emerald-600' : 'text-red-500'}`}>
                                {metric.trend}
                                {metric.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{metric.value}</h3>
                    </div>
                ))}
            </div>

            {/* Middle Row: Analytics & Reminders & Active Projects */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Project Analytics (Rounded Bar Chart) */}
                <div className="lg:col-span-6 donezo-card p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-xl text-gray-900">Member Registrations</h3>
                        <div className="text-xs font-bold text-gray-400">Last 7 Days</div>
                    </div>
                    <div className="flex items-end justify-between h-48 gap-2">
                        {analyticsData.map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                <div
                                    className="w-full bg-emerald-600/10 rounded-full relative group cursor-pointer overflow-hidden transition-all hover:bg-emerald-600/20"
                                    style={{ height: '100%' }}
                                >
                                    <div
                                        className="absolute bottom-0 w-full bg-emerald-600 rounded-full transition-all duration-700 ease-out"
                                        style={{ height: `${(val.count / maxAnalytics) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400">{val.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reminders */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="donezo-card p-6 flex-1 flex flex-col justify-between overflow-hidden relative group">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                        <div>
                            <h3 className="font-bold text-xl text-gray-900 mb-2">Reminders</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">System Update meeting is scheduled for 2:00 PM today.</p>
                        </div>
                        <button className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 group/btn">
                            <Play size={18} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                            Start Meeting
                        </button>
                    </div>
                </div>

                {/* Recent Applications */}
                <div className="lg:col-span-3 donezo-card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-gray-900">Recent Apps</h3>
                        <button
                            onClick={() => window.location.href = '/dashboard/applications'}
                            className="text-emerald-600 p-1 hover:bg-emerald-50/50 rounded-lg transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                    <div className="space-y-5">
                        {recentApplications.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-10">No pending apps</p>
                        ) : recentApplications.map((app, i) => (
                            <div key={i} className="flex items-center gap-4 group cursor-pointer">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
                                    👤
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-900 leading-tight">{app.first_name} {app.last_name}</h4>
                                    <p className="text-[11px] text-gray-400 font-medium">{new Date(app.created_at).toLocaleDateString()}</p>
                                </div>
                                <MoreVertical size={16} className="text-gray-300" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Team Collaboration, Project Progress, Time Tracker */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Recent Activity Table */}
                <div className="lg:col-span-6 donezo-card p-8">
                    <h3 className="font-bold text-xl text-gray-900 mb-8">Recent Activity</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-gray-50">
                                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Member</th>
                                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
                                    <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="pb-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {(stats?.recent_activity || []).map((member, i) => (
                                    <tr key={i} className="group">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                                                    {member.first_name[0]}{member.last_name[0]}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900">{member.first_name} {member.last_name}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium">#{member.member_id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-sm text-gray-500 font-medium capitalize">{member.role}</span>
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${member.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                                                    member.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                                                        'bg-red-50 text-red-600'
                                                }`}>
                                                {member.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <button
                                                onClick={() => window.location.href = `/dashboard/members/${member.id}/profile`}
                                                className="text-gray-300 hover:text-gray-600 transition-colors"
                                            >
                                                <MoreHorizontal size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(!stats || stats.recent_activity.length === 0) && (
                                    <tr>
                                        <td colSpan="4" className="py-10 text-center text-gray-400 text-sm">No recent activity</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Project Progress (Donut Chart) */}
                <div className="lg:col-span-3 donezo-card p-8 flex flex-col items-center justify-center text-center">
                    <h3 className="font-bold text-xl text-gray-900 mb-8">Member Health</h3>
                    <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                        {/* Simple SVG Donut */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                fill="transparent"
                                stroke="#f3f4f6"
                                strokeWidth="12"
                            />
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                fill="transparent"
                                stroke="#047857"
                                strokeWidth="12"
                                strokeDasharray={440}
                                strokeDashoffset={440 * (1 - (stats ? stats.summary.active / stats.summary.total : 0.5))}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-4xl font-black text-gray-900">{stats ? Math.round((stats.summary.active / stats.summary.total) * 100) : '...'}%</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-[180px]">
                        Percentage of members currently in active status.
                    </p>
                </div>

                {/* Time Tracker Widget */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="bg-emerald-950 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_#fff_1px,_transparent_1px)] bg-[length:24px_24px]"></div>
                        </div>

                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-8 backdrop-blur-md">
                            <Clock size={24} />
                        </div>

                        <h3 className="text-white/60 text-xs font-bold uppercase tracking-[0.2em] mb-4">Current Progress</h3>
                        <div className="text-4xl font-black text-white font-mono tracking-wider mb-8 tabular-nums">
                            {formatTime(currentTime)}
                        </div>

                        <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-2xl transition-all shadow-xl shadow-black/20 group-hover:-translate-y-1">
                            Stop Tracking
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDashboard;
