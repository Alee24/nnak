import React, { useState, useEffect, useRef } from 'react';
import { Save, Upload, Image as ImageIcon, Check, Info } from 'lucide-react';
import AdminAPI from '../services/api';
import Swal from 'sweetalert2';

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        system_logo: '',
        authorised_signature: '',
        association_name: '',
        association_tagline: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const logoInputRef = useRef(null);
    const sigInputRef = useRef(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await AdminAPI.getSettings();
            if (response.success) {
                setSettings(prev => ({ ...prev, ...response.settings }));
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
            const response = await AdminAPI.updateSettings(settings);
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Settings Saved',
                    toast: true,
                    position: 'top-end',
                    timer: 3000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">System Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage association branding and asset configuration</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                >
                    {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Save size={18} />}
                    <span>Save Changes</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Branding Section */}
                <div className="donezo-card bg-white p-8 space-y-8 h-fit">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <ImageIcon size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Visual Identity</h3>
                    </div>

                    {/* Logo Upload */}
                    <div className="space-y-4">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">Association Logo</label>
                        <div className="flex items-center gap-6 p-4 rounded-2xl bg-gray-50 border border-dashed border-gray-200 group hover:border-primary/50 transition-colors">
                            <div className="w-24 h-24 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {settings.system_logo ? (
                                    <img src={settings.system_logo} alt="Logo" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <ImageIcon className="text-gray-200" size={32} />
                                )}
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs text-gray-500 leading-relaxed">Recommended 200x200px PNG or SVG with transparent background.</p>
                                <button
                                    onClick={() => logoInputRef.current.click()}
                                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                                >
                                    <Upload size={14} /> Upload New Logo
                                </button>
                                <input
                                    type="file"
                                    ref={logoInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'system_logo')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Signature Upload */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">Authorised Signature</label>
                        <div className="flex items-center gap-6 p-4 rounded-2xl bg-gray-50 border border-dashed border-gray-200 group hover:border-primary/50 transition-colors">
                            <div className="w-24 h-16 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {settings.authorised_signature ? (
                                    <img src={settings.authorised_signature} alt="Signature" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <div className="text-[10px] font-bold text-gray-300">NO SIG</div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs text-gray-500 leading-relaxed">Clean signature on white or transparent background.</p>
                                <button
                                    onClick={() => sigInputRef.current.click()}
                                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
                                >
                                    <Upload size={14} /> Upload Signature
                                </button>
                                <input
                                    type="file"
                                    ref={sigInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'authorised_signature')}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Text Settings Section */}
                <div className="space-y-8">
                    <div className="donezo-card bg-white p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Info size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Organization Info</h3>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">Association Name</label>
                                <input
                                    type="text"
                                    value={settings.association_name}
                                    onChange={(e) => setSettings(prev => ({ ...prev, association_name: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                                    placeholder="e.g., National Nurses Association"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">Association Tagline</label>
                                <input
                                    type="text"
                                    value={settings.association_tagline}
                                    onChange={(e) => setSettings(prev => ({ ...prev, association_tagline: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                                    placeholder="e.g., Voice of Nursing"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm flex-shrink-0">
                            <Check size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-emerald-900">Branding Integrated</h4>
                            <p className="text-xs text-emerald-700/80 mt-1 leading-relaxed">
                                These assets are automatically synchronized with ID card and Certificate generation.
                                Updates will reflect on all new downloads.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
