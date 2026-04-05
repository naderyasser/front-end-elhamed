"use client";
import { useState, useEffect } from "react";

interface Role {
    id: number; name: string; name_ar: string; description: string;
    permissions: string[]; is_system: boolean; created_at: string;
}

const ALL_PERMISSIONS = [
    { key: "products", label: "المنتجات" },
    { key: "orders", label: "الطلبات" },
    { key: "categories", label: "الأقسام" },
    { key: "customers", label: "العملاء" },
    { key: "vendors", label: "البائعين" },
    { key: "suppliers", label: "الموردين" },
    { key: "shipping", label: "الشحن" },
    { key: "blog", label: "المدونة" },
    { key: "newsletter", label: "النشرة البريدية" },
    { key: "seo", label: "SEO" },
    { key: "settings", label: "الإعدادات" },
    { key: "reports", label: "التقارير" },
    { key: "roles", label: "الأدوار" },
];

export default function AdminRolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Role | null>(null);
    const [form, setForm] = useState({ name: "", name_ar: "", description: "", permissions: [] as string[] });

    const load = () => {
        setLoading(true);
        fetch("/api/flask/admin/api/roles").then(r => r.json()).then(d => setRoles(d.roles || [])).finally(() => setLoading(false));
    };
    useEffect(load, []);

    function openAdd() {
        setEditing(null);
        setForm({ name: "", name_ar: "", description: "", permissions: [] });
        setShowModal(true);
    }
    function openEdit(r: Role) {
        setEditing(r);
        setForm({ name: r.name, name_ar: r.name_ar, description: r.description || "", permissions: r.permissions || [] });
        setShowModal(true);
    }

    function togglePerm(key: string) {
        setForm(prev => ({
            ...prev,
            permissions: prev.permissions.includes(key)
                ? prev.permissions.filter(p => p !== key)
                : [...prev.permissions, key],
        }));
    }

    async function save() {
        const url = editing ? `/api/flask/admin/api/roles/${editing.id}` : "/api/flask/admin/api/roles";
        const method = editing ? "PUT" : "POST";
        await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        setShowModal(false);
        load();
    }

    async function handleDelete(id: number) {
        if (!confirm("هل أنت متأكد من حذف هذا الدور؟")) return;
        await fetch(`/api/flask/admin/api/roles/${id}`, { method: "DELETE" });
        load();
    }

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h1 className="admin-page-title"><i className="bx bx-shield-quarter" /> إدارة الأدوار والصلاحيات</h1>
                <button onClick={openAdd} className="btn-cta-alha d-flex align-items-center gap-2"
                    style={{ padding: "8px 18px", borderRadius: 10, fontSize: "0.88rem" }}>
                    <i className="bx bx-plus" /> دور جديد
                </button>
            </div>

            {loading ? <div className="text-center p-5"><i className="bx bx-loader-alt bx-spin" style={{ fontSize: 32 }} /></div> : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                    {roles.map(r => (
                        <div key={r.id} className="admin-card" style={{ padding: "20px 24px" }}>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>{r.name_ar || r.name}</h3>
                                    <div style={{ fontSize: "0.78rem", color: "#888", fontFamily: "monospace" }}>{r.name}</div>
                                </div>
                                {r.is_system && (
                                    <span style={{ background: "#e3f2fd", color: "#1976D2", padding: "2px 10px", borderRadius: 8, fontSize: "0.72rem" }}>
                                        نظام
                                    </span>
                                )}
                            </div>
                            {r.description && <p style={{ fontSize: "0.82rem", color: "#666", margin: "0 0 12px" }}>{r.description}</p>}
                            <div className="d-flex flex-wrap gap-1 mb-3">
                                {(r.permissions || []).map(p => (
                                    <span key={p} style={{ background: "#f0f4f8", padding: "2px 10px", borderRadius: 12, fontSize: "0.75rem", color: "#555" }}>
                                        {ALL_PERMISSIONS.find(ap => ap.key === p)?.label || p}
                                    </span>
                                ))}
                                {(r.permissions || []).length === 0 && r.name === "super_admin" && (
                                    <span style={{ background: "#4CAF50", color: "#fff", padding: "2px 10px", borderRadius: 12, fontSize: "0.75rem" }}>
                                        كل الصلاحيات
                                    </span>
                                )}
                            </div>
                            {!r.is_system && (
                                <div className="d-flex gap-2">
                                    <button onClick={() => openEdit(r)} style={{ background: "#2196F3", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: "0.78rem", cursor: "pointer" }}>
                                        <i className="bx bx-edit" /> تعديل
                                    </button>
                                    <button onClick={() => handleDelete(r.id)} style={{ background: "#f44336", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: "0.78rem", cursor: "pointer" }}>
                                        <i className="bx bx-trash" /> حذف
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
                    <div className="admin-modal" style={{ maxWidth: 520 }}>
                        <div className="admin-modal-header">
                            <h2><i className="bx bx-shield-quarter" /> {editing ? "تعديل الدور" : "دور جديد"}</h2>
                            <button className="admin-modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="row g-3 mb-3">
                                <div className="col-6">
                                    <label className="admin-form-label">الاسم (إنجليزي) <span className="text-danger">*</span></label>
                                    <input className="admin-form-control" dir="ltr" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="col-6">
                                    <label className="admin-form-label">الاسم (عربي) <span className="text-danger">*</span></label>
                                    <input className="admin-form-control" value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })} />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="admin-form-label">الوصف</label>
                                <input className="admin-form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="mb-4">
                                <label className="admin-form-label">الصلاحيات</label>
                                <div className="d-flex flex-wrap gap-2" style={{ marginTop: 8 }}>
                                    {ALL_PERMISSIONS.map(p => (
                                        <label key={p.key} style={{
                                            display: "flex", alignItems: "center", gap: 6,
                                            padding: "6px 14px", borderRadius: 10, cursor: "pointer", fontSize: "0.82rem",
                                            background: form.permissions.includes(p.key) ? "#e3f2fd" : "#f5f5f5",
                                            border: form.permissions.includes(p.key) ? "1px solid #2196F3" : "1px solid #e0e0e0",
                                        }}>
                                            <input type="checkbox" checked={form.permissions.includes(p.key)} onChange={() => togglePerm(p.key)}
                                                style={{ accentColor: "#2196F3" }} />
                                            {p.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-outline-alha">إلغاء</button>
                                <button onClick={save} className="btn-cta-alha d-flex align-items-center gap-2"><i className="bx bx-save" /> حفظ</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
