import React, { useEffect, useState } from "react";
import { CreditCard, ShoppingBag, DollarSign, FileText, CheckCircle, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminAPI from "../services/api";

const CashierDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [stats, setStats] = useState({ collections_today: 185000, mpesa: 142000, cash_card: 43000, pending_pos: 4 });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white">Cashier & Point of Sale Station</h1>
                    <p className="text-xs text-slate-500 font-medium">Welcome back, {user.first_name || "Club Cashier"} • Till Collections & Billing Desk</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigate("/dashboard/restaurant")} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2">
                        <ShoppingBag size={14} /> F&B Till / POS
                    </button>
                    <button onClick={() => navigate("/dashboard/golf-shop")} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2">
                        <ShoppingBag size={14} /> Pro Shop POS
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Till Today</span>
                    <div className="text-2xl font-black text-emerald-600">KES {(stats.collections_today).toLocaleString()}</div>
                    <span className="text-[10px] text-emerald-600 font-bold">Shift Open</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">M-Pesa Express Total</span>
                    <div className="text-2xl font-black text-emerald-700">KES {(stats.mpesa).toLocaleString()}</div>
                    <span className="text-[10px] text-slate-400 font-bold">76.7% of Daily Volume</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cash & PDQ Terminal</span>
                    <div className="text-2xl font-black text-blue-600">KES {(stats.cash_card).toLocaleString()}</div>
                    <span className="text-[10px] text-slate-400 font-bold">Visa / Mastercard / Cash</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Open Dining Tabs</span>
                    <div className="text-2xl font-black text-amber-600">{stats.pending_pos} Active Tabs</div>
                    <span className="text-[10px] text-amber-500 font-bold">Terrace & 19th Hole Bar</span>
                </div>
            </div>
        </div>
    );
};

export default CashierDashboard;
