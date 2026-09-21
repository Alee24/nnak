import React, { useState, useEffect } from 'react';
import {
    Coffee, Plus, Clock, CheckCircle, AlertCircle, Utensils,
    DollarSign, User, Search, RefreshCw, X, ShoppingCart, Check, CreditCard
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';

const RestaurantPage = () => {
    const [tables, setTables] = useState([]);
    const [orders, setOrders] = useState([]);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tables'); // 'tables' | 'orders' | 'menu'
    const [searchQuery, setSearchQuery] = useState('');

    // New Order Modal
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [cart, setCart] = useState([]);
    const [memberSearch, setMemberSearch] = useState('');
    const [orderNotes, setOrderNotes] = useState('');

    useEffect(() => {
        fetchRestaurantData();
    }, []);

    const fetchRestaurantData = async () => {
        setLoading(true);
        try {
            const [tablesRes, ordersRes, menuRes] = await Promise.all([
                AdminAPI.getRestaurantTables().catch(() => ({ data: [] })),
                AdminAPI.getRestaurantOrders().catch(() => ({ data: [] })),
                AdminAPI.getRestaurantMenu().catch(() => ({ data: [] }))
            ]);

            setTables(tablesRes?.data || tablesRes?.tables || []);
            setOrders(ordersRes?.data || ordersRes?.orders || []);
            setMenu(menuRes?.data || menuRes?.menu || []);
        } catch (error) {
            console.error('Failed to load restaurant data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenOrder = (table) => {
        setSelectedTable(table);
        setCart([]);
        setMemberSearch('');
        setOrderNotes('');
        setIsOrderModalOpen(true);
    };

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(i => i.id !== itemId));
    };

    const updateQty = (itemId, delta) => {
        setCart(prev => prev.map(i => {
            if (i.id === itemId) {
                const newQty = i.qty + delta;
                return newQty > 0 ? { ...i, qty: newQty } : i;
            }
            return i;
        }));
    };

    const totalAmount = cart.reduce((sum, item) => sum + (Number(item.price || item.selling_price || 0) * item.qty), 0);

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            Swal.fire('Empty Order', 'Please select at least one item from the menu', 'warning');
            return;
        }

        try {
            const orderPayload = {
                table_id: selectedTable?.id,
                member_name: memberSearch || 'Walk-in Guest',
                items: cart.map(i => ({
                    product_id: i.id,
                    name: i.name,
                    quantity: i.qty,
                    price: i.price || i.selling_price || 0
                })),
                total_amount: totalAmount,
                notes: orderNotes
            };

            const res = await AdminAPI.createRestaurantOrder(orderPayload);
            if (res.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Order Placed',
                    text: `Order sent to the kitchen for ${selectedTable?.table_number || 'Table'}!`,
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
                setIsOrderModalOpen(false);
                fetchRestaurantData();
            }
        } catch (error) {
            Swal.fire('Error', error.message || 'Failed to place order', 'error');
        }
    };

    const handleUpdateTableStatus = async (tableId, newStatus) => {
        try {
            await AdminAPI.updateTableStatus(tableId, newStatus);
            setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: newStatus } : t));
        } catch (error) {
            Swal.fire('Error', 'Failed to update table status', 'error');
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await AdminAPI.updateOrderStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            Swal.fire({
                icon: 'success',
                title: 'Order Updated',
                text: `Order #${orderId} marked as ${newStatus}`,
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } catch (error) {
            Swal.fire('Error', 'Failed to update order status', 'error');
        }
    };

    return (
        <div className="flex flex-col gap-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Coffee className="text-amber-500" size={24} />
                        Clubhouse Dining & 19th Hole Bar
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
                        Table layout, POS kitchen tickets, live bar tabs & dining orders
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchRestaurantData}
                        className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition"
                        title="Refresh"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                    <button
                        onClick={() => handleOpenOrder(tables[0] || { id: 1, table_number: 'Quick Order' })}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95"
                    >
                        <Plus size={14} strokeWidth={3} />
                        New Dining Order
                    </button>
                </div>
            </div>

            {/* Sub Nav Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 gap-6 text-xs font-black uppercase tracking-wider">
                {[
                    { id: 'tables', label: `Tables & Seating (${tables.length})` },
                    { id: 'orders', label: `Active Orders (${orders.filter(o => o.status !== 'completed').length})` },
                    { id: 'menu', label: `Menu Items (${menu.length})` }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-3 transition relative ${activeTab === tab.id ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="p-12 text-center text-slate-400 font-bold text-xs">Loading restaurant records...</div>
            ) : activeTab === 'tables' ? (
                <div>
                    {tables.length === 0 ? (
                        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <Utensils size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No dining tables found</p>
                            <p className="text-xs text-slate-400 mt-1">Populate demo data from Settings or add tables to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {tables.map(table => (
                                <div
                                    key={table.id}
                                    className={`p-5 rounded-2xl border transition shadow-sm ${
                                        table.status === 'occupied'
                                            ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                                            : table.status === 'reserved'
                                            ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-serif font-black text-lg text-slate-900 dark:text-white">
                                            {table.table_number}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                            table.status === 'occupied'
                                                ? 'bg-rose-100 text-rose-800'
                                                : table.status === 'reserved'
                                                ? 'bg-amber-100 text-amber-800'
                                                : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                            {table.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-bold mt-1">{table.table_name || table.section || 'Dining Section'}</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Capacity: {table.capacity || 4} Guests</p>

                                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                                        <button
                                            onClick={() => handleOpenOrder(table)}
                                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition text-center"
                                        >
                                            Take Order
                                        </button>
                                        <button
                                            onClick={() => handleUpdateTableStatus(table.id, table.status === 'occupied' ? 'available' : 'occupied')}
                                            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition"
                                            title="Toggle Status"
                                        >
                                            {table.status === 'occupied' ? 'Vacate' : 'Occupy'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : activeTab === 'orders' ? (
                <div>
                    {orders.length === 0 ? (
                        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <Clock size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No active dining orders</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-[10px] uppercase font-black tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="p-3.5 pl-5">Order #</th>
                                        <th className="p-3.5">Table</th>
                                        <th className="p-3.5">Member / Guest</th>
                                        <th className="p-3.5">Total (KES)</th>
                                        <th className="p-3.5">Status</th>
                                        <th className="p-3.5 pr-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                                    {orders.map(order => (
                                        <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                                            <td className="p-3.5 pl-5 font-mono font-bold text-emerald-600">#{order.id}</td>
                                            <td className="p-3.5 font-bold text-slate-800 dark:text-white">Table {order.table_number || order.table_id || '—'}</td>
                                            <td className="p-3.5 text-slate-600 dark:text-slate-300">{order.member_name || order.first_name || 'Guest'}</td>
                                            <td className="p-3.5 font-bold text-slate-900 dark:text-white">{Number(order.total_amount || 0).toLocaleString()}</td>
                                            <td className="p-3.5">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                    order.status === 'completed'
                                                        ? 'bg-slate-100 text-slate-700'
                                                        : order.status === 'preparing'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-emerald-100 text-emerald-800'
                                                }`}>
                                                    {order.status || 'active'}
                                                </span>
                                            </td>
                                            <td className="p-3.5 pr-5 text-right space-x-2">
                                                {order.status !== 'completed' && (
                                                    <button
                                                        onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                                                    >
                                                        Mark Paid
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                /* Menu Tab */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {menu.map(item => (
                        <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-xs">{item.name}</h4>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.category || 'Restaurant'}</span>
                                <p className="text-xs font-black text-emerald-600 mt-1">KES {Number(item.price || item.selling_price || 0).toLocaleString()}</p>
                            </div>
                            <button
                                onClick={() => addToCart(item)}
                                className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl hover:bg-emerald-100 transition"
                                title="Add to Order"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* New Order Modal */}
            {isOrderModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-serif font-black text-slate-900 dark:text-white">
                                    New Ticket — Table {selectedTable?.table_number}
                                </h3>
                                <p className="text-xs text-emerald-600 font-bold">Select items from clubhouse menu</p>
                            </div>
                            <button
                                onClick={() => setIsOrderModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitOrder} className="flex-1 overflow-y-auto p-5 space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                    Member Name / Tab Holder
                                </label>
                                <input
                                    type="text"
                                    placeholder="Alex Metto or Guest"
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                />
                            </div>

                            {/* Menu Picker */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                    Select Food & Drinks
                                </label>
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-200 dark:border-slate-600">
                                    {menu.map(item => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => addToCart(item)}
                                            className="text-left p-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-600 transition flex items-center justify-between"
                                        >
                                            <div className="truncate mr-2">
                                                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.name}</p>
                                                <p className="text-[10px] text-emerald-600 font-mono">KES {Number(item.price || item.selling_price || 0).toLocaleString()}</p>
                                            </div>
                                            <Plus size={14} className="text-slate-400 flex-shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                    Current Order Items ({cart.length})
                                </label>
                                {cart.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic py-2">No items selected yet</p>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
                                        {cart.map(item => (
                                            <div key={item.id} className="p-2.5 flex items-center justify-between bg-white dark:bg-slate-800">
                                                <span className="text-xs font-bold text-slate-800 dark:text-white">{item.name}</span>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-lg text-xs font-bold">
                                                        <button type="button" onClick={() => updateQty(item.id, -1)} className="px-1 text-slate-500 hover:text-black">-</button>
                                                        <span>{item.qty}</span>
                                                        <button type="button" onClick={() => updateQty(item.id, 1)} className="px-1 text-slate-500 hover:text-black">+</button>
                                                    </div>
                                                    <span className="text-xs font-mono font-bold text-emerald-600">
                                                        KES {(Number(item.price || item.selling_price || 0) * item.qty).toLocaleString()}
                                                    </span>
                                                    <button type="button" onClick={() => removeFromCart(item.id)} className="text-rose-500 hover:text-rose-700">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-between font-black text-sm">
                                <span>Total Amount:</span>
                                <span className="text-emerald-600 font-mono text-base">KES {totalAmount.toLocaleString()}</span>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition"
                            >
                                Send Order to Kitchen / Bar
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantPage;
