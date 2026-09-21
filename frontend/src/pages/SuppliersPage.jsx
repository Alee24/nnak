import React, { useState, useEffect } from 'react';
import {
    Truck, Plus, Search, Filter, Phone, Mail,
    CheckCircle, Clock, AlertCircle, Edit3, X, RefreshCw, FileText
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';

const SuppliersPage = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('suppliers'); // 'suppliers' | 'orders'
    const [searchQuery, setSearchQuery] = useState('');

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        category: 'Turf & Machinery',
        status: 'active'
    });

    useEffect(() => {
        fetchSuppliersData();
    }, []);

    const fetchSuppliersData = async () => {
        setLoading(true);
        try {
            const [supRes, poRes] = await Promise.all([
                AdminAPI.getSuppliers().catch(() => ({ data: [] })),
                AdminAPI.getPurchaseOrders().catch(() => ({ data: [] }))
            ]);
            setSuppliers(supRes?.data || supRes?.suppliers || []);
            setOrders(poRes?.data || poRes?.orders || []);
        } catch (error) {
            console.error('Failed to load supplier data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setFormData({
            company_name: '',
            contact_person: '',
            email: '',
            phone: '',
            category: 'Turf & Machinery',
            status: 'active'
        });
        setIsModalOpen(true);
    };

    const handleSaveSupplier = async (e) => {
        e.preventDefault();
        try {
            await AdminAPI.createSupplier(formData);
            Swal.fire({
                icon: 'success',
                title: 'Supplier Added',
                text: `${formData.company_name} enrolled into vendor roster.`,
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
            setIsModalOpen(false);
            fetchSuppliersData();
        } catch (error) {
            Swal.fire('Error', error.message || 'Failed to add supplier', 'error');
        }
    };

    const filtered = suppliers.filter(s => {
        const matchesSearch = s.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.category?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="flex flex-col gap-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Truck className="text-emerald-600" size={24} />
                        Suppliers & Procurement
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
                        Vendor directory, purchase orders, turf supplies, pro shop stock & F&B deliveries
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchSuppliersData}
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
                        Add Vendor
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 max-w-sm w-full">
                    <Search size={15} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search company name, contact, category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs text-slate-800 dark:text-white placeholder-slate-400 w-full"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">{filtered.length} Active Vendors</span>
                </div>
            </div>

            {/* Suppliers Grid */}
            {loading ? (
                <div className="p-12 text-center text-slate-400 font-bold text-xs">Loading suppliers...</div>
            ) : filtered.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <Truck size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No suppliers registered</p>
                    <p className="text-xs text-slate-400 mt-1">Add a vendor or populate demo records in Settings.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filtered.map(sup => (
                        <div key={sup.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                                        {sup.category}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                                        {sup.status || 'active'}
                                    </span>
                                </div>

                                <h3 className="font-serif font-black text-slate-900 dark:text-white text-base mt-3">
                                    {sup.company_name}
                                </h3>
                                <p className="text-xs text-slate-500 font-bold mt-0.5">Contact: {sup.contact_person || 'Accounts Dept'}</p>

                                <div className="space-y-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-500">
                                    {sup.phone && (
                                        <p className="flex items-center gap-1.5"><Phone size={12} /> {sup.phone}</p>
                                    )}
                                    {sup.email && (
                                        <p className="flex items-center gap-1.5"><Mail size={12} /> {sup.email}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="text-base font-serif font-black text-slate-900 dark:text-white">
                                Register New Supplier
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveSupplier} className="p-5 space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Company / Business Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Toro Turf Equipment East Africa"
                                    value={formData.company_name}
                                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Contact Person</label>
                                    <input
                                        type="text"
                                        placeholder="Peter Njoroge"
                                        value={formData.contact_person}
                                        onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
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
                                        <option value="Turf & Machinery">Turf & Machinery</option>
                                        <option value="Pro Shop Inventory">Pro Shop Inventory</option>
                                        <option value="Food & Beverage">Food & Beverage</option>
                                        <option value="Beverages">Beverages</option>
                                        <option value="Maintenance & Parts">Maintenance & Parts</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Email</label>
                                    <input
                                        type="email"
                                        placeholder="orders@vendor.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Phone</label>
                                    <input
                                        type="text"
                                        placeholder="+254 700 000 000"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition"
                            >
                                Enroll Vendor
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuppliersPage;
