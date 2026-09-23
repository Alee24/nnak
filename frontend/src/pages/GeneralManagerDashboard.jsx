import React, { useEffect, useState } from "react";
import { Users, DollarSign, Clock, Activity, ArrowUpRight, TrendingUp, Flag, Trophy, AlertCircle, UserPlus, Calendar, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminAPI from "../services/api";
import { PageHeader, Button, DataTable, StatusBadge } from "../components/ui/Primitives";

const GeneralManagerDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total_members: 524, active: 486, pending: 24, revenue_month: 2850000, tee_times_today: 18 });
    const [recentMembers, setRecentMembers] = useState([]);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(false);
                const [statsRes, membersRes] = await Promise.allSettled([
                    AdminAPI.getStats(),
                    AdminAPI.getMembers(1, 5, "")
                ]);
                if (statsRes.status === "fulfilled" && statsRes.value) setStats(prev => ({ ...prev, ...statsRes.value }));
                if (membersRes.status === "fulfilled" && membersRes.value?.members) setRecentMembers(membersRes.value.members);
            } catch (e) { console.error(e); setLoading(false); }
        };
        fetchDashboard();
    }, []);

    return (
        <div className="space-y-5">
            <PageHeader
                title="General Manager Control Suite"
                subtitle={`Welcome back, ${user.first_name || 'General Manager'} • Strategic Performance & Executive Operations`}
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Executive Suite' }]}
                actions={
                    <>
                        <Button variant="secondary" size="sm" onClick={() => navigate("/dashboard/members")}>
                            <Users size={13} /> Member Directory
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => navigate("/dashboard/analytics")}>
                            <Activity size={13} /> Full Analytics
                        </Button>
                    </>
                }
            />

            {/* Metric Summary Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">Total Membership</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100 block mt-1">{stats.total_members}</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium block mt-0.5">{stats.active} Active Profiles</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">Monthly Revenue</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100 block mt-1">KES {(stats.revenue_month || 2850000).toLocaleString()}</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium block mt-0.5">+14.2% Growth YTD</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">Tee Times Today</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-100 block mt-1">{stats.tee_times_today} Flights</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Championship Course</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">Pending Applications</span>
                    <span className="text-xl font-bold text-amber-700 dark:text-amber-400 block mt-1">{stats.pending} Pending</span>
                    <span className="text-[10px] text-amber-600 block mt-0.5">Action Required</span>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                            Recent Member Admissions
                        </h3>
                        <button onClick={() => navigate("/dashboard/members")} className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline">
                            View Directory
                        </button>
                    </div>

                    <DataTable
                        headers={[
                            { label: 'Member Name' },
                            { label: 'Category' },
                            { label: 'Handicap', className: 'text-right' },
                            { label: 'Status', className: 'text-center' },
                        ]}
                        loading={loading}
                    >
                        {(recentMembers.length ? recentMembers : [
                            { first_name: 'Alex', last_name: 'Metto', membership_number: 'MMS-005', role: 'Full Member', handicap_index: 6.4, status: 'active' },
                            { first_name: 'Dr. Arthur', last_name: 'Mwangi', membership_number: 'MMS-008', role: 'Full Member', handicap_index: 8.4, status: 'active' },
                            { first_name: 'Sarah', last_name: 'Wanjiku', membership_number: 'MMS-009', role: 'Lady Member', handicap_index: 14.2, status: 'active' }
                        ]).map((m, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                <td className="px-3.5 py-2 font-semibold text-slate-900 dark:text-slate-100">
                                    {m.first_name} {m.last_name}
                                    <span className="block text-[10px] text-slate-400 font-normal">{m.membership_number}</span>
                                </td>
                                <td className="px-3.5 py-2 text-slate-600">{m.role || 'Member'}</td>
                                <td className="px-3.5 py-2 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">HCP {m.handicap_index || '0.0'}</td>
                                <td className="px-3.5 py-2 text-center">
                                    <StatusBadge variant={m.status === 'active' ? 'success' : 'neutral'}>
                                        {m.status}
                                    </StatusBadge>
                                </td>
                            </tr>
                        ))}
                    </DataTable>
                </div>

                {/* Operations & Management Actions */}
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                        Executive Operations
                    </h3>
                    <div className="space-y-1.5">
                        <button onClick={() => navigate("/dashboard/applications")} className="w-full flex items-center justify-between p-2.5 rounded border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors">
                            <span className="flex items-center gap-2"><UserPlus size={14} className="text-emerald-700" /> Member Applications</span>
                            <StatusBadge variant="warning">{stats.pending}</StatusBadge>
                        </button>
                        <button onClick={() => navigate("/dashboard/finance")} className="w-full flex items-center justify-between p-2.5 rounded border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors">
                            <span className="flex items-center gap-2"><DollarSign size={14} className="text-blue-700" /> Revenue & Billing</span>
                        </button>
                        <button onClick={() => navigate("/dashboard/generate-ids")} className="w-full flex items-center justify-between p-2.5 rounded border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors">
                            <span className="flex items-center gap-2"><Shield size={14} className="text-purple-700" /> Issue Membership Cards</span>
                        </button>
                        <button onClick={() => navigate("/dashboard/events")} className="w-full flex items-center justify-between p-2.5 rounded border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors">
                            <span className="flex items-center gap-2"><Calendar size={14} className="text-amber-700" /> Tournaments Calendar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralManagerDashboard;
