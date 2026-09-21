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
        <div className="flex flex-col gap-5 animate-fade-in pb-12 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-serif font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                        <Flag className="text-emerald-700 dark:text-emerald-400" size={22} />
                        MMS Operations Center
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Daily course activity, golfer roster, and financial pulse
                    </p>
                </div>

                {/* Quick Action Shortcuts */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => navigate('/dashboard/tee-times')}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition shadow-xs flex items-center gap-1.5 active:scale-98"
                    >
                        <Clock size={14} strokeWidth={2} />
                        Tee Sheet
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/check-in')}
                        className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition shadow-xs flex items-center gap-1.5 active:scale-98"
                    >
                        <UserCheck size={14} strokeWidth={2} />
                        Golfer Check-In
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/members')}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition shadow-xs flex items-center gap-1.5"
                    >
                        <Plus size={14} strokeWidth={2} />
                        New Member
                    </button>
                </div>
            </div>

            {/* Top 4 KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. Total Members */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Registered Members</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                            <Users size={16} />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
                            {stats?.total_members || 524}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                            <ArrowUpRight size={12} /> +{stats?.growth || 14}%
                        </span>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">
                        {stats?.active || 486} active WHS profiles
                    </span>
                </div>

                {/* 2. Today's Flights */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Today's Tee Sheet</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                            <Clock size={16} />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
                            48
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                            Golfers Booked
                        </span>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">
                        82% Peak Flight Capacity
                    </span>
                </div>

                {/* 3. Active On Course */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active On Course</span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-400">
                            <UserCheck size={16} />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold font-serif text-amber-700 dark:text-amber-400">
                            28
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            In Play
                        </span>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">
                        7 flights across Holes 1–18
                    </span>
                </div>

                {/* 4. Monthly Revenue */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Monthly Billing</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                            <DollarSign size={16} />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
                            KES 4.85M
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                            <ArrowUpRight size={12} /> On Target
                        </span>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">
                        Dues, Green Fees & Dining
                    </span>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left: Today's Tee Sheet & Flights */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h3 className="font-serif font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                                <Clock size={16} className="text-emerald-700 dark:text-emerald-400" />
                                Live Flight Sheet & Timeline
                            </h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                Championship Course • First Tee to Sunset
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/tee-times')}
                            className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 text-xs font-semibold tracking-wide flex items-center gap-1"
                        >
                            Complete Schedule &rarr;
                        </button>
                    </div>

                    <div className="space-y-2">
                        {DEFAULT_TODAY_FLIGHTS.map((flight, idx) => (
                            <div
                                key={idx}
                                className="p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50/30 dark:hover:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors flex items-center justify-between text-xs"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 w-18 flex-shrink-0">
                                        {flight.time}
                                    </div>
                                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[11px] flex-shrink-0">
                                        {flight.hole}
                                    </span>
                                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                        {flight.players}
                                    </span>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ml-2 ${
                                    flight.status === 'On Course'
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40'
                                        : 'bg-blue-50 text-blue-800 border border-blue-200/70 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/40'
                                }`}>
                                    {flight.status}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Course Conditions Bar */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Championship Course</span>
                            <span className="font-semibold text-emerald-800 dark:text-emerald-300 block mt-0.5">Open • Greens 10.5 Stimp</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Executive 9-Hole</span>
                            <span className="font-semibold text-emerald-800 dark:text-emerald-300 block mt-0.5">Open • Fairways Good</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Course Weather</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">24°C • Fair Winds 8 km/h</span>
                        </div>
                    </div>
                </div>

                {/* Right: Membership Distribution & Recent Registrations */}
                <div className="flex flex-col gap-4">
                    {/* Distribution Card */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="font-serif font-bold text-slate-900 dark:text-white text-sm">
                                Membership Categories
                            </h3>
                            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                                WHS Active
                            </span>
                        </div>

                        <div className="h-40 relative flex items-center justify-center">
                            <Doughnut data={statusData} options={chartOptions} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold font-serif text-slate-900 dark:text-white leading-none">
                                    {stats?.total_members || 524}
                                </span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide mt-1">
                                    Total Members
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[#059669]"></span>
                                <span>Full: 280 (53%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]"></span>
                                <span>Social: 110 (21%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]"></span>
                                <span>Ladies: 75 (14%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-sm bg-[#8b5cf6]"></span>
                                <span>Junior: 59 (12%)</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Registrations */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 flex-1">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="font-serif font-bold text-slate-900 dark:text-white text-sm">
                                Recent Registrations
                            </h3>
                            <button
                                onClick={() => navigate('/dashboard/members')}
                                className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 text-xs font-medium"
                            >
                                View Directory
                            </button>
                        </div>

                        <div className="space-y-2">
                            {recentMembers.slice(0, 4).map((m) => (
                                <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-7 h-7 rounded-md bg-emerald-950 text-emerald-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                                            {m.first_name[0]}{m.last_name[0]}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-slate-900 dark:text-white truncate">{m.first_name} {m.last_name}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500">{m.membership_number || 'MMS Member'}</p>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex-shrink-0 ml-2">
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
