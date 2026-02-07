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
    Play,
    Users,
    UserCheck,
    UserX,
    Award
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

    const metrics = [
        {
            label: 'TOTAL MEMBERS',
            value: stats?.summary?.total || '0',
            icon: Users,
            color: 'blue',
            trend: '+12%',
            isUp: true
        },
        {
            label: 'ACTIVE',
            value: stats?.summary?.active || '0',
            icon: UserCheck,
            color: 'emerald',
            trend: '+5%',
            isUp: true
        },
        {
            label: 'PENDING',
            value: stats?.summary?.pending || '0',
            icon: Clock,
            color: 'orange',
            hasBadge: true,
            badgeText: 'ACTION'
        },
        {
            label: 'SUSPENDED',
            value: stats?.summary?.suspended || '0',
            icon: UserX,
            color: 'red',
            trend: '2%',
            isUp: false,
            trendIcon: 'check'
        },
    ];

    const distribution = stats?.summary ? [
        { label: 'Active', value: parseInt(stats.summary.active), color: '#10b981' },
        { label: 'Pending', value: parseInt(stats.summary.pending), color: '#f59e0b' },
        { label: 'Suspended', value: parseInt(stats.summary.suspended), color: '#ef4444' },
        { label: 'Inactive', value: parseInt(stats.summary.inactive || 0), color: '#94a3b8' },
    ] : [];

    const totalForDistribution = distribution.reduce((acc, curr) => acc + curr.value, 0) || 1;

    return (
        <div className="space-y-6 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">NNAK Dashboard</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Professional Portal</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                        <ArrowDownRight size={14} className="rotate-180" />
                        Report
                    </button>
                    <button
                        onClick={() => window.location.href = '/dashboard/members?action=add'}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-slate-200"
                    >
                        <Plus size={16} />
                        Member
                    </button>
                </div>
            </div>

            {/* Overview Label */}
            <div className="flex flex-col -mb-2">
                <h2 className="text-lg font-black text-slate-800">Overview</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Real-time Statistics</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                    <div key={index} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-2xl bg-${metric.color}-50 text-${metric.color}-600`}>
                                <metric.icon size={20} />
                            </div>
                            {metric.trend && (
                                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${metric.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                    {metric.trend}
                                    {metric.isUp ? <ArrowUpRight size={12} /> : (metric.trendIcon === 'check' ? <CheckCircle2 size={12} /> : <ArrowDownRight size={12} />)}
                                </div>
                            )}
                            {metric.hasBadge && (
                                <div className="text-[10px] font-black px-2 py-1 rounded-lg bg-orange-50 text-orange-600 uppercase tracking-tighter">
                                    {metric.badgeText}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-800 mb-1">{metric.value}</h3>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{metric.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
                {/* Distribution Chart Card */}
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 relative group">
                    <div className="flex items-center gap-2 mb-10">
                        <div className="text-emerald-500">
                            <ArrowUpRight size={20} className="rotate-45" />
                        </div>
                        <h3 className="font-black text-slate-800 text-lg">Distribution</h3>
                        <div className="ml-auto flex items-center gap-2 bg-slate-50 p-1 rounded-xl">
                            <button className="px-4 py-1.5 text-[10px] font-black bg-white shadow-sm rounded-lg text-slate-800 uppercase tracking-widest">Now</button>
                            <button className="px-4 py-1.5 text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">History</button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-12">
                        {/* Donut Chart */}
                        <div className="relative w-64 h-64 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                {distribution.map((item, i) => {
                                    const percentage = (item.value / totalForDistribution) * 100;
                                    const strokeDasharray = 440;
                                    const strokeDashoffset = strokeDasharray * (1 - percentage / 100);

                                    // Calculate rotation based on previous items
                                    const precedingPercentage = distribution.slice(0, i).reduce((acc, curr) => acc + (curr.value / totalForDistribution) * 100, 0);
                                    const rotation = (precedingPercentage / 100) * 360;

                                    return (
                                        <circle
                                            key={i}
                                            cx="128"
                                            cy="128"
                                            r="70"
                                            fill="transparent"
                                            stroke={item.color}
                                            strokeWidth="32"
                                            strokeDasharray={strokeDasharray}
                                            strokeDashoffset={strokeDashoffset}
                                            strokeLinecap="round"
                                            style={{
                                                transformOrigin: 'center',
                                                transform: `rotate(${rotation}deg)`,
                                                transition: 'all 1s ease-out'
                                            }}
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-4xl font-black text-slate-800 tracking-tighter">{stats?.summary?.total || '0'}</span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-6 w-full md:w-auto">
                            {distribution.map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-slate-800">{item.label}</span>
                                        <span className="text-[10px] font-bold text-slate-400">{Math.round((item.value / totalForDistribution) * 100)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Stats Row */}
                    <div className="grid grid-cols-2 gap-6 mt-12 pt-10 border-t border-slate-50">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Growth</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-emerald-600">12.5%</span>
                                <ArrowUpRight size={14} className="text-emerald-500" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Retention</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-blue-600">94%</span>
                                <ArrowUpRight size={14} className="text-blue-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Recent Members & CPD Status */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Recent Members Panel */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex-1">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-black text-slate-800 tracking-tight">Recent Members</h3>
                            <button
                                onClick={() => window.location.href = '/dashboard/members'}
                                className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:text-emerald-600 transition-colors"
                            >
                                All
                            </button>
                        </div>
                        <div className="space-y-6">
                            {(stats?.recent_members || []).map((member, i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-bold text-xs uppercase group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
                                        {member.first_name[0]}{member.last_name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-black text-slate-800 truncate leading-tight mb-0.5">{member.first_name} {member.last_name}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold">{new Date(member.created_at).toLocaleDateString()} ago</p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${member.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                                            member.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                                                'bg-red-50 text-red-600'
                                        }`}>
                                        {member.status}
                                    </span>
                                </div>
                            ))}
                            {(!stats?.recent_members || stats.recent_members.length === 0) && (
                                <div className="py-10 text-center text-slate-300 font-bold text-sm tracking-widest uppercase">
                                    No New Members
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CPD Status Widget */}
                    <div className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-30 text-emerald-400">
                            <Plus size={24} className="rotate-45" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">CPD Status</div>
                                    <Award size={14} className="text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-black text-white mb-6">Compliance</h3>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Health</span>
                                    <span className="text-lg font-black text-white">{stats?.cpd?.compliance_ratio || 0}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${stats?.cpd?.compliance_ratio || 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDashboard;
