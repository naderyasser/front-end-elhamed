"use client";
import { useState, useEffect } from "react";

interface Customer {
    id: number; name: string; email: string; phone: string;
    customer_tier: string; is_banned: boolean;
    total_spent: number; order_count: number;
    created_at: string;
}

const TIER_LABEL: Record<string, { label: string; color: string }> = {
    new: { label: "جديد", color: "#2196F3" },
    regular: { label: "عادي", color: "#4CAF50" },
    vip: { label: "VIP", color: "#FF9800" },
};

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [tierFilter, setTierFilter] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams({ page: String(page), per_page: "20" });
        if (search) params.set("search", search);
        if (tierFilter) params.set("tier", tierFilter);
        fetch(`/api/flask/admin/api/customers?${params}`, { credentials: "include" })
            .then(r => r.json())
            .then(d => { setCustomers(d.customers || []); setTotal(d.total || 0); })
            .finally(() => setLoading(false));
    }, [page, search, tierFilter]);

    async function updateTier(uid: number, tier: string) {
        await fetch(`/api/flask/admin/api/customers/${uid}/tier`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tier }), credentials: "include",
        });
        setCustomers(prev => prev.map(c => c.id === uid ? { ...c, customer_tier: tier } : c));
    }

    const totalPages = Math.ceil(total / 20);

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h1 className="admin-page-title"><i className="bx bx-user" /> إدارة العملاء</h1>
                <span style={{ fontSize: "0.85rem", color: "#888" }}>{total} عميل</span>
            </div>

            <div className="d-flex gap-3 mb-4 flex-wrap">
                <input
                    className="admin-form-control" placeholder="بحث بالاسم أو البريد أو الهاتف..."
                    value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    style={{ maxWidth: 320 }}
                />
                <div className="d-flex gap-2">
                    {["", "new", "regular", "vip"].map(t => (
                        <button key={t} onClick={() => { setTierFilter(t); setPage(1); }}
                            className={`btn-sm ${tierFilter === t ? "btn-cta-alha" : "btn-outline-alha"}`}
                            style={{ padding: "6px 14px", borderRadius: 8, fontSize: "0.82rem", border: tierFilter === t ? "none" : "1px solid #ddd" }}>
                            {t === "" ? "الكل" : TIER_LABEL[t]?.label || t}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? <div className="text-center p-5"><i className="bx bx-loader-alt bx-spin" style={{ fontSize: 32 }} /></div> : (
                <div className="admin-card" style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                        <thead>
                            <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                                <th style={{ padding: "12px 16px", textAlign: "right" }}>العميل</th>
                                <th style={{ padding: "12px 16px", textAlign: "right" }}>البريد</th>
                                <th style={{ padding: "12px 16px", textAlign: "center" }}>الهاتف</th>
                                <th style={{ padding: "12px 16px", textAlign: "center" }}>المستوى</th>
                                <th style={{ padding: "12px 16px", textAlign: "center" }}>الطلبات</th>
                                <th style={{ padding: "12px 16px", textAlign: "center" }}>إجمالي الإنفاق</th>
                                <th style={{ padding: "12px 16px", textAlign: "center" }}>تاريخ التسجيل</th>
                                <th style={{ padding: "12px 16px", textAlign: "center" }}>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map(c => (
                                <tr key={c.id} style={{ borderBottom: "1px solid #eee", opacity: c.is_banned ? 0.5 : 1 }}>
                                    <td style={{ padding: "12px 16px" }}>
                                        <strong>{c.name}</strong>
                                        {c.is_banned && <span style={{ background: "#f44336", color: "#fff", padding: "2px 8px", borderRadius: 8, fontSize: "0.7rem", marginRight: 8 }}>محظور</span>}
                                    </td>
                                    <td style={{ padding: "12px 16px", fontSize: "0.82rem" }}>{c.email}</td>
                                    <td style={{ padding: "12px 16px", textAlign: "center", fontSize: "0.82rem" }}>{c.phone || "—"}</td>
                                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                        <select value={c.customer_tier} onChange={e => updateTier(c.id, e.target.value)}
                                            style={{
                                                padding: "4px 8px", borderRadius: 8, border: "1px solid #ddd", fontSize: "0.82rem",
                                                background: TIER_LABEL[c.customer_tier]?.color || "#888", color: "#fff", cursor: "pointer"
                                            }}>
                                            <option value="new">جديد</option>
                                            <option value="regular">عادي</option>
                                            <option value="vip">VIP</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: "12px 16px", textAlign: "center" }}>{c.order_count}</td>
                                    <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600 }}>{Math.round(c.total_spent).toLocaleString("ar-EG")} ج.م</td>
                                    <td style={{ padding: "12px 16px", textAlign: "center", fontSize: "0.82rem" }}>
                                        {new Date(c.created_at).toLocaleDateString("ar-EG")}
                                    </td>
                                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                        <button onClick={() => window.open(`/api/flask/admin/api/customers/${c.id}`, "_blank")}
                                            style={{ background: "#2196F3", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: "0.78rem", cursor: "pointer" }}>
                                            <i className="bx bx-show" /> عرض
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {customers.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "#aaa" }}>لا يوجد عملاء</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center gap-2 mt-4">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
                        <button key={p} onClick={() => setPage(p)}
                            style={{
                                padding: "6px 12px", borderRadius: 8, border: "none", fontSize: "0.85rem", cursor: "pointer",
                                background: p === page ? "var(--alha-primary, #0071CE)" : "#f0f0f0",
                                color: p === page ? "#fff" : "#333",
                            }}>
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
