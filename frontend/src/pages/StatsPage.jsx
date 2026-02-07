import React from 'react';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import { TrendingUp, Users, Map, Calendar, Activity, CheckCircle } from 'lucide-react';

const StatsPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <LandingNavbar />

            <div className="flex-1 pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            <span className="text-sm font-bold text-blue-800 tracking-wide uppercase">Association Impact</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                            Our Impact in <span className="text-emerald-600">Numbers</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Transparency and growth are at the core of our mission. Explore the data that drives our commitment to the nursing profession.
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                        <StatCard number="15k+" label="Active Members" icon={Users} color="text-emerald-500" bg="bg-emerald-50" />
                        <StatCard number="47" label="Counties Covered" icon={Map} color="text-blue-500" bg="bg-blue-50" />
                        <StatCard number="500+" label="Training Events" icon={Calendar} color="text-amber-500" bg="bg-amber-50" />
                        <StatCard number="98%" label="Member Satisfaction" icon={Activity} color="text-purple-500" bg="bg-purple-50" />
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>

                        <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Growing Stronger Together</h2>
                                <p className="text-gray-600 leading-relaxed mb-8">
                                    Since our inception, NNAK has seen consistent growth in membership and engagement. Our digital transformation initiatives have further accelerated our ability to serve nurses across Kenya efficiently.
                                </p>
                                <ul className="space-y-4">
                                    <ListItem text="Over 2,000 new members joined in 2025" />
                                    <ListItem text="Partnetships with 50+ healthcare institutions" />
                                    <ListItem text="Disbursed over 5M in welfare support" />
                                </ul>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                                {/* Pseudograph for visual appeal */}
                                <div className="flex items-end justify-between h-64 gap-4 px-4">
                                    <Bar height="h-24" />
                                    <Bar height="h-32" />
                                    <Bar height="h-40" />
                                    <Bar height="h-36" />
                                    <Bar height="h-48" />
                                    <Bar height="h-56" />
                                    <Bar height="h-64" isActive />
                                </div>
                                <div className="flex justify-between mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <span>2019</span>
                                    <span>2020</span>
                                    <span>2021</span>
                                    <span>2022</span>
                                    <span>2023</span>
                                    <span>2024</span>
                                    <span className="text-emerald-600">2025</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
};

const StatCard = ({ number, label, icon: Icon, color, bg }) => (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all text-center group">
        <div className={`w-16 h-16 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
            <Icon className={`w-8 h-8 ${color}`} />
        </div>
        <div className={`text-4xl font-extrabold ${color} mb-2`}>{number}</div>
        <div className="text-gray-400 font-bold uppercase tracking-widest text-xs">{label}</div>
    </div>
);

const ListItem = ({ text }) => (
    <div className="flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        <span className="text-gray-700 font-medium">{text}</span>
    </div>
);

const Bar = ({ height, isActive }) => (
    <div className={`w-full bg-emerald-100 rounded-t-xl relative group transition-all hover:bg-emerald-200 ${height} ${isActive ? 'bg-gradient-to-t from-emerald-500 to-teal-400 shadow-lg shadow-emerald-200' : ''}`}>
        {isActive && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Record Growth
            </div>
        )}
    </div>
);

export default StatsPage;
