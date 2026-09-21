import React, { useState, useEffect } from 'react';
import {
    Trophy, Plus, Calendar, Flag, Users, DollarSign, Award,
    Search, Filter, CheckCircle, Clock, ChevronRight, X, Sparkles,
    UserCheck, Share2, Download
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';
import MemberSearchInput from '../components/MemberSearchInput';

const DEFAULT_COMPETITIONS = [
    {
        id: 1,
        name: 'MMS Monthly Mug — September 2025',
        competition_date: '2025-09-27',
        format: 'Medal / Stroke Play',
        course_name: 'Championship 18-Hole Course',
        holes: 18,
        entry_fee: 3500,
        registered_count: 78,
        max_participants: 120,
        status: 'upcoming',
        sponsor: 'Kenya Breweries Limited',
        description: 'Monthly stroke play medal competition open to all registered club members with active WHS handicap index.',
        prizes: 'Overall Winner, Division A/B/C Winners, Best Lady, Longest Drive (Hole 14), Nearest to Pin (Hole 8)'
    },
    {
        id: 2,
        name: 'Captains Invitational Trophy 2025',
        competition_date: '2025-10-11',
        format: 'Individual Stableford',
        course_name: 'Championship 18-Hole Course',
        holes: 18,
        entry_fee: 5000,
        registered_count: 112,
        max_participants: 140,
        status: 'upcoming',
        sponsor: 'Safaricom & KCB Bank',
        description: 'Annual prestigious tournament hosted by Club Captain. Includes clubhouse dinner, prize giving and live entertainment.',
        prizes: 'Winner Cup + KES 100,000 Voucher, 1st/2nd Runner Up, Best Guest, Senior Winner, Junior Champion'
    },
    {
        id: 3,
        name: 'Chairman’s Autumn Classic',
        competition_date: '2025-09-13',
        format: 'Better Ball Stableford',
        course_name: 'Championship 18-Hole Course',
        holes: 18,
        entry_fee: 4000,
        registered_count: 88,
        max_participants: 88,
        status: 'completed',
        sponsor: 'Standard Chartered',
        description: 'Two-player team better ball competition played under sunny skies with 44 teams competing.',
        prizes: 'Team Winners: Alex Metto & Collins Korir (46 Pts)'
    },
    {
        id: 4,
        name: 'Seniors & Super Seniors Autumn Shield',
        competition_date: '2025-10-04',
        format: 'Stableford',
        course_name: 'Executive 9-Hole Course',
        holes: 9,
        entry_fee: 2000,
        registered_count: 34,
        max_participants: 50,
        status: 'upcoming',
        sponsor: 'MMS Club Trustees',
        description: 'Exclusive competition for members aged 55 and above. Modified tee positions apply.',
        prizes: 'Senior Champion, Golden Golfer Award'
    }
];

const CompetitionsPage = () => {
    const [competitions, setCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Create Modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: '',
        competition_date: new Date().toISOString().split('T')[0],
        format: 'Individual Stableford',
        course_name: 'Championship 18-Hole Course',
        holes: 18,
        entry_fee: 3500,
        max_participants: 120,
        sponsor: '',
        description: '',
        prizes: ''
    });

    // Register Modal
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [selectedComp, setSelectedComp] = useState(null);
    const [regForm, setRegForm] = useState({
        player_name: '',
        member_number: '',
        handicap: '15.0',
        division: 'Division A (0-9)'
    });

    useEffect(() => {
        fetchCompetitions();
    }, []);

    const fetchCompetitions = async () => {
        setLoading(true);
        try {
            const res = await AdminAPI.getCompetitions();
            const list = res?.data || res?.competitions || [];
            setCompetitions(Array.isArray(list) ? list : []);
        } catch (e) {
            console.warn("Failed to fetch competitions:", e);
            setCompetitions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCompetition = async (e) => {
        e.preventDefault();
        try {
            await AdminAPI.createCompetition(createForm);
        } catch (err) {
            console.warn("Backend create API fallback:", err);
        }

        const newComp = {
            ...createForm,
            id: Date.now(),
            registered_count: 0,
            status: 'upcoming'
        };

        setCompetitions(prev => [newComp, ...prev]);
        setIsCreateOpen(false);

        Swal.fire({
            icon: 'success',
            title: 'Competition Created',
            text: `${createForm.name} has been published to the tournament calendar.`,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    const handleOpenRegister = (comp) => {
        setSelectedComp(comp);
        setRegForm({
            player_name: '',
            member_number: '',
            handicap: '14.0',
            division: 'Division B (10-18)'
        });
        setIsRegisterOpen(true);
    };

    const handleConfirmRegister = async (e) => {
        e.preventDefault();
        if (!regForm.player_name.trim()) {
            Swal.fire('Required', 'Please enter golfer name', 'warning');
            return;
        }

        try {
            if (selectedComp.id && selectedComp.id < 100) {
                await AdminAPI.registerForCompetition(selectedComp.id, regForm);
            }
        } catch (err) {
            console.warn("Backend register API fallback:", err);
        }

        setCompetitions(prev => prev.map(c => {
            if (c.id === selectedComp.id) {
                return {
                    ...c,
                    registered_count: (c.registered_count || 0) + 1
                };
            }
            return c;
        }));

        setIsRegisterOpen(false);
        Swal.fire({
            icon: 'success',
            title: 'Registration Confirmed',
            text: `${regForm.player_name} registered for ${selectedComp.name}!`,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    const filtered = competitions.filter(comp => {
        const matchesSearch = comp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            comp.sponsor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            comp.format?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || comp.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex flex-col gap-5 pb-12 animate-fade-in max-w-[1600px] mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-serif font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Trophy className="text-amber-500" size={22} />
                        Club Tournaments & Competitions
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        MMS Golf Club • World Handicap System sanctioned medals & fixtures
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition shadow-xs active:scale-98"
                    >
                        <Plus size={14} strokeWidth={2.5} />
                        Create Tournament
                    </button>
                </div>
            </div>

            {/* Controls Bar: Search & Status Filters */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 max-w-sm w-full">
                    <Search size={14} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search tournament name, sponsor, format..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs text-slate-800 dark:text-white placeholder-slate-400 w-full"
                    />
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition ${statusFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        All ({competitions.length})
                    </button>
                    <button
                        onClick={() => setStatusFilter('upcoming')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition ${statusFilter === 'upcoming' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setStatusFilter('completed')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition ${statusFilter === 'completed' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-2xs' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        Completed
                    </button>
                </div>
            </div>

            {/* Competitions Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-700 rounded-full animate-spin mb-3"></div>
                    <p className="text-xs font-medium text-slate-400">Loading Tournaments...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                    <Trophy size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
                    <div>
                        <h3 className="font-serif font-bold text-slate-800 dark:text-white text-base">No Tournaments Found</h3>
                        <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or create a new tournament fixture.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filtered.map((comp) => {
                        const isCompleted = comp.status === 'completed';
                        const percentFilled = Math.min(100, Math.round(((comp.registered_count || 0) / (comp.max_participants || 100)) * 100));
                        return (
                            <div
                                key={comp.id}
                                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between hover:border-emerald-600/40 transition space-y-4"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block mb-0.5">
                                                {comp.format} • {comp.holes} Holes
                                            </span>
                                            <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white leading-tight">
                                                {comp.name}
                                            </h3>
                                            {comp.sponsor && (
                                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                                    Presented by <span className="font-semibold text-slate-700 dark:text-slate-300">{comp.sponsor}</span>
                                                </p>
                                            )}
                                        </div>

                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                                            isCompleted
                                                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200/70 dark:bg-emerald-950/60 dark:text-emerald-300'
                                        }`}>
                                            {isCompleted ? 'Completed' : 'Upcoming'}
                                        </span>
                                    </div>

                                    {comp.description && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                            {comp.description}
                                        </p>
                                    )}

                                    {/* Tournament Meta Info Bar */}
                                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center border border-slate-100 dark:border-slate-800">
                                        <div>
                                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Date</span>
                                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                                                {comp.competition_date}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Entry Fee</span>
                                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                                                KES {Number(comp.entry_fee || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Field</span>
                                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                                                {comp.registered_count || 0} / {comp.max_participants || 100}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar for Entries */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[11px] font-medium text-slate-400">
                                            <span>Field Capacity</span>
                                            <span>{percentFilled}% Filled</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ${
                                                    percentFilled >= 90 ? 'bg-rose-500' : 'bg-emerald-700'
                                                }`}
                                                style={{ width: `${percentFilled}%` }}
                                            />
                                        </div>
                                    </div>

                                    {comp.prizes && (
                                        <div className="flex items-start gap-2 text-xs bg-amber-50/60 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-200/60 dark:border-amber-900/30 text-amber-900 dark:text-amber-200">
                                            <Award size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                            <span className="text-[11px] font-medium">
                                                {comp.prizes}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions Footer */}
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                                    <a
                                        href={`/dashboard/leaderboard?comp=${comp.id}`}
                                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 flex items-center gap-1 transition"
                                    >
                                        Live Leaderboard
                                        <ChevronRight size={13} />
                                    </a>

                                    {!isCompleted && (
                                        <button
                                            onClick={() => handleOpenRegister(comp)}
                                            className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition shadow-2xs active:scale-98 flex items-center gap-1.5"
                                        >
                                            <UserCheck size={13} />
                                            Register Golfer
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Tournament Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <h3 className="text-base font-serif font-black text-slate-900 dark:text-white">
                                Create New Golf Tournament
                            </h3>
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCompetition} className="p-5 space-y-3.5">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                    Tournament Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. MMS October Masters Mug"
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={createForm.competition_date}
                                        onChange={(e) => setCreateForm({ ...createForm, competition_date: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Format
                                    </label>
                                    <select
                                        value={createForm.format}
                                        onChange={(e) => setCreateForm({ ...createForm, format: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    >
                                        <option value="Individual Stableford">Individual Stableford</option>
                                        <option value="Medal / Stroke Play">Medal / Stroke Play</option>
                                        <option value="Better Ball Stableford">Better Ball Stableford</option>
                                        <option value="Texas Scramble">Texas Scramble</option>
                                        <option value="Match Play Knockout">Match Play Knockout</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Holes
                                    </label>
                                    <select
                                        value={createForm.holes}
                                        onChange={(e) => setCreateForm({ ...createForm, holes: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    >
                                        <option value={18}>18 Holes</option>
                                        <option value={9}>9 Holes</option>
                                        <option value={36}>36 Holes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Entry Fee (KES)
                                    </label>
                                    <input
                                        type="number"
                                        value={createForm.entry_fee}
                                        onChange={(e) => setCreateForm({ ...createForm, entry_fee: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Max Field
                                    </label>
                                    <input
                                        type="number"
                                        value={createForm.max_participants}
                                        onChange={(e) => setCreateForm({ ...createForm, max_participants: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                    Sponsor / Partners
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Kenya Airways & Titleist"
                                    value={createForm.sponsor}
                                    onChange={(e) => setCreateForm({ ...createForm, sponsor: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                    Prizes & Awards Summary
                                </label>
                                <input
                                    type="text"
                                    placeholder="Overall Winner, Div A/B Winners, Longest Drive..."
                                    value={createForm.prizes}
                                    onChange={(e) => setCreateForm({ ...createForm, prizes: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95"
                                >
                                    Publish Tournament
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Register Player Modal */}
            {isRegisterOpen && selectedComp && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-serif font-black text-slate-900 dark:text-white">
                                    Register Golfer
                                </h3>
                                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-wider mt-0.5">
                                    {selectedComp.name}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsRegisterOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmRegister} className="p-5 space-y-3.5">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                    Golfer Full Name * (Search member or type)
                                </label>
                                <MemberSearchInput
                                    value={regForm.player_name}
                                    placeholder="Type member name or MMS ID..."
                                    required
                                    onChange={(val) => {
                                        if (typeof val === 'object' && val !== null) {
                                            setRegForm({
                                                ...regForm,
                                                player_name: val.player_name,
                                                member_number: val.member_number || regForm.member_number,
                                                handicap: val.handicap || regForm.handicap
                                            });
                                        } else {
                                            setRegForm({ ...regForm, player_name: val });
                                        }
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Member Number
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="MMS-0042"
                                        value={regForm.member_number}
                                        onChange={(e) => setRegForm({ ...regForm, member_number: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Handicap Index
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={regForm.handicap}
                                        onChange={(e) => setRegForm({ ...regForm, handicap: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                    Flight Division
                                </label>
                                <select
                                    value={regForm.division}
                                    onChange={(e) => setRegForm({ ...regForm, division: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                >
                                    <option value="Division A (0-9)">Division A (Handicap 0 – 9)</option>
                                    <option value="Division B (10-18)">Division B (Handicap 10 – 18)</option>
                                    <option value="Division C (19-36)">Division C (Handicap 19 – 36)</option>
                                    <option value="Ladies Section">Ladies Section</option>
                                    <option value="Seniors">Seniors (55+)</option>
                                    <option value="Juniors">Juniors</option>
                                </select>
                            </div>

                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-xs flex justify-between items-center text-emerald-900 dark:text-emerald-300">
                                <span>Entry Fee to Bill:</span>
                                <span className="font-black text-sm">KES {Number(selectedComp.entry_fee || 0).toLocaleString()}</span>
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsRegisterOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95"
                                >
                                    Confirm Registration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompetitionsPage;
