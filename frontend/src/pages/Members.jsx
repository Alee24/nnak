import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Upload, Wand2, Filter, ChevronLeft, ChevronRight, Eye, Edit, Trash2, UserCheck, UserX, Award, User as LucideUser, CheckCircle, Clock, AlertOctagon, Users as UsersIcon, Loader2, Printer, X } from 'lucide-react';
import AdminAPI from '../services/api';
import Swal from 'sweetalert2';
import clsx from 'clsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Line } from 'react-chartjs-2';

const Members = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, suspended: 0 });
    const [debugInfo, setDebugInfo] = useState(null);
    const [bulkItem, setBulkItem] = useState(null);
    const [branding, setBranding] = useState({});

    const idCardRef = useRef(null);
    const certificateRef = useRef(null);

    const itemsPerPage = 20;

    useEffect(() => {
        fetchMembers();
        fetchBranding();
    }, [page, search, filter]);

    const fetchBranding = async () => {
        try {
            const response = await AdminAPI.getSettings();
            if (response.success) setBranding(response.settings);
        } catch (error) {
            console.error("Failed to fetch branding:", error);
        }
    };

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const result = await AdminAPI.getMembers(page, itemsPerPage, search);

            let data = [];
            if (result.members) data = result.members;
            else if (Array.isArray(result)) data = result;

            if (filter !== 'all') {
                data = data.filter(m => m.status === filter);
            }

            setMembers(data);

            if (page === 1 && !search && filter === 'all') {
                setStats({
                    total: result.members ? (result.pagination?.total || result.members.length) : data.length,
                    active: data.filter(m => m.status === 'active').length,
                    pending: data.filter(m => m.status === 'pending').length,
                    suspended: data.filter(m => m.status === 'suspended').length
                });
            }

        } catch (error) {
            console.error('Fetch Members Error:', error);
            setDebugInfo({ message: error.message });
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Error loading members',
                text: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Member?',
            text: "This action will soft-delete the member.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Delete',
            customClass: {
                popup: 'rounded-[1rem] font-inter',
                title: 'text-lg font-bold font-dm-sans',
                confirmButton: 'rounded-lg text-xs font-bold px-4 py-2',
                cancelButton: 'rounded-lg text-xs font-bold px-4 py-2 bg-gray-100 text-gray-600'
            }
        });

        if (result.isConfirmed) {
            try {
                await AdminAPI.deleteMember(id);
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Member has been deleted.',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000
                });
                fetchMembers();
            } catch (e) {
                Swal.fire('Error', 'Failed to delete member.', 'error');
            }
        }
    };

    const handleGenerateIDs = async () => {
        const targetMembers = members; // Generate for current view
        if (targetMembers.length === 0) return Swal.fire('No Members', 'No members found to generate IDs for.', 'info');

        Swal.fire({
            title: 'Generating PDF IDs',
            text: `Processing digital IDs for ${targetMembers.length} members...`,
            icon: 'info',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = 85.6;
            const pdfHeight = 54;
            const x = (210 - pdfWidth) / 2;

            for (let i = 0; i < targetMembers.length; i++) {
                const member = targetMembers[i];
                setBulkItem(member);

                // Wait for state update and render - Increased timeout for stability
                await new Promise(resolve => setTimeout(resolve, 250));

                if (!idCardRef.current) {
                    console.error("ID Card Ref is null for member:", member.email);
                    continue;
                }

                const canvas = await html2canvas(idCardRef.current, {
                    scale: 3,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: '#ffffff',
                    logging: true,
                    scrollX: 0,
                    scrollY: -window.scrollY,
                    onclone: (clonedDoc) => {
                        const style = clonedDoc.createElement('style');
                        style.innerHTML = `
                            :root {
                                --color-emerald-50: #ecfdf5 !important;
                                --color-emerald-500: #10b981 !important;
                                --color-slate-900: #0f172a !important;
                                --color-gray-50: #f9fafb !important;
                                --color-gray-100: #f3f4f6 !important;
                                --color-gray-400: #9ca3af !important;
                            }
                        `;
                        clonedDoc.head.appendChild(style);
                        const elements = clonedDoc.getElementsByTagName('*');
                        for (const el of elements) {
                            const comp = window.getComputedStyle(el);
                            if (comp.backgroundColor.includes('oklch')) el.style.backgroundColor = '#ffffff';
                            if (comp.color.includes('oklch')) el.style.color = '#333333';
                        }
                    }
                });

                const imgData = canvas.toDataURL('image/png');
                if (i > 0) doc.addPage();

                doc.addImage(imgData, 'PNG', x, 40, pdfWidth, pdfHeight);
                doc.setFontSize(8);
                doc.text(`Official NNAK Digital ID - ${member.first_name} ${member.last_name}`, 105, 100, { align: 'center' });
            }

            doc.save(`NNAK_Batch_IDs_${new Date().getTime()}.pdf`);
            setBulkItem(null);

            Swal.fire({
                icon: 'success',
                title: 'Generation Complete',
                text: 'IDs PDF has been downloaded.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } catch (error) {
            console.error("PDF Gen Error:", error);
            setBulkItem(null);
            Swal.fire({
                icon: 'error',
                title: 'PDF Generation Failed',
                text: `An error occurred: ${error.message}. Please check console for details.`,
                confirmButtonColor: '#059669'
            });
        }
    };

    const handleGenerateCertificates = async () => {
        const activeMembers = members.filter(m => m.status === 'active');
        if (activeMembers.length === 0) return Swal.fire('No Active Members', 'No active members found for certificates.', 'info');

        Swal.fire({
            title: 'Generating Certificates',
            text: `Preparing certificates for ${activeMembers.length} active members...`,
            icon: 'info',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const doc = new jsPDF('p', 'mm', 'a4');

            for (let i = 0; i < activeMembers.length; i++) {
                const member = activeMembers[i];
                setBulkItem(member);

                await new Promise(resolve => setTimeout(resolve, 300));

                if (!certificateRef.current) {
                    console.error("Certificate Ref is null for member:", member.email);
                    continue;
                }

                const canvas = await html2canvas(certificateRef.current, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: '#ffffff',
                    logging: true,
                    scrollX: 0,
                    scrollY: -window.scrollY,
                    onclone: (clonedDoc) => {
                        const style = clonedDoc.createElement('style');
                        style.innerHTML = `
                            :root {
                                --color-emerald-50: #ecfdf5 !important;
                                --color-emerald-500: #10b981 !important;
                                --color-slate-900: #0f172a !important;
                                --color-slate-400: #94a3b8 !important;
                                --color-gray-50: #f9fafb !important;
                                --color-gray-100: #f3f4f6 !important;
                            }
                        `;
                        clonedDoc.head.appendChild(style);
                        const elements = clonedDoc.getElementsByTagName('*');
                        for (const el of elements) {
                            const comp = window.getComputedStyle(el);
                            if (comp.backgroundColor.includes('oklch')) el.style.backgroundColor = '#ffffff';
                            if (comp.color.includes('oklch')) el.style.color = '#B91C1C';
                        }
                    }
                });

                const imgData = canvas.toDataURL('image/png');
                if (i > 0) doc.addPage();

                doc.addImage(imgData, 'PNG', 0, 0, 210, 297);
            }

            doc.save(`NNAK_Certificates_${new Date().getTime()}.pdf`);
            setBulkItem(null);

            Swal.fire({
                icon: 'success',
                title: 'Batch Complete',
                text: 'Certificates PDF has been downloaded.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } catch (error) {
            console.error("Cert Gen Error:", error);
            setBulkItem(null);
            Swal.fire({
                icon: 'error',
                title: 'Certificate Error',
                text: `An error occurred: ${error.message}`,
                confirmButtonColor: '#059669'
            });
        }
    };

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100';
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100';
            case 'suspended': return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-100';
        }
    };

    return (
        <div className="flex flex-col gap-4 animate-fade-in font-inter">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight font-dm-sans">Member Directory</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Database Management</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleGenerateIDs} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition shadow-sm hover:border-gray-300">
                        <Wand2 size={14} /> IDs
                    </button>
                    <button onClick={handleGenerateCertificates} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition shadow-sm hover:border-gray-300">
                        <Printer size={14} /> Certificates
                    </button>
                    <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition shadow-sm hover:border-gray-300">
                        <Upload size={14} /> Import
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-md shadow-green-100 transform transition bg-[#059669] text-white hover:bg-[#047857] hover:-translate-y-0.5">
                        <Plus size={14} /> Add Member
                    </button>
                </div>
            </div>

            {/* Compact Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard icon={UsersIcon} color="blue" label="Total" value={stats.total} sub="All" />
                <SummaryCard icon={CheckCircle} color="green" label="Active" value={stats.active} sub="Paid" />
                <SummaryCard icon={Clock} color="yellow" label="Pending" value={stats.pending} sub="Action" />
                <SummaryCard icon={AlertOctagon} color="red" label="Suspended" value={stats.suspended} sub="Alert" />
            </div>

            {/* Table Section */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col flex-1 min-h-[400px] overflow-hidden">
                {/* Filters */}
                <div className="p-3 flex flex-col md:flex-row gap-3 justify-between items-center border-b border-gray-50 bg-gray-50/20">
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={14} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search directory..."
                            className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-medium outline-none transition"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex bg-gray-100/80 p-1 rounded-xl">
                        {['all', 'active', 'pending', 'suspended'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={clsx(
                                    "px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all capitalize",
                                    filter === f ? "bg-white shadow-sm text-emerald-800" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white shadow-sm z-10">
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="py-3 px-6 w-12 text-center"><input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" /></th>
                                <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Member Details</th>
                                <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Register No</th>
                                <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                                <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                                <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <Loader2 className="animate-spin mb-2" size={32} />
                                            <span className="font-bold uppercase tracking-widest text-[10px]">Loading directory...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : members.length === 0 ? (
                                <tr><td colSpan="7" className="py-16 text-center text-gray-400 italic">No members found matching your filters.</td></tr>
                            ) : (
                                members.map((m) => (
                                    <tr key={m.id} className="group hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none">
                                        <td className="py-4 px-6 text-center"><input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" /></td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 flex items-center justify-center font-bold text-[10px] ring-2 ring-white shadow-sm group-hover:scale-105 transition-transform">
                                                    {(m.first_name?.[0] || '') + (m.last_name?.[0] || '')}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900 group-hover:text-[#059669] transition-colors">{m.first_name} {m.last_name}</div>
                                                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">{m.member_id || 'PENDING'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 font-mono">{m.registration_number || 'N/A'}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-xs font-semibold text-gray-700">{m.email}</div>
                                            <div className="text-[10px] text-gray-400 mt-0.5 font-medium">{m.phone || '-'}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(m.status)} uppercase tracking-wide shadow-sm`}>
                                                {m.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full capitalize">{m.role || 'Member'}</span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                <button onClick={() => navigate(`/dashboard/members/${m.id}`)} className="p-2 bg-white border border-gray-200 rounded-xl text-blue-500 hover:bg-blue-50 hover:border-blue-300 transition shadow-sm" title="View Profile">
                                                    <Eye size={14} />
                                                </button>
                                                <button className="p-2 bg-white border border-gray-200 rounded-xl text-emerald-500 hover:bg-emerald-50 hover:border-emerald-300 transition shadow-sm" title="Edit Member">
                                                    <Edit size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(m.id)} className="p-2 bg-white border border-gray-200 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition shadow-sm" title="Delete Member">
                                                    <Trash2 size={14} />
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
                <div className="p-4 border-t border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {Math.min((page - 1) * itemsPerPage + 1, members.length)}-{Math.min(page * itemsPerPage, members.length)} of {members.length}</span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition shadow-sm">Previous</button>
                        <button onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition shadow-sm">Next</button>
                    </div>
                </div>
            </div>

            {/* Hidden Templates for PDF Generation */}
            <div className="fixed top-0 left-0 -z-50 pointer-events-none overflow-hidden opacity-0" style={{ width: '1200px', height: '1000px' }}>
                <div className="p-10">
                    {/* ID Card Template Container - Always present to keep Ref stable if needed */}
                    {bulkItem && (
                        <div ref={idCardRef} className="w-[325px] h-[205px] bg-white rounded-[32px] border border-gray-100 flex flex-col relative overflow-hidden font-dm-sans shadow-none">
                            {/* Red Top Accent */}
                            <div className="absolute top-0 left-0 w-full h-[70px] bg-[#E11D48] flex items-center px-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center p-1 shadow-sm">
                                        {branding.system_logo ? (
                                            <img src={branding.system_logo} alt="L" className="w-full h-full object-contain" crossOrigin="anonymous" />
                                        ) : (
                                            <div className="w-full h-full bg-emerald-600 rounded-full"></div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-[7px] font-black text-white/80 uppercase tracking-[0.1em] leading-none">Membership</div>
                                        <div className="text-[11px] font-black text-white uppercase tracking-tighter">NNA KENYA</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-[55px] flex gap-4 px-5 pt-3">
                                {/* Photo Slot */}
                                <div className="w-[85px] h-[105px] bg-gray-50 rounded-xl border-[3px] border-white shadow-lg overflow-hidden flex-shrink-0">
                                    {bulkItem.profile_picture ? (
                                        <img src={bulkItem.profile_picture} alt="P" className="w-full h-full object-cover" crossOrigin="anonymous" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-600">
                                            <LucideUser size={24} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col justify-end pb-1">
                                    <h2 className="text-[14px] font-black text-slate-900 leading-none tracking-tighter uppercase">{bulkItem.first_name}</h2>
                                    <h2 className="text-[12px] font-bold text-slate-400 leading-none tracking-tighter uppercase mb-2">{bulkItem.last_name}</h2>
                                    <div className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#FDF2F2] border border-[#FECACA] text-[7px] font-black text-[#B91C1C] uppercase tracking-widest w-fit">
                                        {bulkItem.occupation || 'Nurse'}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-2 space-y-2 px-5 pb-4 relative z-10">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <div className="text-[6px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">License No</div>
                                        <div className="text-[8px] font-mono font-black text-slate-800 tracking-tighter px-1.5 py-0.5 bg-gray-50 rounded-md border border-gray-100 leading-none">
                                            {bulkItem.registration_number || 'PENDING'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[6px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Member ID</div>
                                        <div className="text-[8px] font-mono font-black text-slate-800 tracking-tighter px-1.5 py-0.5 bg-gray-50 rounded-md border border-gray-100 leading-none">
                                            {bulkItem.member_id || 'PENDING'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div className="space-y-0.5">
                                        <div className="text-[6px] font-black text-gray-400 uppercase tracking-widest leading-none">Authorized Sign</div>
                                        <div className="h-6 w-16">
                                            {branding.authorised_signature && (
                                                <img src={branding.authorised_signature} alt="S" className="w-full h-full object-contain filter grayscale" crossOrigin="anonymous" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-[7px] font-black text-slate-900 uppercase">2026/27</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {bulkItem && (
                        <div ref={certificateRef} className="w-[794px] h-[1123px] bg-white relative p-16 flex flex-col font-dm-sans border-[15px] border-[#E11D48] text-left">
                            {/* Inner Border */}
                            <div className="absolute inset-2 border border-slate-100"></div>

                            {/* Header */}
                            <div className="relative z-10 flex flex-col items-center text-center mt-4">
                                {branding.system_logo && (
                                    <img src={branding.system_logo} alt="L" className="w-20 h-20 object-contain mb-4" crossOrigin="anonymous" />
                                )}
                                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-tight">
                                    {branding.association_name || 'NATIONAL NURSES ASSOCIATION OF KENYA'}
                                </h1>
                                <p className="text-sm font-bold text-[#E11D48] uppercase tracking-[0.2em]">
                                    {branding.association_tagline || 'Promoting Professional Excellence'}
                                </p>
                            </div>

                            {/* Main Content */}
                            <div className="relative z-10 flex-1 flex flex-col items-center text-center px-10 pt-10">
                                <div className="w-full h-[1px] bg-slate-100 mb-10"></div>

                                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">Membership Certificate</h2>
                                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-8">PRACTISING CERTIFICATE</h3>

                                <p className="text-base text-slate-500 mb-4 italic">This is to certify that</p>
                                <h4 className="text-4xl font-black text-[#E11D48] uppercase tracking-tighter mb-6">
                                    {bulkItem.first_name} {bulkItem.last_name}
                                </h4>

                                <p className="text-base text-slate-600 max-w-lg leading-relaxed mb-10">
                                    Is a duly registered member of the association,
                                    holding registration number <span className="font-black text-slate-900">{bulkItem.registration_number}</span>
                                    and is authorized to practice as a <span className="font-black text-slate-900">{bulkItem.occupation || 'Professional Nurse'}</span>.
                                </p>

                                <div className="grid grid-cols-2 gap-10 w-full mt-auto mb-10 text-left px-8">
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Member ID</p>
                                            <p className="text-sm font-mono font-black text-slate-900 leading-none">{bulkItem.member_id}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Date Issued</p>
                                            <p className="text-sm font-mono font-black text-slate-900 leading-none">{new Date().toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center justify-end">
                                        {branding.authorised_signature && (
                                            <img src={branding.authorised_signature} alt="S" className="w-32 h-12 object-contain filter grayscale mb-1" crossOrigin="anonymous" />
                                        )}
                                        <div className="w-full h-px bg-slate-900"></div>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Authorized Signature</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Warning */}
                            <div className="relative z-10 border-t border-slate-50 pt-4 text-center">
                                <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">
                                    This document is valid until 31st December 2026. Verify at members.nnak.or.ke
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Member Modal */}
            <AddMemberModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    fetchMembers();
                }}
            />
        </div>
    );
};

// Summary Card helper
const SummaryCard = ({ icon: Icon, color, label, value, sub }) => {
    const colors = {
        blue: 'text-blue-600 bg-blue-50/50 border-blue-50',
        green: 'text-emerald-700 bg-emerald-50/50 border-emerald-50',
        yellow: 'text-amber-700 bg-amber-50/50 border-amber-50',
        red: 'text-red-700 bg-red-50/50 border-red-50'
    };
    const c = colors[color] || colors.blue;

    return (
        <div className="bg-white border border-gray-100 rounded-xl p-4 relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition group-hover:scale-110">
                <Icon size={32} />
            </div>
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</div>
            <div className="text-xl font-black text-gray-900 mb-1 leading-none">{value || '0'}</div>
            <div className={`text-[8px] font-bold ${c} inline-block px-1.5 py-0.5 rounded border capitalize`}>{sub}</div>
        </div>
    );
};


const AddMemberModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', phone: '',
        registration_number: '', id_number: '', occupation: 'Nurse',
        status: 'active', sub_county: '', county: '', work_station: '',
        qualifications: '', designation: '', personal_number: '',
        chapter: '', cadre: '', employment_status: 'Full-time', is_signed: 1, gender: 'female'
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await AdminAPI.createMember(formData);
            Swal.fire({
                icon: 'success',
                title: 'Member Registered',
                text: `${formData.first_name} has been successfully added to the system.`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            onSuccess();
            onClose();
        } catch (error) {
            Swal.fire('Error', error.message || 'Failed to add member', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 font-dm-sans">New Membership Application</h3>
                        <p className="text-[11px] text-gray-500 font-medium">Complete all fields from the physical registration form</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] border-b border-emerald-50 pb-1">Personal Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">First Name</label>
                                <input required type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition"
                                    value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} placeholder="Jane" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Last Name</label>
                                <input required type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition"
                                    value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} placeholder="Doe" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
                                <input required type="email" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition"
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="jane.doe@example.com" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Mobile Number</label>
                                <input required type="tel" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition"
                                    value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+254..." />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">National ID / Passport</label>
                                <input required type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-mono font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition"
                                    value={formData.id_number} onChange={e => setFormData({ ...formData, id_number: e.target.value })} placeholder="12345678" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Gender</label>
                                <select className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition"
                                    value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                                    <option value="female">Female</option>
                                    <option value="male">Male</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Professional Details */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] border-b border-emerald-50 pb-1">Professional Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Place of Work</label>
                                <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition"
                                    value={formData.work_station} onChange={e => setFormData({ ...formData, work_station: e.target.value })} placeholder="Hospital/Clinic Name" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Designation</label>
                                <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition"
                                    value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} placeholder="Senior Nurse" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Qualfications</label>
                                <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition"
                                    value={formData.qualifications} onChange={e => setFormData({ ...formData, qualifications: e.target.value })} placeholder="BSc Nursing, etc" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Personal No.</label>
                                <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-mono font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition"
                                    value={formData.personal_number} onChange={e => setFormData({ ...formData, personal_number: e.target.value })} placeholder="PN-000" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Register/Roll No.</label>
                                <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-mono font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition"
                                    value={formData.registration_number} onChange={e => setFormData({ ...formData, registration_number: e.target.value })} placeholder="NNAK/REG/..." />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Cadre / Occupation</label>
                                <select className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition"
                                    value={formData.occupation} onChange={e => setFormData({ ...formData, occupation: e.target.value })}>
                                    <option value="Nurse">Registered Nurse</option>
                                    <option value="Midwife">Midwife</option>
                                    <option value="Student">Student</option>
                                    <option value="Associate">Associate</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Regional Details */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] border-b border-emerald-50 pb-1">Regional Information</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">County</label>
                                <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition"
                                    value={formData.county} onChange={e => setFormData({ ...formData, county: e.target.value })} placeholder="Nairobi" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Sub-County</label>
                                <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition"
                                    value={formData.sub_county} onChange={e => setFormData({ ...formData, sub_county: e.target.value })} placeholder="Westlands" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Chapter</label>
                                <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-800 outline-none focus:border-emerald-500 focus:bg-white transition"
                                    value={formData.chapter} onChange={e => setFormData({ ...formData, chapter: e.target.value })} placeholder="NNAK Chapter" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3 border-t border-gray-100 sticky bottom-0 bg-white pb-2 mt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 py-3 bg-[#059669] text-white rounded-xl text-xs font-bold hover:bg-[#047857] transition shadow-lg shadow-emerald-100 flex items-center justify-center gap-2">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle size={16} /> Submit Membership Application</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Members;
