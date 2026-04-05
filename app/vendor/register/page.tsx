"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VendorRegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ store_name: "", description: "", phone: "", address: "", city: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const r = await fetch("/api/flask/vendor/register", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const d = await r.json();
            if (r.ok) {
                setSuccess(true);
            } else {
                setError(d.error || "حدث خطأ أثناء التسجيل");
            }
        } catch {
            setError("فشل الاتصال بالخادم");
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4f8", direction: "rtl" }}>
                <div style={{ maxWidth: 480, width: "100%", background: "#fff", borderRadius: 16, padding: 40, textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                    <i className="bx bx-check-circle" style={{ fontSize: 64, color: "#4CAF50", display: "block", marginBottom: 16 }} />
                    <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 8 }}>تم تقديم طلبك بنجاح!</h2>
                    <p style={{ color: "#666", fontSize: "0.9rem", lineHeight: 1.8 }}>
                        سيتم مراجعة طلب التسجيل كبائع خلال 24-48 ساعة. سنقوم بإرسال إشعار عند الموافقة.
                    </p>
                    <button onClick={() => router.push("/")} className="btn-cta-alha" style={{ padding: "10px 32px", borderRadius: 10, fontSize: "0.92rem", marginTop: 16 }}>
                        العودة للمتجر
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4f8", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
            <div style={{ maxWidth: 540, width: "100%", background: "#fff", borderRadius: 16, padding: "40px 36px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <div className="text-center mb-4">
                    <i className="bx bx-store" style={{ fontSize: 48, color: "var(--alha-cta, #FF9900)" }} />
                    <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "8px 0 4px" }}>سجل كبائع في الحمد</h1>
                    <p style={{ color: "#888", fontSize: "0.85rem" }}>ابدأ ببيع منتجاتك على منصتنا</p>
                </div>

                {error && (
                    <div style={{ background: "#ffebee", color: "#c62828", padding: "10px 16px", borderRadius: 10, fontSize: "0.85rem", marginBottom: 16 }}>
                        <i className="bx bx-error-circle" /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: 6 }}>اسم المتجر <span style={{ color: "#f44336" }}>*</span></label>
                        <input required value={form.store_name} onChange={e => setForm({ ...form, store_name: e.target.value })}
                            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: "0.9rem", fontFamily: "Cairo" }}
                            placeholder="مثال: متجر الجمال" />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                        <div>
                            <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: 6 }}>المدينة <span style={{ color: "#f44336" }}>*</span></label>
                            <input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: "0.9rem", fontFamily: "Cairo" }}
                                placeholder="القاهرة" />
                        </div>
                        <div>
                            <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: 6 }}>الهاتف <span style={{ color: "#f44336" }}>*</span></label>
                            <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: "0.9rem", fontFamily: "Cairo" }}
                                placeholder="01xxxxxxxxx" />
                        </div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: 6 }}>العنوان</label>
                        <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: "0.9rem", fontFamily: "Cairo" }}
                            placeholder="عنوان المتجر" />
                    </div>
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: 6 }}>وصف المتجر</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: "0.9rem", fontFamily: "Cairo", resize: "vertical" }}
                            placeholder="أخبرنا عن متجرك ومنتجاتك..." />
                    </div>
                    <button type="submit" disabled={loading}
                        style={{
                            width: "100%", padding: "12px 0", borderRadius: 12, border: "none", fontSize: "1rem", fontWeight: 700,
                            background: loading ? "#ccc" : "var(--alha-cta, #FF9900)", color: "#fff", cursor: loading ? "default" : "pointer",
                            fontFamily: "Cairo",
                        }}>
                        {loading ? <><i className="bx bx-loader-alt bx-spin" /> جاري التسجيل...</> : <><i className="bx bx-store" /> تقديم طلب التسجيل</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
