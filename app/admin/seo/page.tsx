"use client";
import { useState, useEffect } from "react";

interface MissingMeta { id: number; name: string; meta_title: string; meta_description: string; }
interface Redirect { id: number; source_path: string; target_path: string; is_active: boolean; hit_count: number; }

export default function AdminSEOPage() {
    const [tab, setTab] = useState<"meta" | "redirects">("meta");
    const [products, setProducts] = useState<MissingMeta[]>([]);
    const [redirects, setRedirects] = useState<Redirect[]>([]);
    const [loading, setLoading] = useState(true);
    const [showRedirectModal, setShowRedirectModal] = useState(false);
    const [rdForm, setRdForm] = useState({ source_path: "", target_path: "" });

    useEffect(() => {
        setLoading(true);
        if (tab === "meta") {
            fetch("/api/flask/admin/api/seo/products-missing-meta").then(r => r.json()).then(d => setProducts(d.products || [])).finally(() => setLoading(false));
        } else {
            fetch("/api/flask/admin/api/seo/redirects").then(r => r.json()).then(d => setRedirects(d.redirects || [])).finally(() => setLoading(false));
        }
    }, [tab]);

    async function saveMeta(pid: number, meta_title: string, meta_description: string) {
        await fetch("/api/flask/admin/api/seo/update-meta", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id: pid, meta_title, meta_description }),
        });
        setProducts(prev => prev.filter(p => p.id !== pid));
    }

    async function saveRedirect() {
        await fetch("/api/flask/admin/api/seo/redirects", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rdForm),
        });
        setShowRedirectModal(false);
        setRdForm({ source_path: "", target_path: "" });
        setTab("redirects"); // reload
    }

    async function deleteRedirect(id: number) {
        await fetch(`/api/flask/admin/api/seo/redirects/${id}`, { method: "DELETE" });
        setRedirects(prev => prev.filter(r => r.id !== id));
    }

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h1 className="admin-page-title"><i className="bx bx-search-alt-2" /> أدوات SEO</h1>
                {tab === "redirects" && (
                    <button onClick={() => setShowRedirectModal(true)} className="btn-cta-alha d-flex align-items-center gap-2"
                        style={{ padding: "8px 18px", borderRadius: 10, fontSize: "0.88rem" }}>
                        <i className="bx bx-plus" /> إعادة توجيه جديدة
                    </button>
                )}
            </div>

            <div className="d-flex gap-2 mb-4">
                <button onClick={() => setTab("meta")}
                    style={{
                        padding: "8px 20px", borderRadius: 10, fontSize: "0.88rem", border: "none", cursor: "pointer",
                        background: tab === "meta" ? "var(--alha-primary, #0071CE)" : "#f0f0f0",
                        color: tab === "meta" ? "#fff" : "#333"
                    }}>
                    <i className="bx bx-tag" /> Meta بيانات ناقصة
                </button>
                <button onClick={() => setTab("redirects")}
                    style={{
                        padding: "8px 20px", borderRadius: 10, fontSize: "0.88rem", border: "none", cursor: "pointer",
                        background: tab === "redirects" ? "var(--alha-primary, #0071CE)" : "#f0f0f0",
                        color: tab === "redirects" ? "#fff" : "#333"
                    }}>
                    <i className="bx bx-transfer" /> إعادات التوجيه (301)
                </button>
            </div>

            {loading ? <div className="text-center p-5"><i className="bx bx-loader-alt bx-spin" style={{ fontSize: 32 }} /></div> : tab === "meta" ? (
                <div style={{ display: "grid", gap: 16 }}>
                    {products.map(p => (
                        <MetaCard key={p.id} product={p} onSave={saveMeta} />
                    ))}
                    {products.length === 0 && (
                        <div className="admin-card text-center" style={{ padding: 40, color: "#4CAF50" }}>
                            <i className="bx bx-check-circle" style={{ fontSize: 48, display: "block", marginBottom: 12 }} />
                            جميع المنتجات لديها بيانات Meta كاملة
                        </div>
                    )}
                </div>
            ) : (
                <div className="admin-card" style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                        <thead>
                            <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                                <th style={{ padding: "12px 16px", textAlign: "right" }}>المسار المصدر</th>
                                <th style={{ padding: "12px 16px", textAlign: "right" }}>المسار الهدف</th>
                                <th style={{ padding: "12px 16px", textAlign: "center" }}>الزيارات</th>
                                <th style={{ padding: "12px 16px", textAlign: "center" }}>الحالة</th>
                                <th style={{ padding: "12px 16px", textAlign: "center" }}>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {redirects.map(r => (
                                <tr key={r.id} style={{ borderBottom: "1px solid #eee" }}>
                                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: "0.82rem" }}>{r.source_path}</td>
                                    <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: "0.82rem" }}>{r.target_path}</td>
                                    <td style={{ padding: "12px 16px", textAlign: "center" }}>{r.hit_count}</td>
                                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                        <span style={{ background: r.is_active ? "#4CAF50" : "#9E9E9E", color: "#fff", padding: "2px 10px", borderRadius: 10, fontSize: "0.78rem" }}>
                                            {r.is_active ? "نشط" : "معطل"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                        <button onClick={() => deleteRedirect(r.id)} style={{ background: "#f44336", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: "0.78rem", cursor: "pointer" }}>
                                            <i className="bx bx-trash" /> حذف
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {redirects.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "#aaa" }}>لا يوجد إعادات توجيه</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Redirect Modal */}
            {showRedirectModal && (
                <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowRedirectModal(false); }}>
                    <div className="admin-modal" style={{ maxWidth: 480 }}>
                        <div className="admin-modal-header">
                            <h2><i className="bx bx-transfer" /> إعادة توجيه جديدة</h2>
                            <button className="admin-modal-close" onClick={() => setShowRedirectModal(false)}>&times;</button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="mb-3">
                                <label className="admin-form-label">المسار المصدر <span className="text-danger">*</span></label>
                                <input className="admin-form-control" placeholder="/old-page" dir="ltr" value={rdForm.source_path} onChange={e => setRdForm({ ...rdForm, source_path: e.target.value })} />
                            </div>
                            <div className="mb-4">
                                <label className="admin-form-label">المسار الهدف <span className="text-danger">*</span></label>
                                <input className="admin-form-control" placeholder="/new-page" dir="ltr" value={rdForm.target_path} onChange={e => setRdForm({ ...rdForm, target_path: e.target.value })} />
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" onClick={() => setShowRedirectModal(false)} className="btn-outline-alha">إلغاء</button>
                                <button onClick={saveRedirect} className="btn-cta-alha d-flex align-items-center gap-2"><i className="bx bx-save" /> حفظ</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* Inline Meta editing card */
