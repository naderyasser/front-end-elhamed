"use client";
import { useState, useEffect } from "react";

interface VendorProfile {
    store_name: string; slug: string; description: string;
    phone: string; address: string; city: string;
    logo: string; banner: string;
    rating: number; rating_count: number;
    total_sales: number; status: string;
}

export default function VendorProfilePage() {
    const [profile, setProfile] = useState<VendorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ store_name: "", description: "", phone: "", address: "", city: "" });
    const [logo, setLogo] = useState<File | null>(null);

    useEffect(() => {
        fetch("/api/flask/vendor/api/profile").then(r => r.json())
            .then(d => {
                setProfile(d.vendor || d);
                setForm({
                    store_name: d.vendor?.store_name || d.store_name || "",
                    description: d.vendor?.description || d.description || "",
                    phone: d.vendor?.phone || d.phone || "",
                    address: d.vendor?.address || d.address || "",
                    city: d.vendor?.city || d.city || "",
                });
            })
            .finally(() => setLoading(false));
    }, []);

    async function save() {
        await fetch("/api/flask/vendor/api/profile", {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (logo) {
            const fd = new FormData();
            fd.append("logo", logo);
            await fetch("/api/flask/vendor/api/profile/logo", { method: "POST", body: fd });
        }
        setEditing(false);
        window.location.reload();
    }

    if (loading || !profile) return <div className="text-center p-5"><i className="bx bx-loader-alt bx-spin" style={{ fontSize: 32 }} /></div>;

    const STATUS_LABEL: Record<string, string> = { pending: "قيد المراجعة", approved: "مقبول", active: "نشط", suspended: "معلق" };

    return (
        <div>
            <h1 className="admin-page-title mb-4"><i className="bx bx-user-circle" /> الملف الشخصي</h1>

            {/* Hero */}
            <div className="admin-card mb-4" style={{ overflow: "hidden" }}>
                {profile.banner && (
                    <div style={{ height: 140, background: `url(/api/flask${profile.banner}) center/cover` }} />
                )}
                <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 20 }}>
                    {profile.logo ? (
                        <img src={`/api/flask${profile.logo}`} alt="logo" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "3px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", marginTop: profile.banner ? -40 : 0 }} />
                    ) : (
                        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="bx bx-store" style={{ fontSize: 32, color: "#2196F3" }} />
                        </div>
                    )}
                    <div>
                        <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{profile.store_name}</h2>
                        <div className="d-flex gap-3 mt-1" style={{ fontSize: "0.82rem", color: "#888" }}>
                            <span><i className="bx bx-star" style={{ color: "#FFC107" }} /> {profile.rating.toFixed(1)} ({profile.rating_count} تقييم)</span>
                            <span><i className="bx bx-money" /> المبيعات: {Math.round(profile.total_sales).toLocaleString("ar-EG")} ج.م</span>
                            <span style={{ color: profile.status === "active" ? "#4CAF50" : "#FFA500" }}>{STATUS_LABEL[profile.status] || profile.status}</span>
                        </div>
                    </div>
                    <button onClick={() => setEditing(!editing)} className="btn-outline-alha" style={{ marginRight: "auto", padding: "6px 16px", borderRadius: 8, fontSize: "0.82rem", border: "1px solid #ddd" }}>
                        <i className={`bx ${editing ? "bx-x" : "bx-edit"}`} /> {editing ? "إلغاء" : "تعديل"}
                    </button>
                </div>
            </div>

            {editing ? (
                <div className="admin-card" style={{ padding: "24px 28px" }}>
                    <div className="mb-3">
                        <label className="admin-form-label">اسم المتجر</label>
                        <input className="admin-form-control" value={form.store_name} onChange={e => setForm({ ...form, store_name: e.target.value })} />
                    </div>
                    <div className="row g-3 mb-3">
                        <div className="col-6">
                            <label className="admin-form-label">الهاتف</label>
                            <input className="admin-form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        </div>
                        <div className="col-6">
                            <label className="admin-form-label">المدينة</label>
                            <input className="admin-form-control" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="admin-form-label">العنوان</label>
                        <input className="admin-form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                    </div>
                    <div className="mb-3">
                        <label className="admin-form-label">وصف المتجر</label>
                        <textarea className="admin-form-control" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="mb-4">
                        <label className="admin-form-label">شعار المتجر</label>
                        <input type="file" accept="image/*" className="admin-form-control" onChange={e => setLogo(e.target.files?.[0] || null)} />
                    </div>
                    <button onClick={save} className="btn-cta-alha d-flex align-items-center gap-2">
                        <i className="bx bx-save" /> حفظ التعديلات
                    </button>
                </div>
            ) : (
                <div className="admin-card" style={{ padding: "24px 28px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        {[
                            { label: "الرابط", value: `/vendor/${profile.slug}`, icon: "bx-link" },
                            { label: "الهاتف", value: profile.phone || "—", icon: "bx-phone" },
                            { label: "المدينة", value: profile.city || "—", icon: "bx-map" },
                            { label: "العنوان", value: profile.address || "—", icon: "bx-map-pin" },
                        ].map((f, i) => (
                            <div key={i} className="d-flex align-items-center gap-2" style={{ padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
                                <i className={`bx ${f.icon}`} style={{ fontSize: "1.2rem", color: "var(--alha-primary, #0071CE)" }} />
                                <div>
                                    <div style={{ fontSize: "0.75rem", color: "#aaa" }}>{f.label}</div>
                                    <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{f.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {profile.description && (
                        <div style={{ marginTop: 20 }}>
                            <h4 style={{ fontSize: "0.88rem", fontWeight: 700, marginBottom: 8 }}>عن المتجر</h4>
                            <p style={{ fontSize: "0.85rem", color: "#555", lineHeight: 1.8 }}>{profile.description}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
