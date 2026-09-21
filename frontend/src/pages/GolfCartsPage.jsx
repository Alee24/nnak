import React, { useState, useEffect } from 'react';
import {
    Car, Plus, Search, Filter, BatteryCharging, Wrench,
    CheckCircle, Clock, AlertCircle, Edit3, X, RefreshCw, DollarSign
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';

const GolfCartsPage = () => {
    const [carts, setCarts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Create Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        cart_number: '',
        make: 'Club Car',
        model: 'Tempo Li-Ion',
        type: 'electric',
        round_rate: 3000,
        battery_level: 100,
        status: 'available'
    });

    useEffect(() => {
        fetchCarts();
    }, []);

    const fetchCarts = async () => {
        setLoading(true);
        try {
            const res = await AdminAPI.getGolfCarts();
            setCarts(res?.data || res?.carts || []);
        } catch (error) {
            console.error('Failed to load carts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setFormData({
            cart_number: `CART-${String(carts.length + 1).padStart(2, '0')}`,
            make: 'Club Car',
            model: 'Tempo Li-Ion',
            type: 'electric',
            round_rate: 3000,
            battery_level: 100,
            status: 'available'
        });
        setIsModalOpen(true);
    };

    const handleSaveCart = async (e) => {
        e.preventDefault();
        try {
            await AdminAPI.createGolfCart(formData);
            Swal.fire({
                icon: 'success',
                title: 'Golf Cart Added',
                text: `${formData.cart_number} added to club cart fleet.`,
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
            setIsModalOpen(false);
            fetchCarts();
        } catch (error) {
            Swal.fire('Error', error.message || 'Failed to add golf cart', 'error');
        }
    };

    const handleToggleStatus = async (cartId, currentStatus) => {
        const nextStatus = currentStatus === 'available' ? 'rented' : currentStatus === 'rented' ? 'maintenance' : 'available';
        try {
            await AdminAPI.updateGolfCart(cartId, { status: nextStatus });
            setCarts(prev => prev.map(c => c.id === cartId ? { ...c, status: nextStatus } : c));
        } catch (error) {
            Swal.fire('Error', 'Failed to update cart status', 'error');
        }
    };

    const filtered = carts.filter(c => {
        const matchesSearch = c.cart_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.model?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex flex-col gap-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Car className="text-emerald-600" size={24} />
                        Golf Cart Fleet Management
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
                        Fleet tracking, battery levels, maintenance status & player dispatch
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchCarts}
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
                        Add Golf Cart
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Total Fleet</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{carts.length}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block mb-1">Available Fleet</span>
                    <span className="text-2xl font-black text-emerald-600 leading-none">{carts.filter(c => c.status === 'available').length}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block mb-1">On Course (Rented)</span>
                    <span className="text-2xl font-black text-amber-600 leading-none">{carts.filter(c => c.status === 'rented').length}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 block mb-1">In Workshop / Maint</span>
                    <span className="text-2xl font-black text-rose-600 leading-none">{carts.filter(c => c.status === 'maintenance').length}</span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 max-w-sm w-full">
                    <Search size={15} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search cart number, make, model..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs text-slate-800 dark:text-white placeholder-slate-400 w-full"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {['all', 'available', 'rented', 'maintenance'].map(st => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize ${statusFilter === st ? 'bg-slate-900 text-white dark:bg-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                        >
                            {st}
                        </button>
                    ))}
                </div>
            </div>

            {/* Fleet Cards */}
            {loading ? (
                <div className="p-12 text-center text-slate-400 font-bold text-xs">Loading golf carts...</div>
            ) : filtered.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <Car size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No golf carts in fleet</p>
                    <p className="text-xs text-slate-400 mt-1">Populate demo records from Settings or register a cart above.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map(cart => (
                        <div key={cart.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                                        {cart.cart_number}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                        cart.status === 'available'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : cart.status === 'rented'
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-rose-100 text-rose-800'
                                    }`}>
                                        {cart.status}
                                    </span>
                                </div>

                                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-2">
                                    {cart.make} {cart.model}
                                </h3>
                                <p className="text-[11px] text-slate-400 capitalize">{cart.type} Drive • KES {Number(cart.round_rate || 3000).toLocaleString()} / round</p>

                                {/* Battery Progress */}
                                <div className="mt-3">
                                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                                        <span className="flex items-center gap-1"><BatteryCharging size={11} /> Battery Charge</span>
                                        <span>{cart.battery_level || 100}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${
                                                (cart.battery_level || 100) > 50
                                                    ? 'bg-emerald-500'
                                                    : (cart.battery_level || 100) > 20
                                                    ? 'bg-amber-500'
                                                    : 'bg-rose-500'
                                            }`}
                                            style={{ width: `${cart.battery_level || 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                                <button
                                    onClick={() => handleToggleStatus(cart.id, cart.status)}
                                    className="w-full py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition text-center"
                                >
                                    {cart.status === 'available' ? 'Dispatch (Rent Cart)' : cart.status === 'rented' ? 'Return to Bay' : 'Finish Repair'}
                                </button>
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
                                Add Golf Cart to Fleet
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveCart} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Cart ID / Number *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.cart_number}
                                        onChange={(e) => setFormData({ ...formData, cart_number: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Make</label>
                                    <input
                                        type="text"
                                        value={formData.make}
                                        onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Model</label>
                                    <input
                                        type="text"
                                        value={formData.model}
                                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Drive Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    >
                                        <option value="electric">Electric (Li-Ion / Lead Acid)</option>
                                        <option value="petrol">Petrol (EFI)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Round Rate (KES)</label>
                                    <input
                                        type="number"
                                        value={formData.round_rate}
                                        onChange={(e) => setFormData({ ...formData, round_rate: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Battery / Fuel (%)</label>
                                    <input
                                        type="number"
                                        value={formData.battery_level}
                                        onChange={(e) => setFormData({ ...formData, battery_level: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition"
                            >
                                Register to Fleet
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GolfCartsPage;
