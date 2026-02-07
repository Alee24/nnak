import React, { useEffect, useState } from 'react';
import {
    Users, UserCheck, UserX, Clock,
    ArrowUpRight, ArrowRight, Activity,
    TrendingUp, Shield, Award, MoreHorizontal,
    Plus, Search, Smartphone, Bell, Scan,
    Zap, Filter, ChevronRight, Download
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentMembers, setRecentMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Simulating API call delay for effect
                await new Promise(resolve => setTimeout(resolve, 800));

                // Demo Data
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
                    { id: 1, first_name: 'Emily', last_name: 'Wanjiku', role: 'Nurse', join_date: '2 min ago', status: 'pending', avatar: 'https://i.pravatar.cc/150?u=1' },
                    { id: 2, first_name: 'Sarah', last_name: 'Kimani', role: 'Midwife', join_date: '15 min ago', status: 'pending', avatar: 'https://i.pravatar.cc/150?u=2' },
                    { id: 3, first_name: 'David', last_name: 'Otieno', role: 'Student', join_date: '1 hour ago', status: 'active', avatar: 'https://i.pravatar.cc/150?u=3' },
                    { id: 4, first_name: 'Robert', last_name: 'Njoroge', role: 'Nurse', join_date: '2 hours ago', status: 'suspended', avatar: 'https://i.pravatar.cc/150?u=4' },
                    { id: 5, first_name: 'Grace', last_name: 'Achieng', role: 'Specialist', join_date: '5 hours ago', status: 'active', avatar: 'https://i.pravatar.cc/150?u=5' },
                ]);

            } catch (err) {
                console.error("Dashboard Error:", err);
                setError(err.message);
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
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse-slow"></div>
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin z-10"></div>
                    <p className="text-sm font-medium text-gray-500 animate-pulse z-10">Initializing Dashboard...</p>
                </div>
            </div>
        );
    }

    // Chart Data Configuration
    const statusData = {
        labels: ['Active', 'Pending', 'Suspended', 'Inactive'],
        datasets: [
            {
                data: [
                    stats?.active || 0,
                    stats?.pending || 0,
                    stats?.suspended || 0,
                    stats?.inactive || 0
                ],
                backgroundColor: [
                    '#10b981', // Active - Emerald 500
                    '#f59e0b', // Pending - Amber 500
                    '#ef4444', // Suspended - Red 500
                    '#9ca3af'  // Inactive - Gray 400
                ],
                borderWidth: 0,
                hoverOffset: 4
            },
        ],
    };

    const chartOptions = {
        cutout: '75%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { family: "'Inter', sans-serif", size: 12, weight: 'bold' }
                }
            },
            tooltip: {
                backgroundColor: '#1f2937',
                padding: 12,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                cornerRadius: 8,
                displayColors: true
            }
        },
        maintainAspectRatio: false
    };


    return (
        <div className="flex flex-col gap-4 animate-fade-in font-inter">
            {/* Header / Actions */}
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight font-dm-sans">Overview</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Real-time statistics</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-gray-50 transition shadow-sm flex items-center gap-1.5">
                        <Download size={14} /> Report
                    </button>
                    <button className="bg-[#059669] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#047857] transition shadow-md shadow-green-100 flex items-center gap-1.5">
                        <Plus size={14} /> Member
                    </button>
                </div>
            </div>

            {/* Compact KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    title="Total Members"
                    value={stats?.total_members || 0}
                    icon={Users}
                    color="blue"
                    trend="+12%"
                />
                <KpiCard
                    title="Active"
                    value={stats?.active || 0}
                    icon={UserCheck}
                    color="emerald"
                    trend="+5%"
                />
                <KpiCard
                    title="Pending"
                    value={stats?.pending || 0}
                    icon={Clock}
                    color="amber"
                    trend="Action"
                    isAction={true}
                />
                <KpiCard
                    title="Suspended"
                    value={stats?.suspended || 0}
                    icon={UserX}
                    color="red"
                    trend="-2%"
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Main Chart Section */}
                <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            <Activity size={16} className="text-emerald-600" /> Distribution
                        </h3>
                        <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
                            <button className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-white text-emerald-700 shadow-sm rounded">Now</button>
                            <button className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-400">History</button>
                        </div>
                    </div>

                    <div className="relative h-[250px] flex items-center justify-center">
                        <Doughnut data={statusData} options={chartOptions} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                            <span className="text-3xl font-black text-gray-900 tracking-tight">{stats?.total_members}</span>
                            <span className="text-[8px] text-gray-400 uppercase tracking-widest font-bold">Total</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-3">
                        <div className="bg-emerald-50/30 rounded-lg p-2.5 border border-emerald-100/50 flex items-center justify-between">
                            <div className="text-[9px] text-emerald-700 font-bold uppercase">Growth</div>
                            <div className="text-sm font-black text-emerald-800 flex items-center">
                                {stats?.growth}% <ArrowUpRight size={14} className="ml-0.5" />
                            </div>
                        </div>
                        <div className="bg-blue-50/30 rounded-lg p-2.5 border border-blue-100/50 flex items-center justify-between">
                            <div className="text-[9px] text-blue-700 font-bold uppercase">Retention</div>
                            <div className="text-sm font-black text-blue-800 flex items-center">
                                94% <TrendingUp size={14} className="ml-0.5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Recent Activity */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col max-h-[400px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 text-sm">Recent Members</h3>
                        <button className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider hover:underline">All</button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
                        {recentMembers.length === 0 ? (
                            <p className="text-center text-gray-400 text-xs py-12 italic">No recent registrations</p>
                        ) : (
                            recentMembers.map((member) => (
                                <div key={member.id} className="flex items-center p-2.5 hover:bg-gray-50 rounded-lg transition-all border border-transparent hover:border-gray-50 cursor-pointer group">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-400 font-bold text-[9px] ring-1 ring-white shadow-sm mr-3 flex-shrink-0">
                                        {member.first_name?.[0]}{member.last_name?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-900 truncate">{member.first_name} {member.last_name}</p>
                                        <p className="text-[9px] text-gray-400 font-medium truncate">{member.join_date}</p>
                                    </div>
                                    <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${member.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        member.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'
                                        }`}>
                                        {member.status}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="p-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl text-white shadow-sm relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                            <div className="flex items-start justify-between relative z-10">
                                <div>
                                    <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">CPD Status</p>
                                    <p className="font-bold text-sm">Compliance</p>
                                </div>
                                <Award className="text-emerald-400" size={16} />
                            </div>
                            <div className="mt-3 w-full bg-white/10 rounded-full h-1 relative z-10">
                                <div className="bg-emerald-500 h-1 rounded-full w-4/5 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

// Helper Components

const KpiCard = ({ title, value, icon: Icon, color, trend, isAction }) => {
    const colors = {
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
        red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' },
    };

    const c = colors[color] || colors.blue;

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-lg ${c.bg} ${c.text}`}>
                    <Icon size={16} />
                </div>
                {isAction ? (
                    <span className="bg-amber-100 text-amber-700 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded">
                        {trend}
                    </span>
                ) : (
                    <span className={`flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded ${trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {trend}
                        {trend.startsWith('+') ? <ArrowUpRight size={12} className="ml-0.5" /> : <TrendingUp size={12} className="ml-0.5 rotate-180" />}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">{value.toLocaleString()}</h3>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{title}</p>
            </div>
        </div>
    );
};

export default Dashboard;
