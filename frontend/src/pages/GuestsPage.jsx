import React, { useState, useEffect } from 'react';
import {
    UserPlus, Plus, Search, CheckCircle, Clock, DollarSign,
    User, Phone, Mail, Filter, Download, Check, X, Shield
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';
import MemberSearchInput from '../components/MemberSearchInput';

const DEFAULT_GUESTS = [
    {
        id: 1,
        guest_pass_number: 'GP-2025-0142',
        first_name: 'Brian',
        last_name: 'Langat',
        phone: '+254 722 458 912',
        email: 'brian.langat@gmail.com',
        host_member_name: 'Kevin Omondi',
        host_member_number: 'MMS-0033',
        visit_date: '2025-09-21',
        purpose: 'Golf 18-Holes',
        guest_fee: 3500,
        handicap: 18.2,
        payment_status: 'paid',
        check_in_status: 'on_course'
    },
    {
        id: 2,
        guest_pass_number: 'GP-2025-0143',
        first_name: 'Samuel',
        last_name: 'Kiptoo',
        phone: '+254 733 812 400',
        email: 'samuel.kiptoo@outlook.com',
        host_member_name: 'Kevin Omondi',
        host_member_number: 'MMS-0033',
        visit_date: '2025-09-21',
        purpose: 'Golf 18-Holes',
        guest_fee: 3500,
        handicap: 12.5,
        payment_status: 'paid',
        check_in_status: 'on_course'
    },
    {
        id: 3,
        guest_pass_number: 'GP-2025-0140',
        first_name: 'Michael',
        last_name: 'Thorne',
        phone: '+254 711 902 334',
        email: 'mthorne@nairobiexpat.com',
        host_member_name: 'Club Visitor',
        host_member_number: 'VISITOR',
        visit_date: '2025-09-20',
        purpose: 'Visitor Day Pass',
        guest_fee: 6000,
        handicap: 9.0,
        payment_status: 'paid',
        check_in_status: 'checked_out'
    },
    {
        id: 4,
        guest_pass_number: 'GP-2025-0144',
        first_name: 'Evans',
        last_name: 'Ruto',
        phone: '+254 728 554 120',
        email: 'eruto@standardbank.co.ke',
        host_member_name: 'Daniel Koech',
        host_member_number: 'MMS-0056',
        visit_date: '2025-09-21',
        purpose: 'Golf 9-Holes',
        guest_fee: 2500,
        handicap: 19.0,
        payment_status: 'pending',
        check_in_status: 'registered'
    }
];

const GuestsPage = () => {
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        host_member_name: '',
        visit_date: new Date().toISOString().split('T')[0],
        purpose: 'Golf 18-Holes (Member Guest)',
        guest_fee: 3500,
        handicap: '18.0'
    });

    useEffect(() => {
        fetchGuests();
    }, []);

    const fetchGuests = async () => {
        setLoading(true);
        try {
            const res = await AdminAPI.getGuests();
            const list = res?.data || res?.guests || [];
            if (Array.isArray(list)) {
                setGuests(list);
            } else {
                setGuests([]);
            }
        } catch (e) {
            console.warn("Error fetching guests:", e);
            setGuests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!form.first_name.trim() || !form.last_name.trim()) {
            Swal.fire('Required', 'Please enter guest full name', 'warning');
            return;
        }

        const newPassNum = `GP-2025-0${Math.floor(150 + Math.random() * 850)}`;
        const newGuest = {
            ...form,
            id: Date.now(),
            guest_pass_number: newPassNum,
            payment_status: 'paid',
            check_in_status: 'registered'
        };

        try {
            await AdminAPI.createGuest(newGuest);
        } catch (err) {
            console.warn("Backend create guest fallback:", err);
        }

        setGuests([newGuest, ...guests]);
        setShowModal(false);

        Swal.fire({
            icon: 'success',
            title: 'Guest Pass Issued!',
            text: `Pass #${newPassNum} generated for ${form.first_name} ${form.last_name}`,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    const handleMarkPaid = (id) => {
        setGuests(guests.map(g => g.id === id ? { ...g, payment_status: 'paid' } : g));
        Swal.fire({
            icon: 'success',
            title: 'Green Fee Paid',
            text: 'Green fee marked as collected.',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    const filtered = guests.filter(g => {
        const full = `${g.first_name || ''} ${g.last_name || ''}`.toLowerCase();
        const host = (g.host_member_name || '').toLowerCase();
        const pass = (g.guest_pass_number || '').toLowerCase();
        const q = searchQuery.toLowerCase();
        return full.includes(q) || host.includes(q) || pass.includes(q);
    });

    const totalGreenFees = guests.reduce((acc, curr) => acc + (Number(curr.guest_fee) || 0), 0);

    return (
        <div className="flex flex-col gap-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <UserPlus className="text-emerald-600" size={24} />
                        Guest Passes & Green Fees
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
                        MMS Golf Club • Member Guest Registration & Visitor Green Fees
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition shadow-sm active:scale-95"
                    >
                        <Plus size={14} strokeWidth={3} />
                        Issue Guest Pass
                    </button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Total Guests</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{guests.length}</span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">This Month</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block mb-1">Green Fee Revenue</span>
                    <span className="text-2xl font-black text-emerald-600 leading-none">KES {totalGreenFees.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">Collected / Billed</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block mb-1">On Course Now</span>
                    <span className="text-2xl font-black text-blue-600 leading-none">
                        {guests.filter(g => g.check_in_status === 'on_course').length}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">Active Flights</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block mb-1">Pending Fees</span>
                    <span className="text-2xl font-black text-amber-500 leading-none">
                        {guests.filter(g => g.payment_status === 'pending').length}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">Awaiting Payment</span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/60 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 max-w-sm w-full">
                    <Search size={15} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search guest name, host member, pass #..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs text-slate-800 dark:text-white placeholder-slate-400 w-full"
                    />
                </div>
            </div>

            {/* Guests Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-white/5 text-[9px] font-black uppercase tracking-wider text-slate-400">
                                <th className="p-3.5 pl-5">Pass #</th>
                                <th className="p-3.5">Guest Name</th>
                                <th className="p-3.5">Host Member</th>
                                <th className="p-3.5">Visit Date</th>
                                <th className="p-3.5">Activity</th>
                                <th className="p-3.5 text-center">HCP</th>
                                <th className="p-3.5 text-right">Green Fee</th>
                                <th className="p-3.5 text-center">Fee Status</th>
                                <th className="p-3.5 text-center">Course Status</th>
                                <th className="p-3.5 pr-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                            {filtered.map((g) => {
                                const isPaid = g.payment_status === 'paid';
                                return (
                                    <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                                        <td className="p-3.5 pl-5 font-black text-emerald-600 font-mono text-[11px]">
                                            {g.guest_pass_number}
                                        </td>
                                        <td className="p-3.5">
                                            <div className="font-black text-slate-900 dark:text-white">
                                                {g.first_name} {g.last_name}
                                            </div>
                                            <span className="text-[10px] text-slate-400">{g.phone}</span>
                                        </td>
                                        <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">
                                            {g.host_member_name || 'Club Direct'}
                                        </td>
                                        <td className="p-3.5 text-slate-500 font-medium">
                                            {g.visit_date}
                                        </td>
                                        <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">
                                            {g.purpose}
                                        </td>
                                        <td className="p-3.5 text-center font-black text-slate-800 dark:text-slate-200">
                                            {g.handicap || '—'}
                                        </td>
                                        <td className="p-3.5 text-right font-black text-slate-900 dark:text-white">
                                            KES {Number(g.guest_fee || 0).toLocaleString()}
                                        </td>
                                        <td className="p-3.5 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                isPaid
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                            }`}>
                                                {isPaid ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                g.check_in_status === 'on_course'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                            }`}>
                                                {g.check_in_status?.replace('_', ' ') || 'Registered'}
                                            </span>
                                        </td>
                                        <td className="p-3.5 pr-5 text-right">
                                            {!isPaid && (
                                                <button
                                                    onClick={() => handleMarkPaid(g.id)}
                                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition"
                                                >
                                                    Mark Paid
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Issue Guest Pass Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <h3 className="text-base font-serif font-black text-slate-900 dark:text-white">
                                Issue Guest Pass & Green Fee
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleRegister} className="p-5 space-y-3.5">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Brian"
                                        value={form.first_name}
                                        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Langat"
                                        value={form.last_name}
                                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="+254 722 000 000"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                                        value={form.handicap}
                                        onChange={(e) => setForm({ ...form, handicap: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                    Host Member Name (Search member or leave blank for walk-in)
                                </label>
                                <MemberSearchInput
                                    value={form.host_member_name}
                                    placeholder="Search host member (e.g. Kevin Omondi)..."
                                    onChange={(val) => {
                                        const name = typeof val === 'object' && val !== null ? val.player_name : val;
                                        setForm({ ...form, host_member_name: name });
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Visit Date
                                    </label>
                                    <input
                                        type="date"
                                        value={form.visit_date}
                                        onChange={(e) => setForm({ ...form, visit_date: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Green Fee (KES)
                                    </label>
                                    <input
                                        type="number"
                                        value={form.guest_fee}
                                        onChange={(e) => setForm({ ...form, guest_fee: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95"
                                >
                                    Generate Pass
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuestsPage;
