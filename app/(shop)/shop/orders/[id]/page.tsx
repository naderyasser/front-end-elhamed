"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface OrderItem {
    id: number;
    product_name: string;
    product_image: string;
    quantity: number;
    price: number;
    total: number;
}

interface OrderData {
    id: number;
    created_at: string | null;
    status: string;
    payment_status: string;
    payment_method: string;
    shipping_status: string;
    total: number;
    name: string;
    phone: string;
    address: string;
    city: string;
    notes: string;
    items: OrderItem[];
    shipping_cost: number;
}

const statusBadge: Record<string, string> = {
    pending: "text-bg-warning",
    confirmed: "text-bg-info",
    shipped: "text-bg-primary",
    delivered: "text-bg-success",
    cancelled: "text-bg-danger",
};

const statusLabel: Record<string, string> = {
    pending: "قيد الانتظار",
    confirmed: "تم التأكيد",
    shipped: "قيد الشحن",
    delivered: "تم التسليم",
    cancelled: "ملغي",
};

export default function ShopOrderDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`/api/flask/api/frontend/orders/${id}`, { cache: "no-store" })
            .then((res) => {
                if (res.status === 401) throw new Error("يرجى تسجيل الدخول أولاً");
                if (res.status === 404) throw new Error("الطلب غير موجود");
                if (!res.ok) throw new Error("حدث خطأ");
                return res.json();
            })
            .then((data) => setOrder(data.order))
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading)
        return (
            <section className="shop-page-shell" dir="rtl">
                <div className="container text-center p-5">
                    <div className="spinner-border" role="status" />
                    <p className="mt-2">جاري تحميل تفاصيل الطلب...</p>
                </div>
            </section>
        );

    if (error || !order)
        return (
            <section className="shop-page-shell" dir="rtl">
                <div className="container" style={{ maxWidth: 900 }}>
                    <div className="shop-page-card text-center">
                        <i className="bx bx-error-circle" style={{ fontSize: 48, color: "#d32f2f" }} />
                        <p className="mt-2">{error || "الطلب غير موجود"}</p>
                        <Link href="/shop/orders" className="btn btn-outline-secondary mt-2">العودة للطلبات</Link>
                    </div>
                </div>
            </section>
        );

    const st = (order.status || "pending").toLowerCase();
    const formattedDate = order.created_at
        ? new Date(order.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
        : "—";
    const subtotal = order.items.reduce((s, i) => s + i.total, 0);

    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container" style={{ maxWidth: 900 }}>
                <div className="shop-page-card">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                        <h1 style={{ fontWeight: 800, margin: 0 }}>تفاصيل الطلب #{order.id}</h1>
                        <span className={`badge ${statusBadge[st] || "text-bg-secondary"}`}>
                            {statusLabel[st] || order.status}
                        </span>
                    </div>

                    {/* Summary row */}
                    <div className="row g-3 mb-3">
                        <div className="col-md-4"><strong>العميل:</strong> {order.name}</div>
                        <div className="col-md-4"><strong>الهاتف:</strong> <span dir="ltr">{order.phone}</span></div>
                        <div className="col-md-4"><strong>التاريخ:</strong> {formattedDate}</div>
                    </div>
                    <div className="row g-3 mb-3">
                        <div className="col-md-4"><strong>العنوان:</strong> {order.address}</div>
                        {order.city && <div className="col-md-4"><strong>المدينة:</strong> {order.city}</div>}
                        <div className="col-md-4"><strong>الدفع:</strong> {order.payment_method || "—"}</div>
                    </div>
                    {order.notes && (
                        <div className="mb-3 p-2 rounded" style={{ background: "#f9f9f9" }}>
                            <strong>ملاحظات:</strong> {order.notes}
                        </div>
                    )}

                    {/* Items table */}
                    <h5 className="mb-2">المنتجات</h5>
                    <div className="table-responsive mb-3">
                        <table className="table align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>المنتج</th>
                                    <th className="text-center">الكمية</th>
                                    <th className="text-center">السعر</th>
                                    <th className="text-center">الإجمالي</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                {item.product_image && (
                                                    <img
                                                        src={item.product_image}
                                                        alt={item.product_name}
                                                        width={48}
                                                        height={48}
                                                        className="rounded"
                                                        style={{ objectFit: "cover" }}
                                                    />
                                                )}
                                                {item.product_name}
                                            </div>
                                        </td>
                                        <td className="text-center">{item.quantity}</td>
                                        <td className="text-center">{item.price.toFixed(2)} ج.م</td>
                                        <td className="text-center">{item.total.toFixed(2)} ج.م</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="d-flex flex-column align-items-end gap-1 mb-3" style={{ fontSize: "0.95rem" }}>
                        <span>المجموع الفرعي: <strong>{subtotal.toFixed(2)} ج.م</strong></span>
                        {order.shipping_cost > 0 && (
                            <span>الشحن: <strong>{order.shipping_cost.toFixed(2)} ج.م</strong></span>
                        )}
                        <span style={{ fontSize: "1.15rem" }}>
                            الإجمالي: <strong style={{ color: "var(--alha-primary, #0071ce)" }}>{order.total.toFixed(2)} ج.م</strong>
                        </span>
                    </div>

                    <div className="d-flex gap-2">
                        <Link href="/shop/orders" className="btn btn-outline-secondary">العودة للطلبات</Link>
                        <Link href="/shop/contact" className="btn btn-primary">طلب مساعدة</Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
