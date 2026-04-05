"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order_id") || searchParams.get("id");

    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container" style={{ maxWidth: 760 }}>
                <div className="shop-page-card text-center">
                    <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#e8f5e9", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                        <i className="bx bx-check" style={{ fontSize: 48, color: "#2e7d32" }} />
                    </div>
                    <h1 className="mt-2" style={{ fontWeight: 800 }}>
                        تم تأكيد طلبك بنجاح
                    </h1>
                    {orderId && (
                        <p className="text-muted mt-2" style={{ fontSize: "1.1rem" }}>
                            رقم الطلب: <strong style={{ color: "var(--alha-primary, #0071ce)" }}>#{orderId}</strong>
                        </p>
                    )}
                    <p className="text-muted">
                        سيتم التواصل معك لتأكيد الشحنة. يمكنك متابعة حالة طلبك من صفحة الطلبات.
                    </p>
                    <div className="d-flex justify-content-center gap-2 mt-3 flex-wrap">
                        {orderId ? (
                            <Link href={`/shop/orders/${orderId}`} className="btn btn-primary">
                                <i className="bx bx-package me-1" /> تتبع الطلب
                            </Link>
                        ) : (
                            <Link href="/shop/orders" className="btn btn-primary">
                                <i className="bx bx-list-ul me-1" /> متابعة الطلبات
                            </Link>
                        )}
                        <Link href="/shop/products" className="btn btn-outline-secondary">
                            <i className="bx bx-store me-1" /> متابعة التسوق
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<div className="text-center p-5">جاري التحميل...</div>}>
            <OrderConfirmationContent />
        </Suspense>
    );
}
