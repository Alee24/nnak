import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flag, Trophy, Clock, QrCode, Utensils, ShoppingBag, ShieldCheck, CheckCircle2, Award, Calendar, DollarSign } from 'lucide-react';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <LandingNavbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950"></div>
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            Premier Golf Club Management Platform
                        </div>

                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight">
                            Excellence on the Green. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
                                Seamless Club Operations.
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
                            MMS provides integrated management for members, online tee time bookings, tournament scorecards, handicaps, clubhouse dining, golf shop inventory, and financial billing in KES.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3.5 justify-center pt-4">
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center px-8 py-4 text-xs font-black uppercase tracking-widest rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/30 gap-2 group"
                            >
                                Member & Staff Portal
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/benefits"
                                className="inline-flex items-center justify-center px-8 py-4 text-xs font-black uppercase tracking-widest rounded-xl text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                            >
                                Explore Membership Tiers
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Features Grid */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    <div className="text-center max-w-2xl mx-auto space-y-3">
                        <h2 className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600">Integrated Golf ERP Suite</h2>
                        <p className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Everything required to manage a championship golf club</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* 1. Tee Times */}
                        <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all space-y-3">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                <Clock size={24} />
                            </div>
                            <h3 className="font-black text-slate-900 text-base">Online Tee Times & Daily Sheet</h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                Reserve tee slots, assign players, caddies, and carts with real-time double-booking prevention.
                            </p>
                        </div>

                        {/* 2. Tournaments & Leaderboards */}
                        <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all space-y-3">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                                <Trophy size={24} />
                            </div>
                            <h3 className="font-black text-slate-900 text-base">Competitions & Live Leaderboards</h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                Manage Stroke Play & Stableford competitions with live real-time leaderboards and starting flight sheets.
                            </p>
                        </div>

                        {/* 3. Digital Scorecards & Handicaps */}
                        <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all space-y-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                                <Flag size={24} />
                            </div>
                            <h3 className="font-black text-slate-900 text-base">Digital Scorecards & WHS Handicap</h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                Hole-by-hole score entry with automatic Gross/Net calculation, Stableford points, and handicap index tracking.
                            </p>
                        </div>

                        {/* 4. Digital Membership Card */}
                        <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all space-y-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                                <QrCode size={24} />
                            </div>
                            <h3 className="font-black text-slate-900 text-base">Digital QR Membership Cards</h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                Dynamic verified QR codes for seamless clubhouse check-in, guest passes, and member charging.
                            </p>
                        </div>

                        {/* 5. Restaurant & Clubhouse POS */}
                        <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all space-y-3">
                            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                                <Utensils size={24} />
                            </div>
                            <h3 className="font-black text-slate-900 text-base">Clubhouse Restaurant & Bar POS</h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                Table management, order processing, and direct room/member account charging with daily sales auditing.
                            </p>
                        </div>

                        {/* 6. Golf Pro Shop & Rentals */}
                        <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all space-y-3">
                            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                                <ShoppingBag size={24} />
                            </div>
                            <h3 className="font-black text-slate-900 text-base">Pro Shop Inventory & Rentals</h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                Equipment sales, inventory movements, low-stock alerts, and rental fleet tracking.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <LandingFooter />
        </div>
    );
};

export default LandingPage;
