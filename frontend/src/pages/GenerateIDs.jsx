import React, { useState, useEffect, useRef } from 'react';
import {
    Users, Search, Filter, Download, CheckCircle,
    Printer, Wand2, Loader2, CheckSquare, Square,
    ChevronLeft, ChevronRight, X
} from 'lucide-react';
import AdminAPI from '../services/api';
import Swal from 'sweetalert2';
import clsx from 'clsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import IDCardPrintable from '../components/IDCardPrintable';
import CertificatePrintable from '../components/CertificatePrintable';

const GenerateIDs = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('active'); // Default to active for IDs
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentProcessingMember, setCurrentProcessingMember] = useState(null);
    const [branding, setBranding] = useState({});

    const idCardRef = useRef(null);
    const certificateRef = useRef(null);

    useEffect(() => {
        fetchMembers();
        fetchBranding();
    }, [search, filter]);

    const fetchBranding = async () => {
        try {
            const response = await AdminAPI.getSettings();
            if (response.success) setBranding(response.settings);
        } catch (error) {
            console.error("Branding fetch error:", error);
        }
    };

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await AdminAPI.getMembers(1, 100, search); // Fetch up to 100 for bulk
            let data = response.members || [];
            if (filter !== 'all') {
                data = data.filter(m => m.status === filter);
            }
            setMembers(data);
        } catch (error) {
            console.error("Failed to fetch members:", error);
            Swal.fire('Error', 'Could not load members', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (id) => {
        setSelectedMembers(prev =>
            prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedMembers.length === members.length) {
            setSelectedMembers([]);
        } else {
            setSelectedMembers(members.map(m => m.id));
        }
    };

    const handleBulkGenerate = async (type) => {
        if (selectedMembers.length === 0) {
            return Swal.fire('No Selection', 'Please select at least one member.', 'info');
        }

        const targetMembers = members.filter(m => selectedMembers.includes(m.id));

        const result = await Swal.fire({
            title: `Generate ${type === 'id' ? 'IDs' : 'Certificates'}?`,
            text: `You are about to generate ${type === 'id' ? 'digital IDs' : 'professional certificates'} for ${targetMembers.length} members.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            confirmButtonText: 'Yes, Proceed'
        });

        if (!result.isConfirmed) return;

        setIsGenerating(true);
        try {
            const doc = new jsPDF(type === 'id' ? 'l' : 'p', 'mm', type === 'id' ? [85.6, 54] : 'a4');

            for (let i = 0; i < targetMembers.length; i++) {
                const member = targetMembers[i];
                setCurrentProcessingMember(member);

                // Small delay to allow renderer to update
                await new Promise(resolve => setTimeout(resolve, 300));

                const container = type === 'id' ? idCardRef.current : certificateRef.current;

                if (!container) continue;

                const canvas = await html2canvas(container, {
                    scale: 3,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: '#ffffff',
                    onclone: (clonedDoc) => {
                        // Fix for 'oklch' tailwind variables
                        const allElements = clonedDoc.body.getElementsByTagName('*');
                        for (let i = 0; i < allElements.length; i++) {
                            allElements[i].removeAttribute('class');
                        }
                    }
                });

                if (i > 0) doc.addPage();

                const imgData = canvas.toDataURL(type === 'id' ? 'image/png' : 'image/jpeg', 0.95);
                if (type === 'id') {
                    doc.addImage(imgData, 'PNG', 0, 0, 85.6, 54);
                } else {
                    doc.addImage(imgData, 'JPEG', 0, 0, 210, 297);
                }
            }

            doc.save(`NNAK_Bulk_${type === 'id' ? 'IDs' : 'Certificates'}_${new Date().getTime()}.pdf`);

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `${targetMembers.length} ${type === 'id' ? 'IDs' : 'Certificates'} generated successfully.`,
            });
        } catch (error) {
            console.error("Bulk generation error:", error);
            Swal.fire('Error', 'An error occurred during generation.', 'error');
        } finally {
            setIsGenerating(false);
            setCurrentProcessingMember(null);
        }
    };

    return (
        <div className="flex flex-col gap-4 animate-fade-in font-inter pb-10">
            {/* Header */}
            <div className="flex justify-between items-end px-1">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bulk ID Engine</h1>
                    <p className="text-xs text-[#059669] font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                        <span className="w-4 h-px bg-[#059669]/30"></span>
                        High-Resolution Document Generation
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleBulkGenerate('id')}
                        disabled={isGenerating || selectedMembers.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Wand2 size={14} /> Generate IDs
                    </button>
                    <button
                        onClick={() => handleBulkGenerate('certificate')}
                        disabled={isGenerating || selectedMembers.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Printer size={14} /> Certificates
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm mx-1">
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search members by name, ID or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/5 transition-all outline-none"
                    />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100/50 p-1 rounded-xl">
                    {['all', 'active', 'pending', 'suspended'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={clsx(
                                "px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                                filter === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Members Selection List */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mx-1">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="py-4 px-6 w-12 text-center">
                                <button onClick={toggleSelectAll} className="text-slate-400 hover:text-emerald-600 transition-colors">
                                    {selectedMembers.length === members.length && members.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                </button>
                            </th>
                            <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member</th>
                            <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reg Number</th>
                            <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Chapter</th>
                            <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="animate-spin text-emerald-500" size={32} />
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Querying Database...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : members.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-20 text-center">
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No members found</p>
                                </td>
                            </tr>
                        ) : (
                            members.map(member => (
                                <tr key={member.id} className={clsx(
                                    "group transition-all hover:bg-slate-50/50 cursor-pointer",
                                    selectedMembers.includes(member.id) && "bg-emerald-50/30"
                                )} onClick={() => toggleSelection(member.id)}>
                                    <td className="py-4 px-6 text-center">
                                        <div className={clsx(
                                            "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                            selectedMembers.includes(member.id)
                                                ? "bg-emerald-500 border-emerald-500 text-white"
                                                : "border-slate-200 bg-white"
                                        )}>
                                            {selectedMembers.includes(member.id) && <CheckSquare size={14} />}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                                                {member.first_name[0]}{member.last_name[0]}
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-slate-900 uppercase tracking-tight">{member.first_name} {member.last_name}</div>
                                                <div className="text-[10px] text-slate-400 font-bold">{member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-[10px] font-black text-emerald-600 font-mono tracking-tighter bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                            {member.registration_number || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{member.chapter || 'Universal'}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={clsx(
                                            "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                            member.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                        )}>
                                            {member.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                    <span>{selectedMembers.length} Members Selected</span>
                    <span>Displaying {members.length} Members</span>
                </div>
            </div>

            {/* Hidden Processing Overlay */}
            {isGenerating && (
                <div className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-8">
                    <div className="bg-white rounded-[3rem] p-10 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Loader2 className="animate-spin text-emerald-600" size={40} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">Generating Batch</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Please do not close this window while we process high-resolution renders.</p>

                        {currentProcessingMember && (
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in slide-in-from-bottom-2">
                                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Processing Member</p>
                                <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{currentProcessingMember.first_name} {currentProcessingMember.last_name}</p>
                            </div>
                        )}

                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 animate-pulse-fast" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Printing Templates - Only active when member is set */}
            <div className="fixed top-0 left-0 -z-50 pointer-events-none opacity-0" style={{ width: '1200px' }}>
                {currentProcessingMember && (
                    <div className="p-20 bg-white">
                        <div ref={idCardRef}>
                            <IDCardPrintable member={currentProcessingMember} branding={branding} />
                        </div>
                        <div className="mt-40" ref={certificateRef}>
                            <CertificatePrintable member={currentProcessingMember} branding={branding} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenerateIDs;
