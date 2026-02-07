import React, { useState, useEffect, useRef } from 'react';
import { Save, Upload, Image as ImageIcon, Check, Info, Phone, MapPin, Globe, Mail } from 'lucide-react';
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

        // Stripe (Visa/Mastercard)
        stripe_publishable_key: '',
        stripe_secret_key: '',
        stripe_env: 'sandbox'
    });
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
                if (profileRes.success) {
                    setSettings(prev => ({
                        ...prev,
                        personal_phone: profileRes.member.phone,
                        personal_city: profileRes.member.city,
                        personal_address: profileRes.member.address_line1,
                        personal_name: `${profileRes.member.first_name} ${profileRes.member.last_name}`
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
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings(prev => ({ ...prev, [key]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            let response;
            if (isAdmin) {
                response = await AdminAPI.updateSettings(settings);
            } else {
                // Member updating personal info
                response = await AdminAPI.updateMember('me', {
                    phone: settings.personal_phone,
                    city: settings.personal_city,
                    address_line1: settings.personal_address,
                    password: settings.new_password // Only if provided
                });
            }

            if (response.success) {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                });
                Toast.fire({
                    icon: 'success',
                    title: isAdmin ? 'System Settings Saved' : 'Account Updated Successfully'
                });
            }
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[400px]">
            <div className="w-12 h-12 border-4 border-[#E11D48]/20 border-t-[#E11D48] rounded-full animate-spin"></div>
        </div>
    );

    const tabs = [
        { id: 'account', label: 'My Account' },
        ...(isAdmin ? [
            { id: 'branding', label: 'Branding & Identity' },
            { id: 'contact', label: 'Contact Details' },
            { id: 'payments', label: 'Payment Gateways' }
        ] : [])
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-fade-in-up pb-16 font-inter">
            {/* Premium Header */}
            <div className="flex justify-between items-center px-6 py-8 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-rose-500/10 transition-colors duration-1000"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{isAdmin ? 'System Settings' : 'My Settings'}</h1>
                    <p className="text-xs text-[#E11D48] font-black uppercase tracking-[0.25em] mt-2 flex items-center gap-2">
                        <span className="w-8 h-px bg-[#E11D48]/30"></span>
                        {isAdmin ? 'Architectural Configuration' : 'Personal Preferences'}
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-[#E11D48] transition-all active:scale-95 disabled:opacity-50 group"
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
                {activeTab === 'account' ? (
                    <>
                        {/* Account Basic Info */}
                        <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/60 shadow-2xl shadow-slate-200/50 space-y-10 group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-[#E11D48] shadow-inner group-hover:scale-110 transition-transform duration-500">
                                    <User size={24} strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Personal Details</h3>
                                    <div className="h-1 w-8 bg-rose-500 rounded-full mt-1"></div>
                                </div>
                            </div>

                            <div className="space-y-6 text-xs text-black">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Full Name</label>
                                    <input type="text" value={settings.personal_name || ''} readOnly className="w-full px-5 py-3.5 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl text-sm font-black tracking-tight cursor-not-allowed" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Phone Number</label>
                                    <input type="text" value={settings.personal_phone || ''} onChange={(e) => setSettings(prev => ({ ...prev, personal_phone: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all duration-300" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Current City</label>
                                    <input type="text" value={settings.personal_city || ''} onChange={(e) => setSettings(prev => ({ ...prev, personal_city: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all duration-300" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Address</label>
                                    <input type="text" value={settings.personal_address || ''} onChange={(e) => setSettings(prev => ({ ...prev, personal_address: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all duration-300" />
                                </div>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="space-y-8">
                            <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl space-y-10 relative overflow-hidden group">
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

                            <div className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-blue-500/20 flex gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-md flex-shrink-0 animate-pulse"><Info size={32} strokeWidth={3} /></div>
                                <div><h4 className="text-sm font-bold text-blue-900 uppercase tracking-widest">Privacy Note</h4><p className="text-[11px] text-blue-800/80 mt-2 leading-relaxed font-bold uppercase tracking-tight">Your data is secured using enterprise-grade encryption. Changes to your contact information are processed instantly.</p></div>
                            </div>
                        </div>
                    </>
                ) : activeTab === 'branding' ? (
                    <>
                        {/* Visual Branding Section */}
                        <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/60 shadow-2xl shadow-slate-200/50 space-y-10 h-fit transition-all hover:border-rose-100/50 group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-[#E11D48] shadow-inner group-hover:scale-110 transition-transform duration-500">
                                    <ImageIcon size={24} strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Visual Identity</h3>
                                    <div className="h-1 w-8 bg-rose-500 rounded-full mt-1"></div>
                                </div>
                            </div>

                            {/* Logo Upload */}
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Association Logo</label>
                                <div className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50/50 border border-dashed border-slate-200 group hover:border-[#E11D48]/50 transition-all duration-300">
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
                                <div className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50/50 border border-dashed border-slate-200 group hover:border-[#E11D48]/50 transition-all duration-300">
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
                            <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/60 shadow-2xl shadow-slate-200/50 space-y-10 group">
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
                                        <input type="text" value={settings.association_name} onChange={(e) => setSettings(prev => ({ ...prev, association_name: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all duration-300" placeholder="e.g., National Nurses Association" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Association Tagline</label>
                                        <input type="text" value={settings.association_tagline} onChange={(e) => setSettings(prev => ({ ...prev, association_tagline: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all duration-300" placeholder="e.g., Voice of Nursing" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-emerald-500/20 flex gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-md flex-shrink-0 animate-pulse"><Check size={32} strokeWidth={3} /></div>
                                <div><h4 className="text-sm font-bold text-emerald-900 uppercase tracking-widest">Branding Integrated</h4><p className="text-sm text-emerald-800/80 mt-2 leading-relaxed font-medium">These assets are automatically synchronized with ID card and Certificate generation. Updates will reflect on all new downloads instantly.</p></div>
                            </div>
                        </div>
                    </>
                ) : activeTab === 'payments' ? (
                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* M-Pesa Settings */}
                        <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/60 shadow-2xl shadow-slate-200/50 flex flex-col group transition-all hover:border-emerald-100/50">
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
                                    <select value={settings.mpesa_env} onChange={(e) => setSettings(prev => ({ ...prev, mpesa_env: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all">
                                        <option value="sandbox">Sandbox</option>
                                        <option value="production">Production</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Shortcode</label>
                                    <input type="text" value={settings.mpesa_shortcode} onChange={(e) => setSettings(prev => ({ ...prev, mpesa_shortcode: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Consumer Key</label>
                                    <input type="password" value={settings.mpesa_consumer_key} onChange={(e) => setSettings(prev => ({ ...prev, mpesa_consumer_key: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Consumer Secret</label>
                                    <input type="password" value={settings.mpesa_consumer_secret} onChange={(e) => setSettings(prev => ({ ...prev, mpesa_consumer_secret: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Passkey</label>
                                    <input type="password" value={settings.mpesa_passkey} onChange={(e) => setSettings(prev => ({ ...prev, mpesa_passkey: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Callback URL</label>
                                    <input type="text" value={settings.mpesa_callback_url} onChange={(e) => setSettings(prev => ({ ...prev, mpesa_callback_url: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all" placeholder="https://api.domain.com/callback" />
                                </div>
                            </div>
                        </div>

                        {/* PayPal Settings */}
                        <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/60 shadow-2xl shadow-slate-200/50 flex flex-col group transition-all hover:border-blue-100/50">
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
                                    <select value={settings.paypal_env} onChange={(e) => setSettings(prev => ({ ...prev, paypal_env: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all">
                                        <option value="sandbox">Sandbox</option>
                                        <option value="live">Live</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Client ID</label>
                                    <input type="text" value={settings.paypal_client_id} onChange={(e) => setSettings(prev => ({ ...prev, paypal_client_id: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Secret Key</label>
                                    <input type="password" value={settings.paypal_secret} onChange={(e) => setSettings(prev => ({ ...prev, paypal_secret: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* Visa/Stripe Settings */}
                        <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/60 shadow-2xl shadow-slate-200/50 flex flex-col group transition-all hover:border-indigo-100/50">
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
                                    <select value={settings.stripe_env} onChange={(e) => setSettings(prev => ({ ...prev, stripe_env: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all">
                                        <option value="sandbox">Test</option>
                                        <option value="production">Live</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Publishable Key</label>
                                    <input type="text" value={settings.stripe_publishable_key} onChange={(e) => setSettings(prev => ({ ...prev, stripe_publishable_key: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Secret Key</label>
                                    <input type="password" value={settings.stripe_secret_key} onChange={(e) => setSettings(prev => ({ ...prev, stripe_secret_key: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Contact Information */}
                        <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/60 shadow-2xl shadow-slate-200/50 space-y-10 group">
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
                                    <input type="email" value={settings.contact_email} onChange={(e) => setSettings(prev => ({ ...prev, contact_email: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-base font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all duration-300" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Phone Number</label>
                                    <input type="text" value={settings.contact_phone} onChange={(e) => setSettings(prev => ({ ...prev, contact_phone: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-base font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all duration-300" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Physical Address</label>
                                    <textarea rows="3" value={settings.contact_address} onChange={(e) => setSettings(prev => ({ ...prev, contact_address: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all duration-300 resize-none"></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em] block ml-1">Google Maps Embed URL</label>
                                    <input type="text" value={settings.contact_map_url} onChange={(e) => setSettings(prev => ({ ...prev, contact_map_url: e.target.value }))} className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-medium tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* Social & Hours */}
                        <div className="space-y-8">
                            <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/60 shadow-2xl shadow-slate-200/50 space-y-10 group">
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
                                        <input type="text" value={settings.social_facebook} onChange={(e) => setSettings(prev => ({ ...prev, social_facebook: e.target.value }))} className="w-full px-5 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all font-mono" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Twitter (X)</label>
                                        <input type="text" value={settings.social_twitter} onChange={(e) => setSettings(prev => ({ ...prev, social_twitter: e.target.value }))} className="w-full px-5 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all font-mono" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Instagram</label>
                                        <input type="text" value={settings.social_instagram} onChange={(e) => setSettings(prev => ({ ...prev, social_instagram: e.target.value }))} className="w-full px-5 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all font-mono" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">LinkedIn</label>
                                        <input type="text" value={settings.social_linkedin} onChange={(e) => setSettings(prev => ({ ...prev, social_linkedin: e.target.value }))} className="w-full px-5 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-black tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-[#E11D48]/5 focus:bg-white focus:border-[#E11D48]/20 transition-all font-mono" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl space-y-10 relative overflow-hidden group">
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
