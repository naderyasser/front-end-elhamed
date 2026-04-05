"use client";
import { useState, useEffect } from "react";

interface Review {
    id: number; product_id: number; product_name: string;
    user_name: string; user_email: string;
    rating: number; title: string; comment: string;
    status: string; created_at: string;
}

const STATUS_BADGE: Record<string, { bg: string; label: string }> = {
    pending: { bg: "#FFA500", label: "قيد المراجعة" },
    approved: { bg: "#4CAF50", label: "مقبول" },
    rejected: { bg: "#f44336", label: "مرفوض" },
};

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        setLoading(true);
        const params = filter ? `?status=${filter}` : "";
        fetch(`/api/flask/admin/api/reviews${params}`)
            .then(r => r.json()).then(d => setReviews(d.reviews || []))
            .finally(() => setLoading(false));
    }, [filter]);

    async function updateStatus(rid: number, status: string) {
        await fetch(`/api/flask/admin/api/reviews/${rid}/status`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        setReviews(prev => prev.map(r => r.id === rid ? { ...r, status } : r));
    }

    function renderStars(rating: number) {
        return (
            <span className="d-flex gap-0">
                {[1, 2, 3, 4, 5].map(v => (
                    <i key={v} className={`bx bxs-star`} style={{ color: v <= rating ? "#FFC107" : "#e0e0e0", fontSize: "0.95rem" }} />
                ))}
            </span>
        );
    }

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h1 className="admin-page-title"><i className="bx bx-star" /> إدارة المراجعات</h1>
                <div className="d-flex gap-2">
                    {["", "pending", "approved", "rejected"].map(s => (
                        <button key={s} onClick={() => setFilter(s)}
                            className={`btn-sm ${filter === s ? "btn-cta-alha" : "btn-outline-alha"}`}
                            style={{ padding: "6px 14px", borderRadius: 8, fontSize: "0.82rem", border: filter === s ? "none" : "1px solid #ddd" }}>
                            {s === "" ? "الكل" : STATUS_BADGE[s]?.label || s}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? <div className="text-center p-5"><i className="bx bx-loader-alt bx-spin" style={{ fontSize: 32 }} /></div> : (
                <div style={{ display: "grid", gap: 16 }}>
                    {reviews.map(r => (
                        <div key={r.id} className="admin-card" style={{ padding: "20px 24px" }}>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        {renderStars(r.rating)}
                                        <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{r.title || "بدون عنوان"}</span>
                                    </div>
                                    <div style={{ fontSize: "0.82rem", color: "#888" }}>
                                        <strong>{r.user_name}</strong> — على منتج: <strong>{r.product_name}</strong>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <span style={{
                                        background: STATUS_BADGE[r.status]?.bg || "#888", color: "#fff",
                                        padding: "4px 12px", borderRadius: 12, fontSize: "0.78rem",
                                    }}>{STATUS_BADGE[r.status]?.label || r.status}</span>
                                    <span style={{ fontSize: "0.78rem", color: "#aaa" }}>{new Date(r.created_at).toLocaleDateString("ar-EG")}</span>
                                </div>
                            </div>
                            <p style={{ margin: "12px 0 16px", fontSize: "0.88rem", color: "#555", lineHeight: 1.8 }}>{r.comment}</p>
                            <div className="d-flex gap-2">
                                {r.status !== "approved" && (
                                    <button onClick={() => updateStatus(r.id, "approved")}
                                        style={{ background: "#4CAF50", color: "#fff", border: "none", borderRadius: 8, padding: "6px 16px", fontSize: "0.82rem", cursor: "pointer" }}>
                                        <i className="bx bx-check" /> قبول
                                    </button>
                                )}
                                {r.status !== "rejected" && (
                                    <button onClick={() => updateStatus(r.id, "rejected")}
                                        style={{ background: "#f44336", color: "#fff", border: "none", borderRadius: 8, padding: "6px 16px", fontSize: "0.82rem", cursor: "pointer" }}>
                                        <i className="bx bx-x" /> رفض
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {reviews.length === 0 && (
                        <div className="admin-card text-center" style={{ padding: 40, color: "#aaa" }}>
                            <i className="bx bx-star" style={{ fontSize: 48, display: "block", marginBottom: 12 }} />
                            لا يوجد مراجعات
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
