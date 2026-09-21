import React, { useState, useEffect } from 'react';
import {
    Flag, Plus, Search, Edit3, Trash2, MapPin, Star,
    ChevronRight, Filter, Eye, CheckCircle, XCircle, Settings
} from 'lucide-react';
import Swal from 'sweetalert2';

const EMPTY_COURSE = {
    name: '',
    holes: 18,
    par: 72,
    length_meters: '',
    course_rating: '',
    slope_rating: '',
    location: '',
    description: '',
    status: 'open',
    designer: '',
    established_year: ''
};

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState(EMPTY_COURSE);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => { fetchCourses(); }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/courses');
            const data = await res.json();
            if (data.success && data.courses) {
                setCourses(data.courses);
            } else {
                // Demo fallback
                setCourses([
                    { id: 1, name: 'Championship Course', holes: 18, par: 72, length_meters: 6450, course_rating: 72.4, slope_rating: 135, location: 'Main Estate', status: 'open', designer: 'Gary Player', established_year: 1987 },
                    { id: 2, name: 'Executive Course', holes: 9, par: 36, length_meters: 2800, course_rating: 35.1, slope_rating: 118, location: 'East Wing', status: 'open', designer: 'Robert Trent Jones', established_year: 1995 },
                    { id: 3, name: 'Driving Range', holes: 0, par: 0, length_meters: 280, course_rating: null, slope_rating: null, location: 'Club Entrance', status: 'open', designer: null, established_year: 2001 }
                ]);
            }
        } catch {
            setCourses([
                { id: 1, name: 'Championship Course', holes: 18, par: 72, length_meters: 6450, course_rating: 72.4, slope_rating: 135, location: 'Main Estate', status: 'open', designer: 'Gary Player', established_year: 1987 },
                { id: 2, name: 'Executive Course', holes: 9, par: 36, length_meters: 2800, course_rating: 35.1, slope_rating: 118, location: 'East Wing', status: 'open', designer: null, established_year: 1995 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = courses.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.location || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openAdd = () => { setFormData(EMPTY_COURSE); setIsEditing(false); setCurrentId(null); setIsModalOpen(true); };
    const openEdit = (c) => { setFormData({ ...c }); setIsEditing(true); setCurrentId(c.id); setIsModalOpen(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const url = isEditing ? `/api/courses/${currentId}` : '/api/courses';
            const method = isEditing ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
            const data = await res.json();
            if (data.success) {
                Swal.fire({ icon: 'success', title: isEditing ? 'Course Updated' : 'Course Added', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
                setIsModalOpen(false);
                fetchCourses();
            } else {
                // Local update for demo
                if (isEditing) {
                    setCourses(cs => cs.map(c => c.id === currentId ? { ...c, ...formData } : c));
                } else {
                    setCourses(cs => [...cs, { ...formData, id: Date.now() }]);
                }
                setIsModalOpen(false);
            }
        } catch {
            // Local update for demo
            if (isEditing) {
                setCourses(cs => cs.map(c => c.id === currentId ? { ...c, ...formData } : c));
            } else {
                setCourses(cs => [...cs, { ...formData, id: Date.now() }]);
            }
            setIsModalOpen(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Remove Course?',
            text: 'This will remove the course from the system.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Remove',
            confirmButtonColor: '#dc2626',
            cancelButtonText: 'Cancel'
        });
        if (!result.isConfirmed) return;
        try {
            await fetch(`/api/courses/${id}`, { method: 'DELETE' });
        } catch { }
        setCourses(cs => cs.filter(c => c.id !== id));
        Swal.fire({ icon: 'success', title: 'Course Removed', timer: 1200, showConfirmButton: false, toast: true, position: 'top-end' });
    };

    const toggleStatus = async (course) => {
        const newStatus = course.status === 'open' ? 'closed' : 'open';
        try {
            await fetch(`/api/courses/${course.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...course, status: newStatus }) });
        } catch { }
        setCourses(cs => cs.map(c => c.id === course.id ? { ...c, status: newStatus } : c));
    };

    const statusColor = {
        open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        closed: 'bg-red-50 text-red-700 border-red-200',
        maintenance: 'bg-amber-50 text-amber-700 border-amber-200'
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
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Golf Courses</h2>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1">
                        {courses.length} Course{courses.length !== 1 ? 's' : ''} Registered
                    </p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-sm active:scale-95"
                >
                    <Plus size={14} strokeWidth={3} />
                    Add Course
                </button>
            </div>

            {/* Search */}
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-3 py-2 gap-2 w-full max-w-sm shadow-sm">
                <Search size={14} className="text-slate-400 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs text-slate-700 dark:text-slate-200 w-full placeholder-slate-300"
                />
            </div>

            {/* Courses Grid */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Flag size={40} strokeWidth={1} className="mb-3" />
                    <p className="text-sm font-bold">No courses found</p>
                    <p className="text-xs mt-1">Add your first course to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(course => (
                        <div key={course.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                            {/* Course Status Bar */}
                            <div className={`h-1.5 w-full ${course.status === 'open' ? 'bg-emerald-500' : course.status === 'maintenance' ? 'bg-amber-500' : 'bg-red-500'}`}></div>

                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-serif font-bold text-slate-900 dark:text-white text-base">{course.name}</h3>
                                        {course.location && (
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                                                <MapPin size={10} />
                                                {course.location}
                                            </p>
                                        )}
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusColor[course.status] || statusColor.open}`}>
                                        {course.status}
                                    </span>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="text-center bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2.5">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Holes</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{course.holes || 'N/A'}</p>
                                    </div>
                                    <div className="text-center bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2.5">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Par</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{course.par || 'N/A'}</p>
                                    </div>
                                    <div className="text-center bg-slate-50 dark:bg-slate-700/50 rounded-xl p-2.5">
                                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Rating</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{course.course_rating || '—'}</p>
                                    </div>
                                </div>

                                {course.length_meters && (
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                                        <span className="font-black text-slate-700 dark:text-slate-200">{Number(course.length_meters).toLocaleString()}m</span> total length
                                        {course.slope_rating && <span className="ml-3">Slope: <span className="font-black text-slate-700 dark:text-slate-200">{course.slope_rating}</span></span>}
                                    </p>
                                )}
                                {course.designer && (
                                    <p className="text-[10px] text-slate-400">
                                        Designed by <span className="font-bold text-slate-600 dark:text-slate-300">{course.designer}</span>
                                        {course.established_year && <span className="ml-2">Est. {course.established_year}</span>}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50 dark:border-slate-700">
                                    <button
                                        onClick={() => toggleStatus(course)}
                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                                            course.status === 'open'
                                                ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                                                : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                        }`}
                                    >
                                        {course.status === 'open' ? 'Close Course' : 'Open Course'}
                                    </button>
                                    <button
                                        onClick={() => openEdit(course)}
                                        className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all border border-slate-100 dark:border-slate-600"
                                    >
                                        <Edit3 size={13} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(course.id)}
                                        className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all border border-slate-100 dark:border-slate-600"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="font-serif font-bold text-slate-900 dark:text-white text-lg">
                                {isEditing ? 'Edit Course' : 'Add New Course'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Course Name *</label>
                                    <input required type="text" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                                        className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Holes</label>
                                    <select value={formData.holes} onChange={e => setFormData(f => ({ ...f, holes: Number(e.target.value) }))}
                                        className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30">
                                        <option value={9}>9 Holes</option>
                                        <option value={18}>18 Holes</option>
                                        <option value={27}>27 Holes</option>
                                        <option value={0}>Driving Range</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Par</label>
                                    <input type="number" value={formData.par} onChange={e => setFormData(f => ({ ...f, par: Number(e.target.value) }))}
                                        className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Length (meters)</label>
                                    <input type="number" value={formData.length_meters} onChange={e => setFormData(f => ({ ...f, length_meters: e.target.value }))}
                                        className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Status</label>
                                    <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
                                        className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30">
                                        <option value="open">Open</option>
                                        <option value="closed">Closed</option>
                                        <option value="maintenance">Under Maintenance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Course Rating</label>
                                    <input type="number" step="0.1" value={formData.course_rating} onChange={e => setFormData(f => ({ ...f, course_rating: e.target.value }))}
                                        className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Slope Rating</label>
                                    <input type="number" value={formData.slope_rating} onChange={e => setFormData(f => ({ ...f, slope_rating: e.target.value }))}
                                        className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Designer</label>
                                    <input type="text" value={formData.designer} onChange={e => setFormData(f => ({ ...f, designer: e.target.value }))}
                                        className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Established Year</label>
                                    <input type="number" value={formData.established_year} onChange={e => setFormData(f => ({ ...f, established_year: e.target.value }))}
                                        className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Location / Description</label>
                                    <input type="text" value={formData.location} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))}
                                        placeholder="e.g. Main Estate, East Wing..."
                                        className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/30" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSaving}
                                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition disabled:opacity-60">
                                    {isSaving ? 'Saving...' : isEditing ? 'Update Course' : 'Add Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoursesPage;
