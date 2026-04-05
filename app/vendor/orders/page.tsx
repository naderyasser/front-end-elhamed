"use client";
import { useState, useEffect } from "react";

interface SubOrder {
    id: number; order_id: number; status: string; tracking_number: string;
    subtotal: number; commission_amount: number; vendor_earning: number;
    customer_name: string; customer_phone: string; customer_city: string;
    items: { product_name: string; quantity: number; unit_price: number }[];
    created_at: string;
}

const STATUS_MAP: Record<string, { label: string; bg: string; next?: { status: string; label: string } }> = {
    pending: { label: "قيد الانتظار", bg: "#FFA500", next: { status: "confirmed", label: "تأكيد" } },
    confirmed: { label: "مؤكد", bg: "#2196F3", next: { status: "shipped", label: "شحن" } },
    shipped: { label: "تم الشحن", bg: "#9C27B0", next: { status: "delivered", label: "تم التوصيل" } },
    delivered: { label: "تم التوصيل", bg: "#4CAF50" },
    cancelled: { label: "ملغي", bg: "#f44336" },
};

export default function VendorOrdersPage() {
    const [orders, setOrders] = useState<SubOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/flask/vendor/api/orders").then(r => r.json())
            .then(d => setOrders(d.sub_orders || []))
            .finally(() => setLoading(false));
    }, []);

    async function updateStatus(soId: number, status: string) {
        const body: Record<string, string> = { status };
        if (status === "shipped") {
            const tn = prompt("أدخل رقم التتبع (اختياري):");
            if (tn) body.tracking_number = tn;
        }
        await fetch(`/api/flask/vendor/api/orders/${soId}/status`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        setOrders(prev => prev.map(o => o.id === soId ? { ...o, status, ...(body.tracking_number ? { tracking_number: body.tracking_number } : {}) } : o));
    }

    return (
        <div>
            <h1 className="admin-page-title mb-4"><i className="bx bx-cart-alt" /> طلباتي</h1>

            {loading ? <div className="text-center p-5"><i className="bx bx-loader-alt bx-spin" style={{ fontSize: 32 }} /></div> : (
                <div style={{ display: "grid", gap: 16 }}>
                    {orders.map(o => {
                        const s = STATUS_MAP[o.status] || { label: o.status, bg: "#888" };
                        return (
                            <div key={o.id} className="admin-card" style={{ padding: "20px 24px" }}>
                                <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                                    <div>
                                        <span style={{ fontWeight: 700, fontSize: "1rem" }}>طلب #{o.order_id}</span>
                                        <span style={{ background: s.bg, color: "#fff", padding: "3px 12px", borderRadius: 12, fontSize: "0.78rem", marginRight: 10 }}>{s.label}</span>
                                        {o.tracking_number && <span style={{ fontSize: "0.78rem", color: "#888", marginRight: 8 }}>تتبع: {o.tracking_number}</span>}
                                    </div>
                                    <span style={{ fontSize: "0.78rem", color: "#aaa" }}>{new Date(o.created_at).toLocaleDateString("ar-EG")}</span>
                                </div>

                                <div className="d-flex gap-4 mb-3 flex-wrap" style={{ fontSize: "0.85rem", color: "#555" }}>
                                    <span><i className="bx bx-user" /> {o.customer_name}</span>
                                    <span><i className="bx bx-phone" /> {o.customer_phone}</span>
                                    <span><i className="bx bx-map" /> {o.customer_city}</span>
                                </div>

                                {/* Items */}
                                <div style={{ background: "#f8f9fa", borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
                                    {(o.items || []).map((it, i) => (
                                        <div key={i} className="d-flex justify-content-between" style={{ fontSize: "0.85rem", padding: "4px 0" }}>
                                            <span>{it.product_name} × {it.quantity}</span>
                                            <span style={{ fontWeight: 600 }}>{(it.unit_price * it.quantity).toLocaleString("ar-EG")} ج.م</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="d-flex justify-content-between align-items-center">
                                    <div style={{ fontSize: "0.85rem" }}>
                                        <span style={{ fontWeight: 700 }}>الإجمالي: {o.subtotal.toLocaleString("ar-EG")} ج.م</span>
                                        <span style={{ color: "#888", marginRight: 12 }}>العمولة: {o.commission_amount.toLocaleString("ar-EG")} ج.م</span>
                                        <span style={{ color: "#4CAF50", fontWeight: 700 }}>ربحك: {o.vendor_earning.toLocaleString("ar-EG")} ج.م</span>
                                    </div>
                                    {s.next && (
                                        <button onClick={() => updateStatus(o.id, s.next!.status)}
                                            style={{ background: "#4CAF50", color: "#fff", border: "none", borderRadius: 8, padding: "6px 18px", fontSize: "0.82rem", cursor: "pointer" }}>
                                            <i className="bx bx-check" /> {s.next.label}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {orders.length === 0 && (
                        <div className="admin-card text-center" style={{ padding: 40, color: "#aaa" }}>
                            <i className="bx bx-cart-alt" style={{ fontSize: 48, display: "block", marginBottom: 12 }} />
                            لا يوجد طلبات بعد
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
