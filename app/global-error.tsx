"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="ar" dir="rtl">
            <body
                style={{
                    margin: 0,
                    fontFamily: "sans-serif",
                    background: "#0a0a0a",
                    color: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                }}
            >
                <div
                    style={{
                        textAlign: "center",
                        padding: "2rem",
                        maxWidth: 480,
                        border: "1px solid #222",
                        borderRadius: 16,
                        background: "#111",
                    }}
                >
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                        حدث خطأ غير متوقع
                    </h2>
                    <p style={{ color: "#999", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                        {error.message || "يرجى إعادة المحاولة أو التواصل مع الدعم الفني."}
                    </p>
                    <button
                        onClick={() => reset()}
                        style={{
                            background: "#d32f2f",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            padding: "0.6rem 1.5rem",
                            cursor: "pointer",
                            fontSize: "0.95rem",
                        }}
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </body>
        </html>
    );
}
