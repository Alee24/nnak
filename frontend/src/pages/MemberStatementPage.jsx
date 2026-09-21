import React, { useState, useEffect } from 'react';
import {
    FileText, Printer, Download, Search, Filter,
    User, Calendar, DollarSign, CheckCircle, ArrowUpRight,
    ArrowDownRight, CreditCard
} from 'lucide-react';
import AdminAPI from '../services/api';

const DEFAULT_MEMBERS = [
    { id: 1, name: 'Alex Metto', number: 'MMS-0042', email: 'alex.metto@mms.co.ke', tier: 'Full Member', balance: 0 },
    { id: 2, name: 'Dr. Arthur Mwangi', number: 'MMS-0015', email: 'arthur.mwangi@gmail.com', tier: 'Full Member', balance: 18500 },
    { id: 3, name: 'Sarah Wanjiku', number: 'MMS-0088', email: 'sarah.wanjiku@yahoo.com', tier: 'Lady Member', balance: 22000 },
    { id: 4, name: 'Kevin Omondi', number: 'MMS-0033', email: 'kevin.omondi@corp.co.ke', tier: 'Full Member', balance: 0 }
];

const DEFAULT_TRANSACTIONS = [
    { id: 1, date: '2025-09-01', ref: 'INV-2025-0842', description: 'Annual Golf Subscription 2025/2026', category: 'Dues', debit: 75000, credit: 0, balance: 75000 },
    { id: 2, date: '2025-09-01', ref: 'INV-2025-0842', description: 'Locker & Bag Storage Facility Fee', category: 'Facility', debit: 10000, credit: 0, balance: 85000 },
    { id: 3, date: '2025-09-03', ref: 'RCP-2025-0411', description: 'Payment via M-Pesa Paybill #884400', category: 'Payment', debit: 0, credit: 85000, balance: 0 },
    { id: 4, date: '2025-09-10', ref: 'TAB-2025-0199', description: 'Clubhouse Fairway Terrace Dining Tab', category: 'Dining', debit: 6500, credit: 0, balance: 6500 },
    { id: 5, date: '2025-09-12', ref: 'RCP-2025-0452', description: 'Credit Card Settlement at Reception', category: 'Payment', debit: 0, credit: 6500, balance: 0 },
    { id: 6, date: '2025-09-15', ref: 'ENT-2025-0088', description: 'Captains Invitational Trophy Entry Fee', category: 'Tournament', debit: 5000, credit: 0, balance: 5000 },
    { id: 7, date: '2025-09-16', ref: 'RCP-2025-0489', description: 'Online Bank Transfer Ref #BT88102', category: 'Payment', debit: 0, credit: 5000, balance: 0 }
];

