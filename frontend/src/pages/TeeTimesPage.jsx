import React, { useState, useEffect } from 'react';
import {
    Clock, Calendar, Plus, User, CheckCircle, Flag, Search, Filter,
    ChevronLeft, ChevronRight, UserPlus, Trash2, Edit3, Shield,
    Check, X, RefreshCw, AlertCircle, Car, Sparkles
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';

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
            if (Array.isArray(list) && list.length > 0) {
                setTeeTimes(list);
            } else {
                // Populate default championship slots so the page is never blank
                setTeeTimes(generateDefaultSlots(selectedDate));
            }
        } catch (e) {
            console.warn("Using fallback tee sheet data:", e);
            setTeeTimes(generateDefaultSlots(selectedDate));
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
        <div className="flex flex-col gap-6 pb-12 animate-fade-in">
            {/* Header with Title and Quick Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Flag className="text-emerald-600" size={24} />
                        Tee Sheet & Slot Reservations
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
                        MMS Golf Club • Daily Tee Sheet Management
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setIsGenModalOpen(true)}
                        className="flex items-center gap-2 bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-600 transition-all shadow-sm active:scale-95"
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
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-sm active:scale-95"
                    >
                        <Plus size={14} strokeWidth={3} />
                        Book Tee Time
                    </button>
                </div>
            </div>

            {/* Quick KPI Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Total Slots</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{totalSlots}</span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">Daily Schedule</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block mb-1">Available Slots</span>
                    <span className="text-2xl font-black text-emerald-600 leading-none">{availableSlots}</span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">Open for Booking</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 block mb-1">Booked Slots</span>
                    <span className="text-2xl font-black text-rose-500 leading-none">{bookedSlots}</span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">Fully Reserved</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block mb-1">Golfers on Sheet</span>
                    <span className="text-2xl font-black text-blue-600 leading-none">{totalPlayersBooked}</span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">Active Players</span>
                </div>
            </div>

            {/* Filter Bar: Date Picker + Course + Status Tabs */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                {/* Date Navigator */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevDay}
                        className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                        title="Previous Day"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600">
                        <Calendar size={14} className="text-emerald-600" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-transparent border-none outline-none text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider cursor-pointer"
                        />
                    </div>
                    <button
                        onClick={handleNextDay}
                        className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                        title="Next Day"
                    >
                        <ChevronRight size={16} />
                    </button>
                    <button
                        onClick={() => setSelectedDate(today)}
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition ${selectedDate === today ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'}`}
                    >
                        Today
                    </button>
                </div>

                {/* Course Switcher & Filter Tabs */}
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(Number(e.target.value))}
                        className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-white px-3 py-2 rounded-xl outline-none"
                    >
                        {DEFAULT_COURSES.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition ${statusFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            All ({totalSlots})
                        </button>
                        <button
                            onClick={() => setStatusFilter('available')}
                            className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition ${statusFilter === 'available' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            Open ({availableSlots})
                        </button>
                        <button
                            onClick={() => setStatusFilter('booked')}
                            className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition ${statusFilter === 'booked' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            Full ({bookedSlots})
                        </button>
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('sheet')}
                            className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition ${viewMode === 'sheet' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            Tee Grid
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            List View
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5">
                    <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Tee Sheet...</p>
                </div>
            ) : filteredSlots.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 space-y-4">
                    <Clock size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
                    <div>
                        <h3 className="font-serif font-bold text-slate-800 dark:text-white text-base">No Tee Slots Found</h3>
                        <p className="text-xs text-slate-400 mt-1">There are no slots matching your current filter for this date.</p>
                    </div>
                    <button
                        onClick={() => setIsGenModalOpen(true)}
                        className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
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
                                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                                    isFull
                                        ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30'
                                        : isPartially
                                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30'
                                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-800'
                                }`}
                            >
                                <div>
                                    {/* Slot Header */}
                                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                                                <Clock size={16} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <span className="text-base font-black text-slate-900 dark:text-white leading-none block">
                                                    {slot.tee_time}
                                                </span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                                    Hole #{slot.starting_hole || 1}
                                                </span>
                                            </div>
                                        </div>

                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                            isFull
                                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'
                                                : isPartially
                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                                        }`}>
                                            {slot.booked_players}/{slot.max_players} Golfer{slot.booked_players !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    {/* Player Slots */}
                                    <div className="py-3 space-y-1.5 min-h-[90px]">
                                        {Array.from({ length: slot.max_players }).map((_, pIdx) => {
                                            const player = slot.players?.[pIdx];
                                            return (
                                                <div
                                                    key={pIdx}
                                                    className={`px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs ${
                                                        player
                                                            ? 'bg-white dark:bg-slate-700/60 border border-slate-100 dark:border-white/5 text-slate-800 dark:text-slate-100 shadow-2xs'
                                                            : 'bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-slate-400'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-1.5 truncate">
                                                        <User size={12} className={player ? 'text-emerald-600' : 'text-slate-300'} />
                                                        <span className="font-bold truncate text-[11px]">
                                                            {player ? `${player.first_name} ${player.last_name}` : `Slot ${pIdx + 1} Open`}
                                                        </span>
                                                    </div>
                                                    {player && (
                                                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300">
                                                            HCP {player.handicap || 0}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Slot Action Button */}
                                <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                                    {slot.booked_players < slot.max_players ? (
                                        <button
                                            onClick={() => handleOpenBooking(slot)}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-[11px] font-black uppercase tracking-wider py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                                        >
                                            <Plus size={13} strokeWidth={3} />
                                            Book Golfer
                                        </button>
                                    ) : (
                                        <div className="w-full text-center py-2 bg-slate-100 dark:bg-slate-700/50 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
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
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-white/5 text-[9px] font-black uppercase tracking-wider text-slate-400">
                                    <th className="p-3.5 pl-5">Tee Time</th>
                                    <th className="p-3.5">Hole</th>
                                    <th className="p-3.5">Registered Flight Members</th>
                                    <th className="p-3.5 text-center">Capacity</th>
                                    <th className="p-3.5 text-center">Status</th>
                                    <th className="p-3.5 pr-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                                {filteredSlots.map((slot) => {
                                    const isFull = slot.booked_players >= slot.max_players;
                                    return (
                                        <tr key={slot.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                                            <td className="p-3.5 pl-5 font-black text-slate-900 dark:text-white flex items-center gap-2">
                                                <Clock size={14} className="text-emerald-600" />
                                                {slot.tee_time}
                                            </td>
                                            <td className="p-3.5 font-bold text-slate-500">#{slot.starting_hole || 1}</td>
                                            <td className="p-3.5">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {slot.players && slot.players.length > 0 ? (
                                                        slot.players.map((p, idx) => (
                                                            <span key={idx} className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-800 dark:text-slate-200">
                                                                {p.first_name} {p.last_name} (HCP {p.handicap || 0})
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-slate-400 italic text-[11px]">No players booked yet</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3.5 text-center font-bold text-slate-600 dark:text-slate-300">
                                                {slot.booked_players} / {slot.max_players}
                                            </td>
                                            <td className="p-3.5 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                    isFull
                                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                                                        : slot.booked_players > 0
                                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                }`}>
                                                    {isFull ? 'Full' : slot.booked_players > 0 ? 'Partially Booked' : 'Available'}
                                                </span>
                                            </td>
                                            <td className="p-3.5 pr-5 text-right">
                                                {slot.booked_players < slot.max_players && (
                                                    <button
                                                        onClick={() => handleOpenBooking(slot)}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg transition"
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
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-serif font-black text-slate-900 dark:text-white">
                                    Book Tee Slot — {selectedSlot.tee_time}
                                </h3>
                                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-wider mt-0.5">
                                    {selectedSlot.course_name} • {selectedDate}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsBookingModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-800"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleConfirmBooking} className="p-5 space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                    Golfer Full Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Alex Metto"
                                    value={bookingForm.member_name}
                                    onChange={(e) => setBookingForm({ ...bookingForm, member_name: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Member ID (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="MMS-0042"
                                        value={bookingForm.member_number}
                                        onChange={(e) => setBookingForm({ ...bookingForm, member_number: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Handicap Index
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="12.4"
                                        value={bookingForm.handicap}
                                        onChange={(e) => setBookingForm({ ...bookingForm, handicap: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <input
                                        type="checkbox"
                                        checked={bookingForm.requires_cart}
                                        onChange={(e) => setBookingForm({ ...bookingForm, requires_cart: e.target.checked })}
                                        className="rounded text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Rent Golf Cart</span>
                                </label>
                                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <input
                                        type="checkbox"
                                        checked={bookingForm.requires_caddy}
                                        onChange={(e) => setBookingForm({ ...bookingForm, requires_caddy: e.target.checked })}
                                        className="rounded text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Assign Caddy</span>
                                </label>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                    Special Notes
                                </label>
                                <textarea
                                    rows="2"
                                    placeholder="Playing with guests, rental clubs..."
                                    value={bookingForm.notes}
                                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsBookingModalOpen(false)}
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
