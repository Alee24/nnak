import React, { useState, useEffect } from 'react';
import {
    FileText, Plus, Search, Filter, Printer, CheckCircle,
    AlertCircle, Clock, DollarSign, Send, Eye, X, Download,
    Check, Trash2, Sparkles, User, Calendar
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';

const DEFAULT_INVOICES = [
    {
        id: 1,
        invoice_number: 'INV-2025-0842',
        member_name: 'Alex Metto',
        member_number: 'MMS-0042',
        email: 'alex.metto@mms.co.ke',
        invoice_date: '2025-09-01',
        due_date: '2025-09-30',
        total_amount: 85000,
        paid_amount: 85000,
        balance_due: 0,
        status: 'paid',
        items: [
            { description: 'Annual Full Golf Membership Subscription 2025/2026', qty: 1, unit_price: 75000, amount: 75000 },
            { description: 'Club Locker & Bag Storage Annual Fee', qty: 1, unit_price: 10000, amount: 10000 }
        ]
    },
    {
        id: 2,
        invoice_number: 'INV-2025-0843',
        member_name: 'Dr. Arthur Mwangi',
        member_number: 'MMS-0015',
        email: 'arthur.mwangi@gmail.com',
        invoice_date: '2025-09-10',
        due_date: '2025-09-25',
        total_amount: 18500,
        paid_amount: 0,
        balance_due: 18500,
        status: 'sent',
        items: [
            { description: 'Monthly Mug Tournament Entry Fee', qty: 1, unit_price: 3500, amount: 3500 },
            { description: 'Golf Cart Fleet Rental (18 Holes x 3 Rounds)', qty: 3, unit_price: 3000, amount: 9000 },
            { description: 'Fairway Terrace Dining Tab', qty: 1, unit_price: 6000, amount: 6000 }
        ]
    },
    {
        id: 3,
        invoice_number: 'INV-2025-0839',
        member_name: 'Sarah Wanjiku',
        member_number: 'MMS-0088',
        email: 'sarah.wanjiku@yahoo.com',
        invoice_date: '2025-08-15',
        due_date: '2025-09-05',
        total_amount: 42000,
        paid_amount: 20000,
        balance_due: 22000,
        status: 'overdue',
        items: [
            { description: 'Simba Banquet Hall Half-Day Private Event', qty: 1, unit_price: 35000, amount: 35000 },
            { description: 'Catering Beverage Deposit', qty: 1, unit_price: 7000, amount: 7000 }
        ]
    },
    {
        id: 4,
        invoice_number: 'INV-2025-0845',
        member_name: 'Kevin Omondi',
        member_number: 'MMS-0033',
        email: 'kevin.omondi@corp.co.ke',
        invoice_date: '2025-09-15',
        due_date: '2025-09-30',
        total_amount: 14000,
        paid_amount: 14000,
        balance_due: 0,
        status: 'paid',
        items: [
            { description: 'Guest Green Fees (2 Players x KES 3,500)', qty: 2, unit_price: 3500, amount: 7000 },
            { description: 'Pro Shop Titleist Pro V1 Dozen Balls', qty: 1, unit_price: 7000, amount: 7000 }
        ]
    },
    {
        id: 5,
        invoice_number: 'INV-2025-0846',
        member_name: 'George Otieno',
        member_number: 'MMS-0004',
        email: 'gotieno@safari.com',
        invoice_date: '2025-09-18',
        due_date: '2025-10-02',
        total_amount: 9500,
        paid_amount: 0,
        balance_due: 9500,
        status: 'sent',
        items: [
            { description: 'Driving Range 500-Ball Card Subscription', qty: 1, unit_price: 4500, amount: 4500 },
            { description: 'Captains Invitational Entry Fee', qty: 1, unit_price: 5000, amount: 5000 }
        ]
    }
];

const InvoicesPage = () => {
    const [invoices, setInvoices] = useState(DEFAULT_INVOICES);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Create Modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        member_name: '',
        member_number: '',
        email: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        items: [{ description: '', qty: 1, unit_price: 0, amount: 0 }]
    });

    // View Modal
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await AdminAPI.getInvoices();
            const list = res?.data || res?.invoices || [];
            if (Array.isArray(list) && list.length > 0) {
                setInvoices(list);
            } else {
                setInvoices(DEFAULT_INVOICES);
            }
        } catch (e) {
            console.warn("Using fallback invoices:", e);
            setInvoices(DEFAULT_INVOICES);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        setCreateForm({
            ...createForm,
            items: [...createForm.items, { description: '', qty: 1, unit_price: 0, amount: 0 }]
        });
    };

    const handleRemoveItem = (index) => {
        if (createForm.items.length <= 1) return;
        setCreateForm({
            ...createForm,
            items: createForm.items.filter((_, i) => i !== index)
        });
    };

    const handleItemChange = (index, field, val) => {
        const updated = [...createForm.items];
        updated[index][field] = val;
        if (field === 'qty' || field === 'unit_price') {
            const q = Number(field === 'qty' ? val : updated[index].qty) || 0;
            const p = Number(field === 'unit_price' ? val : updated[index].unit_price) || 0;
            updated[index].amount = q * p;
        }
        setCreateForm({ ...createForm, items: updated });
    };

    const totalCalculated = createForm.items.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    const handleSaveInvoice = async (e) => {
        e.preventDefault();
        if (!createForm.member_name.trim()) {
            Swal.fire('Required', 'Please enter member name', 'warning');
            return;
        }

        const newInv = {
            ...createForm,
            id: Date.now(),
            invoice_number: `INV-2025-0${Math.floor(850 + Math.random() * 150)}`,
            total_amount: totalCalculated,
            paid_amount: 0,
            balance_due: totalCalculated,
            status: 'sent'
        };

        try {
            await AdminAPI.createInvoice(newInv);
        } catch (err) {
            console.warn("Backend create invoice fallback:", err);
        }

        setInvoices([newInv, ...invoices]);
        setShowCreateModal(false);

        Swal.fire({
            icon: 'success',
            title: 'Invoice Issued',
            text: `Invoice #${newInv.invoice_number} generated for ${newInv.member_name}`,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    const handleMarkPaid = (inv) => {
        setInvoices(invoices.map(i =>
            i.id === inv.id ? { ...i, status: 'paid', paid_amount: i.total_amount, balance_due: 0 } : i
        ));
        Swal.fire({
            icon: 'success',
            title: 'Payment Recorded',
            text: `Invoice #${inv.invoice_number} marked as fully settled.`,
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    const filtered = invoices.filter(inv => {
        const matchesSearch = inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
            inv.member_name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalInvoiced = invoices.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
    const totalCollected = invoices.reduce((acc, curr) => acc + (Number(curr.paid_amount) || 0), 0);
    const totalOutstanding = totalInvoiced - totalCollected;
    const overdueCount = invoices.filter(i => i.status === 'overdue').length;

    return (
        <div className="flex flex-col gap-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <FileText className="text-emerald-600" size={24} />
                        Invoices & Member Billing
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
                        MMS Golf Club • Accounts Receivable, Dues, Tabs & Tournament Billing
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition shadow-sm active:scale-95"
                    >
                        <Plus size={14} strokeWidth={3} />
                        Create Invoice
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Total Invoiced</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                        KES {totalInvoiced.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">All Dues Billed</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block mb-1">Total Collected</span>
                    <span className="text-2xl font-black text-emerald-600 leading-none">
                        KES {totalCollected.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">Settled Payments</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block mb-1">Outstanding Balance</span>
                    <span className="text-2xl font-black text-amber-500 leading-none">
                        KES {totalOutstanding.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">Accounts Receivable</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 block mb-1">Overdue Invoices</span>
                    <span className="text-2xl font-black text-rose-500 leading-none">{overdueCount}</span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">Past Due Date</span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/60 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 max-w-sm w-full">
                    <Search size={15} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search invoice #, member name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs text-slate-800 dark:text-white placeholder-slate-400 w-full"
                    />
                </div>

                <div className="flex flex-wrap bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition ${statusFilter === 'all' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        All ({invoices.length})
                    </button>
                    <button
                        onClick={() => setStatusFilter('paid')}
                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition ${statusFilter === 'paid' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        Paid
                    </button>
                    <button
                        onClick={() => setStatusFilter('sent')}
                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition ${statusFilter === 'sent' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        Sent
                    </button>
                    <button
                        onClick={() => setStatusFilter('overdue')}
                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition ${statusFilter === 'overdue' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        Overdue ({overdueCount})
                    </button>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-white/5 text-[9px] font-black uppercase tracking-wider text-slate-400">
                                <th className="p-3.5 pl-5">Invoice #</th>
                                <th className="p-3.5">Member</th>
                                <th className="p-3.5">Invoice Date</th>
                                <th className="p-3.5">Due Date</th>
                                <th className="p-3.5 text-right">Amount</th>
                                <th className="p-3.5 text-right">Balance Due</th>
                                <th className="p-3.5 text-center">Status</th>
                                <th className="p-3.5 pr-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                            {filtered.map((inv) => {
                                const isPaid = inv.status === 'paid';
                                return (
                                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                                        <td className="p-3.5 pl-5 font-black text-emerald-600 font-mono text-[11px]">
                                            {inv.invoice_number}
                                        </td>
                                        <td className="p-3.5">
                                            <div className="font-black text-slate-900 dark:text-white">
                                                {inv.member_name}
                                            </div>
                                            <span className="text-[10px] text-slate-400">{inv.member_number || 'Member'}</span>
                                        </td>
                                        <td className="p-3.5 text-slate-500 font-medium">
                                            {inv.invoice_date}
                                        </td>
                                        <td className="p-3.5 text-slate-500 font-medium">
                                            {inv.due_date}
                                        </td>
                                        <td className="p-3.5 text-right font-black text-slate-900 dark:text-white">
                                            KES {Number(inv.total_amount).toLocaleString()}
                                        </td>
                                        <td className="p-3.5 text-right font-bold">
                                            <span className={inv.balance_due > 0 ? 'text-rose-600' : 'text-slate-400'}>
                                                KES {Number(inv.balance_due || 0).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                isPaid
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                    : inv.status === 'overdue'
                                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                                            }`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="p-3.5 pr-5 text-right space-x-1.5">
                                            <button
                                                onClick={() => setSelectedInvoice(inv)}
                                                className="p-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg text-slate-600 dark:text-slate-300"
                                                title="View / Print Invoice"
                                            >
                                                <Eye size={13} />
                                            </button>
                                            {!isPaid && (
                                                <button
                                                    onClick={() => handleMarkPaid(inv)}
                                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                                                    title="Record Full Payment"
                                                >
                                                    Mark Paid
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Invoice Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 dark:border-white/10 my-8 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <h3 className="text-base font-serif font-black text-slate-900 dark:text-white">
                                Create Member Invoice
                            </h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveInvoice} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Member Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Alex Metto"
                                        value={createForm.member_name}
                                        onChange={(e) => setCreateForm({ ...createForm, member_name: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Member Number
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="MMS-0042"
                                        value={createForm.member_number}
                                        onChange={(e) => setCreateForm({ ...createForm, member_number: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Invoice Date
                                    </label>
                                    <input
                                        type="date"
                                        value={createForm.invoice_date}
                                        onChange={(e) => setCreateForm({ ...createForm, invoice_date: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={createForm.due_date}
                                        onChange={(e) => setCreateForm({ ...createForm, due_date: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Line Items</span>
                                    <button
                                        type="button"
                                        onClick={handleAddItem}
                                        className="text-xs font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                    >
                                        <Plus size={12} strokeWidth={3} /> Add Item
                                    </button>
                                </div>

                                {createForm.items.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600">
                                        <div className="col-span-6">
                                            <input
                                                type="text"
                                                required
                                                placeholder="Description..."
                                                value={item.description}
                                                onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-white outline-none"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input
                                                type="number"
                                                min="1"
                                                placeholder="Qty"
                                                value={item.qty}
                                                onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 rounded-lg text-xs text-center font-bold text-slate-800 dark:text-white outline-none"
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <input
                                                type="number"
                                                placeholder="Rate"
                                                value={item.unit_price}
                                                onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 rounded-lg text-xs text-right font-bold text-slate-800 dark:text-white outline-none"
                                            />
                                        </div>
                                        <div className="col-span-1 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(idx)}
                                                className="text-slate-400 hover:text-rose-500"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total Bar */}
                            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex justify-between items-center text-xs">
                                <span className="font-bold text-emerald-900 dark:text-emerald-300">Invoice Total:</span>
                                <span className="font-black text-lg text-emerald-700 dark:text-emerald-400">
                                    KES {totalCalculated.toLocaleString()}
                                </span>
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95"
                                >
                                    Generate & Issue Invoice
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View / Print Invoice Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 dark:border-white/10 p-6 space-y-6 my-8">
                        {/* Letterhead */}
                        <div className="flex justify-between items-start border-b border-slate-100 dark:border-white/5 pb-4">
                            <div>
                                <h2 className="font-serif font-black text-xl text-slate-900 dark:text-white">
                                    MMS GOLF CLUB
                                </h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                    Official Tax Invoice & Receipt
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Invoice Meta */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <span className="text-[9px] uppercase font-bold text-slate-400 block">Billed To</span>
                                <span className="font-black text-slate-900 dark:text-white block mt-0.5">{selectedInvoice.member_name}</span>
                                <span className="text-slate-500 block">{selectedInvoice.member_number}</span>
                                <span className="text-slate-400 block">{selectedInvoice.email}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] uppercase font-bold text-slate-400 block">Invoice Number</span>
                                <span className="font-mono font-black text-emerald-600 text-sm block mt-0.5">{selectedInvoice.invoice_number}</span>
                                <span className="text-slate-500 block">Date: {selectedInvoice.invoice_date}</span>
                                <span className="text-slate-500 block">Due: {selectedInvoice.due_date}</span>
                            </div>
                        </div>

                        {/* Itemized Table */}
                        <div className="border border-slate-100 dark:border-white/5 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-[9px] uppercase font-black text-slate-400 border-b border-slate-100 dark:border-white/5">
                                    <tr>
                                        <th className="p-3">Item Description</th>
                                        <th className="p-3 text-center">Qty</th>
                                        <th className="p-3 text-right">Rate</th>
                                        <th className="p-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {selectedInvoice.items && selectedInvoice.items.map((it, idx) => (
                                        <tr key={idx}>
                                            <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{it.description}</td>
                                            <td className="p-3 text-center text-slate-500">{it.qty}</td>
                                            <td className="p-3 text-right text-slate-600 dark:text-slate-300">KES {Number(it.unit_price).toLocaleString()}</td>
                                            <td className="p-3 text-right font-black text-slate-900 dark:text-white">KES {Number(it.amount).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Totals */}
                        <div className="flex justify-end text-xs space-y-1">
                            <div className="w-56 space-y-1.5">
                                <div className="flex justify-between text-slate-500">
                                    <span>Subtotal:</span>
                                    <span className="font-bold">KES {Number(selectedInvoice.total_amount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Amount Paid:</span>
                                    <span className="font-bold text-emerald-600">KES {Number(selectedInvoice.paid_amount || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1.5 text-sm font-black text-slate-900 dark:text-white">
                                    <span>Balance Due:</span>
                                    <span className={selectedInvoice.balance_due > 0 ? 'text-rose-600' : 'text-slate-400'}>
                                        KES {Number(selectedInvoice.balance_due || 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                selectedInvoice.status === 'paid'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                            }`}>
                                Payment Status: {selectedInvoice.status}
                            </span>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.print()}
                                    className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                                >
                                    <Printer size={13} /> Print
                                </button>
                                <button
                                    onClick={() => setSelectedInvoice(null)}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoicesPage;
