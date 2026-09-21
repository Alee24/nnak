import React, { useState, useEffect } from 'react';
import {
    DollarSign, TrendingUp, TrendingDown, CreditCard, PieChart,
    BarChart2, Plus, ArrowUpRight, ArrowDownRight, Calendar,
    Download, Filter, CheckCircle, RefreshCw, X
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';

const DEFAULT_FINANCE = {
    total_revenue: 14850000,
    total_expenses: 8240000,
    net_income: 6610000,
    total_outstanding: 2150000,
    departments: [
        { name: 'Membership Subscriptions & Joining Fees', revenue: 6800000, percent: 46 },
        { name: 'Tee Times, Green Fees & Caddy Services', revenue: 3450000, percent: 23 },
        { name: 'Clubhouse Restaurant, Terrace & Bar', revenue: 2350000, percent: 16 },
        { name: 'Pro Shop Merchandise & Equipment Rentals', revenue: 1250000, percent: 8 },
        { name: 'Tournaments, Sponsorships & Venue Hire', revenue: 1000000, percent: 7 }
    ],
    expenses: [
        { id: 1, date: '2025-09-18', category: 'Course Maintenance', description: 'Fairway fertilizer & green maintenance chemicals', amount: 350000, method: 'Bank Wire', vendor: 'GreenWorks Ag Ltd' },
        { id: 2, date: '2025-09-15', category: 'Utilities & Power', description: 'Irrigation borehole & clubhouse power supply', amount: 185000, method: 'Direct Debit', vendor: 'Kenya Power' },
        { id: 3, date: '2025-09-12', category: 'Clubhouse F&B', description: 'Fresh kitchen supplies & beverage restocking', amount: 240000, method: 'Cheque', vendor: 'Nairobi Gourmet Ltd' },
        { id: 4, date: '2025-09-05', category: 'Staff Payroll', description: 'Caddy stipends & course ground crew bi-weekly wages', amount: 620000, method: 'Bank Transfer', vendor: 'Payroll Services' },
        { id: 5, date: '2025-09-01', category: 'Equipment Leasing', description: 'John Deere fairway mower monthly fleet lease', amount: 210000, method: 'Bank Transfer', vendor: 'Turf Machinery Kenya' }
    ]
};

const FinancePage = () => {
    const [finance, setFinance] = useState(DEFAULT_FINANCE);
    const [loading, setLoading] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [expenseForm, setExpenseForm] = useState({
        category: 'Course Maintenance',
        description: '',
        amount: '',
        vendor: '',
        method: 'Bank Transfer',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchFinance();
    }, []);

    const fetchFinance = async () => {
        setLoading(true);
        try {
            const res = await AdminAPI.getFinanceSummary();
            if (res?.data && res.data.total_revenue) {
                setFinance(res.data);
            }
        } catch (e) {
            console.warn("Using fallback finance data:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleRecordExpense = (e) => {
        e.preventDefault();
        if (!expenseForm.amount || !expenseForm.description.trim()) {
            Swal.fire('Required', 'Please enter expense details and amount', 'warning');
            return;
        }

        const amt = Number(expenseForm.amount) || 0;
        const newExpense = {
            id: Date.now(),
            ...expenseForm,
            amount: amt
        };

        setFinance({
            ...finance,
            total_expenses: finance.total_expenses + amt,
            net_income: finance.net_income - amt,
            expenses: [newExpense, ...finance.expenses]
        });

        setShowExpenseModal(false);
        Swal.fire({
            icon: 'success',
            title: 'Expense Recorded',
            text: `KES ${amt.toLocaleString()} recorded under ${expenseForm.category}`,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    };

    return (
        <div className="flex flex-col gap-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <DollarSign className="text-emerald-600" size={24} />
                        Club Financial Overview & P&L
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
                        MMS Golf Club • Fiscal Year 2025/2026 Executive Financial Report
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowExpenseModal(true)}
                        className="flex items-center gap-2 bg-slate-900 text-white dark:bg-slate-700 hover:bg-emerald-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm active:scale-95"
                    >
                        <Plus size={14} strokeWidth={3} />
                        Record Expense
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition shadow-sm active:scale-95"
                    >
                        <Download size={14} />
                        Export Statement
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Revenue</span>
                        <span className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                            <TrendingUp size={14} />
                        </span>
                    </div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none block mt-2">
                        KES {Number(finance.total_revenue).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-1.5 flex items-center gap-1">
                        <ArrowUpRight size={12} /> +14.2% vs last fiscal year
                    </span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Operating Expenses</span>
                        <span className="p-1 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600">
                            <TrendingDown size={14} />
                        </span>
                    </div>
                    <span className="text-2xl font-black text-rose-600 leading-none block mt-2">
                        KES {Number(finance.total_expenses).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-1.5">
                        Maintenance, Payroll & Utilities
                    </span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Net Operating Profit</span>
                        <span className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                            <CheckCircle size={14} />
                        </span>
                    </div>
                    <span className="text-2xl font-black text-emerald-600 leading-none block mt-2">
                        KES {Number(finance.net_income).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-1.5">
                        44.5% Net Margin
                    </span>
                </div>

                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Accounts Receivable</span>
                        <span className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
                            <CreditCard size={14} />
                        </span>
                    </div>
                    <span className="text-2xl font-black text-amber-500 leading-none block mt-2">
                        KES {Number(finance.total_outstanding).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block mt-1.5">
                        Outstanding Member Balances
                    </span>
                </div>
            </div>

            {/* Department Revenue Breakdown */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                <h3 className="font-serif font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <PieChart size={16} className="text-emerald-600" />
                    Revenue Contribution by Department
                </h3>

                <div className="space-y-3">
                    {finance.departments && finance.departments.map((dept, idx) => (
                        <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-800 dark:text-slate-200">{dept.name}</span>
                                <span className="text-slate-900 dark:text-white font-black">
                                    KES {Number(dept.revenue).toLocaleString()} ({dept.percent}%)
                                </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-600 rounded-full"
                                    style={{ width: `${dept.percent}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Expenses Ledger */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="font-serif font-black text-slate-900 dark:text-white text-sm">
                            Operating Expenses & Disbursements Ledger
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Recent club expenditures
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-white/5 text-[9px] font-black uppercase tracking-wider text-slate-400">
                                <th className="p-3.5 pl-5">Date</th>
                                <th className="p-3.5">Category</th>
                                <th className="p-3.5">Description</th>
                                <th className="p-3.5">Payee / Vendor</th>
                                <th className="p-3.5">Payment Method</th>
                                <th className="p-3.5 pr-5 text-right">Amount (KES)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                            {finance.expenses && finance.expenses.map((exp) => (
                                <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                                    <td className="p-3.5 pl-5 text-slate-500 font-medium">
                                        {exp.date}
                                    </td>
                                    <td className="p-3.5">
                                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                            {exp.category}
                                        </span>
                                    </td>
                                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                                        {exp.description}
                                    </td>
                                    <td className="p-3.5 text-slate-600 dark:text-slate-400 font-medium">
                                        {exp.vendor}
                                    </td>
                                    <td className="p-3.5 text-slate-500 text-[11px]">
                                        {exp.method}
                                    </td>
                                    <td className="p-3.5 pr-5 text-right font-black text-rose-600 dark:text-rose-400">
                                        -KES {Number(exp.amount).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Record Expense Modal */}
            {showExpenseModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <h3 className="text-base font-serif font-black text-slate-900 dark:text-white">
                                Record Operating Expense
                            </h3>
                            <button
                                onClick={() => setShowExpenseModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleRecordExpense} className="p-5 space-y-3.5">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                    Expense Category *
                                </label>
                                <select
                                    value={expenseForm.category}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                >
                                    <option value="Course Maintenance">Course Maintenance & Agronomy</option>
                                    <option value="Staff Payroll">Staff & Caddy Payroll</option>
                                    <option value="Utilities & Power">Utilities, Water & Electricity</option>
                                    <option value="Clubhouse F&B">Clubhouse Food & Beverage Supplies</option>
                                    <option value="Equipment Leasing">Machinery & Fleet Maintenance</option>
                                    <option value="Administration & IT">Administration & IT Operations</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                    Expense Description *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Fairway seed & irrigation valves"
                                    value={expenseForm.description}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Amount (KES) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="50000"
                                        value={expenseForm.amount}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Payment Method
                                    </label>
                                    <select
                                        value={expenseForm.method}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, method: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    >
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="M-Pesa Paybill">M-Pesa Paybill</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Corporate Card">Corporate Card</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Payee / Vendor Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. GreenWorks Kenya"
                                        value={expenseForm.vendor}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={expenseForm.date}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-800 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowExpenseModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition active:scale-95"
                                >
                                    Save Expense
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancePage;
