"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatMoneyEGP, formatStoreImage } from "@/lib/store-utils";
import { useCart, type CartItem } from "@/contexts/CartContext";

export default function CartPageClient() {
    const { cart, isMounted, updateQuantity, removeFromCart, refreshCart } = useCart();
    const [pendingId, setPendingId] = useState<number | null>(null);
    const [removingId, setRemovingId] = useState<number | null>(null);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        if (isMounted) refreshCart();
    }, [isMounted, refreshCart]);

    async function handleQtyChange(item: CartItem, delta: number) {
        const next = item.quantity + delta;
        if (next < 1 || next > (item.max_quantity || 100)) return;
        setPendingId(item.id);
        setError("");
        try {
            await updateQuantity(item.id, next);
        } catch {
            setError("فشل تحديث الكمية");
        } finally {
            setPendingId(null);
        }
    }

    async function handleRemoveItem(itemId: number) {
        setRemovingId(itemId);
        setError("");
        try {
            await removeFromCart(itemId);
        } catch {
            setError("فشل حذف العنصر");
        } finally {
            setRemovingId(null);
        }
    }

    /* ── Loading / Error states ── */
    if (!isMounted) {
        return (
            <div className="cart-page">
                <div className="cart-skeleton">
                    {[1, 2].map(i => (
                        <div key={i} className="cart-skeleton-row">
                            <div className="cart-skel-img" />
                            <div className="cart-skel-lines">
                                <div className="cart-skel-line" style={{ width: "60%" }} />
                                <div className="cart-skel-line" style={{ width: "35%" }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!cart) {
        return (
            <div className="cart-page">
                <div className="cart-error-state">
                    <i className="bx bx-error-circle" />
                    <p>تعذر تحميل بيانات السلة</p>
                    <button className="cart-btn-retry" onClick={() => refreshCart()}>
                        <i className="bx bx-refresh" /> إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    /* ── Empty state ── */
    if (cart.items.length === 0) {
        return (
            <div className="cart-page">
                <div className="cart-empty">
                    <div className="cart-empty-icon">
                        <i className="bx bx-cart" />
                    </div>
                    <h2>سلة التسوق فارغة</h2>
                    <p>لم تضف أي منتجات بعد — تصفح المتجر واختار اللي يعجبك!</p>
                    <Link href="/shop/products" className="cart-btn-shop">
                        <i className="bx bx-store" /> تصفح المنتجات
                    </Link>
                </div>
            </div>
        );
    }

    /* ── Cart with items ── */
    return (
        <div className="cart-page">
            {/* Breadcrumbs */}
            <nav className="cart-breadcrumbs">
                <Link href="/shop">الرئيسية</Link>
                <i className="bx bx-chevron-left" />
                <Link href="/shop/products">المتجر</Link>
                <i className="bx bx-chevron-left" />
                <span>السلة</span>
            </nav>

            <h1 className="cart-title">
                <i className="bx bx-cart" />
                سلة التسوق
                <span className="cart-title-count">{cart.items_count} منتج</span>
            </h1>

            {error && (
                <div className="cart-alert-error">
                    <i className="bx bx-error-circle" /> {error}
                </div>
            )}

            <div className="cart-layout">
                {/* ── Items Column ── */}
                <div className="cart-items-col">
                    {cart.items.map((item) => {
                        const isRemoving = removingId === item.id;
                        const isPending = pendingId === item.id;
                        return (
                            <div
                                key={item.id}
                                className={`cart-item-card${isRemoving ? " removing" : ""}`}
                            >
                                {/* Product image */}
                                <Link href={item.product.url || `/shop/products/${item.product.id}`} className="cart-item-img-wrap">
                                    <img
                                        src={formatStoreImage(item.product.image)}
                                        alt={item.product.name}
                                        className="cart-item-img"
                                        onError={(e) => { (e.target as HTMLImageElement).src = "/static/images/placeholder-product.svg"; }}
                                    />
                                </Link>

                                {/* Info */}
                                <div className="cart-item-info">
                                    <Link href={item.product.url || `/shop/products/${item.product.id}`} className="cart-item-name">
                                        {item.product.name}
                                    </Link>

                                    {item.variant_label && (
                                        <span className="cart-item-variant">{item.variant_label}</span>
                                    )}

                                    <div className="cart-item-price-row">
                                        <span className="cart-item-unit-price">
                                            {formatMoneyEGP(item.unit_price || 0)}
                                        </span>
                                        {(item.product.discount ?? 0) > 0 && (
                                            <span className="cart-item-old-price">
                                                {formatMoneyEGP(item.product.price || 0)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Quantity controls */}
                                    <div className="cart-item-bottom">
                                        <div className="cart-qty-controls">
                                            <button
                                                type="button"
                                                className="cart-qty-btn"
                                                disabled={isPending || item.quantity <= 1}
                                                onClick={() => handleQtyChange(item, -1)}
                                                aria-label="أقل"
                                            >
                                                <i className="bx bx-minus" />
                                            </button>
                                            <span className={`cart-qty-value${isPending ? " loading" : ""}`}>
                                                {isPending ? <i className="bx bx-loader-alt bx-spin" /> : item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                className="cart-qty-btn"
                                                disabled={isPending || item.quantity >= (item.max_quantity || 100)}
                                                onClick={() => handleQtyChange(item, +1)}
                                                aria-label="أكثر"
                                            >
                                                <i className="bx bx-plus" />
                                            </button>
                                        </div>

                                        <span className="cart-item-line-total">
                                            {formatMoneyEGP(item.line_total || 0)}
                                        </span>

                                        <button
                                            type="button"
                                            className="cart-remove-btn"
                                            onClick={() => handleRemoveItem(item.id)}
                                            disabled={isRemoving}
                                            aria-label="حذف"
                                        >
                                            <i className={isRemoving ? "bx bx-loader-alt bx-spin" : "bx bx-trash"} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Summary Column ── */}
                <div className="cart-summary-col">
                    <div className="cart-summary-card">
                        <h3 className="cart-summary-title">ملخص الطلب</h3>

                        <div className="cart-summary-row">
                            <span>المجموع الجزئي ({cart.items_count} منتج)</span>
                            <span>{formatMoneyEGP(cart.subtotal)}</span>
                        </div>
                        <div className="cart-summary-row">
                            <span>الشحن</span>
                            <span className="cart-summary-shipping">يُحسب عند الدفع</span>
                        </div>

                        <div className="cart-summary-total">
                            <span>الإجمالي</span>
                            <span>{formatMoneyEGP(cart.total)}</span>
                        </div>

                        <Link href="/shop/checkout" className="cart-btn-checkout">
                            <i className="bx bx-lock-alt" /> إتمام الشراء
                        </Link>

                        {/* WhatsApp alternative */}
                        <a
                            href={`https://wa.me/201050188516?text=${encodeURIComponent("أريد إكمال طلبي من متجر الحمد")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="cart-btn-whatsapp"
                        >
                            <i className="bx bxl-whatsapp" /> أو اطلب عبر واتساب
                        </a>

                        <Link href="/shop/products" className="cart-btn-continue">
                            <i className="bx bx-left-arrow-alt" /> متابعة التسوق
                        </Link>

                        <div className="cart-trust-badges">
                            <span><i className="bx bxs-truck" /> شحن سريع</span>
                            <span><i className="bx bx-money" /> الدفع عند الاستلام</span>
                            <span><i className="bx bx-shield-quarter" /> منتجات أصلية</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
