"use client";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";

export function AddToCartForm({ productId, inStock }: { productId: number; inStock: boolean }) {
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const { addToCart } = useCart();

    const handleAddToCart = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            await addToCart(productId, quantity);
            setMessage({ type: "success", text: "تمت إضافة المنتج إلى السلة بنجاح! ✓" });
            
            // Refresh cart counter by triggering a custom event
            window.dispatchEvent(new Event("cart-updated"));
            
            // Clear success message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error("Error adding to cart:", error);
            setMessage({ type: "error", text: "حدث خطأ أثناء إضافة المنتج. يرجى المحاولة مرة أخرى." });
            
            // Clear error message after 5 seconds
            setTimeout(() => setMessage(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="d-flex align-items-center gap-2 mt-4 mb-3" onSubmit={handleAddToCart}>
            <label htmlFor="qty" className="fw-semibold">الكمية:</label>
            <input
                id="qty"
                type="number"
                min={1}
                max={100}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                name="quantity"
                className="form-control"
                style={{ width: 90 }}
                disabled={!inStock || loading}
            />
            <button
                type="submit"
                className="btn btn-warning"
                style={{ fontWeight: 700 }}
                disabled={!inStock || loading}
            >
                {loading ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        جاري الإضافة...
                    </>
                ) : (
                    <>
                        <i className="bx bx-cart-add" /> أضف إلى السلة
                    </>
                )}
            </button>
            
            {message && (
                <div
                    className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"} mt-2 mb-0`}
                    style={{ padding: "8px 12px", fontSize: "0.9rem" }}
                >
                    {message.text}
                </div>
            )}
        </form>
    );
}