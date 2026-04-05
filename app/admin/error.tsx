"use client";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="admin-card text-center" style={{ margin: "2rem", padding: "3rem 2rem" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fce4ec", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <i className="bx bx-error-circle" style={{ fontSize: 32, color: "#c62828" }} />
            </div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--alha-primary-dark, #004c91)", marginBottom: 8 }}>
                حدث خطأ في لوحة التحكم
            </h2>
            <p style={{ color: "var(--alha-text-muted, #9e9e9e)", fontSize: "0.875rem", marginBottom: 24 }}>
                {error.message || "خطأ غير متوقع — يرجى إعادة المحاولة."}
            </p>
            <button onClick={() => reset()} className="btn-primary-alha" type="button">
                <i className="bx bx-refresh" /> إعادة المحاولة
            </button>
        </div>
    );
}
