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

    // Manual Award Form
    const [formData, setFormData] = useState({
        member_id_str: '',
        points: 0,
        activity_type: 'Workshop',
        description: '',
        awarded_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchLedger();
    }, []);

    const fetchLedger = async () => {
        try {
            setLoading(true);
            const response = await AdminAPI.getCPDLedger();
            if (response.success) {
                setLedger(response.ledger);
            }
        } catch (error) {
            console.error("Failed to fetch CPD ledger:", error);
            Swal.fire('Error', 'Could not load CPD ledger', 'error');
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
        <div className="p-1 md:p-6 space-y-6 animate-fade-in font-dm-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">CPD Points Management</h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Track and allocate professional development credits</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchLedger}
                        className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-emerald-600 transition-colors shadow-sm"
                    >
                        <RefreshCw size={18} className={clsx(loading && "animate-spin")} />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                    >
                        <Plus size={16} /> Allocate Points
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-500 rounded-xl">
                            <ArrowUpRight size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">This Month</span>
                    </div>
                    <h3 className="text-3xl font-black tracking-tighter mb-1">
                        {ledger.reduce((acc, item) => {
                            const date = new Date(item.created_at);
                            const now = new Date();
                            return (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) ? acc + Number(item.points) : acc;
                        }, 0)}
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Points Awarded</p>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <Clock size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Transactions</span>
                    </div>
                    <h3 className="text-3xl font-black tracking-tighter text-slate-900 mb-1">{ledger.length}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Ledger Records</p>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                            <Calendar size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Avg Points / Award</span>
                    </div>
                    <h3 className="text-3xl font-black tracking-tighter text-slate-900 mb-1">
                        {ledger.length > 0 ? (ledger.reduce((acc, item) => acc + Number(item.points), 0) / ledger.length).toFixed(1) : 0}
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Points Per Event</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by member names, ID or reason..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    {['all', 'Workshop', 'Conference', 'Seminar', 'Manual Award'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={clsx(
                                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                filterType === type
                                    ? "bg-slate-900 text-white shadow-lg"
                                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                            )}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Ledger Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Member Info</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Activity Details</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Points</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Timestamp</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Awarded By</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-6 py-8">
                                            <div className="h-4 bg-gray-50 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredLedger.length > 0 ? (
                                filteredLedger.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                                    <User size={18} />
                                                </div>
                                                <Link to={`/dashboard/members/${item.member_id}`} className="hover:opacity-80 transition-opacity">
                                                    <p className="text-xs font-black text-slate-900 uppercase tracking-tighter hover:text-emerald-600 transition-colors">{item.first_name} {item.last_name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.membership_number}</p>
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="px-2 py-0.5 inline-block bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase tracking-tighter mb-1">
                                                {item.activity_type}
                                            </div>
                                            <p className="text-xs font-medium text-slate-600 line-clamp-1">{item.description}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                                                    <Award size={16} />
                                                </div>
                                                <span className="text-lg font-black text-slate-900">+{item.points}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xs font-bold text-slate-900">{new Date(item.created_at).toLocaleDateString()}</p>
                                            <p className="text-[10px] font-medium text-gray-400">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">
                                                {item.admin_name ? `${item.admin_name} ${item.admin_last_name}` : 'SYSTEM'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 text-gray-400 hover:text-slate-900">
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <Award size={48} className="text-gray-200 mb-4" />
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No CPD records found</p>
                                        </div>
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
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Award professional credits with reason</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleManualAward} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Membership Number</label>
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
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Points to Award</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.points}
                                            onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all font-dm-sans"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Activity Type</label>
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
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Description / Reason</label>
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
                                className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50 font-dm-sans"
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
