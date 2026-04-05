"use client";

export default function ShopError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container">
                <div className="shop-page-card" style={{ textAlign: "center", padding: "3rem 1rem" }}>
                    <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                        حدث خطأ في الصفحة
                    </h2>
                    <p style={{ color: "#666", marginBottom: "1.5rem" }}>
                        {error.message || "يرجى المحاولة مرة أخرى."}
                    </p>
                    <button
                        onClick={() => reset()}
                        className="btn btn-primary"
                        type="button"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        </section>
    );
}
