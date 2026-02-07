import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Award, Search, Filter, Plus, Calendar,
    ArrowUpRight, ArrowDownRight, User,
    MoreVertical, Download, Clock, CheckCircle,
    AlertCircle, RefreshCw
} from 'lucide-react';
import AdminAPI from '../services/api';
import Swal from 'sweetalert2';
import clsx from 'clsx';

const CPDPoints = () => {
    const [ledger, setLedger] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [user, setUser] = useState(null);

    // Manual Award Form
    const [formData, setFormData] = useState({
        member_id_str: '',
        points: 0,
        activity_type: 'Workshop',
        description: '',
        awarded_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

    useEffect(() => {
        if (user) {
            fetchLedger();
        }
    }, [user]);

    const fetchLedger = async () => {
        try {
            setLoading(true);
            const response = isAdmin
                ? await AdminAPI.getCPDLedger()
                : await AdminAPI.getMemberCPD('me');

            if (response.success) {
                setLedger(isAdmin ? (response.ledger || []) : (response.history || []));
            }
        } catch (error) {
            console.error("Failed to fetch CPD data:", error);
            Swal.fire('Error', 'Could not load CPD records', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleManualAward = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // First find member by membership number
            const response = await AdminAPI.awardManualCPD(formData.member_id_str, {
                points: formData.points,
                activity_type: formData.activity_type,
                description: formData.description,
                awarded_date: formData.awarded_date,
                is_membership_number: true // Flag to tell backend we are sending membership number
            });

            if (response.success) {
                Swal.fire('Success', response.message, 'success');
                setIsModalOpen(false);
                setFormData({
                    member_id_str: '',
                    points: 0,
                    activity_type: 'Workshop',
                    description: '',
                    awarded_date: new Date().toISOString().split('T')[0]
                });
                fetchLedger();
            }
        } catch (error) {
            const msg = error.response?.data?.error || error.message;
            Swal.fire('Error', msg, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredLedger = ledger.filter(item =>
        (item.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.membership_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (filterType === 'all' || item.activity_type === filterType)
    );

    return (
        <div className="flex flex-col gap-4 animate-fade-in font-inter pb-8">
            {/* Header Section - Standardized High Density */}
            <div className="flex justify-between items-end px-1">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CPD Ledger</h1>
                    <p className="text-xs text-[#059669] font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                        <span className="w-4 h-px bg-[#059669]/30"></span>
                        Professional Development Tracking
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchLedger}
                        className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition-all shadow-sm active:scale-95"
                    >
                        <RefreshCw size={14} className={clsx(loading && "animate-spin")} />
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-md hover:bg-emerald-600 transition-all active:scale-95"
                        >
                            <Plus size={12} strokeWidth={3} /> Allocate Points
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Overview - Compact High Density */}
            {isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 px-1">
                    <div className="bg-emerald-600 p-4 rounded-2xl text-white shadow-lg shadow-emerald-50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="relative z-10 flex flex-col gap-1">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">This Month Awarded</p>
                            <h3 className="text-xl font-bold tracking-tight">
                                {ledger.reduce((acc, item) => {
                                    const date = new Date(item.created_at);
                                    const now = new Date();
                                    return (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) ? acc + Number(item.points) : acc;
                                }, 0)}
                            </h3>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Transactions</p>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">{ledger.length}</h3>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Points / Award</p>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                            {ledger.length > 0 ? (ledger.reduce((acc, item) => acc + Number(item.points), 0) / ledger.length).toFixed(1) : 0}
                        </h3>
                    </div>
                </div>
            )}

            {/* Filters - High Density */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-2 rounded-2xl border border-slate-100 shadow-sm mx-1">
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search ledger..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/5 transition-all outline-none"
                    />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                    {['all', 'Workshop', 'Conference', 'Seminar', 'Manual Award'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={clsx(
                                "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                filterType === type
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Ledger Table - High Density */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mx-1">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-[0.1em]">Recipient</th>
                                <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-[0.1em]">Activity / Description</th>
                                <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-[0.1em]">Points</th>
                                <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-[0.1em]">Timeline</th>
                                <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-[0.1em]">Issuer</th>
                                <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-[0.1em]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-4 py-6">
                                            <div className="h-3 bg-slate-50 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredLedger.length > 0 ? (
                                filteredLedger.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                                    <User size={14} />
                                                </div>
                                                {isAdmin ? (
                                                    <Link to={`/dashboard/members/${item.member_id}`} className="hover:opacity-80 transition-opacity">
                                                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{item.first_name} {item.last_name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.membership_number}</p>
                                                    </Link>
                                                ) : (
                                                    <div>
                                                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{item.first_name} {item.last_name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.membership_number}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tight">{item.activity_type}</span>
                                                <p className="text-xs font-medium text-slate-500 line-clamp-1">{item.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded flex items-center justify-center">
                                                    <Award size={10} strokeWidth={3} />
                                                </div>
                                                <span className="text-[13px] font-black text-slate-900">+{item.points}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-[10px]">
                                            <p className="font-bold text-slate-900">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            <p className="font-medium text-slate-400 mt-0.5">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>
                                        <td className="px-4 py-3 text-[10px]">
                                            <p className="font-black text-slate-900 uppercase tracking-tight italic">
                                                {item.admin_name ? `${item.admin_name} ${item.admin_last_name}` : 'SYSTEM AUTO'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button className="p-1.5 text-slate-300 hover:text-slate-900 transition-colors">
                                                <MoreVertical size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-16 text-center">
                                        <Award size={32} className="text-slate-100 mx-auto mb-3" />
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No ledger items recorded</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Allocate Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                        <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black tracking-tighter uppercase font-dm-sans">Manual CPD Allocation</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Award professional credits with reason</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleManualAward} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Membership Number</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. NNAK-2024-001"
                                        value={formData.member_id_str}
                                        onChange={(e) => setFormData({ ...formData, member_id_str: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all font-dm-sans"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Points to Award</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.points}
                                            onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all font-dm-sans"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Activity Type</label>
                                        <select
                                            value={formData.activity_type}
                                            onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all font-dm-sans"
                                        >
                                            <option value="Workshop">Workshop</option>
                                            <option value="Seminar">Seminar</option>
                                            <option value="Conference">Conference</option>
                                            <option value="Journal Club">Journal Club</option>
                                            <option value="Manual Award">Manual Award</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Description / Reason</label>
                                    <textarea
                                        required
                                        rows="3"
                                        placeholder="Briefly describe the reason for allocation..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none font-dm-sans"
                                    ></textarea>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50 font-dm-sans"
                            >
                                {isSaving ? 'Processing...' : 'Verify & Award Points'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CPDPoints;
