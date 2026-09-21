import React, { useState, useEffect } from 'react';
import {
    HardDrive, Plus, Search, Filter, Calendar,
    CheckCircle, AlertCircle, Wrench, X, RefreshCw, DollarSign
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';

const AssetsPage = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Create Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        asset_number: '',
        name: '',
        category: 'Course Machinery',
        purchase_date: new Date().toISOString().split('T')[0],
        purchase_cost: '',
        serial_number: '',
        condition_status: 'good'
    });

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const res = await AdminAPI.getAssets();
            setAssets(res?.data || res?.assets || []);
        } catch (error) {
            console.error('Failed to load assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setFormData({
            asset_number: `AST-${Math.floor(100 + Math.random() * 900)}`,
            name: '',
            category: 'Course Machinery',
            purchase_date: new Date().toISOString().split('T')[0],
            purchase_cost: '',
            serial_number: '',
            condition_status: 'good'
        });
        setIsModalOpen(true);
    };

    const handleSaveAsset = async (e) => {
        e.preventDefault();
        try {
            await AdminAPI.createAsset(formData);
            Swal.fire({
                icon: 'success',
                title: 'Asset Registered',
                text: `${formData.name} added to club asset register.`,
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
            setIsModalOpen(false);
            fetchAssets();
        } catch (error) {
            Swal.fire('Error', error.message || 'Failed to add asset', 'error');
        }
    };

    const handleUpdateCondition = async (assetId, newCondition) => {
        try {
            await AdminAPI.updateAsset(assetId, { condition_status: newCondition });
            setAssets(prev => prev.map(a => a.id === assetId ? { ...a, condition_status: newCondition } : a));
        } catch (error) {
            Swal.fire('Error', 'Failed to update condition', 'error');
        }
    };

    const filtered = assets.filter(a => {
        const matchesSearch = a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.asset_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.serial_number?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = Array.isArray(assets) ? Array.from(new Set(assets.map(a => a?.category).filter(Boolean))) : [];
    const totalValuation = Array.isArray(assets) ? assets.reduce((sum, a) => sum + Number(a?.purchase_cost || 0), 0) : 0;

    return (
        <div className="flex flex-col gap-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <HardDrive className="text-emerald-600" size={24} />
                        Club Assets & Machinery Register
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
                        Course mowers, pumps, generators, launch monitors & facility equipment
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchAssets}
                        className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95"
                    >
                        <Plus size={14} strokeWidth={3} />
                        Register New Asset
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Total Assets</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{assets.length}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block mb-1">Operational</span>
                    <span className="text-2xl font-black text-emerald-600 leading-none">{assets.filter(a => a.condition_status !== 'poor').length}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block mb-1">Needs Service</span>
                    <span className="text-2xl font-black text-amber-600 leading-none">{assets.filter(a => a.condition_status === 'poor').length}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block mb-1">Asset Value</span>
                    <span className="text-lg font-black text-blue-600 leading-none truncate font-mono">KES {(totalValuation / 1000000).toFixed(1)}M</span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 max-w-sm w-full">
                    <Search size={15} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search asset name, tag or serial..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs text-slate-800 dark:text-white placeholder-slate-400 w-full"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto">
                    <button
                        onClick={() => setCategoryFilter('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${categoryFilter === 'all' ? 'bg-slate-900 text-white dark:bg-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                    >
                        All Categories
                    </button>
                    {categories.map(c => (
                        <button
                            key={c}
                            onClick={() => setCategoryFilter(c)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${categoryFilter === c ? 'bg-slate-900 text-white dark:bg-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Assets Table */}
            {loading ? (
                <div className="p-12 text-center text-slate-400 font-bold text-xs">Loading assets register...</div>
            ) : filtered.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <HardDrive size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No assets found</p>
                    <p className="text-xs text-slate-400 mt-1">Register new equipment or populate demo records in Settings.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-[10px] uppercase font-black tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="p-3.5 pl-5">Asset Tag</th>
                                <th className="p-3.5">Asset Description</th>
                                <th className="p-3.5">Category</th>
                                <th className="p-3.5">Acquisition Cost</th>
                                <th className="p-3.5">Condition</th>
                                <th className="p-3.5 pr-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                            {filtered.map(asset => (
                                <tr key={asset.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                                    <td className="p-3.5 pl-5 font-mono font-bold text-slate-600 dark:text-slate-300">{asset.asset_number}</td>
                                    <td className="p-3.5">
                                        <p className="font-bold text-slate-900 dark:text-white">{asset.name}</p>
                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">S/N: {asset.serial_number || 'N/A'}</p>
                                    </td>
                                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{asset.category}</td>
                                    <td className="p-3.5 font-bold font-mono text-emerald-600">KES {Number(asset.purchase_cost || 0).toLocaleString()}</td>
                                    <td className="p-3.5">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                            asset.condition_status === 'excellent'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : asset.condition_status === 'good'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-rose-100 text-rose-800'
                                        }`}>
                                            {asset.condition_status || 'good'}
                                        </span>
                                    </td>
                                    <td className="p-3.5 pr-5 text-right">
                                        <button
                                            onClick={() => handleUpdateCondition(asset.id, asset.condition_status === 'good' ? 'poor' : 'good')}
                                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded text-[10px] font-bold"
                                        >
                                            {asset.condition_status === 'good' ? 'Mark for Maint' : 'Mark Service OK'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="text-base font-serif font-black text-slate-900 dark:text-white">
                                Register New Asset
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveAsset} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Asset Tag # *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.asset_number}
                                        onChange={(e) => setFormData({ ...formData, asset_number: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    >
                                        <option value="Course Machinery">Course Machinery</option>
                                        <option value="Irrigation">Irrigation</option>
                                        <option value="Pro Shop & Range">Pro Shop & Range</option>
                                        <option value="Infrastructure">Infrastructure</option>
                                        <option value="Clubhouse">Clubhouse</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Asset Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Toro Reelmaster 3100-D Mower"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Cost (KES) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.purchase_cost}
                                        onChange={(e) => setFormData({ ...formData, purchase_cost: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Condition</label>
                                    <select
                                        value={formData.condition_status}
                                        onChange={(e) => setFormData({ ...formData, condition_status: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    >
                                        <option value="excellent">Excellent</option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                        <option value="poor">Poor (Needs Service)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Serial Number</label>
                                <input
                                    type="text"
                                    placeholder="SN-12345-AB"
                                    value={formData.serial_number}
                                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition"
                            >
                                Save to Asset Register
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetsPage;
