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
        <div className="flex flex-col gap-6 animate-fade-in font-inter pb-10">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight font-dm-sans">Membership Applications</h1>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Verification & Approval Queue</p>
                </div>
                <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                        <Clock size={16} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">Pending</div>
                        <div className="text-lg font-black text-amber-700 leading-none">{stats.pending}</div>
                    </div>
                </div>
            </div>

            {/* Info Alert */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4 items-start shadow-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                    <AlertCircle size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-blue-900">Verification Process</h4>
                    <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                        Review applicant details before approval. Approving a member will automatically activate their account
                        and award them <b>3 CPD points</b> for joining the association.
                    </p>
                </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                <div className="overflow-x-auto custom-scrollbar flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Applicant</th>
                                <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Register No</th>
                                <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Info</th>
                                <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Applied Date</th>
                                <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="animate-spin text-emerald-500" size={40} />
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scanning applications...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : applications.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-32 text-center text-gray-400 italic">
                                        <div className="flex flex-col items-center gap-3 opacity-50">
                                            <CheckCircle size={48} className="text-emerald-500" />
                                            <p className="text-sm font-bold">All caught up! No pending applications.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app) => (
                                    <tr key={app.id} className="group hover:bg-gray-50/80 transition-all">
                                        <td className="py-5 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 flex items-center justify-center font-black text-xs ring-4 ring-white shadow-sm group-hover:scale-105 transition-transform">
                                                    {(app.first_name?.[0] || '') + (app.last_name?.[0] || '')}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">
                                                        {app.first_name} {app.last_name}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 font-bold mt-0.5 tracking-wider">
                                                        PID: {app.member_id || 'PROVISIONAL'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8">
                                            <span className="inline-flex px-2 px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-black text-gray-600 font-mono">
                                                {app.registration_number || 'NOT PROVIDED'}
                                            </span>
                                        </td>
                                        <td className="py-5 px-8">
                                            <div className="text-xs font-bold text-gray-700">{app.email}</div>
                                            <div className="text-[10px] text-gray-400 mt-1 font-bold">{app.phone || '-'}</div>
                                        </td>
                                        <td className="py-5 px-8">
                                            <div className="text-[11px] font-bold text-gray-500">
                                                {app.created_at ? new Date(app.created_at).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                }) : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="py-5 px-8 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/dashboard/members/${app.id}`)}
                                                    className="p-2.5 bg-white border border-gray-200 rounded-xl text-blue-500 hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm"
                                                    title="View Full Profile"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(app.id, `${app.first_name} ${app.last_name}`)}
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 active:scale-95"
                                                >
                                                    <UserCheck size={14} /> APPROVE
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="px-8 py-5 border-t border-gray-50 bg-gray-50/30 flex justify-between items-center mt-auto">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Page {page} of {pagination.pages}
                        </span>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
                            >
                                PREVIOUS
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={page === pagination.pages}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
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
