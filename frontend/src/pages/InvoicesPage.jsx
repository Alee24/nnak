import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, Printer, CheckCircle, AlertCircle, Clock, DollarSign } from 'lucide-react';
import Swal from 'sweetalert2';
import AdminAPI from '../services/api';
import { useTheme } from '../context/ThemeContext';

const InvoicesPage = () => {
  const { theme } = useTheme();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, [search, statusFilter]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getInvoices({ search, status: statusFilter });
      if (res.data) setInvoices(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (st) => {
    switch (st) {
      case 'paid': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'overdue': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400';
      case 'partial': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Invoices & Billing</h1>
          <p className="text-xs text-slate-500 font-medium">Manage member invoices, statements, and receipts</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
        >
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Total Invoiced</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            KES {invoices.reduce((a, b) => a + Number(b.total_amount || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Paid Amount</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            KES {invoices.reduce((a, b) => a + Number(b.amount_paid || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Outstanding Balance</div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            KES {invoices.reduce((a, b) => a + Number(b.balance || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Overdue Count</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {invoices.filter(i => i.status === 'overdue').length}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice number, member..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No invoices found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Member</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Total (KES)</th>
                  <th className="p-4">Balance</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{inv.invoice_number}</td>
                    <td className="p-4">{inv.first_name} {inv.last_name} ({inv.membership_number})</td>
                    <td className="p-4">{inv.invoice_date}</td>
                    <td className="p-4">{inv.due_date}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">KES {Number(inv.total_amount).toLocaleString()}</td>
                    <td className="p-4 font-bold text-rose-600">KES {Number(inv.balance).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusColor(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                      >
                        View / Pay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicesPage;
