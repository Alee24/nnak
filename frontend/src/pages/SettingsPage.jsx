import React, { useState, useEffect, useRef } from 'react';
import { Save, Upload, Image as ImageIcon, Check, Info, Phone, MapPin, Globe, Mail, User, Shield, Database, Sparkles, Trash2, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import AdminAPI from '../services/api';
import Swal from 'sweetalert2';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('branding');
    const [settings, setSettings] = useState({
        // Branding
        system_logo: '',
        authorised_signature: '',
        association_name: '',
        association_tagline: '',

        // Contact
        contact_email: '',
        contact_phone: '',
        contact_address: '',
        contact_map_url: '',

        // Social
        social_facebook: '',
        social_twitter: '',
        social_instagram: '',
        social_linkedin: '',

        // Office Hours
        office_hours_weekdays: '',
        office_hours_saturday: '',
        office_hours_sunday: '',

        // M-Pesa
        mpesa_consumer_key: '',
        mpesa_consumer_secret: '',
        mpesa_passkey: '',
        mpesa_shortcode: '',
        mpesa_env: 'sandbox',
        mpesa_callback_url: '',

        // PayPal
        paypal_client_id: '',
        paypal_secret: '',
        paypal_env: 'sandbox',

        personal_city: '',
        personal_address: '',
        personal_first_name: '',
        personal_last_name: '',
        profile_photo: '',
        new_password: '',
        confirm_password: ''
    });
    const [profileFile, setProfileFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const logoInputRef = useRef(null);
    const sigInputRef = useRef(null);

    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

    useEffect(() => {
        if (!isAdmin) {
            setActiveTab('account');
        }
        fetchSettings();
    }, [isAdmin]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await AdminAPI.getSettings();
            if (response.success) {
                setSettings(prev => ({ ...prev, ...response.settings }));
            }

            // If member, fetch their personal profile details for the account tab
            if (!isAdmin) {
                const profileRes = await AdminAPI.getMemberProfile('me');
                if (profileRes.success && profileRes.user) {
                    const member = profileRes.user;
                    setSettings(prev => ({
                        ...prev,
                        personal_phone: member.phone || '',
                        personal_city: member.city || '',
                        personal_address: member.address_line1 || '',
                        personal_first_name: member.first_name || '',
                        personal_last_name: member.last_name || '',
                        profile_photo: member.profile_photo || ''
                    }));
                }
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to load settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e, key) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                Swal.fire('File too large', 'Please select an image under 2MB', 'warning');
                return;
            }
            setProfileFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings(prev => ({ ...prev, [key]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            if (settings.new_password && settings.new_password !== settings.confirm_password) {
                Swal.fire('Error', 'Passwords do not match', 'error');
                return;
            }

            setSaving(true);
            let response;

            // Handle Profile Photo Upload first if exists
            if (profileFile) {
                const formData = new FormData();
                formData.append('image', profileFile);
                const uploadRes = await AdminAPI.uploadProfilePhoto(formData);
                if (uploadRes.success) {
                    setSettings(prev => ({ ...prev, profile_photo: uploadRes.url }));
                }
            }

            if (isAdmin) {
                response = await AdminAPI.updateSettings(settings);
            } else {
                // Member updating personal info
                const updatePayload = {
                    first_name: settings.personal_first_name,
                    last_name: settings.personal_last_name,
                    phone: settings.personal_phone,
                    city: settings.personal_city,
                    address_line1: settings.personal_address
                };

                if (settings.new_password) {
                    updatePayload.password = settings.new_password;
                }

                response = await AdminAPI.updateMember('me', updatePayload);
            }

            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: isAdmin ? 'System Settings Saved' : 'Account Updated Successfully',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });

                // Clear password fields after save
                setSettings(prev => ({ ...prev, new_password: '', confirm_password: '' }));
                setProfileFile(null);
            }
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[400px]">
            <div className="w-12 h-12 border-4 border-[#059669]/20 border-t-[#059669] rounded-full animate-spin"></div>
        </div>
    );

    const [demoMode, setDemoMode] = useState(true);
    const [demoLoading, setDemoLoading] = useState(false);

    useEffect(() => {
        const fetchDemoStatus = async () => {
            try {
                const res = await AdminAPI.getDemoStatus();
                if (res && res.success) {
                    setDemoMode(res.demo_mode);
                }
            } catch (e) {
                // ignore
            }
        };
        fetchDemoStatus();
    }, []);

    const handleToggleDemoMode = async () => {
        try {
            setDemoLoading(true);
            const nextMode = !demoMode;
            const res = await AdminAPI.toggleDemoMode(nextMode);
            if (res.success) {
                setDemoMode(res.demo_mode);
                Swal.fire({
                    icon: 'success',
                    title: res.demo_mode ? 'Demo Mode Activated' : 'Live Mode Activated',
                    text: res.demo_mode
                        ? 'Login page will now display default demo credentials for all member and staff types.'
                        : 'Login page will now act as a live production portal without demo credentials.',
                    timer: 3000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            }
        } catch (error) {
            Swal.fire('Error', error.message || 'Failed to toggle demo mode', 'error');
        } finally {
            setDemoLoading(false);
        }
    };

    const handlePopulateDemoData = async () => {
        const result = await Swal.fire({
            title: 'Populate Demo Data?',
            text: 'This will seed complete realistic demo records into the database (members, courses, tee times, tournaments, restaurant tables, products, caddies, carts, and staff).',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Populate Database'
        });

        if (!result.isConfirmed) return;

        try {
            setDemoLoading(true);
            const res = await AdminAPI.populateDemoData();
            if (res.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Database Populated!',
                    text: 'Demo data has been seeded across all modules.',
                    timer: 2500,
                    showConfirmButton: false
                });
                fetchSettings();
            }
        } catch (error) {
            Swal.fire('Error', error.message || 'Failed to populate demo data', 'error');
        } finally {
            setDemoLoading(false);
        }
    };

    const handleClearDemoData = async () => {
        const result = await Swal.fire({
            title: 'Clear All Operational Data?',
            text: 'This will wipe all tee times, tournament registrations, scorecards, orders, invoices, and guest records. Core admin accounts and system schema will be preserved.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Clear All Data'
        });

        if (!result.isConfirmed) return;

        try {
            setDemoLoading(true);
            const res = await AdminAPI.clearDemoData();
            if (res.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Database Cleared!',
                    text: 'All operational records have been cleared. The system is fresh.',
                    timer: 2500,
                    showConfirmButton: false
                });
                fetchSettings();
            }
        } catch (error) {
            Swal.fire('Error', error.message || 'Failed to clear data', 'error');
        } finally {
            setDemoLoading(false);
        }
    };

    const tabs = [
        { id: 'account', label: 'My Account' },
        ...(isAdmin ? [
            { id: 'demo', label: 'Demo & Database' },
            { id: 'branding', label: 'Branding & Identity' },
            { id: 'contact', label: 'Contact Details' },
            { id: 'payments', label: 'Payment Gateways' }
        ] : [])
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-fade-in-up pb-16 font-inter">
            {/* Premium Header */}
            <div className="flex justify-between items-center px-6 py-8 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-emerald-600/10 transition-colors duration-1000"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{isAdmin ? 'System Settings' : 'My Settings'}</h1>
                    <p className="text-xs text-[#059669] font-black uppercase tracking-[0.25em] mt-2 flex items-center gap-2">
                        <span className="w-8 h-px bg-[#059669]/30"></span>
                        {isAdmin ? 'Architectural Configuration' : 'Personal Preferences'}
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-[#059669] transition-all active:scale-95 disabled:opacity-50 group"
                >
                    {saving ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <Save size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                    )}
                    <span>{isAdmin ? 'Save ALL Configuration' : 'Update My Profile'}</span>
                </button>
            </div>

            {/* Premium Tab Navigation */}
            <div className="flex px-4 items-center gap-3">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-10 py-4 text-xs font-black uppercase tracking-[0.15em] transition-all rounded-full relative overflow-hidden ${activeTab === tab.id
                            ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/40'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent hover:border-slate-200'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {activeTab === 'demo' ? (
                    <>
                        {/* Demo Mode Toggle Card */}
                        <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-2xl border border-white/60 shadow-2xl shadow-slate-200/50 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                                    <Sparkles size={24} strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Demo Mode Control</h3>
                                    <div className="h-1 w-8 bg-emerald-500 rounded-full mt-1"></div>
                                </div>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                Toggle Demo Mode on or off. When <strong>ON</strong>, the login portal shows quick-fill buttons with default credentials for all member roles (Admin, Member, Pro, Cashier, etc.). When <strong>OFF</strong>, the login portal behaves as an active live production environment with zero demo text.
                            </p>

                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-black uppercase tracking-wider text-slate-900">
                                        System State: {demoMode ? (
                                            <span className="text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px] ml-2">DEMO ACTIVE</span>
                                        ) : (
                                            <span className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full text-[10px] ml-2">LIVE PRODUCTION</span>
                                        )}
                                    </div>
                                    <span className="text-[11px] text-slate-500 block mt-1">
                                        {demoMode ? 'Default credentials visible on login page' : 'Login credentials box completely hidden'}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleToggleDemoMode}
                                    disabled={demoLoading}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md ${
                                        demoMode
                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                                            : 'bg-slate-800 hover:bg-slate-900 text-white'
                                    }`}
                                >
                                    {demoMode ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                    <span>{demoMode ? 'Turn Demo OFF' : 'Turn Demo ON'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Database Seed & Wipe Actions Card */}
                        <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-2xl border border-white/60 shadow-2xl shadow-slate-200/50 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                                    <Database size={24} strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Database Management</h3>
                                    <div className="h-1 w-8 bg-blue-500 rounded-full mt-1"></div>
                                </div>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                Manage the live database contents with one click. Populate rich demo records across all modules, or clear operational tables to start a fresh club season.
                            </p>

                            <div className="space-y-4 pt-2">
                                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900">Populate Demo Records</h4>
                                        <p className="text-[11px] text-slate-600 mt-0.5">Seeds courses, tee times, tournaments, shop items, caddies, carts & staff</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handlePopulateDemoData}
                                        disabled={demoLoading}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95"
                                    >
                                        <Sparkles size={14} />
                                        <span>Populate</span>
                                    </button>
                                </div>

                                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-rose-100 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-wider text-rose-900">Clear Operational Data</h4>
                                        <p className="text-[11px] text-slate-600 mt-0.5">Wipes tee bookings, scorecards, orders, invoices & guest passes cleanly</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleClearDemoData}
                                        disabled={demoLoading}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95"
                                    >
                                        <Trash2 size={14} />
                                        <span>Clear Data</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : activeTab === 'account' ? (
                    <>
                        {/* Account Basic Info */}
                        <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-2xl border border-white/60 shadow-2xl shadow-slate-200/50 space-y-10 group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#059669] shadow-inner group-hover:scale-110 transition-transform duration-500">
                                    <User size={24} strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Personal Details</h3>
                                    <div className="h-1 w-8 bg-emerald-600 rounded-full mt-1"></div>
                                </div>
                            </div>

                            <div className="space-y-6 text-xs text-black">
                                <div className="flex flex-col items-center mb-8">
                                    <div className="relative group/avatar">
                                        <div className="w-32 h-32 rounded-[2rem] bg-slate-50 border-2 border-slate-100 flex items-center justify-center overflow-hidden shadow-xl group-hover/avatar:border-[#059669]/30 transition-all duration-500">
                                            {settings.profile_photo ? (
                                                <img src={settings.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="text-slate-200" size={48} />
                                            )}
                                        </div>
                                        <button
                                            onClick={() => logoInputRef.current.click()}
                                            className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-[#059669] transition-all active:scale-90"
                                        >
                                            <Upload size={18} strokeWidth={2.5} />
                                        </button>
                                        <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'profile_photo')} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Change Profile Picture</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">First Name</label>
                                        <input type="text" value={settings.personal_first_name || ''} onChange={(e) => setSettings(prev => ({ ...prev, personal_first_name: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all duration-300" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Last Name</label>
                                        <input type="text" value={settings.personal_last_name || ''} onChange={(e) => setSettings(prev => ({ ...prev, personal_last_name: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all duration-300" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Phone Number</label>
                                    <input type="text" value={settings.personal_phone || ''} onChange={(e) => setSettings(prev => ({ ...prev, personal_phone: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all duration-300" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Current City</label>
                                    <input type="text" value={settings.personal_city || ''} onChange={(e) => setSettings(prev => ({ ...prev, personal_city: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all duration-300" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Address</label>
                                    <input type="text" value={settings.personal_address || ''} onChange={(e) => setSettings(prev => ({ ...prev, personal_address: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all duration-300" />
                                </div>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="space-y-8">
                            <div className="bg-slate-900 p-10 rounded-2xl border border-slate-800 shadow-2xl space-y-10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform duration-500">
                                        <Shield size={24} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Security</h3>
                                        <div className="h-1 w-8 bg-white/20 rounded-full mt-1"></div>
                                    </div>
                                </div>
                                <div className="space-y-6 relative z-10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">New Password</label>
                                        <input type="password" value={settings.new_password || ''} onChange={(e) => setSettings(prev => ({ ...prev, new_password: e.target.value }))} className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm font-black tracking-tight text-white focus:outline-none focus:ring-4 focus:ring-white/5 focus:bg-white/10 focus:border-white/20 transition-all duration-300" placeholder="••••••••" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Confirm Password</label>
                                        <input type="password" value={settings.confirm_password || ''} onChange={(e) => setSettings(prev => ({ ...prev, confirm_password: e.target.value }))} className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm font-black tracking-tight text-white focus:outline-none focus:ring-4 focus:ring-white/5 focus:bg-white/10 focus:border-white/20 transition-all duration-300" placeholder="••••••••" />
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium italic">Leave blank if you don't want to change your password.</p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 backdrop-blur-md rounded-2xl p-8 border border-blue-500/20 flex gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-md flex-shrink-0 animate-pulse"><Info size={32} strokeWidth={3} /></div>
                                <div><h4 className="text-sm font-bold text-blue-900 uppercase tracking-widest">Privacy Note</h4><p className="text-[11px] text-blue-800/80 mt-2 leading-relaxed font-bold uppercase tracking-tight">Your data is secured using enterprise-grade encryption. Changes to your contact information are processed instantly.</p></div>
                            </div>
                        </div>
                    </>
                ) : activeTab === 'branding' ? (
                    <>
                        {/* Visual Branding Section */}
                        <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-2xl border border-white/60 shadow-2xl shadow-slate-200/50 space-y-10 h-fit transition-all hover:border-emerald-100/50 group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#059669] shadow-inner group-hover:scale-110 transition-transform duration-500">
                                    <ImageIcon size={24} strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Visual Identity</h3>
                                    <div className="h-1 w-8 bg-emerald-600 rounded-full mt-1"></div>
                                </div>
                            </div>

                            {/* Logo Upload */}
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Association Logo</label>
                                <div className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50/50 border border-dashed border-slate-200 group hover:border-[#059669]/50 transition-all duration-300">
                                    <div className="w-24 h-24 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                        {settings.system_logo ? (
                                            <img src={settings.system_logo} alt="Logo" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <ImageIcon className="text-slate-200" size={32} />
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Recommended 200x200px PNG or SVG with transparent background.</p>
                                        <button onClick={() => logoInputRef.current.click()} className="px-4 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition shadow-sm flex items-center gap-2 active:scale-95"><Upload size={14} strokeWidth={2.5} /> Update Logo</button>
                                        <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'system_logo')} />
                                    </div>
                                </div>
                            </div>

                            {/* Signature Upload */}
                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Authorised Signature</label>
                                <div className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50/50 border border-dashed border-slate-200 group hover:border-[#059669]/50 transition-all duration-300">
                                    <div className="w-24 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                        {settings.authorised_signature ? (
                                            <img src={settings.authorised_signature} alt="Signature" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <div className="text-xs font-black text-slate-300 tracking-widest uppercase">No Sig</div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Clean signature on white or transparent background.</p>
                                        <button onClick={() => sigInputRef.current.click()} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition shadow-sm flex items-center gap-2 active:scale-95"><Upload size={16} strokeWidth={2.5} /> Update Sig</button>
                                        <input type="file" ref={sigInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'authorised_signature')} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Text Settings Section */}
                        <div className="space-y-8">
                            <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-2xl border border-white/60 shadow-2xl shadow-slate-200/50 space-y-10 group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                        <Info size={24} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">Organization Info</h3>
                                        <div className="h-1 w-8 bg-blue-500 rounded-full mt-1"></div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Association Name</label>
                                        <input type="text" value={settings.association_name} onChange={(e) => setSettings(prev => ({ ...prev, association_name: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all duration-300" placeholder="e.g., National Nurses Association" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Association Tagline</label>
                                        <input type="text" value={settings.association_tagline} onChange={(e) => setSettings(prev => ({ ...prev, association_tagline: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all duration-300" placeholder="e.g., Voice of Nursing" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 backdrop-blur-md rounded-2xl p-8 border border-emerald-500/20 flex gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-md flex-shrink-0 animate-pulse"><Check size={32} strokeWidth={3} /></div>
                                <div><h4 className="text-sm font-bold text-emerald-900 uppercase tracking-widest">Branding Integrated</h4><p className="text-sm text-emerald-800/80 mt-2 leading-relaxed font-medium">These assets are automatically synchronized with ID card and Certificate generation. Updates will reflect on all new downloads instantly.</p></div>
                            </div>
                        </div>
                    </>
                ) : activeTab === 'payments' ? (
                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* M-Pesa Settings */}
                        <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-2xl border border-white/60 shadow-2xl shadow-slate-200/50 flex flex-col group transition-all hover:border-emerald-100/50">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-lg shadow-inner group-hover:scale-110 transition-transform duration-500">M</div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">M-Pesa</h3>
                                    <div className="h-1 w-8 bg-emerald-500 rounded-full mt-1"></div>
                                </div>
                            </div>
                            <div className="space-y-5 flex-1 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Environment</label>
                                    <select value={settings.mpesa_env} onChange={(e) => setSettings(prev => ({ ...prev, mpesa_env: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all">
                                        <option value="sandbox">Sandbox</option>
                                        <option value="production">Production</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Shortcode</label>
                                    <input type="text" value={settings.mpesa_shortcode} onChange={(e) => setSettings(prev => ({ ...prev, mpesa_shortcode: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Consumer Key</label>
                                    <input type="password" value={settings.mpesa_consumer_key} onChange={(e) => setSettings(prev => ({ ...prev, mpesa_consumer_key: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Consumer Secret</label>
                                    <input type="password" value={settings.mpesa_consumer_secret} onChange={(e) => setSettings(prev => ({ ...prev, mpesa_consumer_secret: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Passkey</label>
                                    <input type="password" value={settings.mpesa_passkey} onChange={(e) => setSettings(prev => ({ ...prev, mpesa_passkey: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Callback URL</label>
                                    <input type="text" value={settings.mpesa_callback_url} onChange={(e) => setSettings(prev => ({ ...prev, mpesa_callback_url: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all" placeholder="https://api.domain.com/callback" />
                                </div>
                            </div>
                        </div>

                        {/* PayPal Settings */}
                        <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-2xl border border-white/60 shadow-2xl shadow-slate-200/50 flex flex-col group transition-all hover:border-blue-100/50">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg shadow-inner group-hover:scale-110 transition-transform duration-500">P</div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">PayPal</h3>
                                    <div className="h-1 w-8 bg-blue-500 rounded-full mt-1"></div>
                                </div>
                            </div>
                            <div className="space-y-5 flex-1 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Environment</label>
                                    <select value={settings.paypal_env} onChange={(e) => setSettings(prev => ({ ...prev, paypal_env: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all">
                                        <option value="sandbox">Sandbox</option>
                                        <option value="live">Live</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Client ID</label>
                                    <input type="text" value={settings.paypal_client_id} onChange={(e) => setSettings(prev => ({ ...prev, paypal_client_id: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Secret Key</label>
                                    <input type="password" value={settings.paypal_secret} onChange={(e) => setSettings(prev => ({ ...prev, paypal_secret: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* Visa/Stripe Settings */}
                        <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-2xl border border-white/60 shadow-2xl shadow-slate-200/50 flex flex-col group transition-all hover:border-indigo-100/50">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-inner group-hover:scale-110 transition-transform duration-500">V</div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Visa / Card</h3>
                                    <div className="h-1 w-8 bg-indigo-500 rounded-full mt-1"></div>
                                </div>
                            </div>
                            <div className="space-y-5 flex-1 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Environment</label>
                                    <select value={settings.stripe_env} onChange={(e) => setSettings(prev => ({ ...prev, stripe_env: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all">
                                        <option value="sandbox">Test</option>
                                        <option value="production">Live</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Publishable Key</label>
                                    <input type="text" value={settings.stripe_publishable_key} onChange={(e) => setSettings(prev => ({ ...prev, stripe_publishable_key: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Secret Key</label>
                                    <input type="password" value={settings.stripe_secret_key} onChange={(e) => setSettings(prev => ({ ...prev, stripe_secret_key: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Contact Information */}
                        <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-2xl border border-white/60 shadow-2xl shadow-slate-200/50 space-y-10 group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                    <Phone size={24} strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Contact Details</h3>
                                    <div className="h-1 w-8 bg-purple-500 rounded-full mt-1"></div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Email Address</label>
                                    <input type="email" value={settings.contact_email} onChange={(e) => setSettings(prev => ({ ...prev, contact_email: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-base font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all duration-300" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Phone Number</label>
                                    <input type="text" value={settings.contact_phone} onChange={(e) => setSettings(prev => ({ ...prev, contact_phone: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-base font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all duration-300" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Physical Address</label>
                                    <textarea rows="3" value={settings.contact_address} onChange={(e) => setSettings(prev => ({ ...prev, contact_address: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all duration-300 resize-none"></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em] block ml-1">Google Maps Embed URL</label>
                                    <input type="text" value={settings.contact_map_url} onChange={(e) => setSettings(prev => ({ ...prev, contact_map_url: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-medium tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* Social & Hours */}
                        <div className="space-y-8">
                            <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-2xl border border-white/60 shadow-2xl shadow-slate-200/50 space-y-10 group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                        <Globe size={24} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">Social Presence</h3>
                                        <div className="h-1 w-8 bg-pink-500 rounded-full mt-1"></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Facebook</label>
                                        <input type="text" value={settings.social_facebook} onChange={(e) => setSettings(prev => ({ ...prev, social_facebook: e.target.value }))} className="w-full px-5 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all font-mono" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Twitter (X)</label>
                                        <input type="text" value={settings.social_twitter} onChange={(e) => setSettings(prev => ({ ...prev, social_twitter: e.target.value }))} className="w-full px-5 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all font-mono" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Instagram</label>
                                        <input type="text" value={settings.social_instagram} onChange={(e) => setSettings(prev => ({ ...prev, social_instagram: e.target.value }))} className="w-full px-5 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all font-mono" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">LinkedIn</label>
                                        <input type="text" value={settings.social_linkedin} onChange={(e) => setSettings(prev => ({ ...prev, social_linkedin: e.target.value }))} className="w-full px-5 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:bg-white focus:border-[#059669]/20 transition-all font-mono" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 p-10 rounded-2xl border border-slate-800 shadow-2xl space-y-10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform duration-500">
                                        <MapPin size={24} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Office Hours</h3>
                                        <div className="h-1 w-8 bg-white/20 rounded-full mt-1"></div>
                                    </div>
                                </div>
                                <div className="space-y-6 relative z-10">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Weekdays</label>
                                        <input type="text" value={settings.office_hours_weekdays} onChange={(e) => setSettings(prev => ({ ...prev, office_hours_weekdays: e.target.value }))} className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm font-black tracking-tight text-white focus:outline-none focus:ring-4 focus:ring-white/5 focus:bg-white/10 focus:border-white/20 transition-all duration-300" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Saturday</label>
                                        <input type="text" value={settings.office_hours_saturday} onChange={(e) => setSettings(prev => ({ ...prev, office_hours_saturday: e.target.value }))} className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm font-black tracking-tight text-white focus:outline-none focus:ring-4 focus:ring-white/5 focus:bg-white/10 focus:border-white/20 transition-all duration-300" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;

