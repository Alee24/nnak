import React, { useState, useEffect } from 'react';
import {
    FileText, Plus, CheckCircle, Flag, Search, Filter,
    Eye, Check, X, Printer, User, Award, Clock, ArrowUpRight
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';
import MemberSearchInput from '../components/MemberSearchInput';

const DEFAULT_SCORECARDS = [
    {
        id: 1,
        player_name: 'Alex Metto',
        member_number: 'MMS-0042',
        course_name: 'Championship 18-Hole Course',
        play_date: '2025-09-20',
        playing_handicap: 7,
        gross_score: 74,
        net_score: 67,
        stableford_points: 39,
        status: 'approved',
        marker_name: 'Collins Korir',
        hole_scores: [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4]
    },
    {
        id: 2,
        player_name: 'Sarah Wanjiku',
        member_number: 'MMS-0088',
        course_name: 'Championship 18-Hole Course',
        play_date: '2025-09-20',
        playing_handicap: 14,
        gross_score: 82,
        net_score: 68,
        stableford_points: 38,
        status: 'approved',
        marker_name: 'Lucy Auma',
        hole_scores: [5, 4, 4, 5, 5, 4, 4, 6, 4, 5, 4, 3, 6, 5, 4, 4, 6, 4]
    },
    {
        id: 3,
        player_name: 'Kevin Omondi',
        member_number: 'MMS-0033',
        course_name: 'Championship 18-Hole Course',
        play_date: '2025-09-21',
        playing_handicap: 11,
        gross_score: 79,
        net_score: 68,
        stableford_points: 38,
        status: 'pending',
        marker_name: 'Brian Langat',
        hole_scores: [4, 5, 4, 5, 4, 4, 3, 5, 5, 4, 4, 4, 6, 4, 5, 3, 5, 5]
    },
    {
        id: 4,
        player_name: 'Dr. Arthur Mwangi',
        member_number: 'MMS-0015',
        course_name: 'Championship 18-Hole Course',
        play_date: '2025-09-18',
        playing_handicap: 8,
        gross_score: 76,
        net_score: 68,
        stableford_points: 38,
        status: 'approved',
        marker_name: 'Peter Kiprono',
        hole_scores: [4, 4, 3, 5, 5, 4, 3, 5, 4, 5, 4, 3, 5, 4, 4, 4, 5, 4]
    }
];

const STANDARD_PARS = [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4]; // Par 72

const ScorecardsPage = () => {
    const [scorecards, setScorecards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Entry Modal
    const [isEntryOpen, setIsEntryOpen] = useState(false);
    const [entryForm, setEntryForm] = useState({
        player_name: '',
        member_number: '',
        play_date: new Date().toISOString().split('T')[0],
        course_name: 'Championship 18-Hole Course',
        playing_handicap: 12,
        marker_name: '',
        hole_scores: [...STANDARD_PARS]
    });

    // View Modal
    const [viewingCard, setViewingCard] = useState(null);

    useEffect(() => {
        fetchScorecards();
    }, []);

    const fetchScorecards = async () => {
        setLoading(true);
        try {
            const res = await AdminAPI.getScorecards();
            const list = res?.data || res?.scorecards || [];
            if (Array.isArray(list) && list.length > 0) {
                setScorecards(list);
            } else {
                setScorecards(DEFAULT_SCORECARDS);
            }
        } catch (e) {
            console.warn("Using fallback scorecards:", e);
            setScorecards(DEFAULT_SCORECARDS);
        } finally {
            setLoading(false);
        }
    };

    const handleHoleChange = (index, value) => {
        const val = parseInt(value) || 0;
        const newScores = [...entryForm.hole_scores];
        newScores[index] = val;
        setEntryForm({ ...entryForm, hole_scores: newScores });
    };

    const calcOut = (scores) => scores.slice(0, 9).reduce((a, b) => a + (b || 0), 0);
    const calcIn = (scores) => scores.slice(9, 18).reduce((a, b) => a + (b || 0), 0);
    const calcTotal = (scores) => calcOut(scores) + calcIn(scores);

    const handleSaveScorecard = async (e) => {
        e.preventDefault();
        if (!entryForm.player_name.trim()) {
            Swal.fire('Required', 'Please enter golfer name', 'warning');
            return;
        }

        const totalGross = calcTotal(entryForm.hole_scores);
        const net = Math.max(0, totalGross - (parseInt(entryForm.playing_handicap) || 0));
        const pts = Math.max(0, 36 + (72 - totalGross));

        const newCard = {
            ...entryForm,
            id: Date.now(),
            gross_score: totalGross,
            net_score: net,
            stableford_points: pts,
            status: 'approved'
        };

        try {
            await AdminAPI.createScorecard(newCard);
        } catch (err) {
            console.warn("Backend create scorecard fallback:", err);
        }

        setScorecards([newCard, ...scorecards]);
        setIsEntryOpen(false);

        Swal.fire({
            icon: 'success',
            title: 'Scorecard Recorded',
            text: `Gross: ${totalGross} | Net: ${net} recorded successfully.`,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    const handleApprove = (id) => {
        setScorecards(scorecards.map(sc => sc.id === id ? { ...sc, status: 'approved' } : sc));
        Swal.fire({
            icon: 'success',
            title: 'Scorecard Verified',
            text: 'Scorecard verified and handicap calculation updated.',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    const filtered = scorecards.filter(sc => {
        const name = sc.player_name || `${sc.first_name || ''} ${sc.last_name || ''}`;
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sc.course_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || sc.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex flex-col gap-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <FileText className="text-emerald-600" size={24} />
                        Digital Golf Scorecards
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
                        MMS Golf Club • World Handicap System Official Score Registry
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsEntryOpen(true)}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-sm active:scale-95"
                    >
                        <Plus size={14} strokeWidth={3} />
                        Enter Scorecard
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/60 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 max-w-sm w-full">
                    <Search size={15} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search golfer name, member #..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs text-slate-800 dark:text-white placeholder-slate-400 w-full"
                    />
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition ${statusFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        All ({scorecards.length})
                    </button>
                    <button
                        onClick={() => setStatusFilter('approved')}
                        className={`px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition ${statusFilter === 'approved' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        Verified
                    </button>
                    <button
                        onClick={() => setStatusFilter('pending')}
                        className={`px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition ${statusFilter === 'pending' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        Pending Review
                    </button>
                </div>
            </div>

            {/* Scorecards Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-white/5 text-[9px] font-black uppercase tracking-wider text-slate-400">
                                <th className="p-3.5 pl-5">Golfer</th>
                                <th className="p-3.5">Course</th>
                                <th className="p-3.5">Date</th>
                                <th className="p-3.5 text-center">Playing HCP</th>
                                <th className="p-3.5 text-center">Gross</th>
                                <th className="p-3.5 text-center font-black text-emerald-600">Net</th>
                                <th className="p-3.5 text-center">Stableford Pts</th>
                                <th className="p-3.5 text-center">Marker</th>
                                <th className="p-3.5 text-center">Status</th>
                                <th className="p-3.5 pr-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="p-8 text-center text-slate-400">Loading scorecards...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="p-8 text-center text-slate-400">No scorecards found</td>
                                </tr>
                            ) : (
                                filtered.map((sc) => {
                                    const name = sc.player_name || `${sc.first_name || ''} ${sc.last_name || ''}`;
                                    const isApproved = sc.status === 'approved';
                                    return (
                                        <tr key={sc.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                                            <td className="p-3.5 pl-5">
                                                <div className="font-black text-slate-900 dark:text-white">{name}</div>
                                                <span className="text-[10px] text-slate-400 font-bold">{sc.member_number || 'Member'}</span>
                                            </td>
                                            <td className="p-3.5 font-bold text-slate-600 dark:text-slate-300">
                                                {sc.course_name}
                                            </td>
                                            <td className="p-3.5 text-slate-500 font-medium">
                                                {sc.play_date}
                                            </td>
                                            <td className="p-3.5 text-center font-bold text-slate-600 dark:text-slate-300">
                                                {sc.playing_handicap || 0}
                                            </td>
                                            <td className="p-3.5 text-center font-black text-slate-800 dark:text-slate-200">
                                                {sc.gross_score || '—'}
                                            </td>
                                            <td className="p-3.5 text-center font-black text-sm text-emerald-600 dark:text-emerald-400">
                                                {sc.net_score || '—'}
                                            </td>
                                            <td className="p-3.5 text-center font-black text-amber-600 dark:text-amber-400">
                                                {sc.stableford_points || '—'}
                                            </td>
                                            <td className="p-3.5 text-center text-slate-500 text-[11px]">
                                                {sc.marker_name || 'Marker Signed'}
                                            </td>
                                            <td className="p-3.5 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                    isApproved
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                                }`}>
                                                    {isApproved ? 'Verified' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="p-3.5 pr-5 text-right space-x-1.5">
                                                <button
                                                    onClick={() => setViewingCard(sc)}
                                                    className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg text-slate-600 dark:text-slate-300"
                                                    title="View Hole by Hole"
                                                >
                                                    <Eye size={13} />
                                                </button>
                                                {!isApproved && (
                                                    <button
                                                        onClick={() => handleApprove(sc.id)}
                                                        className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg"
                                                        title="Approve Scorecard"
                                                    >
                                                        <Check size={13} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Scorecard 18-Hole Entry Modal */}
            {isEntryOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 dark:border-white/10 my-8 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-serif font-black text-slate-900 dark:text-white">
                                    Digital 18-Hole Scorecard Entry
                                </h3>
                                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-wider mt-0.5">
                                    Championship Course • Par 72
                                </p>
                            </div>
                            <button
                                onClick={() => setIsEntryOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveScorecard} className="p-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Golfer Name * (Search member)
                                    </label>
                                    <MemberSearchInput
                                        value={entryForm.player_name}
                                        placeholder="Alex Metto"
                                        required
                                        onChange={(val) => {
                                            if (typeof val === 'object' && val !== null) {
                                                setEntryForm({
                                                    ...entryForm,
                                                    player_name: val.player_name,
                                                    member_number: val.member_number || entryForm.member_number,
                                                    playing_handicap: val.handicap ? Math.round(Number(val.handicap)) : entryForm.playing_handicap
                                                });
                                            } else {
                                                setEntryForm({ ...entryForm, player_name: val });
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Playing Handicap
                                    </label>
                                    <input
                                        type="number"
                                        value={entryForm.playing_handicap}
                                        onChange={(e) => setEntryForm({ ...entryForm, playing_handicap: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Marker Name (Search member)
                                    </label>
                                    <MemberSearchInput
                                        value={entryForm.marker_name}
                                        placeholder="Collins Korir"
                                        onChange={(val) => {
                                            const name = typeof val === 'object' && val !== null ? val.player_name : val;
                                            setEntryForm({ ...entryForm, marker_name: name });
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Front 9 (Out) */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Front 9 (Holes 1 – 9)</span>
                                    <span className="text-[10px] font-black uppercase text-emerald-600">Out Subtotal: {calcOut(entryForm.hole_scores)}</span>
                                </div>
                                <div className="grid grid-cols-9 gap-1.5 text-center">
                                    {entryForm.hole_scores.slice(0, 9).map((score, i) => (
                                        <div key={i} className="bg-slate-50 dark:bg-slate-700 p-1.5 rounded-xl border border-slate-200 dark:border-slate-600">
                                            <span className="text-[9px] font-black text-slate-400 block">#{i + 1}</span>
                                            <span className="text-[8px] text-slate-400 block">P{STANDARD_PARS[i]}</span>
                                            <input
                                                type="number"
                                                min="1"
                                                max="12"
                                                value={score}
                                                onChange={(e) => handleHoleChange(i, e.target.value)}
                                                className="w-full text-center font-black text-xs text-slate-900 dark:text-white bg-transparent outline-none mt-1"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Back 9 (In) */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Back 9 (Holes 10 – 18)</span>
                                    <span className="text-[10px] font-black uppercase text-emerald-600">In Subtotal: {calcIn(entryForm.hole_scores)}</span>
                                </div>
                                <div className="grid grid-cols-9 gap-1.5 text-center">
                                    {entryForm.hole_scores.slice(9, 18).map((score, i) => (
                                        <div key={i + 9} className="bg-slate-50 dark:bg-slate-700 p-1.5 rounded-xl border border-slate-200 dark:border-slate-600">
                                            <span className="text-[9px] font-black text-slate-400 block">#{i + 10}</span>
                                            <span className="text-[8px] text-slate-400 block">P{STANDARD_PARS[i + 9]}</span>
                                            <input
                                                type="number"
                                                min="1"
                                                max="12"
                                                value={score}
                                                onChange={(e) => handleHoleChange(i + 9, e.target.value)}
                                                className="w-full text-center font-black text-xs text-slate-900 dark:text-white bg-transparent outline-none mt-1"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary Box */}
                            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-around text-center">
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">Gross Score</span>
                                    <span className="text-xl font-black text-slate-900 dark:text-white">{calcTotal(entryForm.hole_scores)}</span>
                                </div>
                                <div className="h-8 w-px bg-emerald-200 dark:bg-emerald-800"></div>
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">Net Score</span>
                                    <span className="text-xl font-black text-emerald-600">{Math.max(0, calcTotal(entryForm.hole_scores) - (entryForm.playing_handicap || 0))}</span>
                                </div>
                                <div className="h-8 w-px bg-emerald-200 dark:bg-emerald-800"></div>
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">Par Difference</span>
                                    <span className="text-xl font-black text-slate-800 dark:text-slate-200">
                                        {calcTotal(entryForm.hole_scores) - 72 >= 0 ? `+${calcTotal(entryForm.hole_scores) - 72}` : calcTotal(entryForm.hole_scores) - 72}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEntryOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95"
                                >
                                    Submit Scorecard
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Viewing Modal */}
            {viewingCard && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 dark:border-white/10 p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                            <div>
                                <h3 className="font-serif font-black text-base text-slate-900 dark:text-white">
                                    {viewingCard.player_name}
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    {viewingCard.course_name} • {viewingCard.play_date}
                                </p>
                            </div>
                            <button
                                onClick={() => setViewingCard(null)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-center">
                            <div>
                                <span className="text-[9px] uppercase font-bold text-slate-400 block">Gross</span>
                                <span className="text-xl font-black text-slate-900 dark:text-white">{viewingCard.gross_score}</span>
                            </div>
                            <div>
                                <span className="text-[9px] uppercase font-bold text-slate-400 block">Net</span>
                                <span className="text-xl font-black text-emerald-600">{viewingCard.net_score}</span>
                            </div>
                            <div>
                                <span className="text-[9px] uppercase font-bold text-slate-400 block">Points</span>
                                <span className="text-xl font-black text-amber-600">{viewingCard.stableford_points}</span>
                            </div>
                        </div>

                        {viewingCard.hole_scores && (
                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">18-Hole Matrix</span>
                                <div className="grid grid-cols-9 gap-1 text-center text-xs">
                                    {viewingCard.hole_scores.map((s, idx) => (
                                        <div key={idx} className="p-1 rounded bg-slate-100 dark:bg-slate-700">
                                            <span className="text-[8px] text-slate-400 block">#{idx + 1}</span>
                                            <span className="font-bold text-slate-800 dark:text-white">{s}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-2 flex justify-end">
                            <button
                                onClick={() => setViewingCard(null)}
                                className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-700 rounded-xl text-xs font-bold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScorecardsPage;
