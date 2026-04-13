"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/flask/admin/login", {
        method: "POST",
        body: formData,
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));

      if (data.success) {
        localStorage.setItem('admin_logged_in', 'true');
        router.push(data.redirect || '/admin/dashboard');
      } else {
        setMessage({ text: data.message ?? "بيانات غير صحيحة", type: "error" });
      }
    } catch {
      setMessage({ text: "حدث خطأ في الاتصال", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #004c91 0%, #0071ce 50%, #004c91 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "Cairo, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", padding: "2.5rem 2rem", position: "relative", overflow: "hidden" }}>
        {/* Accent bar */}
        <div style={{ position: "absolute", top: 0, right: 0, left: 0, height: 4, background: "linear-gradient(90deg, #ff9900, #0071ce)" }} />

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#e3f2fd", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <i className="bx bxs-lock-alt" style={{ fontSize: 32, color: "#004c91" }} />
          </div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a2b3c", margin: 0 }}>لوحة تحكم الحمد</h1>
          <p style={{ fontSize: "0.85rem", color: "#4a5568", marginTop: 4 }}>أدخل بيانات الدخول</p>
        </div>

        {message && (
          <div style={{
            marginBottom: 16, padding: "10px 14px", borderRadius: 8, fontSize: "0.85rem",
            background: message.type === "error" ? "#fef2f2" : "#ecfdf5",
            color: message.type === "error" ? "#991b1b" : "#065f46",
            border: `1px solid ${message.type === "error" ? "#fecaca" : "#a7f3d0"}`,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <i className={`bx ${message.type === "error" ? "bx-error-circle" : "bx-check-circle"}`} />
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="username" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#1a2b3c", marginBottom: 6 }}>
              اسم المستخدم
            </label>
            <div style={{ position: "relative" }}>
              <i className="bx bx-user" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 18 }} />
              <input
                id="username"
                type="text"
                name="username"
                autoComplete="username"
                placeholder="admin"
                required
                style={{ width: "100%", padding: "10px 40px 10px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: "0.9rem", outline: "none", fontFamily: "Cairo, sans-serif", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label htmlFor="password" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#1a2b3c", marginBottom: 6 }}>
              كلمة المرور
            </label>
            <div style={{ position: "relative" }}>
              <i className="bx bx-lock-alt" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 18 }} />
              <input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                style={{ width: "100%", padding: "10px 40px 10px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: "0.9rem", outline: "none", fontFamily: "Cairo, sans-serif", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "11px", borderRadius: 8, border: "none",
              background: loading ? "#9ca3af" : "linear-gradient(135deg, #004c91, #0071ce)",
              color: "#fff", fontSize: "0.95rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "Cairo, sans-serif", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? (
              <><i className="bx bx-loader-alt" style={{ animation: "spin 1s linear infinite" }} /> جاري الدخول...</>
            ) : (
              <><i className="bx bx-log-in" /> تسجيل الدخول</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
