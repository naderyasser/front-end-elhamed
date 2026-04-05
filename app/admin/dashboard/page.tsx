"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Load Chart.js + react-chartjs-2 client-only.
// admin-charts.tsx registers all scales SYNCHRONOUSLY so they are
// always ready before any chart component mounts — no race condition.
const AdminCharts = dynamic(
  () => import("@/components/admin/admin-charts"),
  { ssr: false }
);

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardData {
  total_revenue: number;
  monthly_revenue: number;
  daily_revenue: number;
  delivered_orders: unknown[];
  pending_orders: number;
  shipped_orders: number;
  avg_order_value: number;
  total_shipping_cost: number;
  returned_orders: number;
  customers_count: number;
  new_customers: number;
  repeat_customers: number;
  orders_count: number;
  revenue_chart: { labels: string[]; data: number[] };
  orders_chart: { labels: string[]; data: number[] };
  top_products: { product: { name: string; image: string; price: number }; total_sold: number }[];
  shipping_status_distribution: { status: string; count: number }[];
  recent_orders: { id: number; name: string; cod_amount: number; shipping_status: string; created_at: string }[];
}

const DUMMY: DashboardData = {
  total_revenue: 0, monthly_revenue: 0, daily_revenue: 0,
  delivered_orders: [], pending_orders: 0, shipped_orders: 0,
  avg_order_value: 0, total_shipping_cost: 0, returned_orders: 0,
  customers_count: 0, new_customers: 0, repeat_customers: 0, orders_count: 0,
  revenue_chart: { labels: [], data: [] },
  orders_chart: { labels: [], data: [] },
  top_products: [], shipping_status_distribution: [], recent_orders: [],
};

function money(v: number) { return `${Math.round(v ?? 0).toLocaleString("ar-EG")} ج.م`; }

const STATUS_LABEL: Record<string, string> = {
  delivered: "تم التوصيل", pending: "قيد الانتظار", shipped: "تم الشحن", returned: "مرتجع",
};
const STATUS_CLASS: Record<string, string> = {
  delivered: "delivered", pending: "pending", shipped: "shipped", returned: "returned",
};

