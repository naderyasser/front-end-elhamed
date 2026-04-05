"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ShopLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/flask/login", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ email: email.trim(), password, remember }),
            });
            const data = await res.json();
            if (data.success) {
                router.push(data.redirect || "/shop");
                router.refresh();
            } else {
                setError(data.message || "بيانات الدخول غير صحيحة");
            }
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
                    <h1 className="mb-3" style={{ fontWeight: 800 }}>تسجيل الدخول</h1>
                    {error && (
                        <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
                            <i className="bx bx-error-circle" />
                            {error}
                        </div>
                    )}
                    <form className="row g-3" onSubmit={handleSubmit}>
                        <div className="col-12">
                            <label className="form-label">البريد الإلكتروني</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="example@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label">كلمة المرور</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="col-12 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="remember"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="remember">تذكرني</label>
                            </div>
                            <Link href="/shop/auth/forgot-password" className="text-decoration-none">نسيت كلمة المرور؟</Link>
                        </div>
                        <div className="col-12 text-end">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? (
                                    <><span className="spinner-border spinner-border-sm me-2" /> جاري الدخول...</>
                                ) : (
                                    "دخول"
                                )}
                            </button>
                        </div>
                    </form>
                    <hr />
                    <p className="mb-0 text-muted">
                        ليس لديك حساب؟ <Link href="/shop/auth/register" className="text-decoration-none">إنشاء حساب جديد</Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
