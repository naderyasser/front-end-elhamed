"use client";
import { useState, useEffect } from "react";

interface VProduct {
    id: number; name: string; price: number; quantity: number;
    product_status: string; image: string; discount: number;
    created_at: string;
}

const STATUS_LABEL: Record<string, { bg: string; label: string }> = {
    draft: { bg: "#9E9E9E", label: "مسودة" },
    pending_review: { bg: "#FFA500", label: "قيد المراجعة" },
    approved: { bg: "#4CAF50", label: "مقبول" },
    published: { bg: "#2196F3", label: "منشور" },
    rejected: { bg: "#f44336", label: "مرفوض" },
};

export default function VendorProductsPage() {
    const [products, setProducts] = useState<VProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ name: "", price: "", quantity: "", description: "", discount: "0" });
    const [image, setImage] = useState<File | null>(null);

    const load = () => {
        setLoading(true);
        fetch("/api/flask/vendor/api/products").then(r => r.json())
            .then(d => setProducts(d.products || []))
            .finally(() => setLoading(false));
    };
    useEffect(load, []);

    async function addProduct() {
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("price", form.price);
        fd.append("quantity", form.quantity);
        fd.append("description", form.description);
        fd.append("discount", form.discount);
        if (image) fd.append("image", image);
        await fetch("/api/flask/vendor/api/products", { method: "POST", body: fd });
        setShowAdd(false);
        setForm({ name: "", price: "", quantity: "", description: "", discount: "0" });
        setImage(null);
        load();
    }

    async function deleteProduct(pid: number) {
        if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
        await fetch(`/api/flask/vendor/api/products/${pid}`, { method: "DELETE" });
        load();
    }

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h1 className="admin-page-title"><i className="bx bx-package" /> منتجاتي</h1>
                <button onClick={() => setShowAdd(true)} className="btn-cta-alha d-flex align-items-center gap-2"
                    style={{ padding: "8px 18px", borderRadius: 10, fontSize: "0.88rem" }}>
                    <i className="bx bx-plus" /> إضافة منتج
                </button>
            </div>

            {loading ? <div className="text-center p-5"><i className="bx bx-loader-alt bx-spin" style={{ fontSize: 32 }} /></div> : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                    {products.map(p => (
                        <div key={p.id} className="admin-card" style={{ overflow: "hidden" }}>
                            <div style={{ height: 140, background: `url(/api/flask/${p.image}) center/cover`, borderRadius: "12px 12px 0 0", position: "relative" }}>
                                <span style={{
                                    position: "absolute", top: 8, right: 8,
                                    background: STATUS_LABEL[p.product_status]?.bg || "#888", color: "#fff",
                                    padding: "2px 10px", borderRadius: 8, fontSize: "0.72rem",
                                }}>{STATUS_LABEL[p.product_status]?.label || p.product_status}</span>
                            </div>
                            <div style={{ padding: "12px 16px" }}>
                                <h4 style={{ margin: "0 0 6px", fontSize: "0.92rem", fontWeight: 700 }}>{p.name}</h4>
                                <div className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: "0.85rem" }}>
                                    <span style={{ fontWeight: 700, color: "var(--alha-primary, #0071CE)" }}>{p.price.toLocaleString("ar-EG")} ج.م</span>
                                    <span style={{ color: "#888" }}>مخزون: {p.quantity}</span>
                                </div>
                                {p.discount > 0 && <span style={{ background: "#f44336", color: "#fff", padding: "2px 8px", borderRadius: 6, fontSize: "0.72rem" }}>-{p.discount}%</span>}
                                <div className="d-flex gap-2 mt-2">
                                    <button onClick={() => deleteProduct(p.id)}
                                        style={{ flex: 1, background: "#f44336", color: "#fff", border: "none", borderRadius: 6, padding: "6px 0", fontSize: "0.78rem", cursor: "pointer" }}>
                                        <i className="bx bx-trash" /> حذف
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {products.length === 0 && (
                        <div className="admin-card text-center" style={{ padding: 40, color: "#aaa", gridColumn: "1 / -1" }}>
                            <i className="bx bx-package" style={{ fontSize: 48, display: "block", marginBottom: 12 }} />
                            لا يوجد منتجات بعد — ابدأ بإضافة أول منتج
                        </div>
                    )}
                </div>
            )}

            {/* Add product modal */}
            {showAdd && (
                <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
                    <div className="admin-modal" style={{ maxWidth: 520 }}>
                        <div className="admin-modal-header">
                            <h2><i className="bx bx-plus-circle" /> إضافة منتج جديد</h2>
                            <button className="admin-modal-close" onClick={() => setShowAdd(false)}>&times;</button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="mb-3">
                                <label className="admin-form-label">اسم المنتج <span className="text-danger">*</span></label>
                                <input className="admin-form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="row g-3 mb-3">
                                <div className="col-4">
                                    <label className="admin-form-label">السعر (ج.م) <span className="text-danger">*</span></label>
                                    <input type="number" className="admin-form-control" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                                </div>
                                <div className="col-4">
                                    <label className="admin-form-label">الكمية <span className="text-danger">*</span></label>
                                    <input type="number" className="admin-form-control" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
                                </div>
                                <div className="col-4">
                                    <label className="admin-form-label">الخصم (%)</label>
                                    <input type="number" min="0" max="100" className="admin-form-control" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="admin-form-label">وصف المنتج</label>
                                <textarea className="admin-form-control" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="mb-4">
                                <label className="admin-form-label">صورة المنتج</label>
                                <input type="file" accept="image/*" className="admin-form-control" onChange={e => setImage(e.target.files?.[0] || null)} />
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" onClick={() => setShowAdd(false)} className="btn-outline-alha">إلغاء</button>
                                <button onClick={addProduct} className="btn-cta-alha d-flex align-items-center gap-2"><i className="bx bx-save" /> إضافة</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
