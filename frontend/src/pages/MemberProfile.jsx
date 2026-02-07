import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Download, Award, User as LucideUser, Bell, Shield, Clock,
    MapPin, Mail, Phone, Briefcase, Calendar, CheckCircle, AlertTriangle, Printer,
    Activity, FileText
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import AdminAPI from '../services/api';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import clsx from 'clsx';
import IDCardPrintable from '../components/IDCardPrintable';
import CertificatePrintable from '../components/CertificatePrintable';

const MemberProfile = () => {
    const { id: paramId } = useParams();
    const id = paramId || 'me';
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [branding, setBranding] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({});

    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
    const isSelf = id === 'me' || id === currentUser?.id?.toString();

    const idCardRef = useRef(null);
    const certificateRef = useRef(null);
    const printableIdCardRef = useRef(null);
    const printableCertificateRef = useRef(null);

    useEffect(() => {
        fetchProfile();
        fetchBranding();
    }, [id]);

    const fetchBranding = async () => {
        try {
            // Use getPublicSettings instead of getSettings to allow members to fetch branding assets
            const response = await AdminAPI.getPublicSettings();
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
                setFormData(profileResult.member);
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

    const handleEditToggle = () => {
        if (isEditing) {
            setFormData(member); // Reset if cancelling
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await AdminAPI.updateMember(member.id, formData);
            if (res.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Profile Updated',
                    text: 'Your changes have been saved successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
                setMember(prev => ({ ...prev, ...formData }));
                setIsEditing(false);
            } else {
                throw new Error(res.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const waitForImages = async (container) => {
        const images = container.getElementsByTagName('img');
        const promises = Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve; // Continue even if one image fails
            });
        });
        await Promise.all(promises);
        // Small extra buffer for fonts and layout
        await new Promise(resolve => setTimeout(resolve, 500));
    };

    const downloadIdCard = async () => {
        if (!printableIdCardRef.current) {
            console.error("Printable ID Card Ref not found");
            Swal.fire('Error', 'ID Card component not ready. Please try again.', 'error');
            return;
        }

        Swal.fire({
            title: 'Generating ID Card...',
            text: 'Preparing high-resolution render',
            didOpen: () => Swal.showLoading()
        });

        try {
            console.log("Starting ID Card generation...");

            // 1. Wait for all images in the hidden component to load
            await waitForImages(printableIdCardRef.current);
            console.log("Images loaded for ID Card");

            const canvas = await html2canvas(printableIdCardRef.current, {
                scale: 4,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                logging: true,
                imageTimeout: 15000,
                onclone: (clonedDoc) => {
                    // Critical Fix for 'oklch' error: strip all classes to avoid ANY tailwind variables
                    const allElements = clonedDoc.body.getElementsByTagName('*');
                    for (let i = 0; i < allElements.length; i++) {
                        allElements[i].removeAttribute('class');
                    }
                }
            });

            console.log("Canvas generated successfully");

            if (!canvas) throw new Error("Canvas generation failed");

            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [85.6, 54]
            });

            const imgData = canvas.toDataURL('image/png', 1.0);
            doc.addImage(imgData, 'PNG', 0, 0, 85.6, 54, undefined, 'FAST');
            doc.save(`NNAK_ID_${member.first_name}_${member.last_name}.pdf`);

            console.log("PDF saved successfully");
            Swal.fire({ icon: 'success', title: 'ID Card Ready', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
        } catch (error) {
            console.error("PDF Export Error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Export Failed',
                text: `Error: ${error.message || 'Unknown error occurred during generation'}`,
                footer: 'Check console for detailed logs'
            });
        }
    };

    const downloadCertificate = async () => {
        if (!printableCertificateRef.current) {
            console.error("Printable Certificate Ref not found");
            Swal.fire('Error', 'Certificate component not ready.', 'error');
            return;
        }

        Swal.fire({
            title: 'Generating Certificate...',
            text: 'Rendering professional document',
            didOpen: () => Swal.showLoading()
        });

        try {
            console.log("Starting Certificate generation...");

            // 1. Wait for all images in the hidden component to load
            await waitForImages(printableCertificateRef.current);
            console.log("Images loaded for Certificate");

            const canvas = await html2canvas(printableCertificateRef.current, {
                scale: 3,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                logging: true,
                imageTimeout: 15000,
                onclone: (clonedDoc) => {
                    // Critical Fix for 'oklch' error: strip all classes to avoid ANY tailwind variables
                    const allElements = clonedDoc.body.getElementsByTagName('*');
                    for (let i = 0; i < allElements.length; i++) {
                        allElements[i].removeAttribute('class');
                    }
                }
            });

            console.log("Certificate Canvas generated");

            if (!canvas) throw new Error("Certificate canvas generation failed");

            const doc = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            doc.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
            doc.save(`NNAK_Certificate_${member.first_name}_${member.last_name}.pdf`);

            console.log("Certificate saved");
            Swal.fire({ icon: 'success', title: 'Certificate Ready', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
        } catch (error) {
            console.error("Certificate Export Error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Export Failed',
                text: `Error: ${error.message || 'Failed to generate professional certificate'}`,
                footer: 'Check console for details'
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
                {isAdmin && (
                    <button onClick={() => navigate('/members')} className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-emerald-600 transition flex-shrink-0 w-fit group mb-1 uppercase tracking-widest">
                        <div className="w-7 h-7 rounded-lg bg-white border border-gray-100 flex items-center justify-center group-hover:border-emerald-500 transition-colors shadow-sm">
                            <ArrowLeft size={12} />
                        </div>
                        <span>Back to Directory</span>
                    </button>
                )}

                {/* Premium Digital ID Card Preview - Redesigned to Match Specific Mockup */}
                <div className="relative group perspective-1000 flex-shrink-0 w-full flex justify-center overflow-hidden" style={{ height: '230px' }}>
                    <div className="transform scale-[0.70] origin-top">
                        {/* ID CARD CONTAINER - PURE INLINE STYLES ONLY for html2canvas compatibility */}
                        <div ref={idCardRef} style={{
                            position: 'relative',
                            width: '480px',
                            height: '300px',
                            backgroundColor: '#ffffff',
                            borderRadius: '16px',
                            fontFamily: 'Arial, sans-serif',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // Replicating shadow-2xl
                            background: 'linear-gradient(to bottom, #f3f4f6, #e5e7eb, #d1d5db)',
                            border: '1px solid #e5e7eb'
                        }}>

                            {/* 1. Top Red Header Bar */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '100%',
                                height: '85px',
                                zIndex: 10,
                                paddingLeft: '100px',
                                paddingRight: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'flex-end',
                                background: 'linear-gradient(to bottom, #dc2626, #991b1b)',
                                borderBottom: '2px solid #b91c1c'
                            }}>
                                <h1 style={{
                                    fontSize: '17px',
                                    fontWeight: 'bold',
                                    color: '#ffffff',
                                    textTransform: 'uppercase',
                                    letterSpacing: '-0.025em',
                                    textAlign: 'right',
                                    lineHeight: 1.25,
                                    margin: 0,
                                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                }}>
                                    National Nurses Association of Kenya
                                </h1>
                                <p style={{
                                    fontSize: '11px',
                                    color: '#fee2e2',
                                    fontStyle: 'italic',
                                    textAlign: 'right',
                                    marginTop: '2px',
                                    marginBottom: 0
                                }}>
                                    Voice of the Nursing Profession
                                </p>
                                <div style={{
                                    width: '80%',
                                    height: '1px',
                                    backgroundColor: '#fca5a5',
                                    opacity: 0.5,
                                    margin: '4px 0'
                                }}></div>
                                <p style={{
                                    fontSize: '9px',
                                    color: '#ffffff',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    textAlign: 'right',
                                    margin: 0
                                }}>
                                    MEMBER OF THE INTERNATIONAL COUNCIL OF NURSES
                                </p>
                                <p style={{
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    color: '#ffffff',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    textAlign: 'right',
                                    marginTop: '2px',
                                    margin: 0
                                }}>
                                    MEMBERSHIP CARD
                                </p>
                            </div>

                            {/* 2. Logo Container - Overhanging */}
                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                left: '20px',
                                zIndex: 20,
                                width: '90px',
                                height: '100px',
                                backgroundColor: '#ffffff',
                                borderBottomLeftRadius: '20px',
                                borderBottomRightRadius: '20px',
                                borderTopLeftRadius: '5px',
                                borderTopRightRadius: '5px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px',
                                borderLeft: '1px solid #e5e7eb',
                                borderRight: '1px solid #e5e7eb',
                                borderBottom: '1px solid #e5e7eb',
                                background: 'linear-gradient(to bottom, #ffffff, #f3f4f6)'
                            }}>
                                {branding.system_logo ? (
                                    <img src={branding.system_logo} alt="Logo" style={{ width: '75px', height: '75px', objectFit: 'contain', marginBottom: '4px' }} crossOrigin="anonymous" />
                                ) : (
                                    <div style={{
                                        width: '70px',
                                        height: '70px',
                                        backgroundColor: '#d1fae5',
                                        borderRadius: '9999px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        color: '#065f46',
                                        border: '2px solid #10b981'
                                    }}>NNAK</div>
                                )}
                                {/* Shield shape bottom effect */}
                                <div style={{ width: '40px', height: '3px', backgroundColor: '#dc2626', borderRadius: '9999px', marginTop: '4px', opacity: 0.5 }}></div>
                            </div>

                            {/* 3. Left Red Curved Accent */}
                            <div style={{
                                position: 'absolute',
                                top: '100px',
                                left: 0,
                                width: '20px',
                                height: '140px',
                                background: 'linear-gradient(to right, #7f1d1d, #ef4444)',
                                borderTopRightRadius: '16px',
                                borderBottomRightRadius: '16px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                zIndex: 10
                            }}></div>

                            {/* 4. Main Content Container */}
                            <div style={{
                                position: 'absolute',
                                top: '90px',
                                left: 0,
                                width: '100%',
                                height: '210px',
                                display: 'flex',
                                padding: '20px',
                                paddingTop: '32px'
                            }}>

                                {/* Left Side: Details & Signature */}
                                <div style={{
                                    flex: 1,
                                    paddingLeft: '25px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    position: 'relative',
                                    zIndex: 10
                                }}>
                                    <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000' }}>Name: <span style={{ textTransform: 'uppercase', fontSize: '15px' }}>{member.first_name} {member.last_name}</span></span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000' }}>ID No.: <span style={{ fontSize: '15px' }}>{member.id_number}</span></span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000' }}>Membership No.: <span style={{ fontSize: '15px' }}>{member.member_id?.replace('NNAK', '')}</span></span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000' }}>Valid Till: <span style={{ fontSize: '15px' }}>December, 2027</span></span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto', marginBottom: '4px' }}>
                                        <div style={{ padding: '4px', backgroundColor: '#ffffff', border: '1px solid #991b1b', borderRadius: '2px' }}>
                                            <QRCodeSVG
                                                value={`https://portal.nnak.or.ke/verify/${member.member_id}`}
                                                size={48}
                                                level="M"
                                                fgColor="#000000"
                                                bgColor="#ffffff"
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ height: '32px', display: 'flex', alignItems: 'flex-end' }}>
                                                {branding.authorised_signature ? (
                                                    <img src={branding.authorised_signature} alt="Sign" style={{ height: '100%', objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(18%) sepia(87%) saturate(2643%) hue-rotate(224deg) brightness(85%) contrast(106%)' }} crossOrigin="anonymous" />
                                                ) : (
                                                    <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#1e3a8a', fontFamily: 'serif' }}>Signature</div>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '10px', color: '#000000', fontWeight: '500' }}>Authorised Signature</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Photo with Red Frame */}
                                <div style={{
                                    width: '140px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingLeft: '8px'
                                }}>
                                    <div style={{
                                        width: '125px',
                                        height: '155px',
                                        background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)',
                                        padding: '6px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                                        borderRadius: '2px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative'
                                    }}>
                                        {/* Inner Silver/White Border */}
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            border: '3px solid #e5e7eb',
                                            backgroundColor: '#ffffff',
                                            overflow: 'hidden',
                                            position: 'relative'
                                        }}>
                                            {member.profile_picture ? (
                                                <img src={member.profile_picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', color: '#d1d5db' }}>
                                                    <LucideUser size={60} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {/* ID Action Buttons - Grouped with Sidebar */}
                <div className="flex gap-2 flex-shrink-0">
                    <button onClick={downloadIdCard} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-[#E11D48] transition-all flex items-center justify-center gap-2 active:scale-95">
                        <Download size={14} /> Digital ID
                    </button>
                    <button onClick={downloadCertificate} className="flex-1 py-3 bg-white border border-gray-200 text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-95">
                        <Printer size={14} /> Certificate
                    </button>
                </div>

                {/* Contact Quick Info */}
                <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex-1 min-h-0 flex flex-col">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Contact Details</h3>
                    <div className="space-y-0.5 flex-1 overflow-y-auto custom-scrollbar">
                        <InfoRow label="Email" value={member.email} icon={Mail} />
                        <InfoRow label="Phone" value={member.phone} icon={Phone} />
                        <InfoRow label="Location" value={member.address || member.county} icon={MapPin} />
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                        <a href={`mailto:${member.email}`} className="flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest hover:bg-blue-100 transition">
                            <Mail size={12} /> Email
                        </a>
                        <a href={`tel:${member.phone}`} className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition">
                            <Phone size={12} /> Call
                        </a>
                    </div>
                </div>

                {/* Admin Management Tools - Conditionally Rendered */}
                {isAdmin && !isSelf && (
                    <div className="bg-rose-50 rounded-[2rem] p-5 border border-rose-100">
                        <h3 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Shield size={12} /> Management Tools
                        </h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => setActiveTab('settings')}
                                className="w-full py-2.5 bg-white border border-rose-200 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                            >
                                Status & Permissions
                            </button>
                            <button className="w-full py-2.5 bg-white border border-rose-200 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                                Award Special Points
                            </button>
                        </div>
                    </div>
                )}
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
                    <div className="flex items-center justify-between border-b border-gray-100 px-8 bg-white/50 backdrop-blur-md sticky top-0 z-20">
                        <div className="flex gap-8">
                            {['overview', 'cpd', 'logs', 'settings'].map((tab) => (
                                (tab !== 'settings' || isAdmin) && (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={clsx(
                                            "relative py-5 text-xs font-black uppercase tracking-[0.2em] transition-all",
                                            activeTab === tab ? "text-[#E11D48]" : "text-gray-400 hover:text-gray-600"
                                        )}
                                    >
                                        {tab}
                                        {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#E11D48] rounded-t-full animate-in slide-in-from-bottom-1 duration-300"></div>}
                                    </button>
                                )
                            ))}
                        </div>

                        {activeTab === 'overview' && (isSelf || isAdmin) && (
                            <div className="flex gap-2">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleEditToggle}
                                            className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
                                        >
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleEditToggle}
                                        className="px-4 py-1.5 rounded-lg border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition shadow-sm"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Scrollable Tab Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Premium ID Cards - Side by Side */}
                                <div className="grid grid-cols-2 gap-5">
                                    {/* License Number Card */}
                                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 p-3.5 border border-slate-200/60 hover:shadow-md transition-all duration-300">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-slate-900/5 rounded-full -mr-10 -mt-10"></div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 rounded-md bg-slate-900/10 flex items-center justify-center text-slate-600">
                                                    <Shield size={12} strokeWidth={2.5} />
                                                </div>
                                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">License Number</p>
                                            </div>
                                            <p className="text-xl font-black text-slate-900 tracking-tight leading-none" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                {member.registration_number || 'PENDING'}
                                            </p>
                                            <div className="mt-2.5 pt-2 border-t border-slate-200/40">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Nursing Council Registration</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Member ID Card */}
                                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-3.5 border border-emerald-200/60 hover:shadow-md transition-all duration-300">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-600/5 rounded-full -mr-10 -mt-10"></div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 rounded-md bg-emerald-600/10 flex items-center justify-center text-emerald-600">
                                                    <Award size={12} strokeWidth={2.5} />
                                                </div>
                                                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Member ID</p>
                                            </div>
                                            <p className="text-xl font-black text-emerald-700 tracking-tight leading-none" style={{ fontFamily: 'Inter, sans-serif' }}>
                                                {member.member_id || 'PENDING'}
                                            </p>
                                            <div className="mt-2.5 pt-2 border-t border-emerald-200/40">
                                                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest leading-none">NNAK Membership</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Information Grid - 3 Columns for Better Space Usage */}
                                <div className="grid grid-cols-3 gap-5">
                                    {/* Personal Section */}
                                    <section className="space-y-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                                            <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Personal Info</h3>
                                        </div>
                                        <div className="space-y-3.5">
                                            <EditableInfoItem label="First Name" name="first_name" value={formData.first_name} isEditing={isEditing} onChange={handleInputChange} />
                                            <EditableInfoItem label="Last Name" name="last_name" value={formData.last_name} isEditing={isEditing} onChange={handleInputChange} />
                                            <EditableInfoItem label="National ID" name="id_number" value={formData.id_number} isEditing={isEditing} onChange={handleInputChange} />
                                            <EditableInfoItem label="Gender" name="gender" value={formData.gender} isEditing={isEditing} onChange={handleInputChange} type="select" options={['male', 'female', 'other']} />
                                            <EditableInfoItem label="Phone" name="phone" value={formData.phone} isEditing={isEditing} onChange={handleInputChange} />
                                            <EditableInfoItem label="Email" name="email" value={formData.email} isEditing={isEditing} onChange={handleInputChange} />
                                        </div>
                                    </section>

                                    {/* Professional Section */}
                                    <section className="space-y-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                                            <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Professional</h3>
                                        </div>
                                        <div className="space-y-3.5">
                                            <EditableInfoItem label="Nurse Cadre" name="cadre" value={formData.cadre} isEditing={isEditing} onChange={handleInputChange} />
                                            <EditableInfoItem label="Employment" name="employment_status" value={formData.employment_status} isEditing={isEditing} onChange={handleInputChange} />
                                            <EditableInfoItem label="Work Station" name="work_station" value={formData.work_station} isEditing={isEditing} onChange={handleInputChange} />
                                            <EditableInfoItem label="Branch" name="branch_name" value={formData.branch_name} isEditing={isEditing} onChange={handleInputChange} />
                                            <EditableInfoItem label="Designation" name="designation" value={formData.designation} isEditing={isEditing} onChange={handleInputChange} />
                                        </div>
                                    </section>

                                    {/* Regional Section */}
                                    <section className="space-y-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                                            <div className="w-1 h-5 bg-orange-500 rounded-full"></div>
                                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Regional</h3>
                                        </div>
                                        <div className="space-y-3.5">
                                            <EditableInfoItem label="County" name="county" value={formData.county} isEditing={isEditing} onChange={handleInputChange} />
                                            <EditableInfoItem label="Sub-County" name="sub_county" value={formData.sub_county} isEditing={isEditing} onChange={handleInputChange} />
                                            <EditableInfoItem label="Chapter" name="chapter" value={formData.chapter} isEditing={isEditing} onChange={handleInputChange} />
                                            <EditableInfoItem label="Address" name="address" value={formData.address} isEditing={isEditing} onChange={handleInputChange} />
                                        </div>
                                    </section>
                                </div>
                            </div>
                        )}

                        {activeTab === 'cpd' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">CPD History Ledger</h3>
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black uppercase tracking-widest">
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
                                                            <p className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">{item.description}</p>
                                                            {item.event_name && (
                                                                <div className="flex items-center gap-1 mt-1.5 p-1 px-1.5 bg-slate-50 border border-slate-100 rounded text-xs font-bold text-slate-500 uppercase tracking-widest w-fit">
                                                                    <Calendar size={10} /> {item.event_name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-emerald-600 font-black text-lg">+{item.points}</div>
                                                        <div className="text-xs font-bold text-gray-400 mt-0.5">{new Date(item.awarded_date).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <LucideUser size={10} className="text-gray-400" />
                                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">By: {item.awarded_by_name ? `${item.awarded_by_name} ${item.awarded_by_last_name}` : 'System'}</span>
                                                    </div>
                                                    {item.status === 'approved' && (
                                                        <div className="flex items-center gap-1 text-xs font-black text-emerald-600 uppercase tracking-widest">
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
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No CPD records found</p>
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
                                                        <span className="text-xs font-black text-slate-900 uppercase tracking-widest bg-white shadow-sm border border-gray-100 px-2 py-0.5 rounded-md">
                                                            {log.action_type || 'System'}
                                                        </span>
                                                        <span className="text-xs font-medium text-gray-400">
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
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No activity logs found</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {/* Hidden Printable Components for Export - Positioned to ensure rendering but invisible */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '1px',
                height: '1px',
                overflow: 'hidden',
                opacity: 0,
                pointerEvents: 'none',
                zIndex: -100
            }}>
                <div style={{ backgroundColor: '#ffffff', width: '2000px' }}>
                    <IDCardPrintable ref={printableIdCardRef} member={member} branding={branding} />
                    <CertificatePrintable ref={printableCertificateRef} member={member} branding={branding} />
                </div>
            </div>
        </div>
    );
};

const QuickStat = ({ label, value, icon: Icon, color }) => {
    // Generate harmonious gradients based on the theme color
    const getGradientClasses = (col) => {
        if (col === '#10b981') return 'from-emerald-50 to-emerald-100/50 border-emerald-200/50';
        if (col === '#3b82f6') return 'from-blue-50 to-blue-100/50 border-blue-200/50';
        if (col === '#f59e0b') return 'from-amber-50 to-amber-100/50 border-amber-200/50';
        return 'from-slate-50 to-slate-100/50 border-slate-200/50';
    };

    const getIconColorClasses = (col) => {
        if (col === '#10b981') return 'text-emerald-600 bg-emerald-600/10';
        if (col === '#3b82f6') return 'text-blue-600 bg-blue-600/10';
        if (col === '#f59e0b') return 'text-amber-600 bg-amber-600/10';
        return 'text-slate-600 bg-slate-600/10';
    };

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getGradientClasses(color)} p-3.5 border transition-all duration-300 hover:shadow-md group`}>
            {/* Decorative Background Element */}
            <div className={`absolute top-0 right-0 w-16 h-16 rounded-full -mr-8 -mt-8 opacity-20`} style={{ backgroundColor: color }}></div>

            <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${getIconColorClasses(color)}`}>
                            <Icon size={14} strokeWidth={2.5} />
                        </div>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{label}</p>
                    </div>
                </div>
                <div>
                    <p className="text-lg font-black text-slate-900 tracking-tight leading-none" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
};

const InfoItem = ({ label, value }) => (
    <div className="group">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</p>
        <p className="text-sm font-semibold text-slate-900 leading-snug" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em' }}>
            {value || <span className="text-gray-400 italic font-normal text-xs">Not provided</span>}
        </p>
    </div>
);

const EditableInfoItem = ({ label, name, value, isEditing, onChange, type = 'text', options = [] }) => {
    if (!isEditing) return <InfoItem label={label} value={value} />;

    return (
        <div className="group">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">{label}</label>
            {type === 'select' ? (
                <select
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all uppercase"
                >
                    <option value="">Select {label}</option>
                    {options.map(opt => (
                        <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    placeholder={`Enter ${label}`}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
            )}
        </div>
    );
};

const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition group">
        <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
            <Icon size={12} />
        </div>
        <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-xs font-bold text-slate-700 leading-tight">{value || '-'}</p>
        </div>
    </div>
);

export default MemberProfile;
