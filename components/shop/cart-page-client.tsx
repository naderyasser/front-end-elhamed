"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { formatMoneyEGP, formatStoreImage } from "@/lib/store-utils";
import { useCart, type CartItem } from "@/contexts/CartContext";

export default function CartPageClient() {
    const { cart, isMounted, updateQuantity, removeFromCart, refreshCart } = useCart();
    const [pendingId, setPendingId] = useState<number | null>(null);
    const [error, setError] = useState<string>("");

    // Refresh cart from API on mount to get latest data
    useEffect(() => {
        if (isMounted) {
            refreshCart();
        }
    }, [isMounted, refreshCart]);

    async function handleUpdateQuantity(itemId: number, quantity: number) {
        setPendingId(itemId);
        setError("");
        try {
            await updateQuantity(itemId, quantity);
        } catch (err) {
            setError("فشل تحديث الكمية");
        } finally {
            setPendingId(null);
        }
    }

    async function handleRemoveItem(itemId: number) {
        setPendingId(itemId);
        setError("");
        try {
            await removeFromCart(itemId);
        } catch (err) {
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
        handleUpdateQuantity(item.id, quantity);
    }

    if (!isMounted) {
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
                                        <td>{formatMoneyEGP(item.unit_price || 0)}</td>
                                        <td>
                                            <form className="d-flex gap-2" onSubmit={(event) => handleUpdateSubmit(event, item)}>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={Math.max(item.max_quantity || 100, 1)}
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
                                        <td>{formatMoneyEGP(item.line_total || 0)}</td>
                                        <td>
                                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveItem(item.id)} disabled={pendingId === item.id}>
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
