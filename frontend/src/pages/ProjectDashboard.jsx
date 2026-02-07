import React, { useState, useEffect } from 'react';
import {
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    Search,
    Users,
    UserCheck,
    UserX,
    Award
} from 'lucide-react';
import AdminAPI from '../services/api';

const ProjectDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
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

    if (loading) return null;

    return (
        <div className="space-y-4 pb-4 max-w-[1400px] mx-auto">
            {/* Action Bar (Removed redundant NNAK Dashboard title) */}
            <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="bg-emerald-50 p-1.5 rounded-lg">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-800">Quick Actions</h2>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Manage your community</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-xl hover:bg-slate-100 transition-all">
                        <ArrowDownRight size={12} className="rotate-180" />
                        Export
                    </button>
                    <button
                        onClick={() => window.location.href = '/dashboard/members?action=add'}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-[10px] font-bold rounded-xl hover:bg-slate-900 transition-all"
                    >
                        <Plus size={12} />
                        Add Member
                    </button>
                </div>
            </div>

            {/* Metrics Grid - More Compact */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {metrics.map((metric, index) => (
                    <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-xl bg-${metric.color}-50 text-${metric.color}-600`}>
                                <metric.icon size={16} />
                            </div>
                            {metric.trend && (
                                <div className={`flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${metric.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                    {metric.trend}
                                    {metric.isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                </div>
                            )}
                            {metric.hasBadge && (
                                <div className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-orange-50 text-orange-600">
                                    {metric.badgeText}
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-0.5">{metric.value}</h3>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">{metric.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                {/* Distribution Card - Reduced size and padding */}
                <div className="lg:col-span-8 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
                        <div className="flex items-center gap-1.5 text-emerald-600">
                            <ArrowUpRight size={16} className="rotate-45" />
                            <h3 className="font-bold text-slate-800 text-sm">Status Distribution</h3>
                        </div>
                        <div className="flex bg-slate-50 p-0.5 rounded-lg border border-slate-100">
                            <button className="px-3 py-1 text-[9px] font-bold bg-white shadow-sm rounded-md text-slate-800 uppercase tracking-wider">Current</button>
                            <button className="px-3 py-1 text-[9px] font-semibold text-slate-400 hover:text-slate-600 uppercase tracking-wider">Growth</button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
                        {/* Smaller Donut Chart */}
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                {distribution.map((item, i) => {
                                    const percentage = (item.value / totalForDistribution) * 100;
                                    const strokeDasharray = 314; // circumference for r=50
                                    const strokeDashoffset = strokeDasharray * (1 - percentage / 100);
                                    const precedingPercentage = distribution.slice(0, i).reduce((acc, curr) => acc + (curr.value / totalForDistribution) * 100, 0);
                                    const rotation = (precedingPercentage / 100) * 360;

                                    return (
                                        <circle
                                            key={i}
                                            cx="80"
                                            cy="80"
                                            r="50"
                                            fill="transparent"
                                            stroke={item.color}
                                            strokeWidth="18"
                                            strokeDasharray={strokeDasharray}
                                            strokeDashoffset={strokeDashoffset}
                                            strokeLinecap="round"
                                            style={{
                                                transformOrigin: '80px 80px',
                                                transform: `rotate(${rotation}deg)`,
                                                transition: 'all 1s ease-out'
                                            }}
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-2xl font-bold text-slate-800 tracking-tight">{stats?.summary?.total || '0'}</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Members</span>
                            </div>
                        </div>

                        {/* Tighter Legend */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            {distribution.map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-800 leading-tight">{item.label}</span>
                                        <span className="text-[9px] font-semibold text-slate-400">{Math.round((item.value / totalForDistribution) * 100)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Micro Stats */}
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-50">
                        <div className="text-center">
                            <p className="text-[8px] font-bold text-slate-400 uppercase">Growth Rate</p>
                            <p className="text-xs font-bold text-emerald-600">+12.5%</p>
                        </div>
                        <div className="text-center border-x border-slate-50">
                            <p className="text-[8px] font-bold text-slate-400 uppercase">Retention</p>
                            <p className="text-xs font-bold text-blue-600">94.2%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[8px] font-bold text-slate-400 uppercase">Avg Rating</p>
                            <p className="text-xs font-bold text-amber-500">4.9/5</p>
                        </div>
                    </div>
                </div>

                {/* Right Panel - More dense */}
                <div className="lg:col-span-4 flex flex-col gap-3">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex-1">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-bold text-slate-800">Recent Users</h3>
                            <button onClick={() => window.location.href = '/dashboard/members'} className="text-[10px] font-bold text-emerald-500 hover:underline">View All</button>
                        </div>
                        <div className="space-y-3">
                            {(stats?.recent_members || []).map((member, i) => (
                                <div key={i} className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent">
                                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold text-[10px] uppercase">
                                        {member.first_name[0]}{member.last_name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[10px] font-bold text-slate-800 truncate leading-none mb-1">{member.first_name} {member.last_name}</h4>
                                        <p className="text-[8px] text-slate-400 font-semibold">{new Date(member.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase ${member.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                                            member.status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                        {member.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CPD Widget - Compressed */}
                    <div className="bg-slate-900 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-1.5 mb-2">
                                <Award size={14} className="text-emerald-400" />
                                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">CPD Status</span>
                            </div>
                            <div className="flex items-end justify-between mb-1.5">
                                <h4 className="text-sm font-bold text-white leading-none">Compliance</h4>
                                <span className="text-sm font-bold text-emerald-400">{stats?.cpd?.compliance_ratio || 0}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats?.cpd?.compliance_ratio || 0}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDashboard;
