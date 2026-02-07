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
                popup: 'rounded-xl font-inter',
                title: 'text-sm font-bold font-inter',
                confirmButton: 'rounded-lg text-[10px] font-bold px-4 py-2',
                cancelButton: 'rounded-lg text-[10px] font-bold px-4 py-2 bg-slate-100 text-slate-600'
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
                        const styles = clonedDoc.getElementsByTagName('style');
                        for (let i = 0; i < styles.length; i++) {
                            styles[i].innerHTML = styles[i].innerHTML.replace(/oklch\([^)]+\)/g, '#ffffff');
                        }
                        const elements = clonedDoc.getElementsByTagName('*');
                        for (const el of elements) {
                            if (el.classList.contains('bg-white')) el.style.backgroundColor = '#ffffff';
                            if (el.classList.contains('text-slate-900')) el.style.color = '#0f172a';
                            if (el.classList.contains('bg-[#E11D48]')) el.style.backgroundColor = '#E11D48';
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
                        const styles = clonedDoc.getElementsByTagName('style');
                        for (let i = 0; i < styles.length; i++) {
                            styles[i].innerHTML = styles[i].innerHTML.replace(/oklch\([^)]+\)/g, '#ffffff');
                        }
                        const elements = clonedDoc.getElementsByTagName('*');
                        for (const el of elements) {
                            if (el.classList.contains('bg-white')) el.style.backgroundColor = '#ffffff';
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
            {/* Compact Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm gap-4">
                <div className="flex items-center gap-2">
                    <div className="bg-emerald-50 p-1.5 rounded-lg">
                        <UsersIcon size={16} className="text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-800">Member Directory</h2>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none">Database Management</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleGenerateIDs} className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition shadow-sm">
                        <Wand2 size={12} /> IDs
                    </button>
                    <button onClick={handleGenerateCertificates} className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition shadow-sm">
                        <Printer size={12} /> Certificates
                    </button>
                    <button className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition shadow-sm">
                        <Upload size={12} /> Import
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] font-bold shadow-md shadow-emerald-100 bg-emerald-600 text-white hover:bg-emerald-700 transition-all">
                        <Plus size={14} /> Add Member
                    </button>
                </div>
            </div>

            {/* Compact Summary Cards */}
            {/* Compact Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <SummaryCard icon={UsersIcon} color="blue" label="Total" value={stats.total} sub="All" />
                <SummaryCard icon={CheckCircle} color="emerald" label="Active" value={stats.active} sub="Paid" />
                <SummaryCard icon={Clock} color="orange" label="Pending" value={stats.pending} sub="Action" />
                <SummaryCard icon={AlertOctagon} color="red" label="Suspended" value={stats.suspended} sub="Alert" />
            </div>

            {/* Table Section */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col flex-1 min-h-[400px] overflow-hidden">
                {/* Filters */}
                <div className="p-2.5 flex flex-col md:flex-row gap-2.5 justify-between items-center border-b border-slate-50 bg-slate-50/20">
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={14} className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search directory..."
                            className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-semibold outline-none focus:ring-2 focus:ring-emerald-500/10 transition"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex bg-slate-100/80 p-0.5 rounded-xl border border-slate-100">
                        {['all', 'active', 'pending', 'suspended'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={clsx(
                                    "px-4 py-1.5 text-[10px] font-bold rounded-lg transition-all capitalize",
                                    filter === f ? "bg-white shadow-sm text-emerald-800" : "text-slate-400 hover:text-slate-600"
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
                        <thead className="sticky top-0 bg-white shadow-sm z-10 border-b border-slate-100">
                            <tr>
                                <th className="py-2.5 px-4 w-10 text-center"><input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" /></th>
                                <th className="py-2.5 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Member Details</th>
                                <th className="py-2.5 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Reg No</th>
                                <th className="py-2.5 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                                <th className="py-2.5 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="py-2.5 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                                <th className="py-2.5 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
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
                                    <tr key={m.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none">
                                        <td className="py-2.5 px-4 text-center"><input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" /></td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center font-bold text-[9px] uppercase shadow-sm group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
                                                    {(m.first_name?.[0] || '') + (m.last_name?.[0] || '')}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors leading-tight">{m.first_name} {m.last_name}</div>
                                                    <div className="text-[9px] text-slate-400 font-semibold mt-0.5 tracking-tight">{m.member_id || 'PENDING'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50/50 px-1.5 py-0.5 rounded-md border border-emerald-100/50 font-mono tracking-tighter">{m.registration_number || 'N/A'}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-[11px] font-bold text-slate-700 leading-none">{m.email}</div>
                                            <div className="text-[9px] text-slate-400 mt-1 font-semibold">{m.phone || '-'}</div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${getStatusColor(m.status)} uppercase tracking-tighter shadow-sm`}>
                                                {m.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md capitalize">{m.role || 'Member'}</span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button onClick={() => navigate(`/dashboard/members/${m.id}`)} className="p-1.5 bg-white border border-slate-100 rounded-lg text-blue-500 hover:bg-blue-50 transition shadow-xs" title="View Profile">
                                                    <Eye size={12} />
                                                </button>
                                                <button className="p-1.5 bg-white border border-slate-100 rounded-lg text-emerald-500 hover:bg-emerald-50 transition shadow-xs" title="Edit Member">
                                                    <Edit size={12} />
                                                </button>
                                                <button onClick={() => handleDelete(m.id)} className="p-1.5 bg-white border border-slate-100 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition shadow-xs" title="Delete Member">
                                                    <Trash2 size={12} />
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
                <div className="p-3 border-t border-slate-50 flex justify-between items-center bg-slate-50/20">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Showing {Math.min((page - 1) * itemsPerPage + 1, members.length)}-{Math.min(page * itemsPerPage, members.length)} of {members.length}</span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition shadow-sm">Previous</button>
                        <button onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition shadow-sm">Next</button>
                    </div>
                </div>
            </div>

            {/* Hidden Templates for PDF Generation */}
            <div className="fixed top-0 left-0 -z-50 pointer-events-none overflow-hidden opacity-0" style={{ width: '1200px', height: '1000px' }}>
                <div className="p-10">
                    {/* ID Card Template Container - Always present to keep Ref stable if needed */}
                    {bulkItem && (
                        <div ref={idCardRef} className="w-[325px] h-[205px] bg-white rounded-[24px] border border-slate-100 flex flex-col relative overflow-hidden font-dm-sans shadow-none" style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9' }}>
                            {/* Red Slanted Header */}
                            <div className="absolute top-0 left-0 w-full h-[60px] flex" style={{ background: '#ffffff' }}>
                                {/* Logo Area */}
                                <div className="w-[75px] h-full flex items-center justify-center p-2 z-20">
                                    {branding.system_logo ? (
                                        <img src={branding.system_logo} alt="L" className="w-full h-full object-contain" crossOrigin="anonymous" />
                                    ) : (
                                        <div className="w-8 h-8 bg-[#ed1c24] rounded-full" style={{ backgroundColor: '#ed1c24' }}></div>
                                    )}
                                </div>

                                {/* Slanted Red Banner */}
                                <div className="flex-1 h-full bg-[#ed1c24] relative z-10" style={{ backgroundColor: '#ed1c24', clipPath: 'polygon(12% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-20px' }}>
                                    <div className="absolute inset-0 flex flex-col justify-center pl-8 pr-4 text-white">
                                        <h1 className="text-[10px] font-black leading-tight tracking-tight uppercase" style={{ color: '#ffffff' }}>
                                            {branding.association_name || 'NATIONAL NURSES ASSOCIATION OF KENYA'}
                                        </h1>
                                        <p className="text-[6px] font-bold italic opacity-90 leading-tight" style={{ color: '#ffffff' }}>
                                            "{branding.association_tagline || 'Voice of the Nursing Profession'}"
                                        </p>
                                        <p className="text-[5px] font-bold mt-1 tracking-widest opacity-80 uppercase leading-none" style={{ color: '#ffffff' }}>
                                            MEMBER OF THE INTERNATIONAL COUNCIL OF NURSES
                                        </p>
                                        <div className="absolute bottom-1 right-2 text-[7px] font-black tracking-widest opacity-90 leading-none" style={{ color: '#ffffff' }}>
                                            MEMBERSHIP CARD
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="mt-[65px] px-4 flex justify-between items-start">
                                {/* Left Side: Details */}
                                <div className="flex-1 space-y-1 pt-1">
                                    <div className="flex flex-col">
                                        <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5" style={{ color: '#94a3b8' }}>Name:</span>
                                        <span className="text-[11px] font-black text-slate-900 uppercase leading-none" style={{ color: '#0f172a' }}>{bulkItem.first_name} {bulkItem.last_name}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5" style={{ color: '#94a3b8' }}>ID No.:</span>
                                        <span className="text-[9px] font-bold text-slate-800 leading-none" style={{ color: '#1e293b' }}>{bulkItem.id_number || 'N/A'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5" style={{ color: '#94a3b8' }}>Membership No.:</span>
                                        <span className="text-[9px] font-bold text-slate-800 leading-none" style={{ color: '#1e293b' }}>{bulkItem.member_id || 'PENDING'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5" style={{ color: '#94a3b8' }}>Valid Till:</span>
                                        <span className="text-[9px] font-bold text-slate-800 leading-none" style={{ color: '#1e293b' }}>December, 2027</span>
                                    </div>
                                </div>

                                {/* Right Side: Photo with Red Frame */}
                                <div className="w-[85px] h-[105px] flex items-center justify-center p-1 bg-[#ed1c24] rounded-lg shadow-md -mt-4 z-20" style={{ backgroundColor: '#ed1c24' }}>
                                    <div className="w-full h-full bg-white rounded flex flex-col overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
                                        {bulkItem.profile_picture ? (
                                            <img src={bulkItem.profile_picture} alt="P" className="w-full h-full object-cover" crossOrigin="anonymous" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300" style={{ backgroundColor: '#f8fafc', color: '#cbd5e1' }}>
                                                <LucideUser size={32} strokeWidth={1} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer: QR and Signature */}
                            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                                <div className="flex items-center gap-2">
                                    {/* QR Placeholder */}
                                    <div className="w-8 h-8 bg-white border border-slate-100 p-0.5 rounded" style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9' }}>
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                            <div className="grid grid-cols-2 gap-0.5">
                                                <div className="w-1 h-1 bg-slate-800"></div>
                                                <div className="w-1 h-1 bg-slate-800"></div>
                                                <div className="w-1 h-1 bg-slate-800"></div>
                                                <div className="w-1 h-1 bg-slate-400"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col">
                                        <div className="h-3.5 flex items-center overflow-hidden">
                                            {branding.authorised_signature && (
                                                <img src={branding.authorised_signature} alt="S" className="h-5 object-contain filter grayscale opacity-80" crossOrigin="anonymous" />
                                            )}
                                        </div>
                                        <span className="text-[5px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5" style={{ color: '#94a3b8' }}>Authorised Signature</span>
                                    </div>
                                </div>
                                <div className="text-[6px] font-black text-slate-400 uppercase tracking-[0.1em] opacity-50" style={{ color: '#94a3b8' }}>
                                    NNA KENYA
                                </div>
                            </div>
                        </div>
                    )}

                    {bulkItem && (
                        <div ref={certificateRef} className="w-[794px] h-[1123px] bg-white relative p-12 flex flex-col font-dm-sans" style={{ backgroundColor: '#ffffff' }}>
                            {/* Outer Border - Thick Green */}
                            <div className="absolute inset-0 border-[10px] border-[#016938]" style={{ borderColor: '#016938' }}></div>
                            {/* Inner Border - Thin Green */}
                            <div className="absolute inset-4 border-[2px] border-[#016938]" style={{ borderColor: '#016938' }}></div>

                            <div className="relative z-10 flex flex-col items-center flex-1 py-10">
                                {/* Logo Area */}
                                <div className="mt-8 mb-6 h-24 flex items-center justify-center">
                                    {branding.system_logo ? (
                                        <img src={branding.system_logo} alt="Logo" className="h-full object-contain" crossOrigin="anonymous" />
                                    ) : (
                                        <div className="w-20 h-20 border-2 border-[#016938] rounded-full flex items-center justify-center text-[#016938] font-bold text-center p-2 text-[10px]" style={{ borderColor: '#016938', color: '#016938' }}>NNAK Logo</div>
                                    )}
                                </div>

                                {/* Association Name */}
                                <h1 className="text-[28px] font-black text-[#016938] uppercase tracking-tight text-center max-w-[550px] leading-tight mb-1" style={{ color: '#016938' }}>
                                    {branding.association_name || 'NATIONAL NURSES ASSOCIATION OF KENYA'}
                                </h1>

                                {/* Tagline */}
                                <p className="text-lg font-bold text-[#E11D48] italic tracking-tight mb-12" style={{ color: '#E11D48' }}>
                                    "{branding.association_tagline || 'Voice of the Nursing Profession'}"
                                </p>

                                {/* Title Section */}
                                <div className="text-center mb-10">
                                    <h2 className="text-[62px] font-black text-[#1e3a8a] italic leading-none" style={{ color: '#1e3a8a' }}>Certificate of</h2>
                                    <h2 className="text-[62px] font-black text-[#1e3a8a] leading-none" style={{ color: '#1e3a8a' }}>Membership</h2>
                                </div>

                                {/* Statement */}
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.4em] mb-10" style={{ color: '#9ca3af' }}>
                                    THIS IS TO CERTIFY THAT
                                </p>

                                {/* Recipient Name Area */}
                                <div className="flex flex-col items-center mb-10">
                                    <h3 className="text-4xl font-black text-[#016938] uppercase tracking-tight border-b-[4px] border-[#016938] px-8 pb-1 mb-4" style={{ color: '#016938', borderColor: '#016938' }}>
                                        {bulkItem.first_name} {bulkItem.last_name}
                                    </h3>

                                    {/* Member & License Details under the name */}
                                    <div className="flex items-center gap-6 text-[#1e3a8a] font-bold text-sm tracking-wide" style={{ color: '#1e3a8a' }}>
                                        <span>MEMBER NO: <span className="font-mono">{bulkItem.member_id || 'PENDING'}</span></span>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        <span>LICENSE NO: <span className="font-mono">{bulkItem.registration_number || 'PENDING'}</span></span>
                                    </div>
                                </div>

                                {/* Body Text */}
                                <div className="max-w-[550px] text-center mb-16 px-4">
                                    <p className="text-base text-slate-500 leading-relaxed font-medium" style={{ color: '#64748b' }}>
                                        Has been duly registered as a member of the National Nurses Association of Kenya, having complied with the association's requirements and committed to the excellence of the nursing profession.
                                    </p>
                                </div>

                                {/* Bottom Section */}
                                <div className="w-full mt-auto px-12 flex justify-between items-end pb-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest" style={{ color: '#9ca3af' }}>Date of Issue:</span>
                                            <span className="text-sm font-bold text-slate-700 font-mono" style={{ color: '#334155' }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest" style={{ color: '#9ca3af' }}>Expiry Date:</span>
                                            <span className="text-sm font-bold text-slate-700 font-mono" style={{ color: '#334155' }}>31st December 2026</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        {branding.authorised_signature && (
                                            <img src={branding.authorised_signature} alt="Sign" className="h-12 object-contain filter grayscale mb-1" crossOrigin="anonymous" />
                                        ) || <div className="h-12"></div>}
                                        <div className="w-48 h-px bg-[#016938]" style={{ backgroundColor: '#016938' }}></div>
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2" style={{ color: '#9ca3af' }}>Authorized Signature</span>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Footer */}
                            <div className="absolute bottom-10 left-0 w-full text-center">
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em]" style={{ color: '#9ca3af' }}>
                                    Verify this document's authenticity at members.nnak.or.ke
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
        emerald: 'text-emerald-700 bg-emerald-50/50 border-emerald-50',
        orange: 'text-amber-700 bg-amber-50/50 border-amber-50',
        red: 'text-red-700 bg-red-50/50 border-red-50'
    };
    const c = colors[color] || colors.blue;

    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition group-hover:scale-110">
                <Icon size={24} />
            </div>
            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</div>
            <div className="text-lg font-bold text-slate-800 mb-1 leading-none">{value || '0'}</div>
            <div className={`text-[8px] font-bold ${c} inline-block px-1.5 py-0.5 rounded border capitalize tracking-wider`}>{sub}</div>
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
