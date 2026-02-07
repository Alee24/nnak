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
                scrollX: 0,
                scrollY: -window.scrollY,
                onclone: (clonedDoc) => {
                    // Pre-process stylesheets to neutralize oklch for html2canvas parser
                    const styles = clonedDoc.getElementsByTagName('style');
                    for (let i = 0; i < styles.length; i++) {
                        styles[i].innerHTML = styles[i].innerHTML.replace(/oklch\([^)]+\)/g, '#ffffff');
                    }

                    // Force all elements in the cloned document to use standard colors
                    const elements = clonedDoc.getElementsByTagName('*');
                    for (const el of elements) {
                        // Kill any oklch variables or properties
                        el.style.setProperty('--color-emerald-500', '#10b981');
                        el.style.setProperty('--color-slate-900', '#0f172a');

                        // If it's the main container, ensure background is set
                        if (el.classList.contains('bg-white')) el.style.backgroundColor = '#ffffff';
                        if (el.classList.contains('text-slate-900')) el.style.color = '#0f172a';
                        if (el.classList.contains('bg-[#E11D48]')) el.style.backgroundColor = '#E11D48';
                    }
                }
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
                height: 1123,
                scrollX: 0,
                scrollY: -window.scrollY,
                onclone: (clonedDoc) => {
                    const styles = clonedDoc.getElementsByTagName('style');
                    for (let i = 0; i < styles.length; i++) {
                        styles[i].innerHTML = styles[i].innerHTML.replace(/oklch\([^)]+\)/g, '#ffffff');
                    }
                    const elements = clonedDoc.getElementsByTagName('*');
                    for (const el of elements) {
                        el.style.setProperty('--color-emerald-500', '#10b981');
                        el.style.setProperty('--color-slate-900', '#0f172a');
                        if (el.classList.contains('bg-white')) el.style.backgroundColor = '#ffffff';
                    }
                }
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

                {/* Premium Digital ID Card Preview */}
                <div className="relative group perspective-1000 flex-shrink-0">
                    <div ref={idCardRef} className="relative w-[340px] h-[215px] bg-white rounded-[1.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden font-dm-sans" style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9' }}>
                        {/* Red Slanted Header */}
                        <div className="absolute top-0 left-0 w-full h-[65px] flex" style={{ background: '#ffffff' }}>
                            {/* Logo Area (White) */}
                            <div className="w-[85px] h-full flex items-center justify-center p-2 z-20">
                                {branding.system_logo ? (
                                    <img src={branding.system_logo} alt="NNAK" className="w-full h-full object-contain" crossOrigin="anonymous" />
                                ) : (
                                    <div className="w-10 h-10 bg-[#ed1c24] rounded-full" style={{ backgroundColor: '#ed1c24' }}></div>
                                )}
                            </div>

                            {/* Slanted Red Banner */}
                            <div className="flex-1 h-full bg-[#ed1c24] relative z-10" style={{ backgroundColor: '#ed1c24', clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)', marginLeft: '-25px' }}>
                                <div className="absolute inset-0 flex flex-col justify-center pl-10 pr-4 text-white">
                                    <h1 className="text-[11px] font-black leading-tight tracking-tight uppercase" style={{ color: '#ffffff' }}>
                                        {branding.association_name || 'NATIONAL NURSES ASSOCIATION OF KENYA'}
                                    </h1>
                                    <p className="text-[7px] font-bold italic opacity-90 leading-tight" style={{ color: '#ffffff' }}>
                                        "{branding.association_tagline || 'Voice of the Nursing Profession'}"
                                    </p>
                                    <p className="text-[6px] font-bold mt-1 tracking-widest opacity-80 uppercase" style={{ color: '#ffffff' }}>
                                        MEMBER OF THE INTERNATIONAL COUNCIL OF NURSES
                                    </p>
                                    <div className="absolute bottom-1 right-2 text-[8px] font-black tracking-widest opacity-90" style={{ color: '#ffffff' }}>
                                        MEMBERSHIP CARD
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="mt-[70px] px-4 flex justify-between">
                            {/* Left Side: Details */}
                            <div className="flex-1 space-y-1.5 pt-1">
                                <div className="flex flex-col">
                                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest" style={{ color: '#94a3b8' }}>Name:</span>
                                    <span className="text-sm font-black text-slate-900 uppercase leading-none" style={{ color: '#0f172a' }}>{member.first_name} {member.last_name}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest" style={{ color: '#94a3b8' }}>ID No.:</span>
                                    <span className="text-[11px] font-bold text-slate-800" style={{ color: '#1e293b' }}>{member.id_number || 'N/A'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest" style={{ color: '#94a3b8' }}>Membership No.:</span>
                                    <span className="text-[11px] font-bold text-slate-800" style={{ color: '#1e293b' }}>{member.member_id || 'PENDING'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest" style={{ color: '#94a3b8' }}>Valid Till:</span>
                                    <span className="text-[11px] font-bold text-slate-800" style={{ color: '#1e293b' }}>December, 2027</span>
                                </div>
                            </div>

                            {/* Right Side: Photo with Red Frame */}
                            <div className="w-[100px] h-[125px] flex items-center justify-center p-1 bg-[#ed1c24] rounded-lg shadow-md -mt-4 z-20" style={{ backgroundColor: '#ed1c24' }}>
                                <div className="w-full h-full bg-white rounded flex flex-col overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
                                    {member.profile_picture ? (
                                        <img src={member.profile_picture} alt="Profile" className="w-full h-full object-cover" crossOrigin="anonymous" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300" style={{ backgroundColor: '#f8fafc', color: '#cbd5e1' }}>
                                            <LucideUser size={48} strokeWidth={1} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer: QR and Signature */}
                        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                            <div className="flex items-center gap-3">
                                {/* QR Placeholder */}
                                <div className="w-10 h-10 bg-white border border-slate-100 p-1 rounded" style={{ backgroundColor: '#ffffff', borderColor: '#f1f5f9' }}>
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                        <div className="grid grid-cols-2 gap-0.5">
                                            <div className="w-1.5 h-1.5 bg-slate-800"></div>
                                            <div className="w-1.5 h-1.5 bg-slate-800"></div>
                                            <div className="w-1.5 h-1.5 bg-slate-800"></div>
                                            <div className="w-1.5 h-1.5 bg-slate-400"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <div className="h-4 flex items-center overflow-hidden">
                                        {branding.authorised_signature && (
                                            <img src={branding.authorised_signature} alt="Signature" className="h-6 object-contain filter grayscale opacity-80" crossOrigin="anonymous" />
                                        )}
                                    </div>
                                    <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest mt-0.5" style={{ color: '#94a3b8' }}>Authorised Signature</span>
                                </div>
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
                {/* Premium Certificate Template - A4 Portrait */}
                <div ref={certificateRef} className="w-[794px] h-[1123px] bg-white relative p-12 flex flex-col font-dm-sans" style={{ backgroundColor: '#ffffff' }}>
                    {/* Outer Border - Thick Green */}
                    <div className="absolute inset-0 border-[10px] border-[#016938]" style={{ borderColor: '#016938' }}></div>
                    {/* Inner Border - Thin Green */}
                    <div className="absolute inset-4 border-[2px] border-[#016938]" style={{ borderColor: '#016938' }}></div>

                    <div className="relative z-10 flex flex-col items-center flex-1 py-10">
                        {/* Logo Area */}
                        <div className="mt-8 mb-6 h-28 flex items-center justify-center">
                            {branding.system_logo ? (
                                <img src={branding.system_logo} alt="Logo" className="h-full object-contain" crossOrigin="anonymous" />
                            ) : (
                                <div className="w-24 h-24 border-2 border-[#016938] rounded-full flex items-center justify-center text-[#016938] font-bold text-center p-2 text-[10px]" style={{ borderColor: '#016938', color: '#016938' }}>NNAK Logo</div>
                            )}
                        </div>

                        {/* Association Name */}
                        <h1 className="text-[32px] font-black text-[#016938] uppercase tracking-tight text-center max-w-[600px] leading-tight mb-1" style={{ color: '#016938' }}>
                            {branding.association_name || 'NATIONAL NURSES ASSOCIATION OF KENYA'}
                        </h1>

                        {/* Tagline */}
                        <p className="text-lg font-bold text-[#E11D48] italic tracking-tight mb-12" style={{ color: '#E11D48' }}>
                            "{branding.association_tagline || 'Voice of the Nursing Profession'}"
                        </p>

                        {/* Title Section */}
                        <div className="text-center mb-10">
                            <h2 className="text-[64px] font-black text-[#1e3a8a] italic leading-none" style={{ color: '#1e3a8a' }}>Certificate of</h2>
                            <h2 className="text-[64px] font-black text-[#1e3a8a] leading-none" style={{ color: '#1e3a8a' }}>Membership</h2>
                        </div>

                        {/* Statement */}
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.4em] mb-10" style={{ color: '#9ca3af' }}>
                            THIS IS TO CERTIFY THAT
                        </p>

                        {/* Recipient Name Area */}
                        <div className="flex flex-col items-center mb-10">
                            <h3 className="text-5xl font-black text-[#016938] uppercase tracking-tight border-b-[4px] border-[#016938] px-8 pb-1 mb-4" style={{ color: '#016938', borderColor: '#016938' }}>
                                {member.first_name} {member.last_name}
                            </h3>

                            {/* Member & License Details under the name */}
                            <div className="flex items-center gap-6 text-[#1e3a8a] font-bold text-sm tracking-wide" style={{ color: '#1e3a8a' }}>
                                <span>MEMBER NO: <span className="font-mono">{member.member_id || 'PENDING'}</span></span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span>LICENSE NO: <span className="font-mono">{member.registration_number || 'PENDING'}</span></span>
                            </div>
                        </div>

                        {/* Body Text */}
                        <div className="max-w-[580px] text-center mb-20 px-4">
                            <p className="text-base text-slate-500 leading-relaxed font-medium" style={{ color: '#64748b' }}>
                                Has been duly registered as a member of the National Nurses Association of Kenya, having complied with the association's requirements and committed to the excellence of the nursing profession.
                            </p>
                        </div>

                        {/* Bottom Section */}
                        <div className="w-full mt-auto px-16 flex justify-between items-end pb-4">
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
                                    <img src={branding.authorised_signature} alt="Sign" className="h-16 object-contain filter grayscale mb-1" crossOrigin="anonymous" />
                                ) || <div className="h-16"></div>}
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
