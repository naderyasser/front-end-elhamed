"use client";
import { useState, useEffect, useRef } from "react";

interface Msg {
    id: number; sender_type: string; subject: string;
    message: string; is_read: boolean; created_at: string;
}

export default function VendorMessagesPage() {
    const [messages, setMessages] = useState<Msg[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCompose, setShowCompose] = useState(false);
    const [form, setForm] = useState({ subject: "", message: "" });
    const bottomRef = useRef<HTMLDivElement>(null);

    const load = () => {
        setLoading(true);
        fetch("/api/flask/vendor/api/messages").then(r => r.json())
            .then(d => setMessages(d.messages || []))
            .finally(() => setLoading(false));
    };
    useEffect(load, []);

    async function send() {
        await fetch("/api/flask/vendor/api/messages", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        setForm({ subject: "", message: "" });
        setShowCompose(false);
        load();
    }

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h1 className="admin-page-title"><i className="bx bx-message-square-dots" /> الرسائل</h1>
                <button onClick={() => setShowCompose(true)} className="btn-cta-alha d-flex align-items-center gap-2"
                    style={{ padding: "8px 18px", borderRadius: 10, fontSize: "0.88rem" }}>
                    <i className="bx bx-edit" /> رسالة جديدة
                </button>
            </div>

            {loading ? <div className="text-center p-5"><i className="bx bx-loader-alt bx-spin" style={{ fontSize: 32 }} /></div> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {messages.map(m => (
                        <div key={m.id} className="admin-card" style={{
                            padding: "16px 20px",
                            borderRight: m.sender_type === "admin" ? "4px solid var(--alha-primary, #0071CE)" : "4px solid var(--alha-cta, #FF9900)",
                            opacity: m.is_read ? 0.85 : 1,
                        }}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex align-items-center gap-2">
                                    <i className={`bx ${m.sender_type === "admin" ? "bx-shield" : "bx-user"}`}
                                        style={{ color: m.sender_type === "admin" ? "var(--alha-primary)" : "var(--alha-cta)", fontSize: "1.2rem" }} />
                                    <strong style={{ fontSize: "0.92rem" }}>{m.sender_type === "admin" ? "إدارة المتجر" : "أنت"}</strong>
                                    {!m.is_read && <span style={{ background: "#f44336", color: "#fff", width: 8, height: 8, borderRadius: "50%", display: "inline-block" }} />}
                                </div>
                                <span style={{ fontSize: "0.75rem", color: "#aaa" }}>{new Date(m.created_at).toLocaleDateString("ar-EG")}</span>
                            </div>
                            {m.subject && <div style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 6 }}>{m.subject}</div>}
                            <p style={{ margin: 0, fontSize: "0.85rem", color: "#555", lineHeight: 1.8 }}>{m.message}</p>
                        </div>
                    ))}
                    {messages.length === 0 && (
                        <div className="admin-card text-center" style={{ padding: 40, color: "#aaa" }}>
                            <i className="bx bx-message-square-dots" style={{ fontSize: 48, display: "block", marginBottom: 12 }} />
                            لا يوجد رسائل
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
            )}

            {/* Compose */}
            {showCompose && (
                <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowCompose(false); }}>
                    <div className="admin-modal" style={{ maxWidth: 480 }}>
                        <div className="admin-modal-header">
                            <h2><i className="bx bx-edit" /> رسالة جديدة</h2>
                            <button className="admin-modal-close" onClick={() => setShowCompose(false)}>&times;</button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="mb-3">
                                <label className="admin-form-label">الموضوع <span className="text-danger">*</span></label>
                                <input className="admin-form-control" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                            </div>
                            <div className="mb-4">
                                <label className="admin-form-label">الرسالة <span className="text-danger">*</span></label>
                                <textarea className="admin-form-control" rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" onClick={() => setShowCompose(false)} className="btn-outline-alha">إلغاء</button>
                                <button onClick={send} className="btn-cta-alha d-flex align-items-center gap-2"><i className="bx bx-send" /> إرسال</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
