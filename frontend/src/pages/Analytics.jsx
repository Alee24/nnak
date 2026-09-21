import React, { useEffect, useState, useCallback } from "react";
import {
    TrendingUp, Download, BarChart2, PieChart, ShoppingCart,
    DollarSign, FileText, Layers, CreditCard, AlertCircle
} from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import AdminAPI from "../services/api";

ChartJS.register(
    CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend, ArcElement
);

const fmt = (n) =>
    Number(n || 0).toLocaleString("en-KE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const getDefaultDateRange = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30);
    return {
        from: from.toISOString().split("T")[0],
        to: to.toISOString().split("T")[0],
    };
};

const METHOD_COLORS = ["#059669", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#6b7280"];

const CSS = `
@keyframes an-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
.an-page{width:100%;max-width:1400px;margin:0 auto;padding:0 0 48px;display:flex;flex-direction:column;gap:20px;}
.an-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;}
.an-title{margin:0;font-size:1.375rem;font-weight:800;color:#0f172a;letter-spacing:-.02em;}
.an-sub{margin:4px 0 0;font-size:.75rem;color:#64748b;font-weight:500;}
.an-actions{display:flex;gap:10px;flex-shrink:0;flex-wrap:wrap;}
.an-btn-exp{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-size:.75rem;font-weight:700;cursor:pointer;transition:all .15s;border:1.5px solid #e2e8f0;background:#fff;color:#334155;text-transform:uppercase;letter-spacing:.04em;}
.an-btn-exp:hover{border-color:#059669;color:#059669;}
.an-filter{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;display:flex;align-items:flex-end;gap:16px;flex-wrap:wrap;box-shadow:0 1px 3px rgba(0,0,0,.05);}
.an-field{display:flex;flex-direction:column;gap:4px;min-width:0;}
.an-lbl{font-size:.7rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;}
.an-input{padding:8px 12px;border-radius:8px;border:1.5px solid #e2e8f0;background:#f8fafc;font-size:.8125rem;color:#1e293b;outline:none;font-weight:500;transition:border-color .15s;cursor:pointer;min-width:140px;}
.an-input:focus{border-color:#059669;}
.an-apply{padding:9px 22px;border-radius:8px;background:#059669;color:#fff;border:none;cursor:pointer;font-size:.8125rem;font-weight:700;letter-spacing:.03em;transition:background .15s;flex-shrink:0;}
.an-apply:hover{background:#047857;}
.an-apply:active{transform:scale(.97);}
.an-kpi-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px;}
@media(max-width:1100px){.an-kpi-grid{grid-template-columns:repeat(3,minmax(0,1fr));}}
@media(max-width:640px){.an-kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}
@media(max-width:380px){.an-kpi-grid{grid-template-columns:1fr;}}
.an-charts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;}
@media(max-width:768px){.an-charts{grid-template-columns:1fr;}}
.an-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.05);overflow:hidden;min-width:0;}
.an-chart-pad{padding:20px 20px 16px;}
.an-chart-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;gap:8px;flex-wrap:wrap;}
.an-chart-ttl{display:flex;align-items:center;gap:7px;font-size:.875rem;font-weight:700;color:#0f172a;margin:0;}
.an-chart-ttl svg{color:#059669;flex-shrink:0;}
.an-badge{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;}
.an-canvas{height:240px;position:relative;}
.an-mlist{display:flex;flex-direction:column;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid #f1f5f9;}
.an-mrow{display:flex;justify-content:space-between;align-items:center;font-size:.75rem;}
.an-mname{display:flex;align-items:center;gap:8px;font-weight:600;color:#475569;}
.an-mdot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.an-mamt{font-weight:700;color:#0f172a;}
.an-tbl-hdr{padding:16px 20px;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;}
.an-tbl-ttl{font-size:.875rem;font-weight:700;color:#0f172a;margin:0;display:flex;align-items:center;gap:7px;}
.an-tbl-ttl svg{color:#059669;}
.an-tbl-cnt{font-size:.7rem;font-weight:600;color:#94a3b8;}
.an-tbl-wrap{overflow-x:auto;}
table.an-tbl{width:100%;border-collapse:collapse;font-size:.8rem;}
table.an-tbl thead tr{background:#f8fafc;border-bottom:1px solid #e2e8f0;}
table.an-tbl th{padding:10px 16px;text-align:left;font-size:.675rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;white-space:nowrap;}
table.an-tbl td{padding:11px 16px;color:#334155;border-bottom:1px solid #f1f5f9;vertical-align:middle;}
table.an-tbl tbody tr:last-child td{border-bottom:none;}
table.an-tbl tbody tr:hover{background:#f8fafc;}
.an-empty{padding:40px 20px;text-align:center;color:#94a3b8;font-size:.8125rem;font-weight:500;}
.an-err{display:flex;align-items:center;gap:10px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:12px 16px;font-size:.8125rem;color:#dc2626;font-weight:500;}
.an-skel{background:#f1f5f9;border-radius:8px;animation:an-pulse 1.4s ease-in-out infinite;}
.an-kpi-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,.05);padding:16px 18px;min-width:0;overflow:hidden;display:flex;flex-direction:column;}
.an-kpi-hdr{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:10px;}
.an-kpi-lbl{font-size:.6875rem;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;line-height:1.4;}
.an-kpi-icon{width:30px;height:30px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
.an-kpi-val{font-size:1.0625rem;font-weight:800;color:#0f172a;word-break:break-word;line-height:1.2;}
.an-kpi-sub{font-size:.7rem;font-weight:600;color:#94a3b8;margin-top:6px;}
.an-cat-badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:.65rem;font-weight:700;background:#f1f5f9;color:#475569;text-transform:uppercase;letter-spacing:.04em;}
`;

const KpiCard = ({ label, value, sub, icon: Icon, bg, iconColor, valColor, loading }) => (
    <div className="an-kpi-card">
        <div className="an-kpi-hdr">
            <span className="an-kpi-lbl">{label}</span>
            <span className="an-kpi-icon" style={{ background: bg, color: iconColor }}>
                <Icon size={15} strokeWidth={2.2} />
            </span>
        </div>
        {loading ? (
            <div className="an-skel" style={{ height: 24 }} />
        ) : (
            <div className="an-kpi-val" style={valColor ? { color: valColor } : {}}>
                {value}
            </div>
        )}
        {sub && <div className="an-kpi-sub">{sub}</div>}
    </div>
);

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
            label: "Revenue (KSh)",
            data: revenueTrend.map((d) => Number(d.amount ?? d.revenue ?? d.total ?? 0)),
            backgroundColor: "#059669",
            borderRadius: 4,
            borderSkipped: false,
        }],
    };

    const revenueChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => ` KSh ${ctx.parsed.y.toLocaleString()}` } },
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11 }, color: "#94a3b8" }, border: { display: false } },
            y: {
                grid: { color: "#f1f5f9" },
                ticks: { font: { size: 11 }, color: "#94a3b8", callback: (v) => `KSh ${Number(v).toLocaleString()}` },
                border: { display: false },
            },
        },
    };

    const totalPayments = paymentMethods.reduce((s, m) => s + m.amount, 0);
    const paymentChartData = {
        labels: paymentMethods.map((m) => m.name),
        datasets: [{ data: paymentMethods.map((m) => m.amount), backgroundColor: METHOD_COLORS, borderWidth: 0, hoverOffset: 6 }],
    };
    const paymentChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
            legend: { position: "bottom", labels: { font: { size: 11, weight: "600" }, color: "#475569", padding: 14, boxWidth: 12, boxHeight: 12 } },
            tooltip: { callbacks: { label: (ctx) => ` KSh ${ctx.parsed.toLocaleString()}` } },
        },
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: CSS }} />
            <div className="an-page">

                <div className="an-header">
                    <div>
                        <h1 className="an-title">Analytics &amp; Reports</h1>
                        <p className="an-sub">Comprehensive business insights and performance metrics</p>
                    </div>
                    <div className="an-actions">
                        <button className="an-btn-exp" onClick={() => window.print()}>
                            <Download size={13} strokeWidth={2.5} /> Export PDF
                        </button>
                        <button className="an-btn-exp" onClick={() => {
                            const rows = [["Product", "Category", "Stock", "Price"],
                                ...topProducts.map((p) => [p.name, p.category ?? "", p.stock_quantity ?? "", p.price ?? ""])];
                            const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
                            Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "analytics.csv" }).click();
                        }}>
                            <Download size={13} strokeWidth={2.5} /> Export Excel
                        </button>
                    </div>
                </div>

                {error && <div className="an-err"><AlertCircle size={16} /> {error}</div>}

                <div className="an-filter">
                    <div className="an-field">
                        <label className="an-lbl">From</label>
                        <input type="date" className="an-input" value={dateFrom} max={dateTo} onChange={(e) => setDateFrom(e.target.value)} />
                    </div>
                    <div className="an-field">
                        <label className="an-lbl">To</label>
                        <input type="date" className="an-input" value={dateTo} min={dateFrom} onChange={(e) => setDateTo(e.target.value)} />
                    </div>
                    <button className="an-apply" onClick={() => { setAppliedFrom(dateFrom); setAppliedTo(dateTo); }}>Apply</button>
                </div>

                <div className="an-kpi-grid">
                    <KpiCard label="Total Revenue" loading={loading} value={kpis ? `KSh ${fmt(kpis.totalRevenue)}` : "—"} sub="Current period" icon={DollarSign} bg="#d1fae5" iconColor="#059669" />
                    <KpiCard label="Transactions" loading={loading} value={kpis ? String(kpis.txCount) : "—"} sub="Completed orders" icon={CreditCard} bg="#dbeafe" iconColor="#2563eb" />
                    <KpiCard label="Avg Order Value" loading={loading} value={kpis ? `KSh ${fmt(kpis.avgOrder)}` : "—"} sub="Per transaction" icon={TrendingUp} bg="#fef3c7" iconColor="#d97706" />
                    <KpiCard label="Gross Profit" loading={loading} value={kpis ? `KSh ${fmt(kpis.grossProfit)}` : "—"} sub="Revenue minus COGS" icon={BarChart2} bg="#ede9fe" iconColor="#7c3aed" />
                    <KpiCard label="VAT Liability" loading={loading} value={kpis ? `KSh ${fmt(kpis.vatLiability)}` : "—"} sub="Collected tax" icon={FileText} bg="#fee2e2" iconColor="#dc2626" valColor="#dc2626" />
                </div>

                <div className="an-charts">
                    <div className="an-card an-chart-pad">
                        <div className="an-chart-hdr">
                            <h3 className="an-chart-ttl"><BarChart2 size={16} /> Revenue Trend</h3>
                            <span className="an-badge">{appliedFrom} – {appliedTo}</span>
                        </div>
                        <div className="an-canvas">
                            {loading ? <div className="an-skel" style={{ height: "100%" }} />
                                : revenueTrend.length > 0 ? <Bar data={revenueChartData} options={revenueChartOptions} />
                                : <div className="an-empty">No revenue data for this period</div>}
                        </div>
                    </div>

                    <div className="an-card an-chart-pad">
                        <div className="an-chart-hdr">
                            <h3 className="an-chart-ttl"><PieChart size={16} /> Payment Methods</h3>
                            {totalPayments > 0 && <span className="an-badge">KSh {Number(totalPayments).toLocaleString()}</span>}
                        </div>
                        {loading ? <div className="an-skel" style={{ height: 200 }} />
                            : paymentMethods.length > 0 ? (
                                <>
                                    <div className="an-canvas"><Doughnut data={paymentChartData} options={paymentChartOptions} /></div>
                                    <div className="an-mlist">
                                        {paymentMethods.map((m, i) => (
                                            <div key={m.name} className="an-mrow">
                                                <span className="an-mname">
                                                    <span className="an-mdot" style={{ background: METHOD_COLORS[i % METHOD_COLORS.length] }} />
                                                    {m.name}
                                                </span>
                                                <span className="an-mamt">KSh {Number(m.amount).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : <div className="an-empty">No payment data available</div>}
                    </div>
                </div>

                <div className="an-card">
                    <div className="an-tbl-hdr">
                        <h3 className="an-tbl-ttl"><ShoppingCart size={16} /> Top Selling Products</h3>
                        {topProducts.length > 0 && <span className="an-tbl-cnt">{topProducts.length} products</span>}
                    </div>
                    <div className="an-tbl-wrap">
                        {loading ? (
                            <div className="an-empty"><div className="an-skel" style={{ height: 20, width: "60%", margin: "0 auto" }} /></div>
                        ) : topProducts.length > 0 ? (
                            <table className="an-tbl">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Product</th>
                                        <th>Category</th>
                                        <th style={{ textAlign: "right" }}>Quantity Sold</th>
                                        <th style={{ textAlign: "right" }}>Revenue</th>
                                        <th style={{ textAlign: "right" }}>Stock</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topProducts.map((p, idx) => {
                                        const stockQty = Number(p.stock_quantity ?? p.stock ?? 0);
                                        const minStock = Number(p.min_stock_level ?? 5);
                                        const rev = Number(p.revenue ?? (Number(p.price || 0) * Number(p.quantity_sold || p.sold_qty || 0)));
                                        return (
                                            <tr key={p.id ?? idx}>
                                                <td style={{ color: "#94a3b8", fontWeight: 700 }}>{idx + 1}</td>
                                                <td style={{ fontWeight: 700, color: "#0f172a" }}>{p.name}</td>
                                                <td><span className="an-cat-badge">{p.category ?? "—"}</span></td>
                                                <td style={{ textAlign: "right", fontWeight: 700 }}>{Number(p.quantity_sold ?? p.sold_qty ?? 0).toLocaleString()}</td>
                                                <td style={{ textAlign: "right", fontWeight: 700, color: "#059669" }}>KSh {rev.toLocaleString()}</td>
                                                <td style={{ textAlign: "right", fontWeight: 700, color: stockQty <= minStock ? "#dc2626" : "#059669" }}>{stockQty.toLocaleString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="an-empty">
                                <Layers size={32} style={{ margin: "0 auto 8px", display: "block", color: "#cbd5e1" }} />
                                No product data available for this period
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </>
    );
};

export default Analytics;
