import React, { useState, useEffect } from 'react';
import { FileText, Printer, Download, Search } from 'lucide-react';
import AdminAPI from '../services/api';

const MemberStatementPage = () => {
  const [statement, setStatement] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Member Account Statement</h1>
          <p className="text-xs text-slate-500 font-medium">Complete record of debits, credits, and current balance</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl">
          <Printer size={16} /> Print Statement
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
        <div className="flex justify-between border-b pb-4 border-slate-100 dark:border-white/5 text-xs">
          <div>
            <div className="font-black text-sm uppercase text-slate-900 dark:text-white">MMS GOLF CLUB</div>
            <div className="text-slate-400">Statement Date: {new Date().toLocaleDateString()}</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-slate-800 dark:text-slate-200">Current Balance Due</div>
            <div className="text-xl font-black text-rose-600">KES 0.00</div>
          </div>
        </div>

        <div className="text-center py-12 text-xs text-slate-400">
          Account fully settled. No pending balance on statement.
        </div>
      </div>
    </div>
  );
};

export default MemberStatementPage;
