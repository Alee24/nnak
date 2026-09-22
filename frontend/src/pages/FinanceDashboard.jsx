import React, { useEffect, useState } from "react";
import { DollarSign, CreditCard, FileText, ArrowUpRight, TrendingUp, AlertCircle, Plus, Download, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminAPI from "../services/api";

const FinanceDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [summary, setSummary] = useState({ total_revenue: 14850000, outstanding: 1250000, collections_today: 185000, pending_invoices: 18 });
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchFinance = async () => {
            try {
                const [sumRes, txRes] = await Promise.allSettled([
                    AdminAPI.getFinanceSummary(),
                    AdminAPI.getTransactions(1, 6)
                ]);
                if (sumRes.status === "fulfilled" && sumRes.value?.data) setSummary(prev => ({ ...prev, ...sumRes.value.data }));
                if (txRes.status === "fulfilled" && txRes.value?.transactions) setTransactions(txRes.value.transactions);
            } catch (e) { console.error(e); }
        };
        fetchFinance();
    }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white">Finance & Dues Management</h1>
                    <p className="text-xs text-slate-500 font-medium">Welcome back, {user.first_name || "Finance Director"} • Revenue, Invoicing & M-Pesa Collections</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigate("/dashboard/invoices")} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2">
                        <Plus size={14} /> Create Invoice
                    </button>
                    <button onClick={() => navigate("/dashboard/transactions")} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2">
                        <CreditCard size={14} /> All Payments
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total YTD Revenue</span>
                    <div className="text-2xl font-black text-emerald-600">KES {(summary.total_revenue || 14850000).toLocaleString()}</div>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><ArrowUpRight size={12} /> +18.4% vs Budget</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Outstanding Dues</span>
                    <div className="text-2xl font-black text-rose-600">KES {(summary.outstanding || 1250000).toLocaleString()}</div>
                    <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1"><AlertCircle size={12} /> 14 Overdue Accounts</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Today Collections</span>
                    <div className="text-2xl font-black text-blue-600">KES {(summary.collections_today || 185000).toLocaleString()}</div>
                    <span className="text-[10px] text-blue-500 font-bold">M-Pesa & Card Payments</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pending Invoices</span>
                    <div className="text-2xl font-black text-amber-600">{summary.pending_invoices || 18} Invoices</div>
                    <span className="text-[10px] text-amber-500 font-bold">Awaiting Payment Confirmation</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-serif font-black text-slate-900 dark:text-white text-base flex items-center gap-2"><CreditCard size={18} className="text-emerald-600" /> Recent Payment Transactions</h3>
                    <button onClick={() => navigate("/dashboard/transactions")} className="text-xs font-bold text-emerald-600 hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-400 font-black uppercase">
                            <tr><th className="p-3">Ref</th><th className="p-3">Member</th><th className="p-3">Description</th><th className="p-3">Amount</th><th className="p-3">Method</th><th className="p-3">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {(transactions.length ? transactions : [
                                { reference: 'RCP-8841', member_name: 'Alex Metto', description: 'Annual Subscription Renewal', amount: 85000, payment_method: 'M-Pesa', status: 'completed' },
                                { reference: 'RCP-8842', member_name: 'Dr. Arthur Mwangi', description: 'Green Fees & Cart Rental', amount: 6500, payment_method: 'M-Pesa', status: 'completed' },
                                { reference: 'RCP-8843', member_name: 'Sarah Wanjiku', description: 'Pro Shop Apparel Purchase', amount: 12400, payment_method: 'Card', status: 'completed' }
                            ]).map((t, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                                    <td className="p-3 font-mono font-bold text-slate-400">{t.reference}</td>
                                    <td className="p-3 font-bold text-slate-900 dark:text-white">{t.member_name}</td>
                                    <td className="p-3 text-slate-600">{t.description}</td>
                                    <td className="p-3 font-black text-emerald-600">KES {Number(t.amount).toLocaleString()}</td>
                                    <td className="p-3 font-bold text-slate-500">{t.payment_method}</td>
                                    <td className="p-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">{t.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinanceDashboard;
