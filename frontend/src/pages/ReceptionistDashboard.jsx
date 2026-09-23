import React from "react";
import { UserCheck, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader, Button } from "../components/ui/Primitives";

const ReceptionistDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
        <div className="space-y-5">
            <PageHeader
                title="Front Desk & Reception Desk"
                subtitle={`Welcome back, ${user.first_name || 'Front Desk Lead'} • Golfer Arrival, Guest Passes & Reception Desk`}
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Front Desk' }]}
                actions={
                    <>
                        <Button variant="secondary" size="sm" onClick={() => navigate("/dashboard/guests")}>
                            <UserPlus size={13} /> Register Guest Pass
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => navigate("/dashboard/check-in")}>
                            <UserCheck size={13} /> Golfer Check-In
                        </Button>
                    </>
                }
            />

            {/* Metric Summary Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">Members Checked In</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100 block mt-1">32 Golfers</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium block mt-0.5">Checked in today</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">Guest Passes Issued</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100 block mt-1">8 Visitors</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Green fee receipts printed</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">Tee Times Today</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100 block mt-1">18 Flights</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">First tee off 06:30 AM</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">General Inquiries</span>
                    <span className="text-xl font-bold text-purple-700 dark:text-purple-400 block mt-1">3 Unread</span>
                    <span className="text-[10px] text-purple-600 block mt-0.5">Front desk mailbox</span>
                </div>
            </div>
        </div>
    );
};

export default ReceptionistDashboard;
