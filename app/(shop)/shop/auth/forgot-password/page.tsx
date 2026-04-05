"use client";

import Link from "next/link";
import { useState } from "react";

export default function ShopForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!email.trim()) {
            setError("يرجى إدخال البريد الإلكتروني");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/flask/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json();
            setMessage(data.message || "تم إرسال رابط الاستعادة");
            setSent(true);
        } catch {
            setError("حدث خطأ في الاتصال بالخادم");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container" style={{ maxWidth: 560 }}>
                <div className="shop-page-card">
                    <h1 className="mb-3" style={{ fontWeight: 800 }}>استعادة كلمة المرور</h1>
                    <p className="text-muted">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.</p>
                    {error && (
                        <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
                            <i className="bx bx-error-circle" />
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="alert alert-success d-flex align-items-center gap-2" role="alert">
                            <i className="bx bx-check-circle" />
                            {message}
                        </div>
                    )}
                    {!sent ? (
                        <form className="mt-3" onSubmit={handleSubmit}>
                            <label className="form-label">البريد الإلكتروني</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="example@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
                                {loading ? (
                                    <><span className="spinner-border spinner-border-sm me-2" /> جاري الإرسال...</>
                                ) : (
                                    "إرسال رابط الاستعادة"
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center mt-3">
                            <i className="bx bx-envelope" style={{ fontSize: 48, color: "var(--alha-primary, #0071ce)" }} />
                            <p className="mt-2">تحقق من بريدك الإلكتروني</p>
                        </div>
                    )}
                    <div className="mt-3">
                        <Link href="/shop/auth/login" className="text-decoration-none">العودة لتسجيل الدخول</Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
