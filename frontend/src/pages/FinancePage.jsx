import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, PieChart, BarChart2 } from 'lucide-react';
import AdminAPI from '../services/api';

const FinancePage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinance();
  }, []);

  const fetchFinance = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getFinanceSummary();
      if (res.data) setSummary(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Finance Overview</h1>
        <p className="text-xs text-slate-500 font-medium">Income statement, department revenues, accounts receivable & expenses</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Total Revenue</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            KES {summary ? Number(summary.total_revenue).toLocaleString() : 0}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Total Expenses</div>
          <div className="text-2xl font-black text-rose-600 mt-1">
            KES {summary ? Number(summary.total_expenses).toLocaleString() : 0}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Net Income</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            KES {summary ? Number(summary.net_income).toLocaleString() : 0}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Accounts Receivable</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            KES {summary ? Number(summary.total_outstanding).toLocaleString() : 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
