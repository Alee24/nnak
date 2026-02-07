import React, { useEffect, useState } from 'react';
import {
    TrendingUp, Users, MapPin, DollarSign,
    Calendar, Download, Filter, ArrowUpRight
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

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/analytics')
            .then(res => res.json())
            .then(res => {
                if (res.success) setData(res.data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!data) return <div className="text-center p-10">Failed to load analytics.</div>;

    // --- Chart Configurations ---

    // 1. Growth Line Chart
    const growthChartData = {
        labels: data.growth.map(d => d.month),
        datasets: [
            {
                label: 'New Members',
                data: data.growth.map(d => d.count),
                borderColor: '#10b981', // Emerald 500
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#10b981',
                pointBorderWidth: 2,
                pointRadius: 4,
            }
        ]
    };

    const growthOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#1f2937',
                bodyColor: '#1f2937',
                borderColor: '#e5e7eb',
                borderWidth: 1,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#f3f4f6' },
                ticks: { stepSize: 1 }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    // 2. Gender Doughnut
    const genderData = {
        labels: data.gender.map(d => d.gender),
        datasets: [{
            data: data.gender.map(d => d.count),
            backgroundColor: ['#3b82f6', '#ec4899', '#9ca3af'], // Blue, Pink, Gray
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    // 3. City Bar Chart
    const cityData = {
        labels: data.cities.map(d => d.city),
        datasets: [{
            label: 'Members',
            data: data.cities.map(d => d.count),
            backgroundColor: '#8b5cf6', // Violet 500
            borderRadius: 6,
        }]
    };

    return (

        <div className="flex flex-col h-full gap-4 animate-fade-in pb-8">
            {/* Header + Actions - High Density */}
            <div className="flex items-center justify-between px-1">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics Intelligence</h2>
                    <p className="text-xs text-[#E11D48] font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                        <span className="w-4 h-px bg-[#E11D48]/30"></span>
                        Data-Driven Performance Insights
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition shadow-sm">
                        <Calendar size={12} /> Last 12 Months
                    </button>
                    <button className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-[#E11D48] transition shadow-md">
                        <Download size={12} /> Export
                    </button>
                </div>
            </div>

            {/* Main Content Grid - Fills height */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-4 px-1">

                {/* Left Column: Data & Charts (Span 3) */}
                <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0">

                    {/* Revenue Row - High Density */}
                    <div className="grid grid-cols-3 gap-3 flex-shrink-0">
                        {/* Potential Revenue */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Potential</p>
                                    <h3 className="text-xl font-black text-slate-900 mt-1 leading-none tracking-tight">
                                        KES {parseInt(data.revenue.total_potential_revenue || 0).toLocaleString()}
                                    </h3>
                                </div>
                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                    <DollarSign size={16} />
                                </div>
                            </div>
                            <div className="mt-3 flex items-center text-[10px] text-emerald-600 font-black bg-emerald-50 px-2 py-0.5 rounded-md inline-block uppercase tracking-tighter">
                                <TrendingUp size={10} className="mr-1" /> +12.5%
                            </div>
                        </div>

                        {/* Realized Revenue */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Realized</p>
                                    <h3 className="text-xl font-black text-emerald-700 mt-1 leading-none tracking-tight">
                                        KES {parseInt(data.revenue.realized_revenue || 0).toLocaleString()}
                                    </h3>
                                </div>
                                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <DollarSign size={16} />
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1 mt-4">
                                <div className="bg-emerald-500 h-1 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                        </div>

                        {/* Pending Revenue */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Pending</p>
                                    <h3 className="text-xl font-black text-amber-600 mt-1 leading-none tracking-tight">
                                        KES {parseInt(data.revenue.pending_revenue || 0).toLocaleString()}
                                    </h3>
                                </div>
                                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                                    <DollarSign size={16} />
                                </div>
                            </div>
                            <button className="mt-3 text-[10px] font-black text-amber-700 hover:text-amber-900 uppercase tracking-widest">
                                View Invoices &rarr;
                            </button>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="flex-1 min-h-0 grid grid-rows-2 gap-4">
                        {/* Top: Growth Line */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col min-h-0 group">
                            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-[0.1em]">Membership Growth</h3>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Year-to-date Analysis</div>
                            </div>
                            <div className="flex-1 min-h-0 relative">
                                <Line data={growthChartData} options={{ ...growthOptions, maintainAspectRatio: false }} />
                            </div>
                        </div>

                        {/* Bottom: Gender & City */}
                        <div className="grid grid-cols-2 gap-4 min-h-0">
                            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col min-h-0 group">
                                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-[0.1em] mb-4 flex-shrink-0">Demographics</h3>
                                <div className="flex-1 min-h-0 relative flex items-center justify-center">
                                    <Doughnut
                                        data={genderData}
                                        options={{
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'right',
                                                    labels: {
                                                        boxWidth: 8,
                                                        font: { size: 9, weight: 'bold' },
                                                        usePointStyle: true,
                                                        color: '#64748b'
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col min-h-0 group">
                                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-[0.1em] mb-4 flex-shrink-0">Regional Distribution</h3>
                                <div className="flex-1 min-h-0 relative">
                                    <Bar
                                        data={cityData}
                                        options={{
                                            indexAxis: 'y',
                                            maintainAspectRatio: false,
                                            scales: {
                                                x: { display: false },
                                                y: {
                                                    grid: { display: false },
                                                    ticks: { font: { size: 9, weight: 'bold' }, color: '#64748b' }
                                                }
                                            },
                                            plugins: { legend: { display: false } }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Insights (Span 1) */}
                <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl flex flex-col h-full overflow-y-auto custom-scrollbar border border-slate-800 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#E11D48]/10 rounded-full blur-[40px] pointer-events-none"></div>

                    <h3 className="font-bold text-sm mb-6 flex items-center gap-2 relative z-10">
                        Platform Insights <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-black uppercase tracking-widest text-[#E11D48] border border-white/5">Alpha</span>
                    </h3>

                    <div className="space-y-4 relative z-10">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition group">
                            <p className="text-[10px] font-black text-emerald-400 mb-1.5 uppercase tracking-widest">Top Performer</p>
                            <p className="text-xs text-slate-300 leading-snug font-medium">
                                <span className="text-white font-black">{data.growth.sort((a, b) => b.count - a.count)[0]?.month || 'N/A'}</span> recorded a peak of <span className="text-emerald-400 font-black">+{data.growth.sort((a, b) => b.count - a.count)[0]?.count || 0}</span> new registrations.
                            </p>
                        </div>

                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition">
                            <p className="text-[10px] font-black text-blue-400 mb-1.5 uppercase tracking-widest">Regional Growth</p>
                            <p className="text-xs text-slate-300 leading-snug font-medium">
                                <span className="text-white font-black">{data.cities[0]?.city || 'N/A'}</span> leads regional engagement with consistent month-over-month growth.
                            </p>
                        </div>

                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition">
                            <p className="text-[10px] font-black text-amber-400 mb-1.5 uppercase tracking-widest">Collection Monitor</p>
                            <div className="flex items-end justify-between font-bold">
                                <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Outstanding</span>
                                <span className="text-xs text-white">KES {parseInt(data.revenue.pending_revenue || 0).toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-white/10 h-1.5 mt-2 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)]" style={{ width: '40%' }}></div>
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition">
                            <p className="text-[10px] font-black text-purple-400 mb-1.5 uppercase tracking-widest">Member Retention</p>
                            <p className="text-xs text-slate-300 leading-snug font-medium">
                                <span className="text-white font-black">95%</span> renewal rate for annual subscriptions detected in current quarter.
                            </p>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/5 relative z-10">
                        <button className="w-full py-2.5 bg-[#E11D48] hover:bg-[#F43F5E] rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-900/20 active:scale-95">
                            Generate Intelligence Report <ArrowUpRight size={12} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default Analytics;
