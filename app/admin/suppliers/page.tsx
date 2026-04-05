"use client";
import { useState, useEffect } from "react";

interface Supplier {
    id: number; name: string; email: string; phone: string;
    address: string; notes: string; payment_terms: string;
    delivery_rating: number; quality_rating: number;
    is_active: boolean; product_count: number; created_at: string;
}

export default function AdminSuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Supplier | null>(null);
    const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", notes: "", payment_terms: "" });

    const load = () => {
        setLoading(true);
        fetch("/api/flask/admin/api/suppliers").then(r => r.json())
            .then(d => setSuppliers(d.suppliers || []))
            .finally(() => setLoading(false));
    };
    useEffect(load, []);

    function openAdd() {
        setEditing(null);
        setForm({ name: "", email: "", phone: "", address: "", notes: "", payment_terms: "" });
        setShowModal(true);
    }
    function openEdit(s: Supplier) {
        setEditing(s);
        setForm({ name: s.name, email: s.email || "", phone: s.phone || "", address: s.address || "", notes: s.notes || "", payment_terms: s.payment_terms || "" });
        setShowModal(true);
    }

    async function handleSave() {
        const url = editing ? `/api/flask/admin/api/suppliers/${editing.id}` : "/api/flask/admin/api/suppliers";
        const method = editing ? "PUT" : "POST";
        await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        setShowModal(false);
        load();
    }

    async function handleDelete(id: number) {
        if (!confirm("هل أنت متأكد من حذف هذا المورد؟")) return;
        await fetch(`/api/flask/admin/api/suppliers/${id}`, { method: "DELETE" });
        load();
    }

    async function rateSupplier(id: number, field: string, value: number) {
        await fetch(`/api/flask/admin/api/suppliers/${id}/rate`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [field]: value }),
        });
        load();
    }

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h1 className="admin-page-title"><i className="bx bx-box" /> إدارة الموردين</h1>
                <button onClick={openAdd} className="btn-cta-alha d-flex align-items-center gap-2" style={{ padding: "8px 18px", borderRadius: 10, fontSize: "0.88rem" }}>
                    <i className="bx bx-plus" /> إضافة مورد
                </button>
            </div>

            {loading ? <div className="text-center p-5"><i className="bx bx-loader-alt bx-spin" style={{ fontSize: 32 }} /></div> : (
                <div className="admin-card" style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                        <thead>
                            <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                                <th style={{ padding: "12px 16px", textAlign: "right" }}>المورد</th>
                                <th style={{ padding: "12px 16px", textAlign: "right" }}>التواصل</th>
                                <th style={{ padding: "12px 16px", textAlign: "center" }}>المنتجات</th>
                                <th style={{ padding: "12px 16px", textAlign: "center" }}>تقييم التوصيل</th>
                                <th style={{ padding: "12px 16px", textAlign: "center" }}>تقييم الجودة</th>
                                <th style={{ padding: "12px 16px", textAlign: "center" }}>شروط الدفع</th>
                                <th style={{ padding: "12px 16px", textAlign: "center" }}>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map(s => (
                                <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                                    <td style={{ padding: "12px 16px" }}>
                                        <strong>{s.name}</strong>
                                        {s.address && <div style={{ fontSize: "0.78rem", color: "#888" }}>{s.address}</div>}
                                    </td>
                                    <td style={{ padding: "12px 16px" }}>
                                        {s.email && <div style={{ fontSize: "0.82rem" }}>{s.email}</div>}
                                        {s.phone && <div style={{ fontSize: "0.82rem", color: "#888" }}>{s.phone}</div>}
                                    </td>
                                    <td style={{ padding: "12px 16px", textAlign: "center" }}>{s.product_count}</td>
                                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                        <div className="d-flex gap-1 justify-content-center">
                                            {[1, 2, 3, 4, 5].map(v => (
                                                <i key={v} className={`bx bxs-star`} style={{ cursor: "pointer", color: v <= s.delivery_rating ? "#FFC107" : "#e0e0e0", fontSize: "1.1rem" }}
                                                    onClick={() => rateSupplier(s.id, "delivery_rating", v)} />
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                        <div className="d-flex gap-1 justify-content-center">
                                            {[1, 2, 3, 4, 5].map(v => (
                                                <i key={v} className={`bx bxs-star`} style={{ cursor: "pointer", color: v <= s.quality_rating ? "#4CAF50" : "#e0e0e0", fontSize: "1.1rem" }}
                                                    onClick={() => rateSupplier(s.id, "quality_rating", v)} />
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: "12px 16px", textAlign: "center", fontSize: "0.82rem" }}>{s.payment_terms || "—"}</td>
                                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                        <div className="d-flex gap-1 justify-content-center">
                                            <button onClick={() => openEdit(s)} style={{ background: "#2196F3", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: "0.78rem", cursor: "pointer" }}>
                                                <i className="bx bx-edit" /> تعديل
                                            </button>
                                            <button onClick={() => handleDelete(s.id)} style={{ background: "#f44336", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: "0.78rem", cursor: "pointer" }}>
                                                <i className="bx bx-trash" /> حذف
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {suppliers.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "#aaa" }}>لا يوجد موردين</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
                    <div className="admin-modal" style={{ maxWidth: 520 }}>
                        <div className="admin-modal-header">
                            <h2><i className="bx bx-box" /> {editing ? "تعديل المورد" : "إضافة مورد جديد"}</h2>
                            <button className="admin-modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="mb-3">
                                <label className="admin-form-label">اسم المورد <span className="text-danger">*</span></label>
                                <input className="admin-form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="row g-3 mb-3">
                                <div className="col-6">
                                    <label className="admin-form-label">البريد الإلكتروني</label>
                                    <input type="email" className="admin-form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                </div>
                                <div className="col-6">
                                    <label className="admin-form-label">الهاتف</label>
                                    <input className="admin-form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="admin-form-label">العنوان</label>
                                <input className="admin-form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label className="admin-form-label">شروط الدفع</label>
                                <input className="admin-form-control" value={form.payment_terms} onChange={e => setForm({ ...form, payment_terms: e.target.value })} />
                            </div>
                            <div className="mb-4">
                                <label className="admin-form-label">ملاحظات</label>
                                <textarea className="admin-form-control" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-outline-alha">إلغاء</button>
                                <button onClick={handleSave} className="btn-cta-alha d-flex align-items-center gap-2"><i className="bx bx-save" /> حفظ</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
