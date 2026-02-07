import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Download, Award, User as LucideUser, Bell, Shield, Clock,
    MapPin, Mail, Phone, Briefcase, Calendar, CheckCircle, AlertTriangle, Printer,
    Activity, FileText
} from 'lucide-react';
import AdminAPI from '../services/api';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import clsx from 'clsx';

const MemberProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [branding, setBranding] = useState({});

    const idCardRef = useRef(null);
    const certificateRef = useRef(null);

    useEffect(() => {
        fetchProfile();
        fetchBranding();
    }, [id]);

    const fetchBranding = async () => {
        try {
            const response = await AdminAPI.getSettings();
            if (response.success) setBranding(response.settings);
        } catch (error) {
            console.error("Failed to fetch branding:", error);
        }
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const [profileResult, cpdResult] = await Promise.all([
                AdminAPI.getMemberProfile(id),
                AdminAPI.getMemberCPD(id)
            ]);

            if (profileResult.success || profileResult.member) {
                setMember({
                    ...profileResult.member,
                    interactions: profileResult.interactions || [],
                    cpd_summary: profileResult.cpd_summary || {},
                    cpd_history: cpdResult.history || []
                });
            } else {
                throw new Error(profileResult.error || 'Failed to load profile');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Could not load member profile', 'error');
            // Fallback for demo
            setMember({
                first_name: 'Robert', last_name: 'Brown',
                status: 'active',
                occupation: 'Registered Nurse',
                member_id: 'NNAK20260134',
                email: 'robert.brown@example.com',
                phone: '+254700000000',
                address: 'Nairobi, Kenya',
                created_at: '2025-01-15',
                cpd_summary: { total: 15 },
                cpd_history: [
                    { description: 'Advanced Life Support', awarded_date: '2026-02-01', points: 10, status: 'approved' }
                ],
                interactions: [
                    { action_type: 'Login', description: 'User logged in', created_at: '2026-02-06 09:00:00' }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    const downloadIdCard = async () => {
        if (!idCardRef.current) return;

        Swal.fire({
            title: 'Generating ID Card...',
            text: 'Preparing high-resolution render',
            didOpen: () => Swal.showLoading()
        });

        try {
            // Wait a bit for images to load completely
            await new Promise(resolve => setTimeout(resolve, 1000));

            const canvas = await html2canvas(idCardRef.current, {
                scale: 4,
                useCORS: true,
                allowTaint: false,
                backgroundColor: null,
                logging: true,
                width: idCardRef.current.offsetWidth,
                height: idCardRef.current.offsetHeight,
                scrollX: 0,
                scrollY: -window.scrollY
            });

            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [85.6, 54]
            });

            const imgData = canvas.toDataURL('image/png', 1.0);
            doc.addImage(imgData, 'PNG', 0, 0, 85.6, 54, undefined, 'FAST');
            doc.save(`NNAK_ID_${member.first_name}_${member.last_name}.pdf`);

            Swal.fire({ icon: 'success', title: 'ID Card Ready', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
        } catch (error) {
            console.error("PDF Export Error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Export Failed',
                text: `Error: ${error.message || 'Unknown error occurred during generation'}`,
                footer: 'Try checking if all images are loaded correctly'
            });
        }
    };

    const downloadCertificate = async () => {
        if (!certificateRef.current) return;

        Swal.fire({
            title: 'Generating Certificate...',
            text: 'Rendering professional document',
            didOpen: () => Swal.showLoading()
        });

        try {
            await new Promise(resolve => setTimeout(resolve, 1200));

            const canvas = await html2canvas(certificateRef.current, {
                scale: 3,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                logging: true,
                width: 794,
                height: 1123,
                scrollX: 0,
                scrollY: -window.scrollY
            });

            const doc = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            doc.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
            doc.save(`NNAK_Certificate_${member.first_name}.pdf`);

            Swal.fire({ icon: 'success', title: 'Certificate Downloaded', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
        } catch (error) {
            console.error("Certificate Export Error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Export Failed',
                text: `Error: ${error.message || 'Failed to generate professional certificate'}`,
                footer: 'Ensure all profile data and branding are loaded'
            });
        }
    };



    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest animate-pulse">Loading Profile...</p>
            </div>
        </div>
    );

    if (!member) return <div className="p-10 text-center text-red-500 font-bold">Member not found</div>;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 animate-fade-in-up font-dm-sans overflow-hidden">

            {/* --- LEFT SIDEBAR: Digital ID & Quick Contact --- */}
            <div className="lg:w-[380px] flex flex-col gap-5 flex-shrink-0 h-full overflow-y-auto custom-scrollbar pb-4">
                {/* Back Button */}
                <button onClick={() => navigate('/members')} className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-emerald-600 transition flex-shrink-0 w-fit group mb-1 uppercase tracking-widest">
                    <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center group-hover:border-emerald-500 transition-colors shadow-sm">
                        <ArrowLeft size={12} />
                    </div>
                    <span>Back to Directory</span>
                </button>

                {/* Digital ID Card Preview */}
                <div className="relative group perspective-1000 flex-shrink-0">
                    <div ref={idCardRef} className="relative bg-white rounded-[2rem] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                        {/* Red Top Accent */}
                        <div className="absolute top-0 left-0 w-full h-20 bg-[#E11D48] flex items-center px-5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shadow-md">
                                    {branding.system_logo ? (
                                        <img src={branding.system_logo} alt="NNAK" className="w-full h-full object-contain" crossOrigin="anonymous" />
                                    ) : (
                                        <div className="w-full h-full bg-emerald-600 rounded-full"></div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-[8px] font-black text-white/80 uppercase tracking-[0.2em] leading-none">Membership</div>
                                    <div className="text-xs font-black text-white uppercase tracking-tighter">NNA KENYA</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 flex gap-4 relative z-10 pt-3">
                            {/* Photo Slot */}
                            <div className="w-28 h-36 bg-gray-50 rounded-xl border-4 border-white shadow-lg overflow-hidden flex-shrink-0 bg-noise">
                                {member.profile_picture ? (
                                    <img src={member.profile_picture} alt="Profile" className="w-full h-full object-cover" crossOrigin="anonymous" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-600">
                                        <LucideUser size={40} strokeWidth={1} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col justify-end pb-1 overflow-hidden">
                                <h2 className="text-lg font-black text-slate-900 leading-none tracking-tighter uppercase truncate mb-1.5">{member.first_name} {member.last_name}</h2>
                                <div className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-[9px] font-black text-emerald-700 uppercase tracking-widest w-fit">
                                    {member.occupation || 'Nurse'}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3 pt-3 border-t border-gray-100 relative z-10">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">License No</div>
                                    <div className="text-[11px] font-mono font-black text-slate-800 tracking-tighter px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                                        {member.registration_number || 'PENDING'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Member ID</div>
                                    <div className="text-[11px] font-mono font-black text-slate-800 tracking-tighter px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                                        {member.member_id || 'PENDING'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-end">
                                <div className="h-8 w-20">
                                    {branding.authorised_signature && (
                                        <img src={branding.authorised_signature} alt="Sign" className="w-full h-full object-contain filter grayscale opacity-70" crossOrigin="anonymous" />
                                    )}
                                </div>
                                <div className="text-[9px] font-black text-slate-900 uppercase">Valid 2026/27</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ID Action Buttons - Grouped with Sidebar */}
                <div className="flex gap-2 flex-shrink-0">
                    <button onClick={downloadIdCard} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-[#E11D48] transition-all flex items-center justify-center gap-2 active:scale-95">
                        <Download size={14} /> Digital Badge
                    </button>
                    <button onClick={downloadCertificate} className="flex-1 py-3 bg-white border border-gray-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-95">
                        <Printer size={14} /> Certificate
                    </button>
                </div>

                {/* Contact Quick Info */}
                <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex-1 min-h-0 flex flex-col">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Contact Details</h3>
                    <div className="space-y-0.5 flex-1 overflow-y-auto custom-scrollbar">
                        <InfoRow label="Email" value={member.email} icon={Mail} />
                        <InfoRow label="Phone" value={member.phone} icon={Phone} />
                        <InfoRow label="Location" value={member.address || member.county} icon={MapPin} />
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                        <a href={`mailto:${member.email}`} className="flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition">
                            <Mail size={12} /> Email
                        </a>
                        <a href={`tel:${member.phone}`} className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition">
                            <Phone size={12} /> Call
                        </a>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA: Tabs & Scrollable Content --- */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Stats Header Grid */}
                <div className="grid grid-cols-3 gap-3 mb-5 flex-shrink-0">
                    <QuickStat label="CPD Points" value={member.cpd_summary?.total || 0} icon={Award} color="#10b981" />
                    <QuickStat label="Member Since" value={new Date(member.created_at || Date.now()).getFullYear()} icon={Calendar} color="#3b82f6" />
                    <QuickStat label="Verification" value={member.status === 'active' ? 'Verified' : 'Pending'} icon={Shield} color={member.status === 'active' ? '#10b981' : '#f59e0b'} />
                </div>

                {/* Tabbed Content Container */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex-1 min-h-0 flex flex-col overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="flex px-6 border-b border-gray-100 bg-gray-50/30 flex-shrink-0">
                        {['overview', 'cpd', 'logs', 'settings'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-slate-900 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {tab}
                                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#E11D48] rounded-t-full animate-in slide-in-from-bottom-1 duration-300"></div>}
                            </button>
                        ))}
                    </div>

                    {/* Scrollable Tab Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Clean Header Card for IDs */}
                                <div className="p-5 rounded-3xl bg-white border border-emerald-50 relative overflow-hidden group shadow-sm flex items-center justify-between">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                    <div className="flex-1 grid grid-cols-2 gap-8 items-center pl-4">
                                        <div className="space-y-0.5">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">License Number</p>
                                            <p className="text-xl font-mono font-black tracking-tighter text-slate-900">
                                                {member.registration_number || 'PENDING'}
                                            </p>
                                        </div>
                                        <div className="space-y-0.5 border-l border-gray-100 pl-8">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Member ID</p>
                                            <p className="text-xl font-mono font-black tracking-tighter text-emerald-600">
                                                {member.member_id || 'PENDING'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Information Grids */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Personal Section */}
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                            <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Personal Info</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-y-3">
                                            <InfoItem label="Full Name" value={`${member.first_name} ${member.last_name}`} />
                                            <InfoItem label="National ID / Passport" value={member.id_number} />
                                            <InfoItem label="Gender" value={member.gender} />
                                            <InfoItem label="Phone Number" value={member.phone} />
                                            <InfoItem label="Email Address" value={member.email} />
                                        </div>
                                    </section>

                                    {/* Professional Section */}
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                            <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Professional Context</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-y-3">
                                            <InfoItem label="Nurse Cadre" value={member.cadre} />
                                            <InfoItem label="Employment Status" value={member.employment_status || 'Full-time'} />
                                            <InfoItem label="Current Work Station" value={member.work_station} />
                                            <InfoItem label="Assigned Branch" value={member.branch_name} />
                                            <InfoItem label="Registration Number" value={member.registration_number || 'Not Assigned'} />
                                        </div>
                                    </section>
                                </div>

                                {/* Regional Section */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <div className="w-1.5 h-4 bg-orange-500 rounded-full"></div>
                                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Regional Details</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <InfoItem label="County" value={member.county} />
                                        <InfoItem label="Sub-County" value={member.sub_county} />
                                        <InfoItem label="Address" value={member.address || 'N/A'} />
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'cpd' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">CPD History Ledger</h3>
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                        Total: {member.cpd_summary?.total || 0} Points
                                    </div>
                                </div>
                                {member.cpd_history && member.cpd_history.length > 0 ? (
                                    <div className="space-y-3">
                                        {member.cpd_history.map((item, idx) => (
                                            <div key={idx} className="p-4 rounded-2xl border border-gray-100 bg-white hover:border-emerald-200 transition-all group shadow-sm">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                            <Award size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.activity_type}</p>
                                                            <p className="text-[10px] text-gray-500 font-medium leading-relaxed mt-0.5">{item.description}</p>
                                                            {item.event_name && (
                                                                <div className="flex items-center gap-1 mt-1.5 p-1 px-1.5 bg-slate-50 border border-slate-100 rounded text-[8px] font-bold text-slate-500 uppercase tracking-widest w-fit">
                                                                    <Calendar size={10} /> {item.event_name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-emerald-600 font-black text-lg">+{item.points}</div>
                                                        <div className="text-[9px] font-bold text-gray-400 mt-0.5">{new Date(item.awarded_date).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <LucideUser size={10} className="text-gray-400" />
                                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">By: {item.awarded_by_name ? `${item.awarded_by_name} ${item.awarded_by_last_name}` : 'System'}</span>
                                                    </div>
                                                    {item.status === 'approved' && (
                                                        <div className="flex items-center gap-1 text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                                                            <CheckCircle size={10} /> Verified
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-[2rem]">
                                        <Award size={32} className="mx-auto text-gray-200 mb-3" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No CPD records found</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'logs' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Activity interaction history</h3>
                                {member.interactions && member.interactions.length > 0 ? (
                                    <div className="relative border-l-2 border-slate-50 ml-2 py-2">
                                        {member.interactions.map((log, idx) => (
                                            <div key={idx} className="mb-6 relative pl-6 group">
                                                <div className="absolute left-[-9px] top-4 w-4 h-4 rounded-full bg-white border-4 border-slate-100 group-hover:border-emerald-500 transition-colors z-10"></div>
                                                <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-emerald-100 hover:bg-white transition-all shadow-sm">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest bg-white shadow-sm border border-gray-100 px-2 py-0.5 rounded-md">
                                                            {log.action_type || 'System'}
                                                        </span>
                                                        <span className="text-[9px] font-medium text-gray-400">
                                                            {new Date(log.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                                        {log.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-[2rem]">
                                        <FileText size={32} className="mx-auto text-gray-200 mb-3" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No activity logs found</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hidden Templates for PDF Generation */}
            <div className="fixed top-0 left-0 -z-50 pointer-events-none overflow-hidden opacity-0" style={{ width: '1200px' }}>
                {/* Certificate (Permit) Template - A4 Portrait */}
                <div ref={certificateRef} className="w-[794px] h-[1123px] bg-white relative p-16 flex flex-col font-dm-sans border-[20px] border-[#E11D48]">
                    <div className="absolute inset-4 border-2 border-slate-200"></div>
                    <div className="relative z-10 flex flex-col items-center text-center mt-8">
                        {branding.system_logo && <img src={branding.system_logo} alt="Logo" className="w-32 h-32 object-contain mb-6" crossOrigin="anonymous" />}
                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">{branding.association_name || 'NATIONAL NURSES ASSOCIATION OF KENYA'}</h1>
                        <p className="text-xl font-bold text-[#E11D48] uppercase tracking-widest mb-12">{branding.association_tagline || 'Promoting Professional Excellence'}</p>
                    </div>
                    <div className="relative z-10 flex-1 flex flex-col items-center text-center px-12 pt-12">
                        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-16"></div>
                        <h2 className="text-2xl font-bold text-slate-400 uppercase tracking-[0.3em] mb-4">Membership Certificate</h2>
                        <h3 className="text-5xl font-black text-slate-900 uppercase tracking-tighter mb-12">PRACTISING CERTIFICATE</h3>
                        <p className="text-xl text-slate-600 mb-8 italic">This is to certify that</p>
                        <h4 className="text-6xl font-black text-[#E11D48] uppercase tracking-tighter mb-8 bg-noise py-4 px-8 rounded-3xl">{member.first_name} {member.last_name}</h4>
                        <p className="text-xl text-slate-600 max-w-2xl leading-relaxed mb-16">Is a duly registered member of the National Nurses Association of Kenya, holding registration number <span className="font-black text-slate-900">{member.registration_number}</span> and is authorized to practice as a <span className="font-black text-slate-900">{member.occupation || 'Professional Nurse'}</span>.</p>
                        <div className="grid grid-cols-2 gap-24 w-full mt-auto mb-20 text-left px-12">
                            <div className="space-y-4">
                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Member ID</p><p className="text-xl font-mono font-black text-slate-900">{member.member_id}</p></div>
                                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Issued</p><p className="text-xl font-mono font-black text-slate-900">{new Date().toLocaleDateString()}</p></div>
                            </div>
                            <div className="flex flex-col items-center justify-end">
                                {branding.authorised_signature && <img src={branding.authorised_signature} alt="Signature" className="w-48 h-20 object-contain filter grayscale mb-2" crossOrigin="anonymous" />}
                                <div className="w-full h-px bg-slate-900"></div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Authorized Signature</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative z-10 border-t border-slate-100 pt-8 text-center"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">This document is valid until 31st December 2026. Verify at members.nnak.or.ke</p></div>
                </div>
            </div>
        </div>
    );
};

const QuickStat = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all group duration-300">
        <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-base font-black text-slate-900 mt-0.5 tracking-tight">{value}</p>
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: color, boxShadow: `0 4px 12px ${color}20` }}>
            <Icon size={16} />
        </div>
    </div>
);

const InfoItem = ({ label, value }) => (
    <div className="group">
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-0.5 group-hover:text-emerald-500 transition-colors">{label}</p>
        <p className="text-xs font-bold text-slate-700 tracking-tight">{value || 'Not provided'}</p>
    </div>
);

const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition group">
        <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
            <Icon size={12} />
        </div>
        <div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-[11px] font-bold text-slate-700 leading-tight">{value || '-'}</p>
        </div>
    </div>
);

export default MemberProfile;
