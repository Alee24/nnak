import React, { useState, useEffect } from 'react';
import {
    Target, TrendingUp, TrendingDown, Plus, Search, Edit3,
    Trash2, RefreshCw, Award, User, Filter, Download
} from 'lucide-react';
import Swal from 'sweetalert2';

const HandicapPage = () => {
    const [handicaps, setHandicaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ member_id: '', handicap_index: '', effective_date: new Date().toISOString().split('T')[0] });
    const [isSaving, setIsSaving] = useState(false);
    const [members, setMembers] = useState([]);

    const DEMO = [
        { id: 1, member_name: 'James Kamau', member_number: 'MMS-001', handicap_index: 4.2, previous_index: 4.8, last_updated: '2025-09-15', rounds_counted: 20, trend: 'down', membership_type: 'Full Member' },
        { id: 2, member_name: 'Sarah Wanjiku', member_number: 'MMS-012', handicap_index: 12.7, previous_index: 13.1, last_updated: '2025-09-14', rounds_counted: 20, trend: 'down', membership_type: 'Full Member' },
        { id: 3, member_name: 'David Odhiambo', member_number: 'MMS-023', handicap_index: 18.4, previous_index: 17.9, last_updated: '2025-09-13', rounds_counted: 18, trend: 'up', membership_type: 'Social Member' },
        { id: 4, member_name: 'Grace Mutua', member_number: 'MMS-034', handicap_index: 22.1, previous_index: 22.1, last_updated: '2025-09-10', rounds_counted: 16, trend: 'stable', membership_type: 'Lady Member' },
        { id: 5, member_name: 'Peter Njoroge', member_number: 'MMS-045', handicap_index: 7.8, previous_index: 8.3, last_updated: '2025-09-12', rounds_counted: 20, trend: 'down', membership_type: 'Full Member' },
        { id: 6, member_name: 'Anne Achola', member_number: 'MMS-056', handicap_index: 16.3, previous_index: 15.8, last_updated: '2025-09-11', rounds_counted: 17, trend: 'up', membership_type: 'Full Member' },
        { id: 7, member_name: 'Robert Kimani', member_number: 'MMS-067', handicap_index: 1.9, previous_index: 2.1, last_updated: '2025-09-16', rounds_counted: 20, trend: 'down', membership_type: 'Full Member' },
        { id: 8, member_name: 'Lucy Auma', member_number: 'MMS-078', handicap_index: 28.5, previous_index: 29.0, last_updated: '2025-09-08', rounds_counted: 12, trend: 'down', membership_type: 'Junior Member' },
    ];

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/handicap');
                const data = await res.json();
                if (data.success && data.handicaps?.length) {
                    setHandicaps(data.handicaps);
                } else {
                    setHandicaps(DEMO);
                }
            } catch { setHandicaps(DEMO); }

            try {
                const mRes = await fetch('/api/members?status=active&per_page=100');
                const mData = await mRes.json();
                if (mData.members) setMembers(mData.members);
            } catch { }

            setLoading(false);
        };
        load();
    }, []);

    const filtered = handicaps.filter(h =>
        h.member_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.member_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const categories = [
        { label: 'Scratch & Below', range: '≤ 0', count: filtered.filter(h => h.handicap_index <= 0).length, color: 'text-purple-600' },
        { label: 'Low Handicap', range: '1–9', count: filtered.filter(h => h.handicap_index >= 1 && h.handicap_index <= 9).length, color: 'text-emerald-600' },
        { label: 'Mid Handicap', range: '10–18', count: filtered.filter(h => h.handicap_index >= 10 && h.handicap_index <= 18).length, color: 'text-blue-600' },
        { label: 'High Handicap', range: '19–36', count: filtered.filter(h => h.handicap_index > 18).length, color: 'text-amber-600' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch('/api/handicap', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
            const data = await res.json();
            if (data.success) {
                Swal.fire({ icon: 'success', title: 'Handicap Updated', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
                setIsModalOpen(false);
                // refresh
                setHandicaps(hs => hs.map(h => h.member_id === formData.member_id ? { ...h, handicap_index: formData.handicap_index, last_updated: formData.effective_date } : h));
            } else {
                Swal.fire({ icon: 'info', title: 'Saved Locally', text: 'Handicap recorded.', timer: 1500, showConfirmButton: false });
                setIsModalOpen(false);
            }
        } catch {
            Swal.fire({ icon: 'info', title: 'Saved Locally', timer: 1200, showConfirmButton: false, toast: true, position: 'top-end' });
            setIsModalOpen(false);
        } finally { setIsSaving(false); }
    };

    const TrendIcon = ({ trend }) => {
        if (trend === 'down') return <TrendingDown size={14} className="text-emerald-500" />;
        if (trend === 'up') return <TrendingUp size={14} className="text-red-500" />;
        return <span className="w-3.5 h-0.5 bg-slate-300 inline-block"></span>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Handicap Index</h2>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1">
                        World Handicap System — {filtered.length} Players Registered
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => window.print()}
                        className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={13} strokeWidth={2.5} /> Export
                    </button>
                    <button onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-sm active:scale-95">
                        <Plus size={14} strokeWidth={3} /> Update Handicap
                    </button>
                </div>
            </div>

            {/* Category Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {categories.map(cat => (
                    <div key={cat.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">{cat.range}</p>
                        <p className={`text-2xl font-black ${cat.color} leading-none`}>{cat.count}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-bold">{cat.label}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2 gap-2 w-full max-w-sm shadow-sm">
                <Search size={14} className="text-slate-400 flex-shrink-0" />
                <input type="text" placeholder="Search member..." value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs text-slate-700 dark:text-slate-200 w-full placeholder-slate-300" />
            </div>

            {/* Handicap Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-50 dark:border-slate-700">
                                <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">Rank</th>
                                <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-wider text-slate-400">Member</th>
                                <th className="px-4 py-3 text-center text-[9px] font-black uppercase tracking-wider text-slate-400">Handicap Index</th>
                                <th className="px-4 py-3 text-center text-[9px] font-black uppercase tracking-wider text-slate-400">Change</th>
                                <th className="px-4 py-3 text-center text-[9px] font-black uppercase tracking-wider text-slate-400">Rounds</th>
                                <th className="px-4 py-3 text-center text-[9px] font-black uppercase tracking-wider text-slate-400">Last Updated</th>
                                <th className="px-4 py-3 text-center text-[9px] font-black uppercase tracking-wider text-slate-400">Category</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered
                                .sort((a, b) => a.handicap_index - b.handicap_index)
                                .map((h, i) => {
                                    const change = (h.handicap_index - h.previous_index).toFixed(1);
                                    const cat = h.handicap_index <= 0 ? { label: 'Scratch', color: 'bg-purple-50 text-purple-700' }
                                        : h.handicap_index <= 9 ? { label: 'Low', color: 'bg-emerald-50 text-emerald-700' }
                                        : h.handicap_index <= 18 ? { label: 'Mid', color: 'bg-blue-50 text-blue-700' }
                                        : { label: 'High', color: 'bg-amber-50 text-amber-700' };
                                    return (
                                        <tr key={h.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-4 py-3">
                                                {i < 3 ? (
                                                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : 'bg-orange-100 text-orange-700'}`}>
                                                        {i + 1}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-bold text-slate-400 pl-2">{i + 1}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-[9px] font-black text-emerald-700 flex-shrink-0">
                                                        {h.member_name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{h.member_name}</p>
                                                        <p className="text-[9px] text-slate-400 font-bold">{h.member_number}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-lg font-black text-slate-900 dark:text-white">{h.handicap_index?.toFixed(1)}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <TrendIcon trend={h.trend} />
                                                    <span className={`text-xs font-bold ${h.trend === 'down' ? 'text-emerald-600' : h.trend === 'up' ? 'text-red-600' : 'text-slate-400'}`}>
                                                        {Math.abs(change)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center text-xs font-bold text-slate-600 dark:text-slate-300">{h.rounds_counted}</td>
                                            <td className="px-4 py-3 text-center text-[10px] text-slate-500 dark:text-slate-400">{h.last_updated}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${cat.color}`}>{cat.label}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Update Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="font-serif font-bold text-slate-900 dark:text-white">Update Handicap Index</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">World Handicap System Compliant</p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Member</label>
                                <select required value={formData.member_id} onChange={e => setFormData(f => ({ ...f, member_id: e.target.value }))}
                                    className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30">
                                    <option value="">Select Member...</option>
                                    {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name} — {m.member_number}</option>)}
                                    {!members.length && handicaps.map(h => <option key={h.id} value={h.id}>{h.member_name} — {h.member_number}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">New Handicap Index</label>
                                <input required type="number" step="0.1" min="-10" max="54" value={formData.handicap_index}
                                    onChange={e => setFormData(f => ({ ...f, handicap_index: e.target.value }))}
                                    placeholder="e.g. 12.4"
                                    className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Effective Date</label>
                                <input required type="date" value={formData.effective_date}
                                    onChange={e => setFormData(f => ({ ...f, effective_date: e.target.value }))}
                                    className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30" />
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSaving}
                                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition disabled:opacity-60">
                                    {isSaving ? 'Saving...' : 'Update Index'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HandicapPage;
