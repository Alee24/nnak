import React, { useEffect, useState, useRef } from 'react';
import {
    Award, Calendar, CreditCard, ChevronRight,
    Download, Activity, Clock, Shield,
    ArrowUpRight, Star, FileText, User,
    Zap, ExternalLink, Printer
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import IDCardPrintable from '../components/IDCardPrintable';
import CertificatePrintable from '../components/CertificatePrintable';
import AdminAPI from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler);

import { useNavigate } from 'react-router-dom';

const MemberDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [branding, setBranding] = useState({});

    const printableIdCardRef = useRef(null);
    const printableCertificateRef = useRef(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Get user from local storage
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                }

                const [res, brandingRes] = await Promise.all([
                    AdminAPI.getMemberDashboardSummary(),
                    AdminAPI.getPublicSettings()
                ]);

                if (res.success) {
                    setData(res);
                }

                if (brandingRes.success) {
                    setBranding(brandingRes.settings);
                }

                if (!res.success) {
                    // Fallback to sample data for demo if API fails
                    setData({
                        summary: {
                            status: 'active',
                            member_id: 'NNAK-2024-0512',
                            cpd_points: 42,
                            expiry_date: '2024-12-31',
                            membership_type: 'Full Member',
                            first_name: 'Thomas',
                            last_name: 'Davis',
                            registration_number: 'N-12345',
                            id_number: '12345678',
                            profile_picture: null
                        },
                        recent_cpd: [
                            { points: 5, activity_type: 'Seminar', awarded_date: '2024-02-05', description: 'Ethics in Nursing' },
                            { points: 10, activity_type: 'Workshop', awarded_date: '2024-01-20', description: 'Advanced Life Support' }
                        ],
                        upcoming_events: [
                            { id: 101, title: 'Annual Nursing Conference', event_date: '2024-03-15', location: 'Nairobi', registration_status: 'registered' },
                            { id: 105, title: 'Regional Chapter Meeting', event_date: '2024-04-10', location: 'Mombasa', registration_status: 'pending' }
                        ],
                        recent_payments: [
                            { amount: 5000, payment_date: '2024-01-01', payment_status: 'completed', description: 'Annual Membership Renewal' }
                        ]
                    });
                }
            } catch (err) {
                console.error("Member Dashboard Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const waitForImages = async (container) => {
        if (!container) return;
        const images = container.getElementsByTagName('img');
        const promises = Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        });
        await Promise.all(promises);
        await new Promise(resolve => setTimeout(resolve, 500));
    };

    const downloadIdCard = async () => {
        if (!printableIdCardRef.current || !data?.summary) return;

        Swal.fire({
            title: 'Generating ID Card...',
            text: 'Preparing high-resolution render',
            didOpen: () => Swal.showLoading()
        });

        try {
            await waitForImages(printableIdCardRef.current);
            const canvas = await html2canvas(printableIdCardRef.current, {
                scale: 4,
                useCORS: true,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    const allElements = clonedDoc.body.getElementsByTagName('*');
                    for (let i = 0; i < allElements.length; i++) {
                        allElements[i].removeAttribute('class');
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
            doc.save(`NNAK_ID_${data.summary.first_name || 'Member'}.pdf`);
            Swal.fire({ icon: 'success', title: 'ID Card Downloaded', timer: 2000, showConfirmButton: false });
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to generate ID card', 'error');
        }
    };

    const downloadCertificate = async () => {
        if (!printableCertificateRef.current || !data?.summary) return;

        Swal.fire({
            title: 'Generating Certificate...',
            text: 'Rendering professional document',
            didOpen: () => Swal.showLoading()
        });

        try {
            await waitForImages(printableCertificateRef.current);
            const canvas = await html2canvas(printableCertificateRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    const allElements = clonedDoc.body.getElementsByTagName('*');
                    for (let i = 0; i < allElements.length; i++) {
                        allElements[i].removeAttribute('class');
                    }
                }
            });

            const doc = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            doc.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
            doc.save(`NNAK_Certificate_${data.summary.first_name || 'Member'}.pdf`);
            Swal.fire({ icon: 'success', title: 'Certificate Downloaded', timer: 2000, showConfirmButton: false });
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to generate certificate', 'error');
        }
    };

    const downloadReport = async () => {
        if (!data?.summary) return;

        Swal.fire({
            title: 'Generating Statement...',
            text: 'Preparing your membership report',
            didOpen: () => Swal.showLoading()
        });

        try {
            const doc = new jsPDF();
            const margin = 20;
            let cursorY = margin;

            // Header
            doc.setFontSize(22);
            doc.setTextColor(225, 29, 72); // Rose-600
            doc.text('NNAK MEMBER STATEMENT', margin, cursorY);
            cursorY += 10;

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, cursorY);
            cursorY += 20;

            // Member Info
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Member Information', margin, cursorY);
            cursorY += 8;
            doc.line(margin, cursorY, 210 - margin, cursorY);
            cursorY += 10;

            doc.setFontSize(11);
            doc.text(`Name: ${data.summary.first_name} ${data.summary.last_name}`, margin, cursorY);
            cursorY += 7;
            doc.text(`Member ID: ${data.summary.member_id}`, margin, cursorY);
            cursorY += 7;
            doc.text(`Reg Number: ${data.summary.registration_number || 'N/A'}`, margin, cursorY);
            cursorY += 7;
            doc.text(`Membership: ${data.summary.membership_type}`, margin, cursorY);
            cursorY += 7;
            doc.text(`Status: ${data.summary.status.toUpperCase()}`, margin, cursorY);
            cursorY += 15;

            // CPD Summary
            doc.setFontSize(14);
            doc.text('CPD Progress', margin, cursorY);
            cursorY += 8;
            doc.line(margin, cursorY, 210 - margin, cursorY);
            cursorY += 10;
            doc.setFontSize(11);
            doc.text(`Total CPD Points: ${data.summary.total_cpd_points || 0}`, margin, cursorY);
            cursorY += 15;

            // Recent Payments
            doc.setFontSize(14);
            doc.text('Recent Payments', margin, cursorY);
            cursorY += 8;
            doc.line(margin, cursorY, 210 - margin, cursorY);
            cursorY += 10;

            doc.setFontSize(10);
            if (data.recent_payments && data.recent_payments.length > 0) {
                data.recent_payments.forEach(p => {
                    doc.text(`${new Date(p.payment_date).toLocaleDateString()} - ${p.description}`, margin, cursorY);
                    doc.text(`KES ${parseFloat(p.amount).toLocaleString()}`, 160, cursorY, { align: 'right' });
                    cursorY += 7;
                });
            } else {
                doc.text('No recent payments found.', margin, cursorY);
                cursorY += 7;
            }

            doc.save(`NNAK_Statement_${data.summary.first_name}.pdf`);
            Swal.fire({ icon: 'success', title: 'Statement Ready', timer: 2000, showConfirmButton: false });
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to generate report', 'error');
        }
    };

    const handleRenew = async () => {
        const { value: phone } = await Swal.fire({
            title: 'Membership Renewal',
            text: 'Enter your M-Pesa phone number to receive an STK Push (KES 5,000)',
            input: 'text',
            inputLabel: 'Phone Number',
            inputValue: user?.phone || '',
            showCancelButton: true,
            confirmButtonText: 'Pay via M-Pesa',
            confirmButtonColor: '#10b981',
            inputValidator: (value) => {
                if (!value) return 'Phone number is required';
                if (!/^[0-9+]{10,15}$/.test(value)) return 'Invalid phone number format';
            }
        });

        if (phone) {
            Swal.fire({
                title: 'Initiating M-Pesa...',
                text: 'Please check your phone for the STK Push prompt',
                didOpen: () => Swal.showLoading(),
                allowOutsideClick: false
            });

            try {
                const res = await AdminAPI.createPayment({
                    amount: 5000,
                    payment_method: 'mpesa',
                    payment_type: 'membership',
                    phone_number: phone,
                    description: 'Annual Membership Renewal',
                    membership_type_id: data.summary.membership_type_id || 1,
                    currency: 'KES'
                });

                if (res.success) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Request Sent',
                        text: 'A prompt has been sent to your phone. Enter your PIN to complete payment.',
                        confirmButtonText: 'OK'
                    });
                } else {
                    throw new Error(res.error || 'Failed to initiate M-Pesa');
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Payment Failed', error.message, 'error');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="flex flex-col items-center gap-4 relative">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse-slow"></div>
                    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin z-10"></div>
                    <p className="text-xs font-medium text-gray-400 animate-pulse z-10">Loading Portal...</p>
                </div>
            </div>
        );
    }

    const cpdPoints = data?.summary?.total_cpd_points || data?.summary?.cpd_points || 0;
    const cpdData = {
        labels: ['Earned', 'Target'],
        datasets: [
            {
                data: [cpdPoints, Math.max(0, 60 - cpdPoints)],
                backgroundColor: ['#10b981', '#f1f5f9'],
                borderWidth: 0,
                hoverOffset: 0
            },
        ],
    };

    const chartOptions = {
        cutout: '80%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        maintainAspectRatio: false
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-8 max-w-[1600px] mx-auto overflow-x-hidden">
            {/* Header Section */}
            <div className="flex justify-between items-end px-1">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome, {user?.first_name || data?.summary?.first_name || 'Member'}</h2>
                    <p className="text-xs text-emerald-600 font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                        <span className="w-4 h-px bg-emerald-600/30"></span>
                        Member Portal Overview
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={downloadReport} className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition shadow-sm flex items-center gap-1.5 active:scale-95">
                        <FileText size={12} strokeWidth={2.5} /> Report
                    </button>
                    <button onClick={handleRenew} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition shadow-md flex items-center gap-1.5 active:scale-95">
                        <Zap size={12} strokeWidth={2.5} /> Renewal
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard
                    title="CPD Points"
                    value={cpdPoints}
                    icon={Award}
                    color="emerald"
                    subtitle="60 Annual Target"
                    progress={(cpdPoints / 60) * 100}
                />
                <KpiCard
                    title="Membership"
                    value={data?.summary?.status || 'Active'}
                    icon={Shield}
                    color="blue"
                    subtitle={data?.summary?.membership_type}
                    isStatus={true}
                />
                <KpiCard
                    title="Expires On"
                    value={data?.summary?.expiry_date ? new Date(data?.summary?.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                    icon={Calendar}
                    color="amber"
                    subtitle="Annual Renewal"
                />
                <KpiCard
                    title="System ID"
                    value={data?.summary?.member_id || 'PENDING'}
                    icon={User}
                    color="slate"
                    subtitle="Verified Member"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: CPD Progress & Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                    {/* CPD Progress Card */}
                    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50">
                                    <Activity size={18} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-[0.1em]">CPD Progress Analysis</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Professional Development Status</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/dashboard/cpd-points')}
                                className="p-2 border border-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                            >
                                <ExternalLink size={14} />
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-8 py-4">
                            <div className="relative w-40 h-40">
                                <Doughnut data={cpdData} options={chartOptions} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
                                    <span className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{cpdPoints}</span>
                                    <span className="text-[8px] text-slate-400 uppercase tracking-[0.3em] font-black mt-2">POINTS</span>
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 group hover:border-emerald-200 transition-colors">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Certification Status</p>
                                    <p className="text-sm font-bold text-slate-900">Compliant</p>
                                    <div className="mt-2 w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (cpdPoints / 60) * 100)}%` }}></div>
                                    </div>
                                </div>
                                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 group hover:border-blue-200 transition-colors">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Remaining Points</p>
                                    <p className="text-sm font-bold text-slate-900">{Math.max(0, 60 - cpdPoints)}</p>
                                    <div className="mt-2 w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.max(0, 100 - (cpdPoints / 60) * 100)}%` }}></div>
                                    </div>
                                </div>
                                <div className="col-span-2 bg-emerald-900 p-4 rounded-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8"></div>
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Annual Requirement</p>
                                            <p className="text-white text-xs font-bold">Nursing License Compliance 2026</p>
                                        </div>
                                        <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-white text-[10px] font-black uppercase tracking-widest border border-white/10">
                                            Yearly Goal
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-[0.1em]">Registered Events</h3>
                            <button
                                onClick={() => navigate('/dashboard/events')}
                                className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] hover:underline"
                            >
                                Browse All
                            </button>
                        </div>
                        <div className="space-y-3">
                            {data?.upcoming_events?.length > 0 ? (
                                data.upcoming_events.map(event => (
                                    <div key={event.id} className="flex items-center p-3 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-white transition-all group">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex flex-col items-center justify-center border border-slate-100 mr-4 group-hover:scale-110 transition-transform">
                                            <span className="text-[8px] font-black text-emerald-600 uppercase leading-none">{new Date(event.event_date).toLocaleDateString('en-GB', { month: 'short' })}</span>
                                            <span className="text-sm font-black text-slate-900 leading-none mt-0.5">{new Date(event.event_date).getDate()}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-slate-900 truncate">{event.title}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                                                <Activity size={10} /> {event.location}
                                            </p>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${event.registration_status === 'registered' || event.registration_status === 'approved'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {event.registration_status}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No registered events</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Profile Status & Quick Links */}
                <div className="space-y-6">
                    {/* Quick Access ID/Certificate */}
                    <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from- emerald-500/20 to-transparent"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <CreditCard size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Digital Wallet</p>
                                    <p className="text-sm font-bold tracking-tight">Access Credentials</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button onClick={downloadIdCard} className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group/btn">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                            <User size={14} className="text-emerald-400" />
                                        </div>
                                        <span className="text-xs font-bold">Digital ID Card</span>
                                    </div>
                                    <Download size={14} className="text-emerald-400 group-hover/btn:translate-y-0.5 transition-transform" />
                                </button>
                                <button onClick={downloadCertificate} className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group/btn">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                            <Star size={14} className="text-blue-400" />
                                        </div>
                                        <span className="text-xs font-bold">Practitioner Certificate</span>
                                    </div>
                                    <Download size={14} className="text-blue-400 group-hover/btn:translate-y-0.5 transition-transform" />
                                </button>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/10">
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mb-3">Recent Points</p>
                                <div className="space-y-2">
                                    {data?.recent_cpd && data.recent_cpd.length > 0 ? data.recent_cpd.slice(0, 2).map((item, i) => (
                                        <div key={i} className="flex items-center justify-between text-[11px]">
                                            <span className="text-white/70 font-medium truncate max-w-[120px]">{item.description}</span>
                                            <span className="text-emerald-400 font-black">+{item.points} PTS</span>
                                        </div>
                                    )) : (
                                        <p className="text-[10px] text-white/30 italic">No recent points</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment History Card */}
                    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-[0.1em]">Payment History</h3>
                            <Clock size={14} className="text-slate-400" />
                        </div>
                        <div className="space-y-4">
                            {data?.recent_payments && data.recent_payments.length > 0 ? (
                                data.recent_payments.map((payment, i) => (
                                    <div key={i} className="flex items-start gap-3 border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                            <CreditCard size={14} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className="text-[11px] font-bold text-slate-900 truncate tracking-tight">{payment.description}</p>
                                                <p className="text-[11px] font-black text-slate-900">KES {parseFloat(payment.amount).toLocaleString()}</p>
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{new Date(payment.payment_date).toLocaleDateString('en-GB')}</p>
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${payment.payment_status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    {payment.payment_status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-4 text-xs text-slate-400 font-bold">No recent payments</p>
                            )}
                            <button
                                onClick={() => navigate('/dashboard/transactions')}
                                className="w-full py-2.5 mt-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors border border-slate-100"
                            >
                                View My Payments
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Printable Components for Export */}
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
                    {data?.summary && (
                        <>
                            <IDCardPrintable ref={printableIdCardRef} member={data.summary} branding={branding} />
                            <CertificatePrintable ref={printableCertificateRef} member={data.summary} branding={branding} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const KpiCard = ({ title, value, icon: Icon, color, subtitle, progress, isStatus }) => {
    const colors = {
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-500/20' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-500/20' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-500/20' },
        slate: { bg: 'bg-slate-50', text: 'text-slate-600', ring: 'ring-slate-500/20' }
    };
    const c = colors[color] || colors.blue;

    return (
        <div className="group relative overflow-hidden rounded-[1.5rem] bg-white border border-slate-100 p-4 flex flex-col justify-between h-[120px] transition-all duration-300 hover:shadow-md hover:border-emerald-200/50">
            <div className={`absolute top-0 right-0 w-16 h-16 ${c.bg} rounded-full -mr-8 -mt-8 opacity-40 blur-[1px] transition-transform group-hover:scale-150 duration-500`}></div>

            <div className="flex justify-between items-start relative z-10 w-full">
                <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center ${c.text} shadow-sm border border-slate-100 transition-transform group-hover:rotate-12`}>
                    <Icon size={16} strokeWidth={2.5} />
                </div>
                {progress !== undefined && (
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            {Math.round(progress)}%
                        </span>
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <div className="flex items-baseline gap-2">
                    <h3 className="text-xl font-black text-slate-900 tracking-tighter Leonard-none mb-1 uppercase">
                        {value}
                    </h3>
                    {isStatus && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mb-1"></span>
                    )}
                </div>
                <div className="flex flex-col gap-0.5">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">{title}</p>
                    <p className={`text-[8px] font-black uppercase tracking-widest ${c.text}`}>{subtitle}</p>
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;
