import React, { useState, useEffect } from 'react';
import {
    ShoppingBag, Plus, Search, Filter, AlertTriangle, Package,
    DollarSign, ArrowUpRight, ArrowDownRight, Edit3, Trash2, X, RefreshCw
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';

const GolfShopPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Create / Edit Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        category: 'Golf Balls',
        department: 'golf_shop',
        cost_price: '',
        selling_price: '',
        stock_quantity: 10,
        min_stock_alert: 5
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await AdminAPI.getProducts();
            const list = res?.data || res?.products || [];
            setProducts(list.filter(p => !p.department || p.department === 'golf_shop'));
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingProduct(null);
        setFormData({
            code: `PRO-${Math.floor(1000 + Math.random() * 9000)}`,
            name: '',
            category: 'Golf Balls',
            department: 'golf_shop',
            cost_price: '',
            selling_price: '',
            stock_quantity: 10,
            min_stock_alert: 5
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (prod) => {
        setEditingProduct(prod);
        setFormData({
            code: prod.code,
            name: prod.name,
            category: prod.category || 'Golf Balls',
            department: 'golf_shop',
            cost_price: prod.cost_price,
            selling_price: prod.selling_price,
            stock_quantity: prod.stock_quantity,
            min_stock_alert: prod.min_stock_alert
        });
        setIsModalOpen(true);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await AdminAPI.updateProduct(editingProduct.id, formData);
                Swal.fire({
                    icon: 'success',
                    title: 'Item Updated',
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            } else {
                await AdminAPI.createProduct(formData);
                Swal.fire({
                    icon: 'success',
                    title: 'Product Added to Pro Shop',
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (error) {
            Swal.fire('Error', error.message || 'Failed to save product', 'error');
        }
    };

    const handleSellQuick = async (prod) => {
        const { value: qty } = await Swal.fire({
            title: `Quick Sale — ${prod.name}`,
            input: 'number',
            inputLabel: 'Units Sold',
            inputValue: 1,
            showCancelButton: true,
            confirmButtonColor: '#059669'
        });

        if (qty && Number(qty) > 0) {
            try {
                await AdminAPI.sellProduct(prod.id, { quantity: Number(qty) });
                Swal.fire({
                    icon: 'success',
                    title: 'Sale Recorded',
                    text: `Deducted ${qty} units from stock.`,
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
                fetchProducts();
            } catch (error) {
                Swal.fire('Error', error.message || 'Sale failed', 'error');
            }
        }
    };

    const filtered = products.filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.code?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
        return matchesSearch && matchesCat;
    });

    const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

    return (
        <div className="flex flex-col gap-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <ShoppingBag className="text-emerald-600" size={24} />
                        Pro Shop & Golf Equipment
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
                        Inventory catalog, apparel, balls, clubs & quick point-of-sale
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchProducts}
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
                        Add New Item
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 max-w-sm w-full">
                    <Search size={15} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search product name or SKU..."
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
                        All Items
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

            {/* Products Table */}
            {loading ? (
                <div className="p-12 text-center text-slate-400 font-bold text-xs">Loading Pro Shop inventory...</div>
            ) : filtered.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <Package size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No products found</p>
                    <p className="text-xs text-slate-400 mt-1">Use "Add New Item" above or populate demo data in Settings.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-[10px] uppercase font-black tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="p-3.5 pl-5">SKU / Code</th>
                                <th className="p-3.5">Product Name</th>
                                <th className="p-3.5">Category</th>
                                <th className="p-3.5">Price (KES)</th>
                                <th className="p-3.5 text-center">In Stock</th>
                                <th className="p-3.5 pr-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                            {filtered.map(p => {
                                const isLowStock = p.stock_quantity <= (p.min_stock_alert || 5);
                                return (
                                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                                        <td className="p-3.5 pl-5 font-mono font-bold text-slate-500">{p.code}</td>
                                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">{p.name}</td>
                                        <td className="p-3.5">
                                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                                                {p.category}
                                            </span>
                                        </td>
                                        <td className="p-3.5 font-bold text-emerald-600 font-mono">
                                            {Number(p.selling_price || 0).toLocaleString()}
                                        </td>
                                        <td className="p-3.5 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                                isLowStock
                                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                            }`}>
                                                {p.stock_quantity} units
                                            </span>
                                        </td>
                                        <td className="p-3.5 pr-5 text-right space-x-2">
                                            <button
                                                onClick={() => handleSellQuick(p)}
                                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                                            >
                                                Quick Sale
                                            </button>
                                            <button
                                                onClick={() => handleOpenEdit(p)}
                                                className="p-1 hover:text-emerald-600 text-slate-400"
                                                title="Edit Product"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
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
                                {editingProduct ? 'Edit Product' : 'Add New Pro Shop Item'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProduct} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">SKU / Code *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
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
                                        <option value="Golf Balls">Golf Balls</option>
                                        <option value="Gloves">Gloves</option>
                                        <option value="Apparel">Apparel</option>
                                        <option value="Clubs">Clubs</option>
                                        <option value="Bags">Bags</option>
                                        <option value="Accessories">Accessories</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Product Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Titleist Pro V1 Golf Balls (Dozen)"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Cost Price (KES)</label>
                                    <input
                                        type="number"
                                        value={formData.cost_price}
                                        onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Selling Price (KES) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.selling_price}
                                        onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Initial Stock</label>
                                    <input
                                        type="number"
                                        value={formData.stock_quantity}
                                        onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Low Stock Alert</label>
                                    <input
                                        type="number"
                                        value={formData.min_stock_alert}
                                        onChange={(e) => setFormData({ ...formData, min_stock_alert: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition"
                            >
                                {editingProduct ? 'Save Changes' : 'Add to Catalog'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GolfShopPage;
