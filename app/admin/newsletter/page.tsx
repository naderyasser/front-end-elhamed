"use client";
import { useState, useEffect } from "react";

interface Subscriber { id: number; email: string; name: string; is_active: boolean; source: string; created_at: string; }
interface Campaign { id: number; subject: string; status: string; sent_count: number; open_count: number; click_count: number; created_at: string; }

const STATUS_BG: Record<string, string> = { draft: "#9E9E9E", sent: "#4CAF50", sending: "#2196F3" };

export default function AdminNewsletterPage() {
    const [tab, setTab] = useState<"subscribers" | "campaigns">("subscribers");
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [campForm, setCampForm] = useState({ subject: "", body_html: "" });

    useEffect(() => {
        setLoading(true);
        if (tab === "subscribers") {
            fetch("/api/flask/admin/api/newsletter/subscribers").then(r => r.json()).then(d => setSubscribers(d.subscribers || [])).finally(() => setLoading(false));
        } else {
            fetch("/api/flask/admin/api/newsletter/campaigns").then(r => r.json()).then(d => setCampaigns(d.campaigns || [])).finally(() => setLoading(false));
        }
    }, [tab]);

    async function saveCampaign() {
        await fetch("/api/flask/admin/api/newsletter/campaigns", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(campForm),
        });
        setCampForm({ subject: "", body_html: "" });
        setShowModal(false);
        setTab("campaigns");
    }

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h1 className="admin-page-title"><i className="bx bx-envelope" /> النشرة البريدية</h1>
                {tab === "campaigns" && (
                    <button onClick={() => setShowModal(true)} className="btn-cta-alha d-flex align-items-center gap-2"
                        style={{ padding: "8px 18px", borderRadius: 10, fontSize: "0.88rem" }}>
                        <i className="bx bx-plus" /> حملة جديدة
                    </button>
                )}
            </div>

            <div className="d-flex gap-2 mb-4">
                <button onClick={() => setTab("subscribers")}
                    style={{
                        padding: "8px 20px", borderRadius: 10, fontSize: "0.88rem", border: "none", cursor: "pointer",
                        background: tab === "subscribers" ? "var(--alha-primary, #0071CE)" : "#f0f0f0",
                        color: tab === "subscribers" ? "#fff" : "#333"
                    }}>
                    <i className="bx bx-group" /> المشتركين
                </button>
                <button onClick={() => setTab("campaigns")}
                    style={{
                        padding: "8px 20px", borderRadius: 10, fontSize: "0.88rem", border: "none", cursor: "pointer",
                        background: tab === "campaigns" ? "var(--alha-primary, #0071CE)" : "#f0f0f0",
                        color: tab === "campaigns" ? "#fff" : "#333"
                    }}>
                    <i className="bx bx-mail-send" /> الحملات
                </button>
            </div>

            {loading ? <div className="text-center p-5"><i className="bx bx-loader-alt bx-spin" style={{ fontSize: 32 }} /></div> : tab === "subscribers" ? (
                <div className="admin-card" style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                        <thead>
                            <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                                <th style={{ padding: "12px 16px", textAlign: "right" }}>البريد الإلكتروني</th>
                                <th style={{ padding: "12px 16px", textAlign: "right" }}>الاسم</th>
                                <th style={{ padding: "12px 16px", textAlign: "center" }}>المصدر</th>
                                <th style={{ padding: "12px 16px", textAlign: "center" }}>الحالة</th>
                                <th style={{ padding: "12px 16px", textAlign: "center" }}>تاريخ الاشتراك</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map(s => (
                                <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                                    <td style={{ padding: "12px 16px" }}>{s.email}</td>
                                    <td style={{ padding: "12px 16px" }}>{s.name || "—"}</td>
                                    <td style={{ padding: "12px 16px", textAlign: "center", fontSize: "0.82rem" }}>{s.source || "website"}</td>
                                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                        <span style={{ background: s.is_active ? "#4CAF50" : "#f44336", color: "#fff", padding: "2px 10px", borderRadius: 10, fontSize: "0.78rem" }}>
                                            {s.is_active ? "نشط" : "ملغي"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "12px 16px", textAlign: "center", fontSize: "0.82rem" }}>{new Date(s.created_at).toLocaleDateString("ar-EG")}</td>
                                </tr>
                            ))}
                            {subscribers.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "#aaa" }}>لا يوجد مشتركين</td></tr>}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{ display: "grid", gap: 16 }}>
                    {campaigns.map(c => (
                        <div key={c.id} className="admin-card" style={{ padding: "20px 24px" }}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>{c.subject}</h3>
                                <span style={{ background: STATUS_BG[c.status] || "#888", color: "#fff", padding: "4px 12px", borderRadius: 12, fontSize: "0.78rem" }}>
                                    {c.status === "draft" ? "مسودة" : c.status === "sent" ? "مُرسلة" : c.status}
                                </span>
                            </div>
                            <div className="d-flex gap-4" style={{ fontSize: "0.85rem", color: "#666" }}>
                                <span><i className="bx bx-send" /> أُرسلت: {c.sent_count}</span>
                                <span><i className="bx bx-envelope-open" /> فُتحت: {c.open_count}</span>
                                <span><i className="bx bx-pointer" /> نقرات: {c.click_count}</span>
                                <span><i className="bx bx-calendar" /> {new Date(c.created_at).toLocaleDateString("ar-EG")}</span>
                            </div>
                        </div>
                    ))}
                    {campaigns.length === 0 && (
                        <div className="admin-card text-center" style={{ padding: 40, color: "#aaa" }}>
                            <i className="bx bx-mail-send" style={{ fontSize: 48, display: "block", marginBottom: 12 }} />
                            لا يوجد حملات بعد
                        </div>
                    )}
                </div>
            )}

            {/* Campaign Modal */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
                    <div className="admin-modal" style={{ maxWidth: 580 }}>
                        <div className="admin-modal-header">
                            <h2><i className="bx bx-mail-send" /> حملة جديدة</h2>
                            <button className="admin-modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="mb-3">
                                <label className="admin-form-label">موضوع الرسالة <span className="text-danger">*</span></label>
                                <input className="admin-form-control" value={campForm.subject} onChange={e => setCampForm({ ...campForm, subject: e.target.value })} />
                            </div>
                            <div className="mb-4">
                                <label className="admin-form-label">محتوى الرسالة (HTML)</label>
                                <textarea className="admin-form-control" rows={8} value={campForm.body_html} onChange={e => setCampForm({ ...campForm, body_html: e.target.value })} style={{ fontFamily: "monospace", fontSize: "0.82rem" }} />
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-outline-alha">إلغاء</button>
                                <button onClick={saveCampaign} className="btn-cta-alha d-flex align-items-center gap-2"><i className="bx bx-save" /> حفظ كمسودة</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
