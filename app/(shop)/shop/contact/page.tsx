"use client";

import { useState } from "react";

export default function ShopContactPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch("/api/flask/api/frontend/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, subject, message }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setResult({ ok: true, text: data.message || "تم إرسال رسالتك بنجاح!" });
                setName(""); setEmail(""); setSubject(""); setMessage("");
            } else {
                setResult({ ok: false, text: data.message || "حدث خطأ أثناء الإرسال" });
            }
        } catch {
            setResult({ ok: false, text: "تعذر الاتصال بالسيرفر" });
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container">
                <div className="row g-4">
                    <div className="col-lg-5">
                        <div className="shop-page-card h-100">
                            <h1 className="mb-3" style={{ fontWeight: 800 }}>تواصل معنا</h1>
                            <p className="text-muted">يسعدنا استقبال استفساراتك على مدار الأسبوع.</p>
                            <p><strong>الهاتف:</strong> <a href="tel:+201050188516">+20 105 018 8516</a></p>
                            <p><strong>البريد:</strong> <a href="mailto:info@alhamd-store.com">info@alhamd-store.com</a></p>
                            <p><strong>العنوان:</strong> القاهرة، مصر</p>
                        </div>
                    </div>
                    <div className="col-lg-7">
                        <div className="shop-page-card">
                            <h5 className="mb-3">أرسل رسالة</h5>
                            {result && (
                                <div className={`alert ${result.ok ? "alert-success" : "alert-danger"} d-flex align-items-center gap-2`} role="alert">
                                    <i className={`bx ${result.ok ? "bx-check-circle" : "bx-error-circle"}`} />
                                    {result.text}
                                </div>
                            )}
                            <form className="row g-3" onSubmit={handleSubmit}>
                                <div className="col-md-6">
                                    <label className="form-label">الاسم <span className="text-danger">*</span></label>
                                    <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">البريد الإلكتروني <span className="text-danger">*</span></label>
                                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">الموضوع</label>
                                    <input className="form-control" value={subject} onChange={(e) => setSubject(e.target.value)} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">الرسالة <span className="text-danger">*</span></label>
                                    <textarea className="form-control" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required />
                                </div>
                                <div className="col-12 text-end">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? (
                                            <><span className="spinner-border spinner-border-sm me-1" /> جاري الإرسال...</>
                                        ) : (
                                            <><i className="bx bx-send me-1" /> إرسال</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