const MemberStatementPage = () => {
    const [selectedMember, setSelectedMember] = useState(DEFAULT_MEMBERS[0]);
    const [transactions, setTransactions] = useState(DEFAULT_TRANSACTIONS);
    const [startDate, setStartDate] = useState('2025-09-01');
    const [endDate, setEndDate] = useState('2025-09-30');

    const totalDebits = transactions.reduce((acc, curr) => acc + (curr.debit || 0), 0);
    const totalCredits = transactions.reduce((acc, curr) => acc + (curr.credit || 0), 0);
    const currentBalance = totalDebits - totalCredits;

    return (
        <div className="flex flex-col gap-6 pb-12 animate-fade-in max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <FileText className="text-emerald-600" size={24} />
                        Member Account Statement
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">
                        MMS Golf Club • Itemized Ledger of Dues, Tabs, Green Fees & Settlements
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition shadow-sm active:scale-95"
                    >
                        <Printer size={14} />
                        Print Statement
                    </button>
                </div>
            </div>

            {/* Member Selector & Date Filter */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Account:</span>
                    <select
                        value={selectedMember.id}
                        onChange={(e) => {
                            const found = DEFAULT_MEMBERS.find(m => m.id === Number(e.target.value));
                            if (found) setSelectedMember(found);
                        }}
                        className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-white px-3 py-2 rounded-xl outline-none"
                    >
                        {DEFAULT_MEMBERS.map(m => (
                            <option key={m.id} value={m.id}>
                                {m.name} ({m.number}) — {m.tier}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 text-xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Period:</span>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-white px-2.5 py-1.5 rounded-xl outline-none"
                    />
                    <span className="text-slate-400 font-bold">to</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-white px-2.5 py-1.5 rounded-xl outline-none"
                    />
                </div>
            </div>

            {/* Statement Container */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
                {/* Statement Header Letterhead */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-100 dark:border-white/5 gap-4">
                    <div>
                        <h2 className="font-serif font-black text-xl text-slate-900 dark:text-white tracking-tight">
                            MMS GOLF CLUB
                        </h2>
                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-wider mt-0.5">
                            Official Statement of Account
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            P.O. Box 40100, Nairobi, Kenya • accounts@mmsgolfclub.co.ke
                        </p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-white/5 text-right min-w-[200px]">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                            Current Balance
                        </span>
                        <span className={`text-2xl font-black block mt-0.5 ${currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            KES {currentBalance.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                            {currentBalance === 0 ? 'Account Fully Settled' : 'Payment Due Within 14 Days'}
                        </span>
                    </div>
                </div>

                {/* Member Info Card */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-700/40 rounded-xl text-xs">
                    <div>
                        <span className="text-[9px] font-black uppercase text-slate-400 block">Member Name</span>
                        <span className="font-bold text-slate-900 dark:text-white block mt-0.5">{selectedMember.name}</span>
                    </div>
                    <div>
                        <span className="text-[9px] font-black uppercase text-slate-400 block">Member Number</span>
                        <span className="font-mono font-bold text-emerald-600 block mt-0.5">{selectedMember.number}</span>
                    </div>
                    <div>
                        <span className="text-[9px] font-black uppercase text-slate-400 block">Membership Tier</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{selectedMember.tier}</span>
                    </div>
                    <div>
                        <span className="text-[9px] font-black uppercase text-slate-400 block">Statement Date</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">{new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Financial Overview Cards */}
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                        <span className="text-[9px] font-black uppercase text-slate-400 block">Total Debits (Charges)</span>
                        <span className="text-base font-black text-slate-900 dark:text-white mt-1 block">
                            KES {totalDebits.toLocaleString()}
                        </span>
                    </div>
                    <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl">
                        <span className="text-[9px] font-black uppercase text-emerald-700 dark:text-emerald-400 block">Total Payments Received</span>
                        <span className="text-base font-black text-emerald-600 mt-1 block">
                            KES {totalCredits.toLocaleString()}
                        </span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                        <span className="text-[9px] font-black uppercase text-slate-400 block">Closing Balance</span>
                        <span className={`text-base font-black mt-1 block ${currentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            KES {currentBalance.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Transaction Ledger Table */}
                <div className="border border-slate-100 dark:border-white/5 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-700/60 text-[9px] font-black uppercase tracking-wider text-slate-400">
                                    <th className="p-3 pl-4">Date</th>
                                    <th className="p-3">Reference #</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3 text-right">Debit (KES)</th>
                                    <th className="p-3 text-right">Credit (KES)</th>
                                    <th className="p-3 pr-4 text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                                        <td className="p-3 pl-4 text-slate-500 font-medium">{tx.date}</td>
                                        <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-300 font-bold">{tx.ref}</td>
                                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{tx.description}</td>
                                        <td className="p-3">
                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                {tx.category}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                                            {tx.debit > 0 ? Number(tx.debit).toLocaleString() : '—'}
                                        </td>
                                        <td className="p-3 text-right font-bold text-emerald-600">
                                            {tx.credit > 0 ? Number(tx.credit).toLocaleString() : '—'}
                                        </td>
                                        <td className="p-3 pr-4 text-right font-black text-slate-900 dark:text-white">
                                            KES {Number(tx.balance).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Payment Instructions */}
                <div className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-xl text-xs space-y-1 text-slate-500 dark:text-slate-400">
                    <p className="font-bold text-slate-700 dark:text-slate-200">Payment Remittance Details:</p>
                    <p>M-Pesa Paybill: <strong className="text-slate-800 dark:text-white">884400</strong> | Account: <strong className="text-slate-800 dark:text-white">{selectedMember.number}</strong></p>
                    <p>Bank: Standard Chartered Bank • Account: 01020304050607 • Branch: Kenyatta Avenue</p>
                </div>
            </div>
        </div>
    );
};

export default MemberStatementPage;