// ─── Chart options shared ─────────────────────────────────────────────────────
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: "#4a5568", font: { family: "Cairo" } }, grid: { color: "#e8edf2" } },
    y: { ticks: { color: "#4a5568", font: { family: "Cairo" } }, grid: { color: "#e8edf2" } },
  },
};

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData>(DUMMY);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);
    fetch(`/api/flask/admin/api/dashboard?${params}`)
      .then((r) => { if (!r.ok) throw new Error(r.status.toString()); return r.json(); })
      .then((d) => {
        if (!d || d.success === false) return;
        setData({
          ...DUMMY, ...d,
          delivered_orders: Array.isArray(d?.delivered_orders) ? d.delivered_orders : [],
          top_products: Array.isArray(d?.top_products) ? d.top_products : [],
          shipping_status_distribution: Array.isArray(d?.shipping_status_distribution) ? d.shipping_status_distribution : [],
          recent_orders: Array.isArray(d?.recent_orders) ? d.recent_orders : [],
          revenue_chart: { labels: [], data: [], ...(d?.revenue_chart ?? {}) },
          orders_chart: { labels: [], data: [], ...(d?.orders_chart ?? {}) },
        });
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  const revenueChartData = {
    labels: data.revenue_chart?.labels ?? [],
    datasets: [{ label: "الإيرادات", data: data.revenue_chart?.data ?? [], borderColor: "#0071CE", backgroundColor: "rgba(0,113,206,0.08)", tension: 0.4, fill: true, pointBackgroundColor: "#0071CE" }],
  };
  const ordersChartData = {
    labels: data.orders_chart?.labels ?? [],
    datasets: [{ label: "الطلبات", data: data.orders_chart?.data ?? [], backgroundColor: "rgba(255,153,0,0.7)", borderColor: "#FF9900", borderWidth: 2, borderRadius: 6 }],
  };

  return (
    <div>
      {/* ── Page Title ──────────────────────────── */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="section-title mb-1" style={{ fontSize: "1.25rem" }}>
            <i className="bx bx-home-alt" /> لوحة التحكم
          </h1>
          <p style={{ color: "var(--alha-text-muted)", fontSize: "0.8rem", margin: 0 }}>مرحباً، هنا ملخص أداء متجرك اليوم</p>
        </div>
        <Link href="/admin/orders" className="btn-cta-alha d-flex align-items-center gap-2 text-decoration-none">
          <i className="bx bx-cart-alt" /> الطلبات الجديدة
        </Link>
      </div>

      {/* ── Date Filter ─────────────────────────── */}
      <div className="admin-card mb-4">
        <div className="admin-card-header">
          <h3><i className="bx bx-filter-alt" /> فلتر حسب التاريخ</h3>
          <button className="btn-outline-alha d-flex align-items-center gap-1" style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}
            onClick={() => { setStartDate(""); setEndDate(""); }}>
            <i className="bx bx-refresh" /> إعادة تعيين
          </button>
        </div>
        <div className="admin-card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="admin-form-label">من تاريخ</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="admin-form-control" />
            </div>
            <div className="col-md-4">
              <label className="admin-form-label">إلى تاريخ</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="admin-form-control" />
            </div>
            <div className="col-md-4">
              <button className="btn-primary-alha w-100 d-flex align-items-center justify-content-center gap-2" disabled={loading}
                style={{ padding: "0.6rem" }}>
                {loading ? <><i className="bx bx-loader-alt" style={{ animation: "spin 1s linear infinite" }} /> جاري التحميل...</> : <><i className="bx bx-check" /> تطبيق الفلتر</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────── */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-icon blue"><i className="bx bx-money" /></div>
            <div>
              <div className="stat-value">{money(data.total_revenue)}</div>
              <div className="stat-label">إجمالي الإيرادات</div>
              <div className="stat-sub">+{money(data.daily_revenue)} اليوم · +{money(data.monthly_revenue)} الشهر</div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-icon orange"><i className="bx bx-cart-alt" /></div>
            <div>
              <div className="stat-value">{(data.delivered_orders ?? []).length}</div>
              <div className="stat-label">الطلبات الموصلة</div>
              <div className="stat-sub">{data.pending_orders} انتظار · {data.shipped_orders} شحن</div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-icon green"><i className="bx bx-line-chart" /></div>
            <div>
              <div className="stat-value">{money(data.avg_order_value)}</div>
              <div className="stat-label">متوسط قيمة الطلب</div>
              <div className="stat-sub">شحن: {money(data.total_shipping_cost)} · مرتجع: {data.returned_orders}</div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="stat-card">
            <div className="stat-icon red"><i className="bx bx-group" /></div>
            <div>
              <div className="stat-value">{data.customers_count}</div>
              <div className="stat-label">إجمالي العملاء</div>
              <div className="stat-sub">+{data.new_customers} جديد · {data.repeat_customers} متكرر</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts ──────────────────────────────── */}
      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="admin-card h-100">
            <div className="admin-card-header">
              <h3><i className="bx bx-line-chart" /> الإيرادات الشهرية</h3>
            </div>
            <div className="admin-card-body" style={{ height: 260 }}>
              {AdminCharts
                ? <AdminCharts type="line" data={revenueChartData} options={chartOptions} />
                : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--alha-text-muted)" }}>جاري التحميل...</div>
              }
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="admin-card h-100">
            <div className="admin-card-header">
              <h3><i className="bx bx-bar-chart-alt-2" /> الطلبات الشهرية</h3>
            </div>
            <div className="admin-card-body" style={{ height: 260 }}>
              {AdminCharts
                ? <AdminCharts type="bar" data={ordersChartData} options={chartOptions} />
                : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--alha-text-muted)" }}>جاري التحميل...</div>
              }
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Products & Status ────────────────── */}
      <div className="row g-3 mb-4">
        <div className="col-lg-7">
          <div className="admin-card">
            <div className="admin-card-header">
              <h3><i className="bx bx-trophy" /> المنتجات الأكثر مبيعاً</h3>
              <Link href="/admin/products" className="btn-outline-alha d-flex align-items-center gap-1 text-decoration-none" style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}>
                عرض الكل <i className="bx bx-chevron-left" />
              </Link>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>المنتج</th>
                    <th>الكمية</th>
                    <th>الإيرادات</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.top_products ?? []).length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-4" style={{ color: "var(--alha-text-muted)" }}>لا توجد بيانات</td></tr>
                  ) : (data.top_products ?? []).map(({ product, total_sold }, i) => (
                    <tr key={i}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img src={`/api/flask/${product.image}`} alt={product.name}
                            style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", border: "1px solid var(--alha-border)" }}
                            onError={(e) => { (e.target as HTMLImageElement).src = "/static/images/placeholder-product.svg"; }} />
                          <span style={{ fontWeight: 600 }}>{product.name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ background: "var(--alha-primary-light)", color: "var(--alha-primary-dark)", borderRadius: 6, padding: "2px 10px", fontWeight: 700, fontSize: "0.8rem" }}>
                          {total_sold}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: "var(--alha-primary-dark)" }}>{money(total_sold * product.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="admin-card h-100">
            <div className="admin-card-header">
              <h3><i className="bx bx-truck" /> توزيع حالة الشحن</h3>
              <Link href="/admin/orders" className="btn-outline-alha d-flex align-items-center gap-1 text-decoration-none" style={{ padding: "0.3rem 0.8rem", fontSize: "0.8rem" }}>
                الطلبات <i className="bx bx-chevron-left" />
              </Link>
            </div>
            <div className="admin-card-body">
              {(data.shipping_status_distribution ?? []).length === 0 ? (
                <div className="text-center py-4" style={{ color: "var(--alha-text-muted)" }}>لا توجد بيانات</div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {(data.shipping_status_distribution ?? []).map(({ status, count }) => {
                    const pct = data.orders_count ? Math.round((count / data.orders_count) * 100) : 0;
                    const colors: Record<string, string> = { delivered: "#2e7d32", pending: "#e65100", shipped: "#0071ce", returned: "#c62828" };
                    return (
                      <div key={status}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className={`status-badge ${STATUS_CLASS[status] ?? ""}`}>{STATUS_LABEL[status] ?? status}</span>
                          <span style={{ fontWeight: 700, color: "var(--alha-text-primary)", fontSize: "0.9rem" }}>{count} <span style={{ color: "var(--alha-text-muted)", fontWeight: 400, fontSize: "0.75rem" }}>({pct}%)</span></span>
                        </div>
                        <div style={{ background: "#e8edf2", borderRadius: 999, height: 8, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: colors[status] ?? "#cfd8dc", borderRadius: 999, transition: "width 0.6s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Orders ────────────────────────── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3><i className="bx bx-receipt" /> أحدث الطلبات</h3>
          <Link href="/admin/orders" className="btn-cta-alha d-flex align-items-center gap-1 text-decoration-none" style={{ padding: "0.35rem 0.9rem", fontSize: "0.8rem" }}>
            عرض الكل <i className="bx bx-chevron-left" />
          </Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>العميل</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {(data.recent_orders ?? []).length === 0 ? (
                <tr><td colSpan={6} className="text-center py-4" style={{ color: "var(--alha-text-muted)" }}>لا توجد طلبات حديثة</td></tr>
              ) : (data.recent_orders ?? []).map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 700 }}>
                    <span style={{ background: "var(--alha-primary-light)", color: "var(--alha-primary-dark)", borderRadius: 6, padding: "2px 8px", fontSize: "0.8rem" }}>#{order.id}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{order.name}</td>
                  <td style={{ fontWeight: 700, color: "var(--alha-primary-dark)" }}>{money(order.cod_amount)}</td>
                  <td><span className={`status-badge ${STATUS_CLASS[order.shipping_status] ?? ""}`}>{STATUS_LABEL[order.shipping_status] ?? order.shipping_status}</span></td>
                  <td style={{ color: "var(--alha-text-secondary)", fontSize: "0.8rem" }}>{order.created_at}</td>
                  <td>
                    <Link href={`/admin/orders/${order.id}`} className="admin-header-btn text-decoration-none" style={{ width: 34, height: 34, display: "inline-flex", alignItems: "center", justifyContent: "center" }} title="عرض التفاصيل">
                      <i className="bx bx-show" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Advanced Analytics ────────────────────────── */}
      <AdvancedSection />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/* ── Advanced Dashboard Section (from /admin/api/dashboard/advanced) ───── */
function AdvancedSection() {
  const [adv, setAdv] = useState<{
    conversion_rate?: number; month_comparison?: { revenue_change: number; orders_change: number };
    gov_sales?: { gov: string; total: number }[];
    vendors_count?: number; pending_vendors?: number;
    reviews_pending?: number; low_stock_count?: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/flask/admin/api/dashboard/advanced")
      .then(r => r.ok ? r.json() : null).then(setAdv).catch(() => { });
  }, []);

  if (!adv) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
        <i className="bx bx-bar-chart-square" /> تحليلات متقدمة
      </h2>

      {/* Quick metrics row */}
      <div className="row g-3 mb-4">
        {[
          { icon: "bx-transfer-alt", label: "معدل التحويل", value: `${(adv.conversion_rate ?? 0).toFixed(1)}%`, color: "#9C27B0" },
          { icon: "bx-trending-up", label: "نمو الإيرادات (شهري)", value: `${(adv.month_comparison?.revenue_change ?? 0) > 0 ? "+" : ""}${(adv.month_comparison?.revenue_change ?? 0).toFixed(1)}%`, color: (adv.month_comparison?.revenue_change ?? 0) >= 0 ? "#4CAF50" : "#f44336" },
          { icon: "bx-store-alt", label: "البائعين", value: `${adv.vendors_count ?? 0}`, sub: `${adv.pending_vendors ?? 0} بانتظار الموافقة`, color: "#2196F3" },
          { icon: "bx-star", label: "مراجعات معلقة", value: `${adv.reviews_pending ?? 0}`, color: "#FF9800" },
        ].map((m, i) => (
          <div key={i} className="col-6 col-md-3">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: `${m.color}18`, color: m.color }}><i className={`bx ${m.icon}`} /></div>
              <div>
                <div className="stat-value" style={{ color: m.color }}>{m.value}</div>
                <div className="stat-label">{m.label}</div>
                {"sub" in m && m.sub && <div className="stat-sub">{m.sub}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gov sales breakdown */}
      {(adv.gov_sales ?? []).length > 0 && (
        <div className="admin-card mb-4">
          <div className="admin-card-header">
            <h3><i className="bx bx-map" /> المبيعات حسب المحافظة</h3>
          </div>
          <div className="admin-card-body">
            <div className="d-flex flex-column gap-2">
              {(adv.gov_sales ?? []).slice(0, 10).map((g, i) => {
                const maxVal = Math.max(...(adv.gov_sales ?? []).map(x => x.total), 1);
                return (
                  <div key={i} className="d-flex align-items-center gap-3">
                    <span style={{ minWidth: 100, fontSize: "0.85rem", fontWeight: 600 }}>{g.gov}</span>
                    <div style={{ flex: 1, background: "#e8edf2", borderRadius: 999, height: 8, overflow: "hidden" }}>
                      <div style={{ width: `${(g.total / maxVal) * 100}%`, height: "100%", background: "#0071CE", borderRadius: 999 }} />
                    </div>
                    <span style={{ minWidth: 80, textAlign: "left", fontSize: "0.82rem", fontWeight: 700 }}>{Math.round(g.total).toLocaleString("ar-EG")} ج.م</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick action links */}
      <div className="row g-3">
        {[
          { href: "/admin/vendors", icon: "bx-store-alt", label: "إدارة البائعين", bg: "#e3f2fd" },
          { href: "/admin/reviews", icon: "bx-star", label: "المراجعات", bg: "#fff3e0" },
          { href: "/admin/customers", icon: "bx-user", label: "العملاء", bg: "#e8f5e9" },
          { href: "/admin/seo", icon: "bx-search-alt-2", label: "أدوات SEO", bg: "#f3e5f5" },
          { href: "/admin/blog", icon: "bx-news", label: "المدونة", bg: "#fce4ec" },
          { href: "/admin/roles", icon: "bx-shield-quarter", label: "الأدوار", bg: "#e0f2f1" },
        ].map((l, i) => (
          <div key={i} className="col-6 col-md-4 col-lg-2">
            <Link href={l.href} className="text-decoration-none">
              <div className="admin-card text-center" style={{ padding: "20px 12px", background: l.bg, cursor: "pointer", transition: "transform 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
                <i className={`bx ${l.icon}`} style={{ fontSize: 28, color: "#333", display: "block", marginBottom: 8 }} />
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#333" }}>{l.label}</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
