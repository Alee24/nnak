import React, { useEffect, useState, useCallback } from 'react';
import {
    DollarSign, Search, Filter, Download,
    ChevronLeft, ChevronRight, CheckCircle2,
    XCircle, Clock, MoreHorizontal,
    CreditCard, Smartphone, ShieldCheck,
    ArrowUpRight, History, Printer, X, FileText
} from 'lucide-react';
import AdminAPI from '../services/api';
import ReceiptPrintable from '../components/ReceiptPrintable';
import { clsx } from 'clsx';
import Swal from 'sweetalert2';

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 0 });
    const [filters, setFilters] = useState({
        status: '',
        type: '',
        search: ''
    });
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        failed: 0
    });

    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [fetchingDetails, setFetchingDetails] = useState(false);
    const [branding, setBranding] = useState(null);

    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

    const fetchTransactions = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = isAdmin
                ? await AdminAPI.getTransactions(
                    page,
                    pagination.limit,
                    filters.status,
                    filters.type,
                    filters.search
                )
                : await AdminAPI.getMemberPayments('me'); // Member fetches their own

            if (response.payments) {
                setTransactions(response.payments);
                setPagination(response.pagination);

                // Calculate mini-stats from the current view or ideally from a separate stats API
                // For now, let's just use the current view's totals if pagination isn't too large
                // In a real app, you'd want a dedicated endpoint for transaction stats
            }
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Failed to load transactions'
            });
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.limit]);

    const fetchBranding = useCallback(async () => {
        try {
            const response = await AdminAPI.getSettings();
            if (response.success) setBranding(response.settings);
        } catch (error) {
            console.error("Failed to fetch branding:", error);
        }
    }, []);

    useEffect(() => {
        fetchTransactions(1);
        fetchBranding();
    }, [fetchTransactions, fetchBranding]);

    const handleRowClick = async (id) => {
        setFetchingDetails(true);
        setSelectedTransaction(null);
        setIsReceiptModalOpen(true);
        try {
            const response = await AdminAPI.getTransaction(id);
            if (response.payment) {
                setSelectedTransaction(response.payment);
            }
        } catch (error) {
            console.error("Failed to fetch transaction details:", error);
            Swal.fire('Error', 'Failed to load receipt details', 'error');
            setIsReceiptModalOpen(false);
        } finally {
            setFetchingDetails(false);
        }
    };

    const handlePrint = () => {
        const printContent = document.getElementById('printable-receipt');
        if (!printContent) return;

        const originalBody = document.body.innerHTML;
        const printSection = printContent.innerHTML;

        // Custom Styles for printing
        const style = document.createElement('style');
        style.innerHTML = `
            @media print {
                body * { visibility: hidden; }
                #print-wrapper, #print-wrapper * { visibility: visible; }
                #print-wrapper { position: absolute; left: 0; top: 0; width: 100%; }
                .no-print { display: none !important; }
            }
        `;
        document.head.appendChild(style);

        const printWrapper = document.createElement('div');
        printWrapper.id = 'print-wrapper';
        printWrapper.innerHTML = printSection;
        document.body.appendChild(printWrapper);

        window.print();

        document.body.removeChild(printWrapper);
        document.head.removeChild(style);
        window.location.reload(); // To restore React state/events if needed, or better approach:
    };

    const exportToCSV = () => {
        const headers = ["Date", "Invoice", "Reference", "Amount", "Currency", "Gateway", "Status", "Type"];
        const rows = transactions.map(t => [
            new Date(t.payment_date || t.created_at).toLocaleDateString(),
            t.invoice_number,
            t.transaction_reference,
            t.amount,
            t.currency,
            t.payment_method,
            t.payment_status,
            t.payment_type
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `NNAK_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'failed':
                return 'bg-rose-50 text-rose-700 border-rose-100';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return <CheckCircle2 size={12} />;
            case 'pending':
                return <Clock size={12} />;
            case 'failed':
                return <XCircle size={12} />;
            default:
                return null;
        }
    };

    const getMethodIcon = (method) => {
        const m = method?.toLowerCase();
        if (m === 'mpesa' || m === 'm-pesa') return <Smartphone size={14} className="text-emerald-600" />;
        if (m === 'paypal') return <ShieldCheck size={14} className="text-blue-600" />;
        if (m === 'stripe' || m === 'card' || m === 'visa') return <CreditCard size={14} className="text-indigo-600" />;
        if (m === 'import') return <History size={14} className="text-slate-600" />;
        return <DollarSign size={14} className="text-slate-400" />;
    };

    return (
        <div className="flex flex-col h-full gap-4 animate-fade-in font-inter pb-8">
            {/* Header */}
            <div className="flex justify-between items-end px-1">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Ledger</h1>
                    <p className="text-xs text-[#E11D48] font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                        <span className="w-4 h-px bg-[#E11D48]/30"></span>
                        Real-time Transaction Monitoring
                    </p>
                </div>
                <button
                    onClick={exportToCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-md hover:bg-[#E11D48] transition-all active:scale-95 group"
                >
                    <Download size={12} strokeWidth={2.5} />
                    <span>Export Ledger</span>
                </button>
            </div>

            {/* Quick Stats Grid */}
            {isAdmin && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-1">
                    <StatCard label="Total Revenue" value={`KES ${transactions.reduce((acc, curr) => acc + parseFloat(curr.amount), 0).toLocaleString()}`} icon={DollarSign} color="#10b981" />
                    <StatCard label="Completed" value={transactions.filter(t => t.payment_status === 'completed').length} icon={CheckCircle2} color="#059669" />
                    <StatCard label="Pending" value={transactions.filter(t => t.payment_status === 'pending').length} icon={Clock} color="#f59e0b" />
                    <StatCard label="Failed" value={transactions.filter(t => t.payment_status === 'failed').length} icon={XCircle} color="#e11d48" />
                </div>
            )}

            {/* Filter Bar - High Density */}
            <div className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-3 items-center mx-1">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search by ID, Invoice, or Member..."
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500/50 transition-all font-inter"
                    />
                </div>

                <div className="flex gap-2">
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black uppercase tracking-widest text-slate-600 focus:outline-none transition-all cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>

                    <select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black uppercase tracking-widest text-slate-600 focus:outline-none transition-all cursor-pointer"
                    >
                        <option value="">All Types</option>
                        <option value="membership">Membership</option>
                        <option value="event">Event</option>
                    </select>
                </div>
            </div>

            {/* Transactions Table - Professional Multi-Density */}
            <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col mx-1">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white z-10 border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Invoice / Reference</th>
                                <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Beneficiary</th>
                                <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Gateway</th>
                                <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Date/Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(10).fill(0).map((_, i) => <SkeletonRow key={i} />)
                            ) : transactions.length > 0 ? (
                                transactions.map((t) => (
                                    <tr
                                        key={t.id}
                                        className="hover:bg-slate-50 transition-colors group cursor-pointer active:bg-slate-100"
                                        onClick={() => handleRowClick(t.id)}
                                    >
                                        <td className="px-4 py-2.5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-extrabold text-slate-900 leading-tight">{t.invoice_number || 'N/A'}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tight">{t.transaction_reference || 'REF-' + t.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-xs font-black text-slate-400 uppercase shadow-inner border border-slate-100/50">
                                                    {t.first_name?.[0]}{t.last_name?.[0]}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-800 leading-none">{t.first_name} {t.last_name}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold mt-1 leading-none">{t.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <span className="text-xs font-black text-slate-900">{t.currency} {parseFloat(t.amount).toLocaleString()}</span>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5 opacity-60">
                                                {t.payment_type}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center border border-slate-100 shadow-xs">
                                                    {getMethodIcon(t.payment_method)}
                                                </div>
                                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                                    {t.payment_method}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className={clsx(
                                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-widest",
                                                getStatusStyle(t.payment_status)
                                            )}>
                                                {getStatusIcon(t.payment_status)}
                                                {t.payment_status}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-bold text-slate-800 leading-none">
                                                    {new Date(t.payment_date || t.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold mt-1 leading-none">
                                                    {new Date(t.payment_date || t.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-4 py-16 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200">
                                                <DollarSign size={24} />
                                            </div>
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">No Transactions</h3>
                                            <p className="text-xs text-slate-400 max-w-[150px] leading-relaxed">Adjust filters to find records.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination - Compact */}
                <div className="mt-auto border-t border-slate-50 p-3 flex items-center justify-between bg-slate-50/30">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Total Records: <span className="text-slate-900">{pagination.total}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={pagination.page === 1 || loading}
                            onClick={() => fetchTransactions(pagination.page - 1)}
                            className="p-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none shadow-sm transition-all"
                        >
                            <ChevronLeft size={12} strokeWidth={3} />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                let pageNum;
                                if (pagination.pages <= 5) pageNum = i + 1;
                                else if (pagination.page <= 3) pageNum = i + 1;
                                else if (pagination.page >= pagination.pages - 2) pageNum = pagination.pages - 4 + i;
                                else pageNum = pagination.page - 2 + i;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => fetchTransactions(pageNum)}
                                        className={clsx(
                                            "w-7 h-7 rounded-lg text-xs font-black transition-all",
                                            pagination.page === pageNum
                                                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-105"
                                                : "bg-transparent text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            disabled={pagination.page === pagination.pages || loading}
                            onClick={() => fetchTransactions(pagination.page + 1)}
                            className="p-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none shadow-sm transition-all"
                        >
                            <ChevronRight size={12} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
            {/* Receipt Modal */}
            {isReceiptModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in max-h-[95vh] flex flex-col">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-2">
                                <FileText size={18} className="text-slate-400" />
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Transaction Receipt</h3>
                            </div>
                            <button onClick={() => setIsReceiptModalOpen(false)} className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/30">
                            {fetchingDetails ? (
                                <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Retreiving Secure Data...</span>
                                </div>
                            ) : selectedTransaction ? (
                                <div id="printable-area">
                                    <ReceiptPrintable transaction={selectedTransaction} branding={branding} />
                                </div>
                            ) : (
                                <div className="py-20 text-center text-slate-400 text-xs font-medium italic">Failed to load transaction details.</div>
                            )}
                        </div>

                        {selectedTransaction && (
                            <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3 px-6 no-print">
                                <button
                                    onClick={() => setIsReceiptModalOpen(false)}
                                    className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-[#E11D48] transition-all active:scale-95"
                                >
                                    <Printer size={14} /> Print Receipt
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
        <div className="absolute top-0 right-0 w-16 h-16 rounded-full -mr-8 -mt-8 opacity-5" style={{ backgroundColor: color }}></div>
        <div className="relative z-10 flex flex-col gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm border border-white/10`} style={{ backgroundColor: color }}>
                <Icon size={16} strokeWidth={2.5} />
            </div>
            <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1.5 leading-none">{value}</h3>
            </div>
        </div>
    </div>
);

const SkeletonRow = () => (
    <tr className="animate-pulse">
        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-lg w-24"></div><div className="h-3 bg-slate-50 rounded-lg w-32 mt-2"></div></td>
        <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-slate-100"></div><div className="flex flex-col gap-2"><div className="h-3 bg-slate-100 rounded-lg w-24"></div><div className="h-2 bg-slate-50 rounded-lg w-32"></div></div></div></td>
        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded-lg w-16"></div><div className="h-2 bg-slate-50 rounded-lg w-12 mt-2"></div></td>
        <td className="px-6 py-4"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-slate-100"></div><div className="h-3 bg-slate-50 rounded-lg w-16"></div></div></td>
        <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded-full w-20"></div></td>
        <td className="px-6 py-4"><div className="h-3 bg-slate-100 rounded-lg w-20 ml-auto"></div></td>
    </tr>
);

export default TransactionsPage;
