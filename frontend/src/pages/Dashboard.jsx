import React, { useEffect, useState } from 'react';
import {
    Users, UserCheck, UserX, Clock,
    ArrowUpRight, Activity,
    TrendingUp, Award,
    Plus, Download
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentMembers, setRecentMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 800));
                setStats({
                    total_members: 1248,
                    active: 892,
                    suspended: 45,
                    pending: 156,
                    inactive: 155,
                    growth: 12.5,
                    revenue: 452000
                });

                setRecentMembers([
                    { id: 1, first_name: 'Emily', last_name: 'Wanjiku', role: 'Nurse', join_date: '2 min ago', status: 'pending' },
                    { id: 2, first_name: 'Sarah', last_name: 'Kimani', role: 'Midwife', join_date: '15 min ago', status: 'pending' },
                    { id: 3, first_name: 'David', last_name: 'Otieno', role: 'Student', join_date: '1 hour ago', status: 'active' },
                    { id: 4, first_name: 'Robert', last_name: 'Njoroge', role: 'Nurse', join_date: '2 hours ago', status: 'suspended' },
                    { id: 5, first_name: 'Grace', last_name: 'Achieng', role: 'Specialist', join_date: '5 hours ago', status: 'active' },
                ]);
            } catch (err) {
                console.error("Dashboard Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4 relative">
                    <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full animate-pulse-slow"></div>
                    <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin z-10"></div>
                    <p className="text-xs font-medium text-gray-400 animate-pulse z-10">Initializing Portal...</p>
                </div>
            </div>
        );
    }

    const statusData = {
        labels: ['Active', 'Pending', 'Suspended', 'Inactive'],
        datasets: [
            {
                data: [stats?.active || 0, stats?.pending || 0, stats?.suspended || 0, stats?.inactive || 0],
                backgroundColor: ['#10b981', '#f59e0b', '#E11D48', '#94a3b8'],
                borderWidth: 0,
                hoverOffset: 4
            },
        ],
    };

    const chartOptions = {
        cutout: '78%',
        plugins: { legend: { display: false } },
        maintainAspectRatio: false
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-8 max-w-[1600px] mx-auto">
            {/* Header Section - High Density */}
            <div className="flex justify-between items-end px-1">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
                    <p className="text-xs text-[#E11D48] font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                        <span className="w-4 h-px bg-[#E11D48]/30"></span>
                        Professional Portal Overview
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition shadow-sm flex items-center gap-1.5 active:scale-95">
                        <Download size={12} strokeWidth={2.5} /> Export
                    </button>
                    <button className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-[#E11D48] transition shadow-md flex items-center gap-1.5 active:scale-95">
                        <Plus size={12} strokeWidth={2.5} /> Add Member
                    </button>
                </div>
            </div>

            {/* High-Density KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard title="Total Members" value={stats?.total_members || 0} icon={Users} color="blue" trend="+12%" />
                <KpiCard title="Active Status" value={stats?.active || 0} icon={UserCheck} color="emerald" trend="+5%" />
                <KpiCard title="Pending" value={stats?.pending || 0} icon={Clock} color="amber" trend="Action" isAction={true} />
                <KpiCard title="Suspended" value={stats?.suspended || 0} icon={UserX} color="red" trend="-2%" />
            </div>

            {/* Concentrated Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Distribution Plot - Compact Scaling */}
                <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shadow-inner">
                                <Activity size={16} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-[0.1em]">Distribution Analysis</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Real-time status tracking</p>
                            </div>
                        </div>
                        <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
                            <button className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-white text-slate-900 shadow-sm rounded-md transition-all">Current</button>
                            <button className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Growth</button>
                        </div>
                    </div>

                    <div className="relative h-[200px] flex items-center justify-center z-10">
                        <Doughnut data={statusData} options={chartOptions} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
                            <span className="text-3xl font-bold text-slate-900 tracking-tighter leading-none">{stats?.total_members}</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black mt-1.5">Registrations</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-2 gap-3 relative z-10">
                        <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/40 flex flex-col group transition-all">
                            <div className="text-xs text-emerald-600 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Growth Rate
                            </div>
                            <div className="text-lg font-bold text-emerald-900 flex items-center tracking-tight">
                                +{stats?.growth}% <ArrowUpRight size={14} className="ml-1 text-emerald-500" strokeWidth={3} />
                            </div>
                        </div>
                        <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/40 flex flex-col group transition-all">
                            <div className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                Retention
                            </div>
                            <div className="text-lg font-bold text-blue-900 flex items-center tracking-tight">
                                94.2% <TrendingUp size={14} className="ml-1 text-blue-500" strokeWidth={3} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Log & System Status - High Density */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white/90 p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col flex-1 relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-[0.1em]">Recent Registry</h3>
                            <button className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] hover:text-emerald-700 transition">View All</button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2 relative z-10 max-h-[220px]">
                            {recentMembers.map((member) => (
                                <div key={member.id} className="flex items-center p-2.5 bg-slate-50/50 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 cursor-pointer group/item shadow-sm">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 font-bold text-xs shadow-inner mr-2.5 flex-shrink-0 group-hover/item:scale-105 transition-transform">
                                        {member.first_name[0]}{member.last_name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-900 truncate tracking-tight">{member.first_name} {member.last_name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{member.join_date}</p>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${member.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                        member.status === 'pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                            'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                        }`}>
                                        {member.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Integrated Status Widget */}
                    <div className="bg-slate-900 p-5 rounded-[2rem] text-white shadow-lg relative overflow-hidden group border border-slate-800">
                        <div className="flex items-start justify-between relative z-10 mb-4">
                            <div>
                                <p className="text-[#E11D48] text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-[#E11D48] animate-ping"></span>
                                    Operational
                                </p>
                                <p className="font-bold text-base tracking-tight">System Status</p>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 shadow-lg">
                                <Award size={16} strokeWidth={2.5} />
                            </div>
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[10px] font-bold text-white/40 tracking-[0.2em] uppercase">Compliance</span>
                                <span className="text-base font-bold text-white tracking-tighter">41.8%</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                                <div className="bg-[#E11D48] h-full rounded-full w-[41.8%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KpiCard = ({ title, value, icon: Icon, color, trend, isAction }) => {
    const colors = {
        emerald: { bg: 'bg-emerald-50' },
        blue: { bg: 'bg-blue-50' },
        amber: { bg: 'bg-amber-50' },
        red: { bg: 'bg-rose-50' }
    };
    const c = colors[color] || colors.blue;

    return (
        <div className="group relative overflow-hidden rounded-[1.5rem] bg-white border border-slate-100 hover:shadow-md transition-all duration-300 p-4 flex flex-col justify-between h-[120px]">
            <div className={`absolute top-0 right-0 w-16 h-16 ${c.bg} rounded-full -mr-8 -mt-8 opacity-40 blur-[1px]`}></div>

            <div className="flex justify-between items-start relative z-10">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shadow-inner border border-slate-100">
                    <Icon size={16} strokeWidth={2.5} />
                </div>
                {isAction ? (
                    <span className="bg-[#E11D48] text-white text-[10px] uppercase font-bold tracking-[0.2em] px-2 py-1 rounded-full">
                        {trend}
                    </span>
                ) : (
                    <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md ${trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-700' : 'bg-rose-500/10 text-rose-700'}`}>
                        {trend}
                        <ArrowUpRight size={8} className={`ml-0.5 ${trend.startsWith('-') ? 'rotate-180' : ''}`} strokeWidth={3} />
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <h3 className="text-xl font-bold text-slate-900 tracking-tighter leading-none mb-1">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">{title}</p>
            </div>
        </div>
    );
};

export default Dashboard;
