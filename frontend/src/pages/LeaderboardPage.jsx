import React, { useState, useEffect } from 'react';
import {
    Trophy, RefreshCw, Flag, Award, Search, Filter,
    Download, Printer, ChevronUp, ChevronDown, Minus,
    User, Sparkles, Medal, Shield
} from 'lucide-react';
import AdminAPI from '../services/api';

const DEFAULT_COMPS = [
    { id: 1, name: 'MMS Monthly Mug — September 2025', date: '2025-09-27', format: 'Stroke Play (Gross & Net)' },
    { id: 2, name: 'Captains Invitational Trophy', date: '2025-10-11', format: 'Individual Stableford' },
    { id: 3, name: 'Chairman’s Autumn Classic', date: '2025-09-13', format: 'Better Ball' }
];

const DEFAULT_LEADERBOARD = [
    { rank: 1, name: 'Alex Metto', member_number: 'MMS-0042', hcp: 6.4, thru: 'F', gross: 71, net: 65, points: 41, to_par: -1, division: 'Division A' },
    { rank: 2, name: 'Dr. Arthur Mwangi', member_number: 'MMS-0015', hcp: 8.2, thru: 'F', gross: 73, net: 65, points: 39, to_par: '+1', division: 'Division A' },
    { rank: 3, name: 'Sarah Wanjiku', member_number: 'MMS-0088', hcp: 14.1, thru: 'F', gross: 80, net: 66, points: 38, to_par: '+8', division: 'Ladies' },
    { rank: 4, name: 'Kevin Omondi', member_number: 'MMS-0033', hcp: 11.0, thru: 'F', gross: 78, net: 67, points: 37, to_par: '+6', division: 'Division B' },
    { rank: 5, name: 'George Otieno', member_number: 'MMS-0004', hcp: 3.1, thru: 'F', gross: 72, net: 69, points: 37, to_par: 'E', division: 'Division A' },
    { rank: 6, name: 'Peter Kiprono', member_number: 'MMS-0071', hcp: 13.5, thru: '16', gross: 69, net: 57, points: 34, to_par: '+5', division: 'Division B' },
    { rank: 7, name: 'Collins Korir', member_number: 'MMS-0027', hcp: 9.0, thru: '15', gross: 66, net: 58, points: 32, to_par: '+3', division: 'Division A' },
    { rank: 8, name: 'Faith Chebet', member_number: 'MMS-0104', hcp: 16.0, thru: 'F', gross: 86, net: 70, points: 34, to_par: '+14', division: 'Ladies' },
    { rank: 9, name: 'David Mutua', member_number: 'MMS-0059', hcp: 5.2, thru: 'F', gross: 76, net: 71, points: 33, to_par: '+4', division: 'Division A' },
    { rank: 10, name: 'Hon. Joseph Ndegwa', member_number: 'MMS-0012', hcp: 18.2, thru: '14', gross: 68, net: 54, points: 29, to_par: '+10', division: 'Division B' },
];

