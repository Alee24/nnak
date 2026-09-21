import React, { useEffect, useState, useRef } from 'react';
import {
    Award, Calendar, CreditCard, ChevronRight,
    Download, Activity, Clock, Shield,
    ArrowUpRight, Star, FileText, User,
    Zap, ExternalLink, Printer, Flag, Trophy,
    CheckCircle, Plus, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';

const DEFAULT_MEMBER_DATA = {
    summary: {
        first_name: 'Alex',
        last_name: 'Metto',
        member_id: 'MMS-0042',
        membership_type: 'Full Championship Member',
        status: 'active',
        handicap_index: 6.4,
        rounds_played: 24,
        best_gross: 71,
        account_balance: 0,
        expiry_date: '2026-08-31'
    },
    upcoming_tee_time: {
        date: '2025-09-27',
        time: '07:42 AM',
        course: 'Championship 18-Hole Course',
        hole: 'Hole #1',
        partners: 'George Otieno (HCP 3.1), Collins Korir (HCP 9.0), Dr. Arthur Mwangi (HCP 8.2)'
    },
    recent_scores: [
        { date: '2025-09-20', course: 'Championship Course', gross: 74, net: 67, points: 39, marker: 'Collins Korir' },
        { date: '2025-09-13', course: 'Championship Course', gross: 71, net: 65, points: 41, marker: 'George Otieno' },
        { date: '2025-09-06', course: 'Championship Course', gross: 77, net: 70, points: 36, marker: 'Dr. Arthur Mwangi' },
        { date: '2025-08-30', course: 'Executive 9-Hole', gross: 35, net: 32, points: 20, marker: 'Peter Kiprono' }
    ],
    upcoming_events: [
        { id: 1, title: 'MMS Monthly Mug — September 2025', date: '2025-09-27', fee: 3500, status: 'Registered' },
        { id: 2, title: 'Captains Invitational Trophy 2025', date: '2025-10-11', fee: 5000, status: 'Open' }
    ],
    recent_payments: [
        { date: '2025-09-03', description: 'Annual Membership Subscription Renewal', amount: 85000, status: 'Completed', ref: 'RCP-0411' },
        { date: '2025-09-12', description: 'Clubhouse Fairway Dining Tab', amount: 6500, status: 'Completed', ref: 'RCP-0452' }
    ]
};

const MemberDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(DEFAULT_MEMBER_DATA);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setUser(parsed);
                if (parsed.first_name) {
                    setData(prev => ({
                        ...prev,
                        summary: {
                            ...prev.summary,
                            first_name: parsed.first_name,
                            last_name: parsed.last_name || '',
                            member_id: parsed.membership_number || parsed.member_id || 'MMS-0042'
                        }
                    }));
                }
            } catch (e) { }
        }

        const fetchMemberSummary = async () => {
            try {
                const res = await AdminAPI.getMemberDashboardSummary();
                if (res?.data || res?.summary) {
                    setData(prev => ({ ...prev, ...(res.data || res) }));
                }
            } catch (e) {
                console.warn("Using fallback member data:", e);
            }
        };
        fetchMemberSummary();
    }, []);

    const s = data.summary || DEFAULT_MEMBER_DATA.summary;

    return (
        <div className="flex flex-col gap-5 pb-12 animate-fade-in max-w-[1500px] mx-auto">
            {/* Member Profile Hero Card */}
            <div className="bg-emerald-950 text-white rounded-xl p-5 lg:p-6 shadow-xs relative overflow-hidden border border-emerald-900/80">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg bg-emerald-900/80 border border-emerald-700/50 flex items-center justify-center font-serif font-bold text-xl text-emerald-200 shadow-xs flex-shrink-0">
                            {s.first_name?.[0] || 'M'}{s.last_name?.[0] || 'G'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl lg:text-2xl font-serif font-bold tracking-tight">
                                    {s.first_name} {s.last_name}
                                </h1>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-900 text-emerald-300 border border-emerald-700/50">
                                    {s.status}
                                </span>
                            </div>
                            <p className="text-xs text-emerald-100/80 font-medium mt-0.5">
                                {s.member_id} • {s.membership_type}
                            </p>
                            <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
                                MMS Golf Club • Member In Good Standing
                            </p>
                        </div>
                    </div>

                    {/* Handicap Badge & Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="bg-emerald-900/60 px-4 py-2.5 rounded-lg border border-emerald-800/80 text-center">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-300 block">
                                WHS Handicap Index
                            </span>
                            <span className="text-2xl font-bold font-serif tracking-tight text-white block">
                                {s.handicap_index}
                            </span>
                            <span className="text-[10px] text-emerald-200/70 block">
                                Course HCP: 7
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={() => navigate('/dashboard/tee-times')}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition shadow-xs flex items-center justify-center gap-1.5 active:scale-98"
                            >
                                <Clock size={14} />
                                Book Tee Slot
                            </button>
                            <button
                                onClick={() => navigate('/dashboard/scorecards')}
                                className="bg-emerald-900/60 hover:bg-emerald-900 text-white border border-emerald-700/50 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition flex items-center justify-center gap-1.5"
                            >
                                <FileText size={14} />
                                Post Scorecard
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Handicap Index</span>
                    <span className="text-2xl font-bold font-serif text-slate-900 dark:text-white leading-none block">
                        {s.handicap_index}
                    </span>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium block mt-1.5 flex items-center gap-1">
                        <ArrowUpRight size={12} /> Low this season: 5.8
                    </span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Rounds Played 2025</span>
                    <span className="text-2xl font-bold font-serif text-slate-900 dark:text-white leading-none block">
                        {s.rounds_played} Rounds
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block mt-1.5">
                        Avg Gross Score: 74.8
                    </span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Season Best Gross</span>
                    <span className="text-2xl font-bold font-serif text-emerald-700 dark:text-emerald-400 leading-none block">
                        {s.best_gross} Gross
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block mt-1.5">
                        -1 Under Par (Championship Course)
                    </span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Member Ledger Balance</span>
                    <span className="text-2xl font-bold font-serif text-slate-900 dark:text-white leading-none block">
                        KES {Number(s.account_balance).toLocaleString()}
                    </span>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium block mt-1.5">
                        Dues Up to Date
                    </span>
                </div>
            </div>

            {/* Next Scheduled Tee Time Alert Card */}
            {data.upcoming_tee_time && (
                <div className="bg-emerald-50/60 dark:bg-slate-900 p-4 rounded-xl border border-emerald-200/70 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-emerald-800 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                            <Clock size={18} />
                        </div>
                        <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
                                Your Next Scheduled Flight
                            </span>
                            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white mt-0.5">
                                {data.upcoming_tee_time.date} at {data.upcoming_tee_time.time} — {data.upcoming_tee_time.hole}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                                {data.upcoming_tee_time.course}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Flight Players: {data.upcoming_tee_time.partners}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/dashboard/tee-times')}
                            className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold tracking-wide shadow-xs transition"
                        >
                            View Tee Sheet
                        </button>
                    </div>
                </div>
            )}

            {/* Main Portal Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Recent Scores Matrix */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h3 className="font-serif font-bold text-slate-900 dark:text-white text-base">
                                Recent Scores & Handicap Record
                            </h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                Official qualifying rounds recorded for WHS handicap
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/scorecards')}
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
                        >
                            All Scorecards &rarr;
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-white/5 text-[9px] font-black uppercase tracking-wider text-slate-400">
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Course</th>
                                    <th className="p-3 text-center">Gross</th>
                                    <th className="p-3 text-center font-black text-emerald-600">Net</th>
                                    <th className="p-3 text-center">Points</th>
                                    <th className="p-3">Attesting Marker</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {data.recent_scores.map((sc, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                                        <td className="p-3 text-slate-500 font-medium">{sc.date}</td>
                                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{sc.course}</td>
                                        <td className="p-3 text-center font-black text-slate-900 dark:text-white">{sc.gross}</td>
                                        <td className="p-3 text-center font-black text-emerald-600 text-sm">{sc.net}</td>
                                        <td className="p-3 text-center font-black text-amber-600">{sc.points}</td>
                                        <td className="p-3 text-slate-500 text-[11px]">{sc.marker}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column: Upcoming Tournaments & Quick Shortcuts */}
                <div className="space-y-4">
                    {/* Tournaments Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="font-serif font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                                <Trophy size={14} className="text-amber-500" />
                                Upcoming Tournaments
                            </h3>
                            <button
                                onClick={() => navigate('/dashboard/competitions')}
                                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
                            >
                                Calendar
                            </button>
                        </div>

                        <div className="space-y-2">
                            {data.upcoming_events.map((ev) => (
                                <div key={ev.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold text-slate-900 dark:text-white text-xs leading-snug">
                                            {ev.title}
                                        </h4>
                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                            {ev.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                                        <span>{ev.date}</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">Entry: KES {ev.fee.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Services Grid */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 space-y-3">
                        <h3 className="font-serif font-bold text-slate-900 dark:text-white text-sm pb-2 border-b border-slate-100 dark:border-slate-800">
                            Member Services
                        </h3>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => navigate('/dashboard/statements')}
                                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-left transition border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800"
                            >
                                <CreditCard size={15} className="text-emerald-700 dark:text-emerald-400 mb-1" />
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Statement</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Monthly ledger</span>
                            </button>

                            <button
                                onClick={() => navigate('/dashboard/facilities')}
                                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-left transition border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800"
                            >
                                <Calendar size={15} className="text-emerald-700 dark:text-emerald-400 mb-1" />
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Facilities</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Book courts & halls</span>
                            </button>

                            <button
                                onClick={() => navigate('/dashboard/guests')}
                                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-left transition border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800"
                            >
                                <User size={15} className="text-emerald-700 dark:text-emerald-400 mb-1" />
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Guests</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Invite guest golfers</span>
                            </button>

                            <button
                                onClick={() => navigate('/dashboard/leaderboard')}
                                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-left transition border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800"
                            >
                                <Trophy size={15} className="text-emerald-700 dark:text-emerald-400 mb-1" />
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Leaderboard</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Club standings</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;
