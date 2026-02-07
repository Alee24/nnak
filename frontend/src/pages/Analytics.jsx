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

        <div className="flex flex-col h-full gap-3 animate-fade-in-up">
            {/* Header + Actions */}
            <div className="flex items-center justify-between flex-shrink-0">
                <h2 className="text-lg font-bold text-gray-900">Analytics Overview</h2>
                <div className="flex gap-2">
                    <button className="flex items-center gap-1 bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition">
                        <Calendar size={14} /> Last 12 Months
                    </button>
                    <button className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-700 transition">
                        <Download size={14} /> Export
                    </button>
                </div>
            </div>

            {/* Main Content Grid - Fills height */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-3">

                {/* Left Column: Data & Charts (Span 3) */}
                <div className="lg:col-span-3 flex flex-col gap-3 h-full min-h-0">

                    {/* Revenue Row */}
                    <div className="grid grid-cols-3 gap-3 flex-shrink-0">
                        {/* Potential Revenue */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 text-[10px] font-medium uppercase">Potential</p>
                                    <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                                        KES {parseInt(data.revenue.total_potential_revenue || 0).toLocaleString()}
                                    </h3>
                                </div>
                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                    <DollarSign size={16} />
                                </div>
                            </div>
                            <div className="mt-2 flex items-center text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded inline-block">
                                <TrendingUp size={10} className="mr-1" /> +12.5%
                            </div>
                        </div>

                        {/* Realized Revenue */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 text-[10px] font-medium uppercase">Realized</p>
                                    <h3 className="text-lg font-bold text-emerald-700 mt-0.5">
                                        KES {parseInt(data.revenue.realized_revenue || 0).toLocaleString()}
                                    </h3>
                                </div>
                                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <DollarSign size={16} />
                                </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1 mt-3">
                                <div className="bg-emerald-500 h-1 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                        </div>

                        {/* Pending Revenue */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 text-[10px] font-medium uppercase">Pending</p>
                                    <h3 className="text-lg font-bold text-amber-600 mt-0.5">
                                        KES {parseInt(data.revenue.pending_revenue || 0).toLocaleString()}
                                    </h3>
                                </div>
                                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                                    <DollarSign size={16} />
                                </div>
                            </div>
                            <button className="mt-2 text-[10px] font-bold text-amber-700 hover:underline">
                                View Invoices &rarr;
                            </button>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="flex-1 min-h-0 grid grid-rows-2 gap-3">
                        {/* Top: Growth Line */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col min-h-0">
                            <h3 className="font-bold text-gray-900 text-sm mb-2 flex-shrink-0">Membership Growth</h3>
                            <div className="flex-1 min-h-0 relative">
                                <Line data={growthChartData} options={{ ...growthOptions, maintainAspectRatio: false }} />
                            </div>
                        </div>

                        {/* Bottom: Gender & City */}
                        <div className="grid grid-cols-2 gap-3 min-h-0">
                            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col min-h-0">
                                <h3 className="font-bold text-gray-900 text-sm mb-2 flex-shrink-0">Gender</h3>
                                <div className="flex-1 min-h-0 relative flex items-center justify-center">
                                    <Doughnut
                                        data={genderData}
                                        options={{
                                            maintainAspectRatio: false,
                                            plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } } }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col min-h-0">
                                <h3 className="font-bold text-gray-900 text-sm mb-2 flex-shrink-0">Top Regions</h3>
                                <div className="flex-1 min-h-0 relative">
                                    <Bar
                                        data={cityData}
                                        options={{
                                            indexAxis: 'y',
                                            maintainAspectRatio: false,
                                            scales: { x: { display: false }, y: { ticks: { font: { size: 10 } } } },
                                            plugins: { legend: { display: false } }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Insights (Span 1) */}
                <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-4 rounded-xl text-white shadow-xl flex flex-col h-full overflow-y-auto custom-scrollbar">
                    <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                        AI Insights <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">Beta</span>
                    </h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition">
                            <p className="text-xs font-bold text-emerald-300 mb-0.5">Top Month</p>
                            <p className="text-[11px] text-gray-300 leading-snug">
                                <span className="text-white font-bold">{data.growth.sort((a, b) => b.count - a.count)[0]?.month || 'N/A'}</span> saw +{data.growth.sort((a, b) => b.count - a.count)[0]?.count || 0} members.
                            </p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition">
                            <p className="text-xs font-bold text-blue-300 mb-0.5">Growth Zone</p>
                            <p className="text-[11px] text-gray-300 leading-snug">
                                <span className="text-white font-bold">{data.cities[0]?.city || 'N/A'}</span> is trending up.
                            </p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition">
                            <p className="text-xs font-bold text-amber-300 mb-0.5">Revenue Monitor</p>
                            <div className="flex items-end justify-between">
                                <span className="text-[10px] text-gray-400">Pending</span>
                                <span className="text-sm font-bold text-white">KES {parseInt(data.revenue.pending_revenue || 0).toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-white/10 h-1 mt-1 rounded-full">
                                <div className="bg-amber-400 h-1 rounded-full" style={{ width: '40%' }}></div>
                            </div>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition">
                            <p className="text-xs font-bold text-purple-300 mb-1">User Retention</p>
                            <p className="text-[11px] text-gray-300 leading-snug">
                                95% of members renewed their Annual subscription this month.
                            </p>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/10">
                        <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition flex items-center justify-center gap-2">
                            Generate Full Report <ArrowUpRight size={12} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default Analytics;