const LeaderboardPage = () => {
    const [competitions, setCompetitions] = useState(DEFAULT_COMPS);
    const [selectedComp, setSelectedComp] = useState(1);
    const [leaderboard, setLeaderboard] = useState(DEFAULT_LEADERBOARD);
    const [loading, setLoading] = useState(false);
    const [divisionFilter, setDivisionFilter] = useState('all');
    const [scoringView, setScoringView] = useState('net'); // 'net' | 'gross' | 'stableford'
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadCompetitions();
    }, []);

    useEffect(() => {
        if (selectedComp) fetchLeaderboard(selectedComp);
    }, [selectedComp]);

    const loadCompetitions = async () => {
        try {
            const res = await AdminAPI.getCompetitions();
            const list = res?.data || res?.competitions || [];
            if (Array.isArray(list) && list.length > 0) {
                setCompetitions(list);
                setSelectedComp(list[0].id);
            }
        } catch (e) {
            console.warn("Using fallback comps:", e);
        }
    };

    const fetchLeaderboard = async (compId) => {
        setLoading(true);
        try {
            const res = await AdminAPI.getCompetitionLeaderboard(compId);
            const list = res?.data || res?.leaderboard || [];
            if (Array.isArray(list)) {
                setLeaderboard(list);
            } else {
                setLeaderboard([]);
            }
        } catch (e) {
            console.warn("Error fetching leaderboard:", e);
            setLeaderboard([]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = leaderboard.filter(player => {
        const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            player.member_number?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDiv = divisionFilter === 'all' || player.division === divisionFilter;
        return matchesSearch && matchesDiv;
    });

    const top3 = filtered.slice(0, 3);

    return (
        <div className="flex flex-col gap-5 pb-12 animate-fade-in max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-serif font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Trophy className="text-amber-500" size={22} />
                        Live Tournament Leaderboard
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Real-time scores, gross & net standings, and WHS stroke play rankings
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => fetchLeaderboard(selectedComp)}
                        className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-2xs"
                    >
                        <RefreshCw size={13} className={loading ? 'animate-spin text-emerald-700' : ''} />
                        Refresh
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shadow-xs"
                    >
                        <Printer size={13} />
                        Print Leaderboard
                    </button>
                </div>
            </div>

            {/* Tournament Selector & Filter Bar */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tournament:</span>
                    <select
                        value={selectedComp}
                        onChange={(e) => setSelectedComp(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-white px-3 py-1.5 rounded-lg outline-none"
                    >
                        {competitions.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name} ({c.competition_date || c.date})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Division Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                        <button
                            onClick={() => setDivisionFilter('all')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition ${divisionFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setDivisionFilter('Division A')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition ${divisionFilter === 'Division A' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            Div A
                        </button>
                        <button
                            onClick={() => setDivisionFilter('Division B')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition ${divisionFilter === 'Division B' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            Div B
                        </button>
                        <button
                            onClick={() => setDivisionFilter('Ladies')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition ${divisionFilter === 'Ladies' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-2xs' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            Ladies
                        </button>
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                        <button
                            onClick={() => setScoringView('net')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition ${scoringView === 'net' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            Net Score
                        </button>
                        <button
                            onClick={() => setScoringView('gross')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition ${scoringView === 'gross' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            Gross Score
                        </button>
                        <button
                            onClick={() => setScoringView('stableford')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition ${scoringView === 'stableford' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            Stableford Pts
                        </button>
                    </div>
                </div>
            </div>

            {/* Top 3 Leaders Podium */}
            {top3.length >= 3 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {/* 2nd Place */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5 order-2 md:order-1">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                            2
                        </div>
                        <div className="min-w-0">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">1st Runner Up</span>
                            <h3 className="font-serif font-bold text-slate-900 dark:text-white text-sm truncate">
                                {top3[1].name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                Net: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{top3[1].net}</span> • Gross: {top3[1].gross}
                            </p>
                        </div>
                    </div>

                    {/* 1st Place Champion */}
                    <div className="bg-emerald-950 text-white p-4 rounded-xl border border-emerald-800/80 shadow-xs flex items-center gap-3.5 order-1 md:order-2">
                        <div className="w-11 h-11 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-base shadow-xs flex-shrink-0">
                            <Trophy size={20} />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">Tournament Leader</span>
                            <h3 className="font-serif font-bold text-white text-base truncate">
                                {top3[0].name}
                            </h3>
                            <p className="text-xs text-emerald-200 font-medium mt-0.5">
                                Net: <span className="text-white font-bold text-sm">{top3[0].net}</span> • Gross: {top3[0].gross} • Thru: {top3[0].thru}
                            </p>
                        </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5 order-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                            3
                        </div>
                        <div className="min-w-0">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">2nd Runner Up</span>
                            <h3 className="font-serif font-bold text-slate-900 dark:text-white text-sm truncate">
                                {top3[2].name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                Net: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{top3[2].net}</span> • Gross: {top3[2].gross}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900">
                                <th className="p-3 pl-5 text-center w-12">POS</th>
                                <th className="p-3">Golfer</th>
                                <th className="p-3 text-center">HCP</th>
                                <th className="p-3 text-center">Division</th>
                                <th className="p-3 text-center">Thru</th>
                                <th className="p-3 text-center">To Par</th>
                                <th className="p-3 text-center">Gross</th>
                                <th className="p-3 text-center font-bold text-emerald-700 dark:text-emerald-400">Net</th>
                                <th className="p-3 pr-5 text-center">Points</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {filtered.map((player, idx) => {
                                const isLeader = idx === 0;
                                return (
                                    <tr
                                        key={idx}
                                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                                            isLeader ? 'bg-emerald-50/30 dark:bg-emerald-950/20' : ''
                                        }`}
                                    >
                                        <td className="p-3 pl-5 text-center">
                                            {idx < 3 ? (
                                                <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-bold ${
                                                    idx === 0 ? 'bg-amber-400 text-slate-950 font-black' :
                                                    idx === 1 ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' :
                                                    'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                }`}>
                                                    {idx + 1}
                                                </span>
                                            ) : (
                                                <span className="font-semibold text-slate-400">{idx + 1}</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                {player.name}
                                                {isLeader && <Trophy size={13} className="text-amber-500" />}
                                            </div>
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500">{player.member_number}</span>
                                        </td>
                                        <td className="p-3 text-center font-medium text-slate-600 dark:text-slate-300">
                                            {player.hcp}
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                {player.division}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center font-medium text-slate-800 dark:text-slate-200 font-mono">
                                            {player.thru}
                                        </td>
                                        <td className="p-3 text-center font-semibold">
                                            <span className={player.to_par?.toString().startsWith('-') ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}>
                                                {player.to_par}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center font-medium text-slate-800 dark:text-slate-200">
                                            {player.gross}
                                        </td>
                                        <td className="p-3 text-center font-bold text-emerald-700 dark:text-emerald-400">
                                            {player.net}
                                        </td>
                                        <td className="p-3 pr-5 text-center font-semibold text-slate-900 dark:text-white">
                                            {player.points || '—'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;
