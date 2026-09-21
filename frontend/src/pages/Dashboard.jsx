import React, { useEffect, useState } from 'react';
import {
    Users, UserCheck, Clock, Flag, Trophy,
    DollarSign, ArrowUpRight, Activity, TrendingUp,
    Plus, Download, CheckCircle, Calendar, UserPlus,
    FileText, Sparkles, MapPin, Sun, Shield
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler);

const DEFAULT_TODAY_FLIGHTS = [
    { time: '06:30 AM', hole: 'Hole #1', players: 'Dr. Arthur Mwangi, Peter Kiprono', status: 'On Course' },
    { time: '06:42 AM', hole: 'Hole #1', players: 'David Mutua, Kevin O., Brian L., Samuel K.', status: 'On Course' },
    { time: '07:18 AM', hole: 'Hole #1', players: 'Sarah Wanjiku, Faith Chebet, Lucy Auma', status: 'On Course' },
    { time: '07:42 AM', hole: 'Hole #10', players: 'Alex Metto, George Otieno, Collins Korir', status: 'On Course' },
    { time: '08:30 AM', hole: 'Hole #1', players: 'Daniel Koech, Evans Ruto', status: 'Booked' },
    { time: '09:15 AM', hole: 'Hole #1', players: 'Ladies Captain Invitational Flight', status: 'Booked' }
];

