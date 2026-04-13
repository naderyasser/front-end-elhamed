"use client";
import { useState } from "react";

export function WishlistIconButton({ productId }: { productId: number }) {
    const [added, setAdded] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        // Optimistic update
        const wasAdded = added;
        setAdded(!wasAdded);
        try {
            const res = await fetch(`/api/flask/api/wishlist/${productId}`, {
                method: wasAdded ? "DELETE" : "POST",
                credentials: "include",
            });
            if (!res.ok) {
                setAdded(wasAdded); // Revert on failure
            }
        } catch {
            setAdded(wasAdded); // Revert on error
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleToggle}
            className="product-wishlist-btn"
            aria-label={added ? "إزالة من المفضلة" : "إضافة للمفضلة"}
            disabled={loading}
        >
            {loading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            ) : (
                <i className={`bx ${added ? "bxs-heart" : "bx-heart"}`} style={added ? { color: "#e53935" } : {}} />
            )}
        </button>
    );
}
