"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { formatMoneyEGP, formatStoreImage } from "@/lib/store-utils";

type CartItem = {
    id: number;
    quantity: number;
    max_quantity: number;
    line_total: number;
    unit_price: number;
    product: {
        id: number;
        name: string;
        image: string;
    };
};

type CartResponse = {
    items: CartItem[];
    items_count: number;
    subtotal: number;
    total: number;
};

export default function CartPageClient() {
    const [cart, setCart] = useState<CartResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [pendingId, setPendingId] = useState<number | null>(null);
    const [error, setError] = useState<string>("");

    async function loadCart() {
        setLoading(true);
        setError("");
        try {
            const response = await fetch("/api/flask/api/frontend/cart", { cache: "no-store" });
            const data = await response.json();
            setCart(data);
        } catch {
            setError("تعذر تحميل السلة حاليا");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCart();
    }, []);

    async function updateQuantity(itemId: number, quantity: number) {
        setPendingId(itemId);
        setError("");
        try {
            const response = await fetch(`/api/flask/api/frontend/cart/update/${itemId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity }),
            });
            const data = await response.json();
            if (!response.ok || !data?.success) {
                setError(data?.message || "فشل تحديث الكمية");
                return;
            }
            setCart(data);
        } catch {
            setError("فشل تحديث الكمية");
        } finally {
            setPendingId(null);
        }
    }

    async function removeItem(itemId: number) {
        setPendingId(itemId);
        setError("");
        try {
            const response = await fetch(`/api/flask/api/frontend/cart/remove/${itemId}`, {
                method: "POST",
            });
            const data = await response.json();
            if (!response.ok || !data?.success) {
                setError(data?.message || "فشل حذف العنصر");
                return;
            }
            setCart(data);
        } catch {
            setError("فشل حذف العنصر");
        } finally {
            setPendingId(null);
        }
    }

    function handleUpdateSubmit(event: FormEvent<HTMLFormElement>, item: CartItem) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const quantity = Number(form.get("quantity") || item.quantity);
        if (!Number.isFinite(quantity) || quantity < 1) {
            setError("الكمية غير صحيحة");
            return;
        }
        updateQuantity(item.id, quantity);
    }

    if (loading) {
        return <div className="shop-page-card">جاري تحميل السلة...</div>;
    }

    if (!cart) {
        return <div className="shop-page-card">تعذر تحميل بيانات السلة.</div>;
    }

    return (
        <div className="shop-page-card">
            <h1 className="mb-4" style={{ fontWeight: 800 }}>
                سلة التسوق
            </h1>

            {error ? <div className="alert alert-danger">{error}</div> : null}

            {cart.items.length === 0 ? (
                <div className="alert alert-info mb-0">السلة فارغة حاليا. ابدأ بإضافة منتجات من المتجر.</div>
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="table align-middle">
                            <thead>
                                <tr>
                                    <th>المنتج</th>
                                    <th>السعر</th>
                                    <th>الكمية</th>
                                    <th>الإجمالي</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {cart.items.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <img src={formatStoreImage(item.product.image)} alt={item.product.name} width={56} height={56} style={{ objectFit: "cover", borderRadius: 8 }} />
                                                <span>{item.product.name}</span>
                                            </div>
                                        </td>
                                        <td>{formatMoneyEGP(item.unit_price)}</td>
                                        <td>
                                            <form className="d-flex gap-2" onSubmit={(event) => handleUpdateSubmit(event, item)}>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={Math.max(item.max_quantity, 1)}
                                                    name="quantity"
                                                    defaultValue={item.quantity}
                                                    className="form-control"
                                                    style={{ maxWidth: 90 }}
                                                />
                                                <button type="submit" className="btn btn-outline-primary btn-sm" disabled={pendingId === item.id}>
                                                    تحديث
                                                </button>
                                            </form>
                                        </td>
                                        <td>{formatMoneyEGP(item.line_total)}</td>
                                        <td>
                                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeItem(item.id)} disabled={pendingId === item.id}>
                                                حذف
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
                        <div>
                            <strong>الإجمالي الكلي:</strong> {formatMoneyEGP(cart.total)}
                        </div>
                        <div className="d-flex gap-2">
                            <Link href="/shop" className="btn btn-outline-secondary">
                                متابعة التسوق
                            </Link>
                            <Link href="/shop/checkout" className="btn btn-primary">
                                إتمام الطلب
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
