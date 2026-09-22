import React, { useEffect, useState } from "react";
import { UserCheck, UserPlus, Clock, Mail, CheckCircle, Flag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ReceptionistDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-black text-slate-900 dark:text-white">Front Desk & Reception Desk</h1>
                    <p className="text-xs text-slate-500 font-medium">Welcome back, {user.first_name || "Front Desk Lead"} • Golfer Arrival, Guests & Member Check-In</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigate("/dashboard/check-in")} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2">
                        <UserCheck size={14} /> Golfer Check-In
                    </button>
                    <button onClick={() => navigate("/dashboard/guests")} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2">
                        <UserPlus size={14} /> Register Guest Pass
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Members Checked In</span>
                    <div className="text-2xl font-black text-emerald-600">32 Golfers</div>
                    <span className="text-[10px] text-emerald-600 font-bold">Checked in today</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Guest Passes Issued</span>
                    <div className="text-2xl font-black text-blue-600">8 Visitors</div>
                    <span className="text-[10px] text-blue-500 font-bold">Green fee receipts printed</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tee Times Today</span>
                    <div className="text-2xl font-black text-amber-600">18 Flights</div>
                    <span className="text-[10px] text-amber-500 font-bold">First tee off 06:30 AM</span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">General Inquiries</span>
                    <div className="text-2xl font-black text-purple-600">3 Unread</div>
                    <span className="text-[10px] text-purple-500 font-bold">Front desk mailbox</span>
                </div>
            </div>
        </div>
    );
};

export default ReceptionistDashboard;