function MetaCard({ product, onSave }: { product: MissingMeta; onSave: (id: number, t: string, d: string) => void }) {
    const [title, setTitle] = useState(product.meta_title || product.name);
    const [desc, setDesc] = useState(product.meta_description || "");
    return (
        <div className="admin-card" style={{ padding: "16px 20px" }}>
            <h4 style={{ margin: "0 0 12px", fontSize: "0.95rem" }}>{product.name}</h4>
            <div className="row g-3 mb-3">
                <div className="col-6">
                    <label className="admin-form-label">Meta Title</label>
                    <input className="admin-form-control" dir="auto" value={title} onChange={e => setTitle(e.target.value)} />
                    <div style={{ fontSize: "0.72rem", color: title.length > 60 ? "#f44336" : "#aaa", marginTop: 4 }}>{title.length}/60</div>
                </div>
                <div className="col-6">
                    <label className="admin-form-label">Meta Description</label>
                    <input className="admin-form-control" dir="auto" value={desc} onChange={e => setDesc(e.target.value)} />
                    <div style={{ fontSize: "0.72rem", color: desc.length > 160 ? "#f44336" : "#aaa", marginTop: 4 }}>{desc.length}/160</div>
                </div>
            </div>
            <button onClick={() => onSave(product.id, title, desc)} className="btn-cta-alha d-flex align-items-center gap-2" style={{ padding: "6px 16px", borderRadius: 8, fontSize: "0.82rem" }}>
                <i className="bx bx-save" /> حفظ
            </button>
        </div>
    );
}
