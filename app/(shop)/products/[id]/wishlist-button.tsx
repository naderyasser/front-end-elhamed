"use client";
import { useState } from "react";

export function WishlistButton({ productId }: { productId: number }) {
    const [added, setAdded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError(null);
        // Optimistic update
        const wasAdded = added;
        setAdded(!wasAdded);
        try {
            const res = await fetch(`/api/flask/api/wishlist/${productId}`, {
                method: wasAdded ? "DELETE" : "POST",
                credentials: "include",
            });
            if (!res.ok) {
                setAdded(wasAdded); // Revert
                setError("حدث خطأ، حاول مرة أخرى");
                setTimeout(() => setError(null), 3000);
            }
        } catch {
            setAdded(wasAdded); // Revert
            setError("فشل الاتصال، حاول مرة أخرى");
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={handleToggle}
                className={`btn ${added ? "btn-danger" : "btn-outline-secondary"}`}
                disabled={loading}
                aria-label={added ? "إزالة من المفضلة" : "إضافة للمفضلة"}
            >
                {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                ) : (
                    <i className={`bx ${added ? "bxs-heart" : "bx-heart"}`} />
                )}
                {" "}{added ? "في المفضلة" : "للمفضلة"}
            </button>
            {error && (
                <div style={{ color: "#d32f2f", fontSize: "0.8rem", marginTop: 4 }}>{error}</div>
            )}
        </>
    );
}
