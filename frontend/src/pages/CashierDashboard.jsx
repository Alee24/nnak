import React, { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader, Button } from "../components/ui/Primitives";

const CashierDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [stats] = useState({ collections_today: 185000, mpesa: 142000, cash_card: 43000, pending_pos: 4 });

    return (
        <div className="space-y-5">
            <PageHeader
                title="Cashier & Point of Sale Operations"
                subtitle={`Welcome back, ${user.first_name || 'Club Cashier'} • POS Till Collections, Dining Tabs & Billing Desk`}
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Cashier Station' }]}
                actions={
                    <>
                        <Button variant="secondary" size="sm" onClick={() => navigate("/dashboard/golf-shop")}>
                            <ShoppingBag size={13} /> Pro Shop POS
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => navigate("/dashboard/restaurant")}>
                            <ShoppingBag size={13} /> F&B Till / POS
                        </Button>
                    </>
                }
            />

            {/* Metric Summary Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">Total Till Today</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100 block mt-1">KES {(stats.collections_today).toLocaleString()}</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium block mt-0.5">Shift Open</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">M-Pesa Express Total</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100 block mt-1">KES {(stats.mpesa).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">76.7% of Daily Volume</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">Cash & PDQ Terminal</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100 block mt-1">KES {(stats.cash_card).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Visa / Mastercard / Cash</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">Open Dining Tabs</span>
                    <span className="text-xl font-bold text-amber-700 dark:text-amber-400 block mt-1">{stats.pending_pos} Active Tabs</span>
                    <span className="text-[10px] text-amber-600 block mt-0.5">Terrace & 19th Hole Bar</span>
                </div>
            </div>
        </div>
    );
};

export default CashierDashboard;
