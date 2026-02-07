import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Eye,
    CheckCircle,
    Clock,
    Users as UsersIcon,
    Loader2,
    AlertCircle,
    UserCheck
} from 'lucide-react';
import AdminAPI from '../services/api';
import Swal from 'sweetalert2';
import clsx from 'clsx';

const Applications = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 0 });
    const [stats, setStats] = useState({ pending: 0 });

    const itemsPerPage = 10;

    useEffect(() => {
        fetchApplications();
    }, [page]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const result = await AdminAPI.getPendingApplications(page, itemsPerPage);
            if (result.applications) {
                setApplications(result.applications);
                setPagination(result.pagination);
                setStats({ pending: result.pagination.total });
            }
        } catch (error) {
            console.error('Fetch Applications Error:', error);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Error loading applications',
                text: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, name) => {
        const result = await Swal.fire({
            title: 'Approve Membership?',
            text: `Are you sure you want to approve ${name}? They will be awarded 3 CPD points automatically.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            confirmButtonText: 'Yes, Approve',
            customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'rounded-xl px-5 py-2.5 font-bold',
                cancelButton: 'rounded-xl px-5 py-2.5 font-bold'
            }
        });

        if (result.isConfirmed) {
            try {
                Swal.fire({
                    title: 'Approving...',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });

                // 1. Update Status
                await AdminAPI.updateMemberStatus(id, 'active');

                // 2. Award CPD Points (3 points for activation)
                await AdminAPI.awardManualCPD(id, {
                    points: 3,
                    activity_type: 'Membership Activation',
                    description: 'Awarded 3 CPD points for membership activation and successful verification.',
                    awarded_date: new Date().toISOString().split('T')[0]
                });

                Swal.fire({
                    title: 'Approved!',
                    text: `${name}'s membership has been activated and 3 CPD points awarded.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });

                fetchApplications();

                // Dispatch event to update sidebar badge if needed
                window.dispatchEvent(new Event('membership-updated'));

            } catch (error) {
                Swal.fire('Error', error.message || 'Failed to approve membership', 'error');
            }
        }
    };

    return (
        <div className="flex flex-col gap-4 animate-fade-in font-inter pb-8">
            {/* Header Section - Standardized High Density */}
            <div className="flex justify-between items-end px-1">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Approval Queue</h1>
                    <p className="text-xs text-[#059669] font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                        <span className="w-4 h-px bg-[#059669]/30"></span>
                        Membership Verification Engine
                    </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-100/50 rounded-lg shadow-sm">
                        <Clock size={10} className="text-amber-500" />
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none">{stats.pending} Applications Pending</span>
                    </div>
                </div>
            </div>

            {/* Info Hint - Compact */}
            <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-3 flex gap-3 items-center mx-1">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
                    <AlertCircle size={14} />
                </div>
                <p className="text-xs text-blue-700 font-semibold leading-relaxed">
                    Review applicant credentials carefully. Approval triggers automatic activation and awards <b className="text-blue-900">3 CPD points</b>.
                </p>
            </div>

            {/* Applications Table - High Density */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px] mx-1">
                <div className="overflow-x-auto custom-scrollbar flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="py-3 px-6 text-xs font-black text-slate-400 uppercase tracking-[0.1em]">Applicant / Profile</th>
                                <th className="py-3 px-6 text-xs font-black text-slate-400 uppercase tracking-[0.1em]">Registration</th>
                                <th className="py-3 px-6 text-xs font-black text-slate-400 uppercase tracking-[0.1em]">Contact Matrix</th>
                                <th className="py-3 px-6 text-xs font-black text-slate-400 uppercase tracking-[0.1em]">Timeline</th>
                                <th className="py-3 px-6 text-xs font-black text-slate-400 uppercase tracking-[0.1em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="animate-spin text-emerald-500" size={24} />
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Queue...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : applications.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-50">
                                            <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                                                <CheckCircle size={18} />
                                            </div>
                                            <p className="text-[12px] font-black text-slate-900 uppercase tracking-tight">System Clear</p>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No pending applications found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app) => (
                                    <tr key={app.id} className="group hover:bg-slate-50/50 transition-all cursor-default">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shadow-xs ${false ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white'}`}>
                                                    {(app.first_name?.[0] || '') + (app.last_name?.[0] || '')}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900 group-hover:text-[#059669] transition-colors uppercase tracking-tight leading-none mb-1">
                                                        {app.first_name} {app.last_name}
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-bold tracking-widest uppercase">
                                                        PID: {app.member_id || 'PROVISIONAL'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-xs font-black text-slate-600 font-mono tracking-tighter">
                                                {app.registration_number || 'NULL'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div>
                                                <div className="text-sm font-black text-slate-900 leading-none">{app.email}</div>
                                                <div className="text-[10px] text-slate-400 mt-0.5 font-bold tracking-wider">{app.phone || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-xs font-bold text-slate-500">
                                                {app.created_at ? new Date(app.created_at).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                }) : '---'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => navigate(`/dashboard/members/${app.id}`)}
                                                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-500 hover:border-blue-200 transition-all shadow-sm"
                                                    title="Detailed Review"
                                                >
                                                    <Eye size={12} />
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(app.id, `${app.first_name} ${app.last_name}`)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-black hover:bg-[#059669] transition-all shadow-md active:scale-95 uppercase tracking-widest"
                                                >
                                                    <UserCheck size={10} strokeWidth={3} /> Verify
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination - Compact */}
                {pagination.pages > 1 && (
                    <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center mt-auto">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                            Stack {page} / {pagination.pages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
                            >
                                BACK
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={page === pagination.pages}
                                className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm"
                            >
                                NEXT
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Applications;