const DEFAULT_RECENT_MEMBERS = [
    { id: 1, first_name: 'Alex', last_name: 'Metto', membership_number: 'MMS-0042', join_date: '2025-09-18', status: 'active', handicap: 6.4 },
    { id: 2, first_name: 'Dr. Arthur', last_name: 'Mwangi', membership_number: 'MMS-0015', join_date: '2025-09-15', status: 'active', handicap: 8.2 },
    { id: 3, first_name: 'Sarah', last_name: 'Wanjiku', membership_number: 'MMS-0088', join_date: '2025-09-12', status: 'active', handicap: 14.1 },
    { id: 4, first_name: 'Kevin', last_name: 'Omondi', membership_number: 'MMS-0033', join_date: '2025-09-10', status: 'active', handicap: 11.0 },
    { id: 5, first_name: 'Faith', last_name: 'Chebet', membership_number: 'MMS-0104', join_date: '2025-09-08', status: 'active', handicap: 16.0 },
];

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [recentMembers, setRecentMembers] = useState(DEFAULT_RECENT_MEMBERS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('/api/dashboard');
                const data = await response.json();
                if (data.success) {
                    setStats(data.stats);
                    if (data.recent_members?.length) setRecentMembers(data.recent_members);
                } else {
                    setStats({
                        total_members: 524,
                        active: 486,
                        pending: 24,
                        suspended: 14,
                        growth: 14.2
                    });
                }
            } catch (err) {
                setStats({
                    total_members: 524,
                    active: 486,
                    pending: 24,
                    suspended: 14,
                    growth: 14.2
                });
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const statusData = {
        labels: ['Full Members', 'Social Members', 'Lady Members', 'Junior / Senior'],
        datasets: [
            {
                data: [280, 110, 75, 59],
                backgroundColor: ['#059669', '#3b82f6', '#f59e0b', '#8b5cf6'],
                borderWidth: 0,
                hoverOffset: 4
            },
        ],
    };

    const chartOptions = {
        cutout: '76%',
        plugins: { legend: { display: false } },
        maintainAspectRatio: false
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-80">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin"></div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading MMS Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-12 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Flag className="text-emerald-600" size={26} />
                        MMS Golf Club Management Center
                    </h1>
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                        <span className="w-3 h-px bg-emerald-600"></span>
                        Executive Operations & Daily Clubhouse Overview
                    </p>
                </div>

                {/* Quick Shortcuts */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => navigate('/dashboard/tee-times')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 active:scale-95"
                    >
                        <Clock size={13} strokeWidth={2.5} />
                        Tee Sheet
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/checkin')}
                        className="bg-slate-900 dark:bg-slate-700 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 active:scale-95"
                    >
                        <UserCheck size={13} strokeWidth={2.5} />
                        Check-In Golfer
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/members')}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition shadow-sm flex items-center gap-1.5"
                    >
                        <Plus size={13} strokeWidth={2.5} />
                        New Member
                    </button>
                </div>
            </div>

            {/* Top 4 KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Registered Members</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                            <Users size={16} />
                        </div>
                    </div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none block mt-2">
                        {stats?.total_members || 524}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-1.5 flex items-center gap-1">
                        <ArrowUpRight size={12} /> +{stats?.growth || 14}% this year
                    </span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Today's Tee Sheet</span>
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                            <Clock size={16} />
                        </div>
                    </div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none block mt-2">
                        48 Golfers
                    </span>
                    <span className="text-[10px] text-blue-600 font-bold block mt-1.5">
                        82% Peak Flight Capacity
                    </span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active On Course</span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600">
                            <UserCheck size={16} />
                        </div>
                    </div>
                    <span className="text-2xl font-black text-amber-600 leading-none block mt-2">
                        28 Golfers
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-1.5">
                        7 Active Flights In Play
                    </span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Monthly Revenue</span>
                        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600">
                            <DollarSign size={16} />
                        </div>
                    </div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none block mt-2">
                        KES 4.85M
                    </span>
                    <span className="text-[10px] text-purple-600 font-bold block mt-1.5 flex items-center gap-1">
                        <ArrowUpRight size={12} /> Dues, Green Fees & F&B
                    </span>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left: Today's Tee Sheet & Flights */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-serif font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                                <Clock size={16} className="text-emerald-600" />
                                Today’s Live Tee Sheet & Course Timeline
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                Championship Course • First Tee to Sunset
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/tee-times')}
                            className="text-emerald-600 hover:text-emerald-700 text-xs font-black uppercase tracking-wider"
                        >
                            Full Sheet →
                        </button>
                    </div>

                    <div className="space-y-2.5">
                        {DEFAULT_TODAY_FLIGHTS.map((flight, idx) => (
                            <div
                                key={idx}
                                className="p-3 bg-slate-50 dark:bg-slate-700/40 hover:bg-white dark:hover:bg-slate-700 rounded-xl border border-slate-100 dark:border-white/5 transition flex items-center justify-between text-xs"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="font-black text-slate-900 dark:text-white font-mono text-xs w-20">
                                        {flight.time}
                                    </div>
                                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                                        {flight.hole}
                                    </span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                                        {flight.players}
                                    </span>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                    flight.status === 'On Course'
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                                }`}>
                                    {flight.status}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Course Conditions Bar */}
                    <div className="pt-2 border-t border-slate-100 dark:border-white/5 grid grid-cols-3 gap-3 text-center text-xs">
                        <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl">
                            <span className="text-[9px] font-black uppercase text-emerald-800 dark:text-emerald-400 block">Championship Course</span>
                            <span className="font-black text-emerald-700 dark:text-emerald-300 block mt-0.5">Open • Greens 10.5 Stimp</span>
                        </div>
                        <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl">
                            <span className="text-[9px] font-black uppercase text-emerald-800 dark:text-emerald-400 block">Executive 9-Hole</span>
                            <span className="font-black text-emerald-700 dark:text-emerald-300 block mt-0.5">Open • Fairways Good</span>
                        </div>
                        <div className="p-2.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl">
                            <span className="text-[9px] font-black uppercase text-amber-800 dark:text-amber-400 block">Weather Conditions</span>
                            <span className="font-black text-amber-700 dark:text-amber-300 block mt-0.5">24°C • Light Breeze 8km/h</span>
                        </div>
                    </div>
                </div>

                {/* Right: Membership Distribution & Quick Actions */}
                <div className="flex flex-col gap-4">
                    {/* Distribution Card */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-serif font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                                Member Category Breakdown
                            </h3>
                            <span className="text-[9px] font-black text-emerald-600 uppercase">Active WHS</span>
                        </div>

                        <div className="h-44 relative flex items-center justify-center">
                            <Doughnut data={statusData} options={chartOptions} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                                    {stats?.total_members || 524}
                                </span>
                                <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest mt-1">
                                    Total Golfers
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-white/5">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                <span>Full: 280 (53%)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span>Social: 110 (21%)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                <span>Ladies: 75 (14%)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                <span>Junior: 59 (12%)</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Member Arrivals */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-3 flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="font-serif font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                                Recent Registrations
                            </h3>
                            <button
                                onClick={() => navigate('/dashboard/members')}
                                className="text-emerald-600 hover:text-emerald-700 text-[10px] font-black uppercase"
                            >
                                View All
                            </button>
                        </div>

                        <div className="space-y-2">
                            {recentMembers.slice(0, 4).map((m) => (
                                <div key={m.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-700/40 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 flex items-center justify-center font-black text-[10px]">
                                            {m.first_name[0]}{m.last_name[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{m.first_name} {m.last_name}</p>
                                            <p className="text-[9px] text-slate-400">{m.membership_number || 'MMS Member'}</p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-black uppercase text-emerald-600">
                                        HCP {m.handicap || 18.0}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
