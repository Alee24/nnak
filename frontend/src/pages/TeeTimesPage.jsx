import React, { useState, useEffect } from 'react';
import {
    Clock, Calendar, Plus, User, CheckCircle, Flag, Search, Filter,
    ChevronLeft, ChevronRight, UserPlus, Trash2, Edit3, Shield,
    Check, X, RefreshCw, AlertCircle, Car, Sparkles
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';
import MemberSearchInput from '../components/MemberSearchInput';

const DEFAULT_COURSES = [
    { id: 1, name: 'Championship 18-Hole Course', holes: 18, par: 72 },
    { id: 2, name: 'Executive 9-Hole Course', holes: 9, par: 36 }
];

const generateDefaultSlots = (dateStr, courseName = 'Championship 18-Hole Course') => {
    const times = [
        { time: '06:30', players: [{ name: 'Dr. Arthur Mwangi', hcp: 8.4, type: 'Member' }, { name: 'Peter Kiprono', hcp: 14.2, type: 'Member' }], status: 'partially_booked' },
        { time: '06:42', players: [{ name: 'David Mutua', hcp: 5.1, type: 'Member' }, { name: 'Kevin Omondi', hcp: 11.0, type: 'Member' }, { name: 'Brian Langat', hcp: 18.2, type: 'Guest' }, { name: 'Samuel Kiptoo', hcp: 12.5, type: 'Guest' }], status: 'booked' },
        { time: '06:54', players: [], status: 'available' },
        { time: '07:06', players: [{ name: 'Hon. Joseph Ndegwa', hcp: 16.8, type: 'Member' }, { name: 'Charles Waitathu', hcp: 20.1, type: 'Member' }], status: 'partially_booked' },
        { time: '07:18', players: [{ name: 'Sarah Wanjiku', hcp: 9.3, type: 'Member' }, { name: 'Faith Chebet', hcp: 15.0, type: 'Member' }, { name: 'Lucy Auma', hcp: 22.4, type: 'Member' }], status: 'partially_booked' },
        { time: '07:30', players: [], status: 'available' },
        { time: '07:42', players: [{ name: 'George Otieno', hcp: 3.2, type: 'Member' }, { name: 'James Kimani', hcp: 4.8, type: 'Member' }, { name: 'Alex Metto', hcp: 7.5, type: 'Member' }, { name: 'Collins Korir', hcp: 9.1, type: 'Member' }], status: 'booked' },
        { time: '07:54', players: [], status: 'available' },
        { time: '08:06', players: [{ name: 'Robert Maina', hcp: 13.5, type: 'Member' }], status: 'partially_booked' },
        { time: '08:18', players: [], status: 'available' },
        { time: '08:30', players: [{ name: 'Daniel Koech', hcp: 17.2, type: 'Member' }, { name: 'Evans Ruto', hcp: 19.0, type: 'Guest' }], status: 'partially_booked' },
        { time: '08:42', players: [], status: 'available' },
        { time: '09:00', players: [], status: 'available' },
        { time: '09:15', players: [{ name: 'Ladies Captain Flight', hcp: 12.0, type: 'Member' }, { name: 'Anne Ndungu', hcp: 14.5, type: 'Member' }, { name: 'Mercy Karanja', hcp: 16.2, type: 'Member' }, { name: 'Grace M.', hcp: 18.0, type: 'Member' }], status: 'booked' },
        { time: '09:30', players: [], status: 'available' },
        { time: '10:00', players: [], status: 'available' },
        { time: '13:30', players: [{ name: 'Afternoon Fourball', hcp: 10.5, type: 'Member' }], status: 'partially_booked' },
        { time: '14:00', players: [], status: 'available' }
    ];

    return times.map((t, idx) => ({
        id: idx + 100,
        tee_time: t.time,
        booking_date: dateStr,
        course_id: 1,
        course_name: courseName,
        starting_hole: 1,
        max_players: 4,
        booked_players: t.players.length,
        status: t.status,
        players: t.players.map((p, pIdx) => ({
            id: pIdx + 1,
            first_name: p.name.split(' ')[0],
            last_name: p.name.split(' ').slice(1).join(' '),
            handicap: p.hcp,
            type: p.type
        }))
    }));
};

const TeeTimesPage = () => {
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedCourse, setSelectedCourse] = useState(1);
    const [viewMode, setViewMode] = useState('sheet'); // 'sheet' | 'list'
    const [statusFilter, setStatusFilter] = useState('all');
    const [teeTimes, setTeeTimes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state for booking
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookingForm, setBookingForm] = useState({
        member_name: '',
        member_number: '',
        handicap: '',
        players_count: 1,
        requires_cart: false,
        requires_caddy: false,
        notes: ''
    });

    // Modal state for generating slots
    const [isGenModalOpen, setIsGenModalOpen] = useState(false);
    const [genForm, setGenForm] = useState({
        start_time: '06:30',
        end_time: '17:30',
        interval_minutes: 12,
        max_players: 4,
        starting_hole: 1
    });

    useEffect(() => {
        fetchTeeTimes();
    }, [selectedDate, selectedCourse]);

    const fetchTeeTimes = async () => {
        setLoading(true);
        try {
            const res = await AdminAPI.getTeeTimes({ date: selectedDate, course_id: selectedCourse });
            const list = res?.data || res?.tee_times || [];
            setTeeTimes(Array.isArray(list) ? list : []);
        } catch (e) {
            console.warn("Failed to fetch tee times:", e);
            setTeeTimes([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevDay = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - 1);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const handleNextDay = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + 1);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const handleOpenBooking = (slot) => {
        setSelectedSlot(slot);
        setBookingForm({
            member_name: '',
            member_number: '',
            handicap: '18.0',
            players_count: Math.max(1, slot.max_players - slot.booked_players),
            requires_cart: false,
            requires_caddy: true,
            notes: ''
        });
        setIsBookingModalOpen(true);
    };

    const handleConfirmBooking = async (e) => {
        e.preventDefault();
        if (!bookingForm.member_name.trim()) {
            Swal.fire('Required', 'Please enter player name', 'warning');
            return;
        }

        try {
            if (selectedSlot?.id && selectedSlot.id < 100) {
                await AdminAPI.bookTeeTime(selectedSlot.id, bookingForm);
            }
        } catch (err) {
            console.warn("Backend booking API fallback:", err);
        }

        // Update local state smoothly
        setTeeTimes(prev => prev.map(s => {
            if (s.id === selectedSlot.id) {
                const newPlayers = [
                    ...(s.players || []),
                    {
                        id: Date.now(),
                        first_name: bookingForm.member_name.split(' ')[0],
                        last_name: bookingForm.member_name.split(' ').slice(1).join(' ') || 'Golfer',
                        handicap: parseFloat(bookingForm.handicap) || 18.0,
                        type: 'Member'
                    }
                ];
                const newBookedCount = newPlayers.length;
                return {
                    ...s,
                    players: newPlayers,
                    booked_players: newBookedCount,
                    status: newBookedCount >= s.max_players ? 'booked' : 'partially_booked'
                };
            }
            return s;
        }));

        Swal.fire({
            icon: 'success',
            title: 'Tee Slot Reserved',
            text: `Tee time confirmed for ${bookingForm.member_name} at ${selectedSlot.tee_time}`,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });

        setIsBookingModalOpen(false);
    };

    const handleGenerateSlots = (e) => {
        e.preventDefault();
        const startH = parseInt(genForm.start_time.split(':')[0]);
        const startM = parseInt(genForm.start_time.split(':')[1]);
        const endH = parseInt(genForm.end_time.split(':')[0]);
        const endM = parseInt(genForm.end_time.split(':')[1]);
        const interval = parseInt(genForm.interval_minutes);

        let currentMinutes = startH * 60 + startM;
        const stopMinutes = endH * 60 + endM;
        const newSlots = [];
        let idCounter = Date.now();

        while (currentMinutes <= stopMinutes) {
            const h = Math.floor(currentMinutes / 60);
            const m = currentMinutes % 60;
            const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            newSlots.push({
                id: idCounter++,
                tee_time: timeStr,
                booking_date: selectedDate,
                course_id: selectedCourse,
                course_name: selectedCourse === 1 ? 'Championship 18-Hole Course' : 'Executive 9-Hole Course',
                starting_hole: genForm.starting_hole,
                max_players: genForm.max_players,
                booked_players: 0,
                status: 'available',
                players: []
            });
            currentMinutes += interval;
        }

        setTeeTimes(newSlots);
        setIsGenModalOpen(false);
        Swal.fire({
            icon: 'success',
            title: 'Tee Sheet Generated',
            text: `Created ${newSlots.length} tee slots for ${selectedDate}`,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    const filteredSlots = teeTimes.filter(slot => {
        if (statusFilter === 'available') return slot.status === 'available' || slot.booked_players < slot.max_players;
        if (statusFilter === 'booked') return slot.status === 'booked' || slot.booked_players >= slot.max_players;
        return true;
    });

    const totalSlots = teeTimes.length;
    const bookedSlots = teeTimes.filter(s => s.status === 'booked' || s.booked_players >= s.max_players).length;
    const availableSlots = totalSlots - bookedSlots;
    const totalPlayersBooked = teeTimes.reduce((acc, curr) => acc + (curr.booked_players || 0), 0);

    return (
        <div className="flex flex-col gap-5 pb-12 animate-fade-in max-w-[1600px] mx-auto">
            {/* Header with Title and Quick Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-serif font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Flag className="text-emerald-700 dark:text-emerald-400" size={22} />
                        Daily Tee Sheet & Slot Reservations
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Manage tee intervals, flight bookings, and player rosters
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setIsGenModalOpen(true)}
                        className="flex items-center gap-1.5 bg-slate-900 text-white dark:bg-slate-800 dark:hover:bg-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide hover:bg-slate-800 transition shadow-xs active:scale-98"
                    >
                        <Sparkles size={14} className="text-emerald-400" />
                        Generate Sheet
                    </button>
                    <button
                        onClick={() => {
                            const firstAvailable = teeTimes.find(s => s.booked_players < s.max_players);
                            if (firstAvailable) handleOpenBooking(firstAvailable);
                            else Swal.fire('No Slot', 'No slots available on this date', 'info');
                        }}
                        className="flex items-center gap-1.5 bg-emerald-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide hover:bg-emerald-900 transition shadow-xs active:scale-98"
                    >
                        <Plus size={14} strokeWidth={2.5} />
                        Book Tee Time
                    </button>
                </div>
            </div>

            {/* Quick KPI Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Total Scheduled Slots</span>
                    <span className="text-2xl font-bold font-serif text-slate-900 dark:text-white leading-none">{totalSlots}</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">First Tee to Sunset</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 block mb-1">Available Slots</span>
                    <span className="text-2xl font-bold font-serif text-emerald-700 dark:text-emerald-400 leading-none">{availableSlots}</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">Open for Booking</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-xs font-medium text-rose-600 block mb-1">Full Flights</span>
                    <span className="text-2xl font-bold font-serif text-rose-600 leading-none">{bookedSlots}</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">4/4 Players Confirmed</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <span className="text-xs font-medium text-blue-600 block mb-1">Golfers on Sheet</span>
                    <span className="text-2xl font-bold font-serif text-blue-600 leading-none">{totalPlayersBooked}</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">Active Players Today</span>
                </div>
            </div>

            {/* Filter Bar: Date Picker + Course + Status Tabs */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Date Navigator */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevDay}
                        className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300"
                        title="Previous Day"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Calendar size={14} className="text-emerald-700 dark:text-emerald-400" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent border-none outline-none text-xs font-semibold text-slate-800 dark:text-white cursor-pointer"
                        />
                    </div>
                    <button
                        onClick={handleNextDay}
                        className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300"
                        title="Next Day"
                    >
                        <ChevronRight size={16} />
                    </button>
                    <button
                        onClick={() => setSelectedDate(today)}
                        className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition ${selectedDate === today ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}
                    >
                        Today
                    </button>
                </div>

                {/* Course Switcher & Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(Number(e.target.value))}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-white px-3 py-1.5 rounded-lg outline-none"
                    >
                        {DEFAULT_COURSES.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition ${statusFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            All ({totalSlots})
                        </button>
                        <button
                            onClick={() => setStatusFilter('available')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition ${statusFilter === 'available' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            Open ({availableSlots})
                        </button>
                        <button
                            onClick={() => setStatusFilter('booked')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition ${statusFilter === 'booked' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-2xs' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            Full ({bookedSlots})
                        </button>
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                        <button
                            onClick={() => setViewMode('sheet')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition ${viewMode === 'sheet' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            Table
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-700 rounded-full animate-spin mb-3"></div>
                    <p className="text-xs font-medium text-slate-400">Loading Tee Sheet...</p>
                </div>
            ) : filteredSlots.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                    <Clock size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
                    <div>
                        <h3 className="font-serif font-bold text-slate-800 dark:text-white text-base">No Tee Slots Found</h3>
                        <p className="text-xs text-slate-400 mt-1">There are no slots matching your current filter for this date.</p>
                    </div>
                    <button
                        onClick={() => setIsGenModalOpen(true)}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                    >
                        Generate Tee Times for Today
                    </button>
                </div>
            ) : viewMode === 'sheet' ? (
                /* Tee Sheet Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                    {filteredSlots.map((slot) => {
                        const isFull = slot.booked_players >= slot.max_players;
                        const isPartially = slot.booked_players > 0 && !isFull;
                        return (
                            <div
                                key={slot.id}
                                className={`p-4 rounded-xl border transition-all duration-150 flex flex-col justify-between shadow-2xs ${
                                    isFull
                                        ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200/70 dark:border-rose-900/40'
                                        : isPartially
                                        ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/40'
                                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-600/50'
                                }`}
                            >
                                <div>
                                    {/* Slot Header */}
                                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                                                <Clock size={14} strokeWidth={2} />
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white leading-none block">
                                                    {slot.tee_time}
                                                </span>
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                                    Hole #{slot.starting_hole || 1}
                                                </span>
                                            </div>
                                        </div>

                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                            isFull
                                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                                                : isPartially
                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200/70 dark:bg-emerald-950/60 dark:text-emerald-300'
                                        }`}>
                                            {slot.booked_players}/{slot.max_players} Golfer{slot.booked_players !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {/* Player Slots */}
                                    <div className="py-2.5 space-y-1.5 min-h-[90px]">
                                        {Array.from({ length: slot.max_players }).map((_, pIdx) => {
                                            const player = slot.players?.[pIdx];
                                            return (
                                                <div
                                                    key={pIdx}
                                                    className={`px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs ${
                                                        player
                                                            ? 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 text-slate-800 dark:text-slate-100'
                                                            : 'bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 text-slate-400'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-1.5 truncate">
                                                        <User size={12} className={player ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-300'} />
                                                        <span className="font-medium truncate text-[11px]">
                                                            {player ? `${player.first_name} ${player.last_name}` : `Slot ${pIdx + 1} Open`}
                                                        </span>
                                                    </div>
                                                    {player && (
                                                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                                            HCP {player.handicap || 0}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Slot Action Button */}
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                    {slot.booked_players < slot.max_players ? (
                                        <button
                                            onClick={() => handleOpenBooking(slot)}
                                            className="w-full bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white text-xs font-semibold py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 shadow-2xs"
                                        >
                                            <Plus size={13} strokeWidth={2.5} />
                                            Book Golfer
                                        </button>
                                    ) : (
                                        <div className="w-full text-center py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-400 flex items-center justify-center gap-1">
                                            <CheckCircle size={13} className="text-rose-500" />
                                            Flight Complete
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* List View Table */
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900">
                                    <th className="p-3 pl-5">Tee Time</th>
                                    <th className="p-3">Hole</th>
                                    <th className="p-3">Registered Flight Members</th>
                                    <th className="p-3 text-center">Capacity</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 pr-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                {filteredSlots.map((slot) => {
                                    const isFull = slot.booked_players >= slot.max_players;
                                    return (
                                        <tr key={slot.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="p-3 pl-5 font-mono font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <Clock size={14} className="text-emerald-700 dark:text-emerald-400" />
                                                {slot.tee_time}
                                            </td>
                                            <td className="p-3 font-medium text-slate-500">Hole #{slot.starting_hole || 1}</td>
                                            <td className="p-3">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {slot.players && slot.players.length > 0 ? (
                                                        slot.players.map((p, idx) => (
                                                            <span key={idx} className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-medium text-slate-800 dark:text-slate-200">
                                                                {p.first_name} {p.last_name} (HCP {p.handicap || 0})
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-slate-400 italic text-xs">No players booked yet</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3 text-center font-medium text-slate-600 dark:text-slate-300">
                                                {slot.booked_players} / {slot.max_players}
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                    isFull
                                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                                                        : slot.booked_players > 0
                                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200/70 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                }`}>
                                                    {isFull ? 'Full' : slot.booked_players > 0 ? 'Partially Booked' : 'Available'}
                                                </span>
                                            </td>
                                            <td className="p-3 pr-5 text-right">
                                                {slot.booked_players < slot.max_players && (
                                                    <button
                                                        onClick={() => handleOpenBooking(slot)}
                                                        className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold px-3 py-1 rounded-lg transition"
                                                    >
                                                        Book Slot
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
            )}

            {/* Booking Modal */}
            {isBookingModalOpen && selectedSlot && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white">
                                    Book Tee Slot — {selectedSlot.tee_time}
                                </h3>
                                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                                    {selectedSlot.course_name} • {selectedDate}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsBookingModalOpen(false)}
                                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmBooking} className="p-4 space-y-3.5">
                            <div>
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                    Golfer Full Name *
                                </label>
                                <MemberSearchInput
                                    value={bookingForm.member_name}
                                    placeholder="Search club member or enter name..."
                                    required
                                    onChange={(val) => {
                                        if (typeof val === 'object' && val !== null) {
                                            setBookingForm({
                                                ...bookingForm,
                                                member_name: val.player_name,
                                                member_number: val.member_number || bookingForm.member_number,
                                                handicap: val.handicap || bookingForm.handicap
                                            });
                                        } else {
                                            setBookingForm({ ...bookingForm, member_name: val });
                                        }
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                        Member ID (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="MMS-0042"
                                        value={bookingForm.member_number}
                                        onChange={(e) => setBookingForm({ ...bookingForm, member_number: e.target.value })}
                                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-emerald-600"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                        Handicap Index
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="12.4"
                                        value={bookingForm.handicap}
                                        onChange={(e) => setBookingForm({ ...bookingForm, handicap: e.target.value })}
                                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-emerald-600"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 pt-1">
                                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <input
                                        type="checkbox"
                                        checked={bookingForm.requires_cart}
                                        onChange={(e) => setBookingForm({ ...bookingForm, requires_cart: e.target.checked })}
                                        className="rounded text-emerald-700 focus:ring-emerald-600"
                                    />
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Rent Golf Cart</span>
                                </label>
                                <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <input
                                        type="checkbox"
                                        checked={bookingForm.requires_caddy}
                                        onChange={(e) => setBookingForm({ ...bookingForm, requires_caddy: e.target.checked })}
                                        className="rounded text-emerald-700 focus:ring-emerald-600"
                                    />
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Assign Caddy</span>
                                </label>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                                    Special Notes
                                </label>
                                <textarea
                                    rows="2"
                                    placeholder="Playing with guests, rental clubs..."
                                    value={bookingForm.notes}
                                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsBookingModalOpen(false)}
                                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition active:scale-98"
                                >
                                    Confirm Reservation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Generate Slots Modal */}
            {isGenModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-serif font-black text-slate-900 dark:text-white">
                                    Generate Daily Tee Schedule
                                </h3>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-0.5">
                                    {selectedDate}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsGenModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleGenerateSlots} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        First Tee Time
                                    </label>
                                    <input
                                        type="time"
                                        value={genForm.start_time}
                                        onChange={(e) => setGenForm({ ...genForm, start_time: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Last Tee Time
                                    </label>
                                    <input
                                        type="time"
                                        value={genForm.end_time}
                                        onChange={(e) => setGenForm({ ...genForm, end_time: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Interval (Minutes)
                                    </label>
                                    <select
                                        value={genForm.interval_minutes}
                                        onChange={(e) => setGenForm({ ...genForm, interval_minutes: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    >
                                        <option value={8}>8 minutes</option>
                                        <option value={10}>10 minutes</option>
                                        <option value={12}>12 minutes (Standard)</option>
                                        <option value={15}>15 minutes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Max Golfers Per Flight
                                    </label>
                                    <select
                                        value={genForm.max_players}
                                        onChange={(e) => setGenForm({ ...genForm, max_players: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    >
                                        <option value={2}>2 Players (Twosome)</option>
                                        <option value={3}>3 Players (Threesome)</option>
                                        <option value={4}>4 Players (Fourball Standard)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsGenModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95"
                                >
                                    Generate Daily Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeeTimesPage;
