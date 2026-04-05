import Link from "next/link";
import { flaskServerJson } from "@/lib/flask-server";

export const dynamic = "force-dynamic";

interface Vendor {
    id: number; store_name: string; slug: string; description: string;
    logo: string; city: string; rating: number; rating_count: number;
    product_count: number; is_featured: boolean;
}

export default async function PublicVendorsPage() {
    let vendors: Vendor[] = [];
    try {
        const data = await flaskServerJson<{ vendors: Vendor[] }>("/vendor/api/list");
        vendors = data?.vendors || [];
    } catch { /* noop */ }

    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container">
                <div className="text-center mb-5">
                    <h1 style={{ fontWeight: 800, fontSize: "2rem" }}>
                        <i className="bx bx-store" style={{ color: "var(--alha-cta, #FF9900)" }} /> البائعين
                    </h1>
                    <p className="text-muted" style={{ fontSize: "1rem" }}>تعرف على البائعين المميزين في منصة الحمد</p>
                </div>

                {vendors.length === 0 ? (
                    <div className="text-center py-5">
                        <i className="bx bx-store" style={{ fontSize: 64, color: "#ddd", display: "block", marginBottom: 16 }} />
                        <p className="text-muted" style={{ fontSize: "1.1rem" }}>لا يوجد بائعين حاليا</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {vendors.map(v => (
                            <div key={v.id} className="col-md-6 col-lg-4">
                                <Link href={`/vendors/${v.slug}`} className="text-decoration-none">
                                    <div className="shop-page-card text-center" style={{ padding: 24, cursor: "pointer", transition: "transform 0.2s" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
                                        {v.logo ? (
                                            <img src={`/api/flask${v.logo}`} alt={v.store_name}
                                                style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", margin: "0 auto 12px", display: "block", border: "3px solid #f0f0f0" }} />
                                        ) : (
                                            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                                                <i className="bx bx-store" style={{ fontSize: 32, color: "#2196F3" }} />
                                            </div>
                                        )}
                                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 4px", color: "#222" }}>{v.store_name}</h3>
                                        {v.city && <div style={{ fontSize: "0.82rem", color: "#888", marginBottom: 8 }}><i className="bx bx-map" /> {v.city}</div>}
                                        <div className="d-flex justify-content-center gap-3" style={{ fontSize: "0.85rem", color: "#555" }}>
                                            <span><i className="bx bxs-star" style={{ color: "#FFC107" }} /> {v.rating.toFixed(1)} <span style={{ color: "#aaa" }}>({v.rating_count})</span></span>
                                            <span><i className="bx bx-package" /> {v.product_count} منتج</span>
                                        </div>
                                        {v.is_featured && (
                                            <span style={{ display: "inline-block", background: "#FF9800", color: "#fff", padding: "2px 12px", borderRadius: 12, fontSize: "0.75rem", marginTop: 8 }}>
                                                <i className="bx bx-medal" /> بائع مميز
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}

                {/* CTA for new vendors */}
                <div className="text-center mt-5">
                    <div className="shop-page-card d-inline-block" style={{ padding: "24px 40px", background: "var(--lux-surface-2, #f5f5f0)" }}>
                        <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>هل تريد البيع على منصتنا؟</h3>
                        <p className="text-muted" style={{ fontSize: "0.9rem", marginBottom: 16 }}>سجل كبائع الآن وابدأ بيع منتجاتك</p>
                        <Link href="/vendor/register" className="btn btn-warning" style={{ fontWeight: 700, padding: "10px 32px" }}>
                            <i className="bx bx-store" /> سجل كبائع
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
