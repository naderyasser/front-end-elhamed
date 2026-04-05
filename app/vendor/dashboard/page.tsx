"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface DashData {
    total_products: number; published_products: number; pending_products: number;
    total_orders: number; pending_orders: number; total_sales: number;
    pending_balance: number; this_month_sales: number;
}

const DUMMY: DashData = { total_products: 0, published_products: 0, pending_products: 0, total_orders: 0, pending_orders: 0, total_sales: 0, pending_balance: 0, this_month_sales: 0 };

export default function VendorDashboardPage() {
    const [d, setD] = useState<DashData>(DUMMY);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/flask/vendor/api/dashboard")
            .then(r => r.json()).then(data => setD({ ...DUMMY, ...data }))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-center p-5"><i className="bx bx-loader-alt bx-spin" style={{ fontSize: 32 }} /></div>;

    const cards = [
        { icon: "bx-package", label: "إجمالي المنتجات", value: d.total_products, sub: `${d.published_products} منشور · ${d.pending_products} معلق`, color: "#2196F3" },
        { icon: "bx-cart-alt", label: "إجمالي الطلبات", value: d.total_orders, sub: `${d.pending_orders} بانتظار التنفيذ`, color: "#FF9800" },
        { icon: "bx-money", label: "إجمالي المبيعات", value: `${Math.round(d.total_sales).toLocaleString("ar-EG")} ج.م`, sub: `هذا الشهر: ${Math.round(d.this_month_sales).toLocaleString("ar-EG")} ج.م`, color: "#4CAF50" },
        { icon: "bx-wallet", label: "الرصيد المعلق", value: `${Math.round(d.pending_balance).toLocaleString("ar-EG")} ج.م`, sub: "بانتظار التحويل", color: "#9C27B0" },
    ];

    return (
        <div>
            <h1 className="admin-page-title mb-4"><i className="bx bx-home-alt" /> لوحة التحكم</h1>

            <div className="row g-3 mb-4">
                {cards.map((c, i) => (
                    <div key={i} className="col-6 col-md-3">
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: `${c.color}18`, color: c.color }}><i className={`bx ${c.icon}`} /></div>
                            <div>
                                <div className="stat-value">{c.value}</div>
                                <div className="stat-label">{c.label}</div>
                                <div className="stat-sub">{c.sub}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-3">
                {[
                    { href: "/vendor/products", icon: "bx-plus-circle", label: "إضافة منتج", desc: "أضف منتجات جديدة لمتجرك" },
                    { href: "/vendor/orders", icon: "bx-cart-alt", label: "إدارة الطلبات", desc: "تابع وحدّث حالة الطلبات" },
                    { href: "/vendor/earnings", icon: "bx-money", label: "الأرباح والتحويلات", desc: "تابع أرباحك واطلب تحويل" },
                    { href: "/vendor/messages", icon: "bx-message-square-dots", label: "الرسائل", desc: "تواصل مع إدارة المتجر" },
                ].map((a, i) => (
                    <div key={i} className="col-6 col-md-3">
                        <Link href={a.href} className="text-decoration-none">
                            <div className="admin-card text-center" style={{ padding: 24, cursor: "pointer", transition: "transform 0.15s" }}
                                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}>
                                <i className={`bx ${a.icon}`} style={{ fontSize: 32, color: "var(--alha-cta, #FF9900)", display: "block", marginBottom: 8 }} />
                                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{a.label}</div>
                                <div style={{ fontSize: "0.78rem", color: "#888", marginTop: 4 }}>{a.desc}</div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
