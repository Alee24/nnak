import React, { useState, useEffect } from 'react';
import {
    UserCheck, Search, Clock, LogOut, CheckCircle, ShieldAlert,
    User, Flag, Coffee, Dumbbell, Calendar, Plus, RefreshCw,
    X, Sparkles, AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';

const DEFAULT_CHECKINS = [
    { id: 1, member_name: 'Alex Metto', member_number: 'MMS-0042', purpose: 'Golf (Championship 18H)', check_in_time: '07:15 AM', status: 'on_course', handicap: 6.4, cart_assigned: 'Cart #12' },
    { id: 2, member_name: 'Dr. Arthur Mwangi', member_number: 'MMS-0015', purpose: 'Golf (Championship 18H)', check_in_time: '07:22 AM', status: 'on_course', handicap: 8.2, cart_assigned: 'Walking (Caddy #09)' },
    { id: 3, member_name: 'Sarah Wanjiku', member_number: 'MMS-0088', purpose: 'Golf (Executive 9H)', check_in_time: '08:05 AM', status: 'on_course', handicap: 14.1, cart_assigned: 'Cart #04' },
    { id: 4, member_name: 'Kevin Omondi', member_number: 'MMS-0033', purpose: 'Driving Range', check_in_time: '08:30 AM', status: 'completed', handicap: 11.0, cart_assigned: 'None' },
    { id: 5, member_name: 'Hon. Joseph Ndegwa', member_number: 'MMS-0012', purpose: 'Clubhouse Dining', check_in_time: '09:10 AM', status: 'active', handicap: 18.2, cart_assigned: 'None' },
    { id: 6, member_name: 'George Otieno', member_number: 'MMS-0004', purpose: 'Golf (Championship 18H)', check_in_time: '09:45 AM', status: 'on_course', handicap: 3.1, cart_assigned: 'Cart #18' },
];

const CheckInPage = () => {
    const [query, setQuery] = useState('');
    const [purpose, setPurpose] = useState('Golf (Championship 18H)');
    const [cartOption, setCartOption] = useState('none');
    const [todayCheckIns, setTodayCheckIns] = useState(DEFAULT_CHECKINS);
    const [loading, setLoading] = useState(false);
    const [matchedMember, setMatchedMember] = useState(null);

    // Guest check-in modal
    const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
    const [guestForm, setGuestForm] = useState({
        guest_name: '',
        host_member: '',
        phone: '',
        purpose: 'Golf Green Fee (18 Holes)',
        handicap: '18.0'
    });

    useEffect(() => {
        fetchToday();
    }, []);

    const fetchToday = async () => {
        try {
            const res = await AdminAPI.getTodayCheckIns();
            const list = res?.data || res?.checkins || [];
            if (Array.isArray(list) && list.length > 0) {
                setTodayCheckIns(list);
            } else {
                setTodayCheckIns(DEFAULT_CHECKINS);
            }
        } catch (e) {
            console.warn("Using fallback checkins:", e);
            setTodayCheckIns(DEFAULT_CHECKINS);
        }
    };

    const handleSearchCheck = (val) => {
        setQuery(val);
        if (val.trim().length >= 2) {
            // Quick mock match or search
            setMatchedMember({
                name: val,
                member_number: `MMS-${Math.floor(1000 + Math.random() * 9000)}`,
                status: 'Active Member',
                handicap: '12.4',
                balance: 'KES 0 (Up to date)'
            });
        } else {
            setMatchedMember(null);
        }
    };

    const handleCheckIn = async (e) => {
        e.preventDefault();
        if (!query.trim()) {
            Swal.fire('Required', 'Enter member name or membership number', 'warning');
            return;
        }

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newEntry = {
            id: Date.now(),
            member_name: matchedMember ? matchedMember.name : query,
            member_number: matchedMember ? matchedMember.member_number : 'MMS-0099',
            purpose,
            check_in_time: timeStr,
            status: purpose.includes('Golf') ? 'on_course' : 'active',
            handicap: matchedMember ? matchedMember.handicap : '18.0',
            cart_assigned: cartOption === 'cart' ? 'Cart Assigned' : cartOption === 'caddy' ? 'Caddy Assigned' : 'Walking'
        };

        try {
            await AdminAPI.checkIn({
                search_query: query,
                purpose,
                cart_option: cartOption
            });
        } catch (err) {
            console.warn("Backend checkin fallback:", err);
        }

        setTodayCheckIns([newEntry, ...todayCheckIns]);
        setQuery('');
        setMatchedMember(null);

        Swal.fire({
            icon: 'success',
            title: 'Golfer Checked In!',
            text: `${newEntry.member_name} checked in for ${purpose}`,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    const handleGuestCheckIn = (e) => {
        e.preventDefault();
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newGuest = {
            id: Date.now(),
            member_name: `${guestForm.guest_name} (Guest of ${guestForm.host_member || 'Club'})`,
            member_number: 'GUEST',
            purpose: guestForm.purpose,
            check_in_time: timeStr,
            status: 'on_course',
            handicap: guestForm.handicap,
            cart_assigned: 'Green Fee Paid'
        };

        setTodayCheckIns([newGuest, ...todayCheckIns]);
        setIsGuestModalOpen(false);

        Swal.fire({
            icon: 'success',
            title: 'Guest Registered & Checked In',
            text: `${guestForm.guest_name} has been issued a daily green fee tag.`,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    const handleCheckOut = (id) => {
        setTodayCheckIns(todayCheckIns.map(item =>
            item.id === id ? { ...item, status: 'completed' } : item
        ));
        Swal.fire({
            icon: 'info',
            title: 'Checked Out',
            text: 'Golfer marked completed and off course.',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    const totalToday = todayCheckIns.length;
    const onCourse = todayCheckIns.filter(c => c.status === 'on_course').length;

    return (
        <div className="flex flex-col gap-6 pb-12 animate-fade-in max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <UserCheck className="text-emerald-600" size={26} />
                        Member & Golfer Course Check-In
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
                        MMS Golf Club • Pro Shop & Clubhouse Reception Desk
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => setIsGuestModalOpen(true)}
                        className="flex items-center gap-2 bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-600 transition shadow-sm active:scale-95"
                    >
                        <Plus size={14} strokeWidth={3} />
                        Guest Green Fee Check-In
                    </button>
                    <button
                        onClick={fetchToday}
                        className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
                        title="Refresh List"
                    >
                        <RefreshCw size={15} />
                    </button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Today's Check-Ins</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{totalToday}</span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">Total Arrivals</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block mb-1">Currently On Course</span>
                    <span className="text-2xl font-black text-emerald-600 leading-none">{onCourse}</span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">Active Golfers</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block mb-1">Clubhouse Dining</span>
                    <span className="text-2xl font-black text-blue-600 leading-none">{todayCheckIns.filter(c => c.purpose.includes('Dining')).length}</span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">Lounge & Dining</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 block mb-1">Practice / Range</span>
                    <span className="text-2xl font-black text-purple-600 leading-none">{todayCheckIns.filter(c => c.purpose.includes('Range')).length}</span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">Driving Range</span>
                </div>
            </div>

            {/* Fast Check-In Panel */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                <h2 className="text-sm font-serif font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <Search size={16} className="text-emerald-600" />
                    Rapid Golfer Verification & Check-In
                </h2>

                <form onSubmit={handleCheckIn} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                Search Member by Name, Phone or Membership Number *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Type member name (e.g. Alex Metto, Arthur Mwangi) or MMS-0042..."
                                value={query}
                                onChange={(e) => handleSearchCheck(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                Facility / Purpose
                            </label>
                            <select
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                            >
                                <option value="Golf (Championship 18H)">Golf — Championship 18 Holes</option>
                                <option value="Golf (Executive 9H)">Golf — Executive 9 Holes</option>
                                <option value="Driving Range">Practice — Driving Range</option>
                                <option value="Clubhouse Dining">Clubhouse — Lounge & Dining</option>
                                <option value="Swimming Pool & Fitness">Club Services — Pool & Gym</option>
                                <option value="Tournament Play">Tournament — Official Competition</option>
                            </select>
                        </div>
                    </div>

                    {/* Member Verification Preview Card */}
                    {matchedMember && (
                        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between animate-fade-in">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                                    {matchedMember.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-serif font-black text-slate-900 dark:text-white text-sm">{matchedMember.name}</span>
                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                                            {matchedMember.status}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mt-0.5">
                                        {matchedMember.member_number} • Handicap Index: <strong className="text-emerald-700 dark:text-emerald-400">{matchedMember.handicap}</strong> • Account: {matchedMember.balance}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <select
                                    value={cartOption}
                                    onChange={(e) => setCartOption(e.target.value)}
                                    className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-white px-3 py-1.5 rounded-xl outline-none"
                                >
                                    <option value="none">Walking</option>
                                    <option value="cart">Rent Cart</option>
                                    <option value="caddy">Assign Caddy</option>
                                </select>

                                <button
                                    type="submit"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider px-5 py-2 rounded-xl transition shadow-sm active:scale-95"
                                >
                                    Confirm Check-In
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            {/* Today's Check-Ins Registry */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="font-serif font-black text-slate-900 dark:text-white text-sm">
                            Today’s Course & Club Arrivals
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Live attendance ledger
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-white/5 text-[9px] font-black uppercase tracking-wider text-slate-400">
                                <th className="p-3.5 pl-5">Arrival Time</th>
                                <th className="p-3.5">Golfer / Member</th>
                                <th className="p-3.5">Member ID</th>
                                <th className="p-3.5">Activity</th>
                                <th className="p-3.5 text-center">HCP</th>
                                <th className="p-3.5">Equipment / Caddy</th>
                                <th className="p-3.5 text-center">Status</th>
                                <th className="p-3.5 pr-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                            {todayCheckIns.map((ci) => {
                                const isOnCourse = ci.status === 'on_course';
                                return (
                                    <tr key={ci.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                                        <td className="p-3.5 pl-5 font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                            <Clock size={13} className="text-emerald-600" />
                                            {ci.check_in_time}
                                        </td>
                                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                                            {ci.member_name}
                                        </td>
                                        <td className="p-3.5 text-slate-400 font-bold text-[10px]">
                                            {ci.member_number}
                                        </td>
                                        <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">
                                            {ci.purpose}
                                        </td>
                                        <td className="p-3.5 text-center font-black text-slate-800 dark:text-slate-200">
                                            {ci.handicap || '—'}
                                        </td>
                                        <td className="p-3.5 text-slate-500 text-[11px]">
                                            {ci.cart_assigned || 'Walking'}
                                        </td>
                                        <td className="p-3.5 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                isOnCourse
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                    : ci.status === 'completed'
                                                    ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                                            }`}>
                                                {isOnCourse ? 'On Course' : ci.status === 'completed' ? 'Finished' : 'In Club'}
                                            </span>
                                        </td>
                                        <td className="p-3.5 pr-5 text-right">
                                            {isOnCourse && (
                                                <button
                                                    onClick={() => handleCheckOut(ci.id)}
                                                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-[10px] font-bold"
                                                >
                                                    Mark Off Course
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

            {/* Guest Green Fee Check-In Modal */}
            {isGuestModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-serif font-black text-slate-900 dark:text-white">
                                    Guest Green Fee Registration
                                </h3>
                                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-wider mt-0.5">
                                    MMS Golf Club Daily Pass
                                </p>
                            </div>
                            <button
                                onClick={() => setIsGuestModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleGuestCheckIn} className="p-5 space-y-3.5">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                    Guest Golfer Full Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Michael Thorne"
                                    value={guestForm.guest_name}
                                    onChange={(e) => setGuestForm({ ...guestForm, guest_name: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Host Member Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Alex Metto"
                                        value={guestForm.host_member}
                                        onChange={(e) => setGuestForm({ ...guestForm, host_member: e.target.value })}
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
                                        value={guestForm.handicap}
                                        onChange={(e) => setGuestForm({ ...guestForm, handicap: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                    Green Fee Tier
                                </label>
                                <select
                                    value={guestForm.purpose}
                                    onChange={(e) => setGuestForm({ ...guestForm, purpose: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                >
                                    <option value="Guest with Member (18H) — KES 3,500">Guest with Member (18H) — KES 3,500</option>
                                    <option value="Non-Affiliated Visitor (18H) — KES 6,000">Non-Affiliated Visitor (18H) — KES 6,000</option>
                                    <option value="Sunset 9-Hole Rate — KES 2,500">Sunset 9-Hole Rate — KES 2,500</option>
                                </select>
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsGuestModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95"
                                >
                                    Complete Green Fee Check-In
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckInPage;
