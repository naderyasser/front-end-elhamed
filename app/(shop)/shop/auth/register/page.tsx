"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ShopRegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!name.trim() || !email.trim() || !password) {
            setError("يرجى ملء جميع الحقول المطلوبة");
            return;
        }
        if (password !== confirmPassword) {
            setError("كلمتا المرور غير متطابقتين");
            return;
        }
        if (password.length < 6) {
            setError("يجب أن تكون كلمة المرور 6 أحرف على الأقل");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/flask/register", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), password, confirm_password: confirmPassword }),
            });
            const data = await res.json();
            if (data.success) {
                router.push(data.redirect || "/shop");
                router.refresh();
            } else {
                setError(data.message || "حدث خطأ أثناء إنشاء الحساب");
            }
        } catch {
            setError("حدث خطأ في الاتصال بالخادم");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container" style={{ maxWidth: 620 }}>
                <div className="shop-page-card">
                    <h1 className="mb-3" style={{ fontWeight: 800 }}>إنشاء حساب جديد</h1>
                    {error && (
                        <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
                            <i className="bx bx-error-circle" />
                            {error}
                        </div>
                    )}
                    <form className="row g-3" onSubmit={handleSubmit}>
                        <div className="col-12">
                            <label className="form-label">الاسم الكامل <span className="text-danger">*</span></label>
                            <input
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="أحمد محمد"
                                required
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label">البريد الإلكتروني <span className="text-danger">*</span></label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@email.com"
                                required
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label">رقم الهاتف</label>
                            <input
                                type="tel"
                                className="form-control"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="01xxxxxxxxx"
                                dir="ltr"
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">كلمة المرور <span className="text-danger">*</span></label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="6 أحرف على الأقل"
                                minLength={6}
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">تأكيد كلمة المرور <span className="text-danger">*</span></label>
                            <input
                                type="password"
                                className="form-control"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="أعد كتابة كلمة المرور"
                                required
                            />
                        </div>
                        <div className="col-12 text-end">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? (
                                    <><span className="spinner-border spinner-border-sm me-2" /> جاري الإنشاء...</>
                                ) : (
                                    "إنشاء الحساب"
                                )}
                            </button>
                        </div>
                    </form>
                    <hr />
                    <p className="mb-0 text-muted">
                        لديك حساب بالفعل؟ <Link href="/shop/auth/login" className="text-decoration-none">تسجيل الدخول</Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
