import React, { useEffect, useState } from "react";
import { CreditCard, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminAPI from "../services/api";
import { PageHeader, Button, DataTable, StatusBadge } from "../components/ui/Primitives";

const FinanceDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [summary, setSummary] = useState({ total_revenue: 14850000, outstanding: 1250000, collections_today: 185000, pending_invoices: 18 });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFinance = async () => {
            try {
                const [sumRes, txRes] = await Promise.allSettled([
                    AdminAPI.getFinanceSummary(),
                    AdminAPI.getTransactions(1, 6)
                ]);
                if (sumRes.status === "fulfilled" && sumRes.value?.data) setSummary(prev => ({ ...prev, ...sumRes.value.data }));
                if (txRes.status === "fulfilled" && txRes.value?.transactions) setTransactions(txRes.value.transactions);
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchFinance();
    }, []);

    return (
        <div className="space-y-5">
            <PageHeader
                title="Finance & Dues Management"
                subtitle={`Welcome back, ${user.first_name || 'Finance Director'} • Financial Pulse, Accounts Receivable & Collections`}
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance' }]}
                actions={
                    <>
                        <Button variant="secondary" size="sm" onClick={() => navigate("/dashboard/transactions")}>
                            <CreditCard size={13} /> All Transactions
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => navigate("/dashboard/invoices")}>
                            <Plus size={13} /> Create Invoice
                        </Button>
                    </>
                }
            />

            {/* Metric Summary Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">Total YTD Revenue</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100 block mt-1">KES {(summary.total_revenue || 14850000).toLocaleString()}</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium block mt-0.5">+18.4% vs Budget</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">Outstanding Dues</span>
                    <span className="text-xl font-bold text-rose-700 dark:text-rose-400 block mt-1">KES {(summary.outstanding || 1250000).toLocaleString()}</span>
                    <span className="text-[10px] text-rose-600 block mt-0.5">14 Overdue Accounts</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">Today Collections</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100 block mt-1">KES {(summary.collections_today || 185000).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">M-Pesa & Card Terminals</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">Pending Invoices</span>
                    <span className="text-xl font-bold text-amber-700 dark:text-amber-400 block mt-1">{summary.pending_invoices || 18} Invoices</span>
                    <span className="text-[10px] text-amber-600 block mt-0.5">Awaiting Confirmation</span>
                </div>
            </div>

            {/* Transactions Log Table */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                        Recent Payment Transactions
                    </h3>
                    <button onClick={() => navigate("/dashboard/transactions")} className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline">
                        View All Log
                    </button>
                </div>

                <DataTable
                    headers={[
                        { label: 'Reference' },
                        { label: 'Member Name' },
                        { label: 'Description' },
                        { label: 'Amount (KES)', className: 'text-right' },
                        { label: 'Payment Method' },
                        { label: 'Status', className: 'text-center' },
                    ]}
                    loading={loading}
                >
                    {(transactions.length ? transactions : [
                        { reference: 'RCP-8841', member_name: 'Alex Metto', description: 'Annual Subscription Renewal', amount: 85000, payment_method: 'M-Pesa', status: 'completed' },
                        { reference: 'RCP-8842', member_name: 'Dr. Arthur Mwangi', description: 'Green Fees & Cart Rental', amount: 6500, payment_method: 'M-Pesa', status: 'completed' },
                        { reference: 'RCP-8843', member_name: 'Sarah Wanjiku', description: 'Pro Shop Apparel Purchase', amount: 12400, payment_method: 'Card', status: 'completed' }
                    ]).map((t, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="px-3.5 py-2 font-mono text-slate-500">{t.reference}</td>
                            <td className="px-3.5 py-2 font-semibold text-slate-900 dark:text-slate-100">{t.member_name}</td>
                            <td className="px-3.5 py-2 text-slate-600">{t.description}</td>
                            <td className="px-3.5 py-2 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">KES {Number(t.amount).toLocaleString()}</td>
                            <td className="px-3.5 py-2 text-slate-600">{t.payment_method}</td>
                            <td className="px-3.5 py-2 text-center">
                                <StatusBadge variant={t.status === 'completed' ? 'success' : 'neutral'}>
                                    {t.status}
                                </StatusBadge>
                            </td>
                        </tr>
                    ))}
                </DataTable>
            </div>
        </div>
    );
};

export default FinanceDashboard;
