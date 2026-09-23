import React, { useEffect, useState, useCallback } from "react";
import { Download, ShoppingCart, DollarSign, FileText, CreditCard, AlertCircle, BarChart2 } from "lucide-react";
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import AdminAPI from "../services/api";
import { PageHeader, Button, DataTable, StatusBadge } from "../components/ui/Primitives";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const fmt = (n) => Number(n || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const getDefaultDateRange = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30);
    return {
        from: from.toISOString().split("T")[0],
        to: to.toISOString().split("T")[0],
    };
};

const METHOD_COLORS = ["#047857", "#2563eb", "#d97706", "#7c3aed", "#dc2626", "#64748b"];

const Analytics = () => {
    const def = getDefaultDateRange();
    const [dateFrom, setDateFrom] = useState(def.from);
    const [dateTo, setDateTo] = useState(def.to);
    const [appliedFrom, setAppliedFrom] = useState(def.from);
    const [appliedTo, setAppliedTo] = useState(def.to);
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState(null);
    const [revenueTrend, setRevenueTrend] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = { date_from: appliedFrom, date_to: appliedTo };
            const [summaryRes, dailySalesRes, productsRes, txRes] = await Promise.allSettled([
                AdminAPI.getFinanceSummary(),
                AdminAPI.getDailySales(params),
                AdminAPI.getProducts({ limit: 10 }),
                AdminAPI.getTransactions(1, 200, "", "", ""),
            ]);

            const summary = summaryRes.status === "fulfilled" ? summaryRes.value : null;
            const txData = txRes.status === "fulfilled" ? txRes.value : null;
            const txList = txData?.data ?? txData?.transactions ?? [];
            const totalRevenue = summary?.data?.total_revenue ?? summary?.total_revenue ?? 0;
            const grossProfit = summary?.data?.gross_profit ?? summary?.gross_profit ?? totalRevenue * 0.6;
            const vatLiability = summary?.data?.vat_liability ?? summary?.vat_liability ?? totalRevenue * 0.16;
            const txCount = Array.isArray(txList) ? txList.length : (txData?.total ?? 0);
            const avgOrder = txCount > 0 ? totalRevenue / txCount : 0;
            setKpis({ totalRevenue, txCount, avgOrder, grossProfit, vatLiability });

            const salesData = dailySalesRes.status === "fulfilled" ? dailySalesRes.value : null;
            const dailyList = salesData?.data ?? salesData?.sales ?? [];
            setRevenueTrend(Array.isArray(dailyList) ? dailyList : []);

            if (Array.isArray(txList) && txList.length > 0) {
                const map = {};
                txList.forEach((t) => {
                    const m = (t.payment_method ?? t.method ?? "OTHER").toUpperCase();
                    map[m] = (map[m] || 0) + Number(t.amount || 0);
                });
                setPaymentMethods(Object.entries(map).map(([name, amount]) => ({ name, amount })));
            } else {
                setPaymentMethods([]);
            }

            const prodRes = productsRes.status === "fulfilled" ? productsRes.value : null;
            const prodList = prodRes?.data ?? prodRes?.products ?? [];
            setTopProducts(Array.isArray(prodList) ? prodList.slice(0, 10) : []);
        } catch (err) {
            console.error("Analytics fetch error:", err);
            setError("Unable to load analytics data. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [appliedFrom, appliedTo]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const revenueChartData = {
        labels: revenueTrend.map((d) => d.label ?? d.date ?? d.day ?? ""),
        datasets: [{
            label: "Revenue (KES)",
            data: revenueTrend.map((d) => Number(d.amount ?? d.revenue ?? d.total ?? 0)),
            backgroundColor: "#047857",
            borderRadius: 2,
        }],
    };

    const revenueChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => ` KES ${ctx.parsed.y.toLocaleString()}` } },
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#64748b" } },
            y: { grid: { color: "#f1f5f9" }, ticks: { font: { size: 10 }, color: "#64748b", callback: (v) => `KES ${Number(v).toLocaleString()}` } },
        },
    };

    const paymentChartData = {
        labels: paymentMethods.map((m) => m.name),
        datasets: [{ data: paymentMethods.map((m) => m.amount), backgroundColor: METHOD_COLORS, borderWidth: 0 }],
    };
    const paymentChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
            legend: { position: "bottom", labels: { font: { size: 10, weight: "600" }, color: "#475569", padding: 12, boxWidth: 10 } },
        },
    };

    return (
        <div className="space-y-4">
            <PageHeader
                title="Analytics & Financial Reports"
                subtitle="Business metrics, revenue trends, and product performance analysis"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Analytics & Reports' }]}
                actions={
                    <>
                        <Button variant="secondary" size="sm" onClick={() => window.print()}>
                            <Download size={13} /> Export PDF
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => {
                            const rows = [["Product", "Category", "Stock", "Price"], ...topProducts.map((p) => [p.name, p.category ?? "", p.stock_quantity ?? "", p.price ?? ""])];
                            const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
                            Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "analytics.csv" }).click();
                        }}>
                            <Download size={13} /> Export CSV
                        </Button>
                    </>
                }
            />

            {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                </div>
            )}

            {/* Date Range Filter Bar */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-md border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-end gap-3">
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Start Date</label>
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded outline-none" />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">End Date</label>
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded outline-none" />
                </div>
                <Button variant="primary" size="sm" onClick={() => { setAppliedFrom(dateFrom); setAppliedTo(dateTo); }}>
                    Apply Filter
                </Button>
            </div>

            {/* Metric Summary Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">Total Revenue</span>
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100 block mt-1">KES {fmt(kpis?.totalRevenue)}</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium block mt-0.5">YTD Financial Year</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">Transactions</span>
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100 block mt-1">{kpis?.txCount || 0}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Completed Payments</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">Avg Order Value</span>
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100 block mt-1">KES {fmt(kpis?.avgOrder)}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Per Ticket Average</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">Gross Profit</span>
                    <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 block mt-1">KES {fmt(kpis?.grossProfit)}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Estimated Margin</span>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <span className="text-[11px] font-semibold text-slate-500 block">VAT Liability</span>
                    <span className="text-base font-bold text-amber-700 dark:text-amber-400 block mt-1">KES {fmt(kpis?.vatLiability)}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">16% Standard Rate</span>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
                        Revenue Trend Line (KES)
                    </h3>
                    <div className="h-56">
                        <Bar data={revenueChartData} options={revenueChartOptions} />
                    </div>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
                        Payment Method Breakdown
                    </h3>
                    <div className="h-56 relative flex items-center justify-center">
                        <Doughnut data={paymentChartData} options={paymentChartOptions} />
                    </div>
                </div>
            </div>

            {/* Top Products Data Table */}
            <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Top Stock & Inventory Sales
                </h3>
                <DataTable
                    headers={[
                        { label: 'Product Name' },
                        { label: 'Category' },
                        { label: 'Department' },
                        { label: 'Selling Price', className: 'text-right' },
                        { label: 'Stock On Hand', className: 'text-right' },
                    ]}
                    loading={loading}
                    emptyMessage="No product inventory data recorded"
                >
                    {topProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="px-3.5 py-2 font-semibold text-slate-900 dark:text-slate-100">{p.name}</td>
                            <td className="px-3.5 py-2 text-slate-600">{p.category || 'General'}</td>
                            <td className="px-3.5 py-2 text-slate-600 capitalize">{p.department?.replace('_', ' ') || 'Shop'}</td>
                            <td className="px-3.5 py-2 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">KES {fmt(p.selling_price)}</td>
                            <td className="px-3.5 py-2 text-right font-medium">
                                <StatusBadge variant={p.stock_quantity <= (p.min_stock_alert || 5) ? 'warning' : 'neutral'}>
                                    {p.stock_quantity} units
                                </StatusBadge>
                            </td>
                        </tr>
                    ))}
                </DataTable>
            </div>
        </div>
    );
};

export default Analytics;
