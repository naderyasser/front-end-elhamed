"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function WishlistRemoveButton({ productId }: { productId: number }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRemove = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/flask/api/wishlist/${productId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                router.refresh();
            }
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleRemove}
            className="btn btn-outline-danger btn-sm"
            disabled={loading}
        >
            {loading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            ) : (
                <><i className="bx bx-trash" /> إزالة</>
            )}
        </button>
    );
}
