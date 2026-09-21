import React, { useState, useEffect } from 'react';
import {
    Map, Calendar, Plus, Clock, Users, DollarSign,
    CheckCircle, AlertCircle, Dumbbell, Coffee, Sparkles,
    X, Shield, Check
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';

const DEFAULT_FACILITIES = [
    {
        id: 1,
        name: 'The Simba Ballroom & Banquet Hall',
        category: 'Function Hall',
        capacity: 250,
        member_hourly_rate: 15000,
        guest_hourly_rate: 25000,
        status: 'available',
        hours: '08:00 AM – 11:00 PM',
        description: 'Luxury ballroom with scenic fairway terrace, staging, AV sound system and full banquet catering service.'
    },
    {
        id: 2,
        name: 'Executive Boardroom',
        category: 'Meeting Room',
        capacity: 20,
        member_hourly_rate: 3500,
        guest_hourly_rate: 5500,
        status: 'available',
        hours: '07:00 AM – 09:00 PM',
        description: 'High-speed fiber WiFi, 4K interactive conference screen, video conferencing and private coffee bar.'
    },
    {
        id: 3,
        name: 'Championship Tennis Courts (x4)',
        category: 'Sports',
        capacity: 8,
        member_hourly_rate: 800,
        guest_hourly_rate: 1500,
        status: 'available',
        hours: '06:00 AM – 09:00 PM',
        description: 'Floodlit all-weather hard courts with ball machine rental and resident club tennis pro coaching.'
    },
    {
        id: 4,
        name: 'Olympic Heated Swimming Pool',
        category: 'Leisure',
        capacity: 50,
        member_hourly_rate: 500,
        guest_hourly_rate: 1200,
        status: 'available',
        hours: '06:30 AM – 07:30 PM',
        description: '50-meter temperature controlled pool, sun loungers, poolside cafe and certified lifeguards on duty.'
    },
    {
        id: 5,
        name: 'Driving Range & Practice Bays (30 Bays)',
        category: 'Golf Practice',
        capacity: 30,
        member_hourly_rate: 600,
        guest_hourly_rate: 1000,
        status: 'available',
        hours: '06:00 AM – 09:00 PM',
        description: 'Floodlit 300-yard driving range, automated ball dispensers, putting green and short game chipping area.'
    },
    {
        id: 6,
        name: 'Clubhouse Health & Fitness Gym',
        category: 'Fitness',
        capacity: 25,
        member_hourly_rate: 0,
        guest_hourly_rate: 800,
        status: 'available',
        hours: '05:30 AM – 09:30 PM',
        description: 'Cardio equipment, free weights, sauna, steam room and personal training sessions.'
    }
];

const DEFAULT_BOOKINGS = [
    { id: 1, facility_name: 'The Simba Ballroom & Banquet Hall', member_name: 'Alex Metto', date: '2025-09-27', time: '06:00 PM – 11:00 PM', guests: 120, purpose: 'Tournament Dinner & Gala' },
    { id: 2, facility_name: 'Executive Boardroom', member_name: 'Dr. Arthur Mwangi', date: '2025-09-22', time: '10:00 AM – 01:00 PM', guests: 14, purpose: 'Quarterly Corporate Review' },
    { id: 3, facility_name: 'Championship Tennis Courts (x4)', member_name: 'Sarah Wanjiku', date: '2025-09-21', time: '04:00 PM – 06:00 PM', guests: 4, purpose: 'Club Doubles Match' }
];

const FacilitiesPage = () => {
    const [facilities, setFacilities] = useState(DEFAULT_FACILITIES);
    const [bookings, setBookings] = useState(DEFAULT_BOOKINGS);
    const [loading, setLoading] = useState(false);
    const [showBookModal, setShowBookModal] = useState(false);
    const [bookForm, setBookForm] = useState({
        facility_id: 1,
        member_name: '',
        member_number: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '10:00',
        end_time: '12:00',
        attendees: 10,
        purpose: ''
    });

    useEffect(() => {
        fetchFacilities();
    }, []);

    const fetchFacilities = async () => {
        setLoading(true);
        try {
            const res = await AdminAPI.getFacilities();
            const list = res?.data || res?.facilities || [];
            if (Array.isArray(list) && list.length > 0) {
                setFacilities(list);
            } else {
                setFacilities(DEFAULT_FACILITIES);
            }
        } catch (e) {
            console.warn("Using fallback facilities:", e);
            setFacilities(DEFAULT_FACILITIES);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBooking = (e) => {
        e.preventDefault();
        if (!bookForm.member_name.trim()) {
            Swal.fire('Required', 'Please enter member name', 'warning');
            return;
        }

        const fac = facilities.find(f => f.id === Number(bookForm.facility_id)) || facilities[0];
        const newBooking = {
            id: Date.now(),
            facility_name: fac.name,
            member_name: bookForm.member_name,
            date: bookForm.date,
            time: `${bookForm.start_time} – ${bookForm.end_time}`,
            guests: Number(bookForm.attendees) || 1,
            purpose: bookForm.purpose || 'Private Booking'
        };

        setBookings([newBooking, ...bookings]);
        setShowBookModal(false);

        Swal.fire({
            icon: 'success',
            title: 'Facility Reserved',
            text: `${fac.name} booked for ${bookForm.member_name} on ${bookForm.date}.`,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    return (
        <div className="flex flex-col gap-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Map className="text-emerald-600" size={24} />
                        Club Facilities & Venue Bookings
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
                        MMS Golf Club • Function halls, boardrooms, courts, pool & driving range
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowBookModal(true)}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition shadow-sm active:scale-95"
                    >
                        <Plus size={14} strokeWidth={3} />
                        Reserve Facility
                    </button>
                </div>
            </div>

            {/* Facilities Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {facilities.map((fac) => (
                    <div
                        key={fac.id}
                        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition space-y-4"
                    >
                        <div className="space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                                        {fac.category}
                                    </span>
                                    <h3 className="font-serif font-black text-slate-900 dark:text-white text-base leading-tight">
                                        {fac.name}
                                    </h3>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 flex-shrink-0">
                                    {fac.status}
                                </span>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {fac.description}
                            </p>

                            <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 dark:bg-slate-700/40 rounded-xl text-xs">
                                <div>
                                    <span className="text-[9px] font-black uppercase text-slate-400 block">Capacity</span>
                                    <span className="font-black text-slate-800 dark:text-slate-200 mt-0.5 block flex items-center gap-1">
                                        <Users size={12} className="text-slate-400" />
                                        {fac.capacity} Guests
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[9px] font-black uppercase text-slate-400 block">Hours</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-300 mt-0.5 block text-[11px] truncate">
                                        {fac.hours}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1">
                                <span className="text-slate-500 font-medium">Member Rate:</span>
                                <span className="font-black text-emerald-600">
                                    {Number(fac.member_hourly_rate) === 0 ? 'Complimentary' : `KES ${Number(fac.member_hourly_rate).toLocaleString()} / hr`}
                                </span>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-white/5">
                            <button
                                onClick={() => {
                                    setBookForm({ ...bookForm, facility_id: fac.id });
                                    setShowBookModal(true);
                                }}
                                className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-200 text-xs font-black uppercase tracking-wider py-2 rounded-xl transition"
                            >
                                Book This Venue
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Upcoming Venue Bookings Ledger */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="font-serif font-black text-slate-900 dark:text-white text-sm">
                            Upcoming Facility Reservations
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Scheduled events & private sessions
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-white/5 text-[9px] font-black uppercase tracking-wider text-slate-400">
                                <th className="p-3.5 pl-5">Facility / Venue</th>
                                <th className="p-3.5">Booked By</th>
                                <th className="p-3.5">Date</th>
                                <th className="p-3.5">Time Interval</th>
                                <th className="p-3.5 text-center">Attendees</th>
                                <th className="p-3.5 pr-5">Event Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                            {bookings.map((b) => (
                                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                                    <td className="p-3.5 pl-5 font-black text-slate-900 dark:text-white">
                                        {b.facility_name}
                                    </td>
                                    <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">
                                        {b.member_name}
                                    </td>
                                    <td className="p-3.5 text-slate-500 font-medium">
                                        {b.date}
                                    </td>
                                    <td className="p-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-300 font-bold">
                                        {b.time}
                                    </td>
                                    <td className="p-3.5 text-center font-bold text-slate-700 dark:text-slate-300">
                                        {b.guests}
                                    </td>
                                    <td className="p-3.5 pr-5 text-slate-500 font-medium">
                                        {b.purpose}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Book Modal */}
            {showBookModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <h3 className="text-base font-serif font-black text-slate-900 dark:text-white">
                                Reserve Club Facility
                            </h3>
                            <button
                                onClick={() => setShowBookModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateBooking} className="p-5 space-y-3.5">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                    Select Facility / Venue *
                                </label>
                                <select
                                    value={bookForm.facility_id}
                                    onChange={(e) => setBookForm({ ...bookForm, facility_id: Number(e.target.value) })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                >
                                    {facilities.map(f => (
                                        <option key={f.id} value={f.id}>{f.name} (Max {f.capacity})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Member Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Alex Metto"
                                        value={bookForm.member_name}
                                        onChange={(e) => setBookForm({ ...bookForm, member_name: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Expected Attendees
                                    </label>
                                    <input
                                        type="number"
                                        value={bookForm.attendees}
                                        onChange={(e) => setBookForm({ ...bookForm, attendees: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={bookForm.date}
                                        onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                                        className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Start Time
                                    </label>
                                    <input
                                        type="time"
                                        value={bookForm.start_time}
                                        onChange={(e) => setBookForm({ ...bookForm, start_time: e.target.value })}
                                        className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        End Time
                                    </label>
                                    <input
                                        type="time"
                                        value={bookForm.end_time}
                                        onChange={(e) => setBookForm({ ...bookForm, end_time: e.target.value })}
                                        className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                    Event / Meeting Description
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Birthday Celebration, Business Presentation..."
                                    value={bookForm.purpose}
                                    onChange={(e) => setBookForm({ ...bookForm, purpose: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowBookModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95"
                                >
                                    Confirm Reservation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacilitiesPage;
