import React, { useState, useEffect } from 'react';
import {
    Briefcase, Plus, Search, Filter, Mail, Phone,
    CheckCircle, AlertCircle, Edit3, X, RefreshCw, User, Shield
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';

const StaffPage = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deptFilter, setDeptFilter] = useState('all');

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        department: 'Golf Operations',
        designation: 'Assistant Golf Manager',
        salary: 120000,
        employment_status: 'full_time'
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await AdminAPI.getStaff();
            setStaff(res?.data || res?.staff || []);
        } catch (error) {
            console.error('Failed to load staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setFormData({
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            department: 'Golf Operations',
            designation: 'Assistant Golf Manager',
            salary: 120000,
            employment_status: 'full_time'
        });
        setIsModalOpen(true);
    };

    const handleSaveStaff = async (e) => {
        e.preventDefault();
        try {
            await AdminAPI.createStaff(formData);
            Swal.fire({
                icon: 'success',
                title: 'Staff Member Appointed',
                text: `${formData.first_name} ${formData.last_name} has been added to club staff records.`,
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
            setIsModalOpen(false);
            fetchStaff();
        } catch (error) {
            Swal.fire('Error', error.message || 'Failed to add staff member', 'error');
        }
    };

    const departments = Array.from(new Set(staff.map(s => s.department).filter(Boolean)));

    const filtered = staff.filter(s => {
        const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
        const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
            s.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.department?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = deptFilter === 'all' || s.department === deptFilter;
        return matchesSearch && matchesDept;
    });

    return (
        <div className="flex flex-col gap-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Briefcase className="text-emerald-600" size={24} />
                        Club Staff & Administration Roster
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
                        Department personnel, designations, executive managers & frontline staff
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchStaff}
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
                        Appoint Staff
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Total Employees</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{staff.length}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block mb-1">Full Time</span>
                    <span className="text-2xl font-black text-emerald-600 leading-none">{staff.filter(s => s.employment_status === 'full_time').length}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block mb-1">Departments</span>
                    <span className="text-2xl font-black text-blue-600 leading-none">{departments.length || 1}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block mb-1">Active Roles</span>
                    <span className="text-2xl font-black text-amber-600 leading-none">{staff.filter(s => s.role !== 'member').length}</span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 max-w-sm w-full">
                    <Search size={15} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search staff name, designation or department..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs text-slate-800 dark:text-white placeholder-slate-400 w-full"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto">
                    <button
                        onClick={() => setDeptFilter('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${deptFilter === 'all' ? 'bg-slate-900 text-white dark:bg-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                    >
                        All Departments
                    </button>
                    {departments.map(d => (
                        <button
                            key={d}
                            onClick={() => setDeptFilter(d)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${deptFilter === d ? 'bg-slate-900 text-white dark:bg-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>

            {/* Staff Grid */}
            {loading ? (
                <div className="p-12 text-center text-slate-400 font-bold text-xs">Loading staff roster...</div>
            ) : filtered.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <Briefcase size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No staff members found</p>
                    <p className="text-xs text-slate-400 mt-1">Populate demo records from Settings or appoint a staff member above.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filtered.map(st => (
                        <div key={st.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                                        {st.department || 'Clubhouse'}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                                        {st.employment_status || 'full_time'}
                                    </span>
                                </div>

                                <h3 className="font-serif font-black text-slate-900 dark:text-white text-base mt-3">
                                    {st.first_name} {st.last_name}
                                </h3>
                                <p className="text-xs text-emerald-600 font-bold mt-0.5">{st.designation || 'Staff Officer'}</p>

                                <div className="space-y-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-500">
                                    {st.email && (
                                        <p className="flex items-center gap-1.5"><Mail size={12} /> {st.email}</p>
                                    )}
                                    {st.phone && (
                                        <p className="flex items-center gap-1.5"><Phone size={12} /> {st.phone}</p>
                                    )}
                                </div>
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
                                Appoint New Staff Member
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveStaff} className="p-5 space-y-4">
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
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Department</label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    >
                                        <option value="Executive">Executive</option>
                                        <option value="Golf Operations">Golf Operations</option>
                                        <option value="Finance & Accounts">Finance & Accounts</option>
                                        <option value="Food & Beverage">Food & Beverage</option>
                                        <option value="Course & Greens">Course & Greens</option>
                                        <option value="Front Office">Front Office</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Designation</label>
                                    <input
                                        type="text"
                                        value={formData.designation}
                                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition"
                            >
                                Confirm Appointment
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffPage;
