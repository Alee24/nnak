import React, { useEffect, useState } from 'react';
import {
    TrendingUp, Users, MapPin, DollarSign,
    Calendar, Download, Filter, ArrowUpRight,
    Flag, Clock, Activity, Award, Trophy
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, ArcElement, Filler
);

const DEFAULT_ANALYTICS = {
    rounds_by_month: [
        { month: 'Jan', count: 420 },
        { month: 'Feb', count: 480 },
        { month: 'Mar', count: 530 },
        { month: 'Apr', count: 610 },
        { month: 'May', count: 580 },
        { month: 'Jun', count: 640 },
        { month: 'Jul', count: 720 },
        { month: 'Aug', count: 810 },
        { month: 'Sep', count: 790 }
    ],
    handicap_distribution: [
        { category: 'Plus & Scratch (≤0)', count: 18 },
        { category: 'Single Digit (1–9)', count: 142 },
        { category: 'Mid Handicap (10–18)', count: 224 },
        { category: 'High Handicap (19–36)', count: 140 }
    ],
    revenue_breakdown: [
        { label: 'Subscriptions', amount: 6800000 },
        { label: 'Green Fees', amount: 3450000 },
        { label: 'F&B Dining', amount: 2350000 },
        { label: 'Pro Shop', amount: 1250000 },
        { label: 'Tournaments', amount: 1000000 }
    ],
    course_utilization: [
        { day: 'Mon', rate: 45 },
        { day: 'Tue', rate: 60 },
        { day: 'Wed', rate: 68 },
        { day: 'Thu', rate: 72 },
        { day: 'Fri', rate: 88 },
        { day: 'Sat', rate: 96 },
        { day: 'Sun', rate: 94 }
    ]
};

const Analytics = () => {
    const [analytics, setAnalytics] = useState(DEFAULT_ANALYTICS);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/api/analytics')
            .then(res => res.json())
            .then(res => {
                if (res?.success && res?.data) setAnalytics(res.data);
            })
            .catch(err => console.warn("Using fallback analytics:", err));
    }, []);

    // Rounds Played Chart
    const roundsData = {
        labels: analytics.rounds_by_month.map(d => d.month),
        datasets: [
            {
                label: '18-Hole Rounds Played',
                data: analytics.rounds_by_month.map(d => d.count),
                borderColor: '#059669',
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    // Handicap Doughnut
    const hcpData = {
        labels: analytics.handicap_distribution.map(d => d.category),
        datasets: [
            {
                data: analytics.handicap_distribution.map(d => d.count),
                backgroundColor: ['#8b5cf6', '#059669', '#3b82f6', '#f59e0b'],
                borderWidth: 0
            }
        ]
    };

    // Utilization Bar
    const utilData = {
        labels: analytics.course_utilization.map(d => d.day),
        datasets: [
            {
                label: 'Course Utilization %',
                data: analytics.course_utilization.map(d => d.rate),
                backgroundColor: '#059669',
                borderRadius: 8
            }
        ]
    };

    return (
        <div className="flex flex-col gap-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Activity className="text-emerald-600" size={24} />
                        Club Analytics & Performance Metrics
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
                        MMS Golf Club • Operational, Golf & Financial Intelligence
                    </p>
                </div>

                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition shadow-sm active:scale-95"
                >
                    <Download size={14} />
                    Export Analytics
                </button>
            </div>

            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Total Active Golfers</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none block mt-1">
                        524 Members
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-1.5 flex items-center gap-1">
                        <ArrowUpRight size={12} /> +14.2% Member Growth
                    </span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Annual Rounds Played</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none block mt-1">
                        5,580 Rounds
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-1.5">
                        Average 18.2 rounds / member
                    </span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Peak Weekend Utilization</span>
                    <span className="text-2xl font-black text-emerald-600 leading-none block mt-1">
                        95.4%
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-1.5">
                        Saturday & Sunday Mornings
                    </span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Fiscal Year Revenue</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none block mt-1">
                        KES 14.85M
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-1.5 flex items-center gap-1">
                        <ArrowUpRight size={12} /> +18% Above Budget
                    </span>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rounds Played Trend */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-serif font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                            <Flag size={16} className="text-emerald-600" />
                            Monthly Rounds Played (2025)
                        </h3>
                        <span className="text-[10px] font-black uppercase text-emerald-600">Season High: Aug (810)</span>
                    </div>
                    <div className="h-64">
                        <Line
                            data={roundsData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } }
                            }}
                        />
                    </div>
                </div>

                {/* Course Utilization by Day */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-serif font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                            <Clock size={16} className="text-emerald-600" />
                            Tee Sheet Utilization % by Day
                        </h3>
                        <span className="text-[10px] font-black uppercase text-slate-400">Peak Days: Fri – Sun</span>
                    </div>
                    <div className="h-64">
                        <Bar
                            data={utilData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } }
                            }}
                        />
                    </div>
                </div>

                {/* Handicap Index Distribution */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-serif font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                            <Trophy size={16} className="text-amber-500" />
                            WHS Handicap Index Distribution
                        </h3>
                        <span className="text-[10px] font-black uppercase text-slate-400">524 Players</span>
                    </div>
                    <div className="h-56 relative flex items-center justify-center">
                        <Doughnut
                            data={hcpData}
                            options={{
                                cutout: '70%',
                                maintainAspectRatio: false,
                                plugins: { legend: { position: 'bottom' } }
                            }}
                        />
                    </div>
                </div>

                {/* Department Revenue Contribution */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4 flex flex-col justify-between">
                    <div>
                        <h3 className="font-serif font-black text-slate-900 dark:text-white text-base flex items-center gap-2 mb-3">
                            <DollarSign size={16} className="text-emerald-600" />
                            Annual Revenue Stream Distribution
                        </h3>
                        <div className="space-y-3">
                            {analytics.revenue_breakdown.map((rev, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{rev.label}</span>
                                    <span className="font-black text-slate-900 dark:text-white">
                                        KES {Number(rev.amount).toLocaleString()}
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

export default Analytics;
