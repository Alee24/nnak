import React, { useState, useEffect } from 'react';
import {
    Users, Plus, Search, Filter, Phone, Award,
    CheckCircle, Clock, AlertCircle, Edit3, X, RefreshCw, UserCheck
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';

const CaddiesPage = () => {
    const [caddies, setCaddies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        caddy_number: '',
        first_name: '',
        last_name: '',
        phone: '',
        handicap_rating: 'Class A',
        experience_years: 3,
        status: 'available'
    });

    useEffect(() => {
        fetchCaddies();
    }, []);

    const fetchCaddies = async () => {
        setLoading(true);
        try {
            const res = await AdminAPI.getCaddies();
            setCaddies(res?.data || res?.caddies || []);
        } catch (error) {
            console.error('Failed to load caddies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setFormData({
            caddy_number: `CAD-${Math.floor(100 + Math.random() * 900)}`,
            first_name: '',
            last_name: '',
            phone: '',
            handicap_rating: 'Class A',
            experience_years: 3,
            status: 'available'
        });
        setIsModalOpen(true);
    };

    const handleSaveCaddy = async (e) => {
        e.preventDefault();
        try {
            await AdminAPI.createCaddy(formData);
            Swal.fire({
                icon: 'success',
                title: 'Caddy Registered',
                text: `${formData.first_name} ${formData.last_name} has been enrolled into the roster.`,
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
            setIsModalOpen(false);
            fetchCaddies();
        } catch (error) {
            Swal.fire('Error', error.message || 'Failed to register caddy', 'error');
        }
    };

    const handleToggleStatus = async (caddyId, currentStatus) => {
        const nextStatus = currentStatus === 'available' ? 'on_course' : currentStatus === 'on_course' ? 'leave' : 'available';
        try {
            await AdminAPI.updateCaddy(caddyId, { status: nextStatus });
            setCaddies(prev => prev.map(c => c.id === caddyId ? { ...c, status: nextStatus } : c));
        } catch (error) {
            Swal.fire('Error', 'Failed to update status', 'error');
        }
    };

    const filtered = caddies.filter(c => {
        const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
        const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
            c.caddy_number?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex flex-col gap-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Users className="text-emerald-600" size={24} />
                        Caddy Master & Roster
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
                        Caddy classifications, bag assignments, round tracking & availability
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchCaddies}
                        className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95"
                    >
                        <Plus size={14} strokeWidth={3} />
                        Register Caddy
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Total Roster</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{caddies.length}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block mb-1">Available Now</span>
                    <span className="text-2xl font-black text-emerald-600 leading-none">{caddies.filter(c => c.status === 'available').length}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block mb-1">On Course</span>
                    <span className="text-2xl font-black text-amber-600 leading-none">{caddies.filter(c => c.status === 'on_course').length}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block mb-1">Class A Veterans</span>
                    <span className="text-2xl font-black text-blue-600 leading-none">{caddies.filter(c => c.handicap_rating === 'Class A').length}</span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 max-w-sm w-full">
                    <Search size={15} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search caddy name or badge..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs text-slate-800 dark:text-white placeholder-slate-400 w-full"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {['all', 'available', 'on_course', 'leave'].map(st => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize ${statusFilter === st ? 'bg-slate-900 text-white dark:bg-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                        >
                            {st.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Caddies Grid */}
            {loading ? (
                <div className="p-12 text-center text-slate-400 font-bold text-xs">Loading caddy roster...</div>
            ) : filtered.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <Users size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No caddies found</p>
                    <p className="text-xs text-slate-400 mt-1">Populate demo records from Settings or register a new caddy above.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filtered.map(caddy => (
                        <div key={caddy.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-black">
                                        {caddy.caddy_number}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                        caddy.status === 'available'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : caddy.status === 'on_course'
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {caddy.status?.replace('_', ' ')}
                                    </span>
                                </div>

                                <h3 className="font-serif font-black text-slate-900 dark:text-white text-base mt-3">
                                    {caddy.first_name} {caddy.last_name}
                                </h3>
                                <p className="text-xs text-slate-500 font-bold mt-0.5">Rating: {caddy.handicap_rating || 'Class A'} • {caddy.experience_years || 1} yrs exp</p>
                                {caddy.phone && (
                                    <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1">
                                        <Phone size={12} /> {caddy.phone}
                                    </p>
                                )}
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                                <span className="text-[10px] text-slate-400 uppercase font-black">Change Status:</span>
                                <button
                                    onClick={() => handleToggleStatus(caddy.id, caddy.status)}
                                    className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition"
                                >
                                    {caddy.status === 'available' ? 'Dispatch to Course' : caddy.status === 'on_course' ? 'Set Off Duty' : 'Set Available'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="text-base font-serif font-black text-slate-900 dark:text-white">
                                Enroll New Caddy
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveCaddy} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Caddy Badge # *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.caddy_number}
                                        onChange={(e) => setFormData({ ...formData, caddy_number: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Class Rating</label>
                                    <select
                                        value={formData.handicap_rating}
                                        onChange={(e) => setFormData({ ...formData, handicap_rating: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    >
                                        <option value="Class A">Class A (Expert / Single HCP)</option>
                                        <option value="Class B">Class B (Experienced)</option>
                                        <option value="Class C">Class C (Trainee)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">First Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Last Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        placeholder="+254 700 000 000"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Experience (Yrs)</label>
                                    <input
                                        type="number"
                                        value={formData.experience_years}
                                        onChange={(e) => setFormData({ ...formData, experience_years: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition"
                            >
                                Save Caddy to Roster
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CaddiesPage;
