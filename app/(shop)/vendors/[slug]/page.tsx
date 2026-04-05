import Link from "next/link";
import { notFound } from "next/navigation";
import { flaskServerJson } from "@/lib/flask-server";
import { formatMoneyEGP, formatStoreImage } from "@/lib/store-utils";

export const dynamic = "force-dynamic";

interface VendorStore {
    id: number; store_name: string; slug: string; description: string;
    logo: string; banner: string; city: string;
    rating: number; rating_count: number;
    products: { id: number; name: string; price: number; discount: number; final_price: number; image: string; in_stock: boolean }[];
}

export default async function VendorStorePage({ params }: { params: { slug: string } }) {
    let store: VendorStore | null = null;
    try {
        store = await flaskServerJson<VendorStore>(`/vendor/api/store/${params.slug}`);
    } catch { /* noop */ }

    if (!store) notFound();

    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container">
                {/* Store header */}
                <div className="shop-page-card" style={{ overflow: "hidden", marginBottom: 32 }}>
                    {store.banner && (
                        <div style={{ height: 180, background: `url(/api/flask${store.banner}) center/cover` }} />
                    )}
                    <div style={{ padding: "20px 28px", display: "flex", alignItems: "center", gap: 20 }}>
                        {store.logo ? (
                            <img src={`/api/flask${store.logo}`} alt={store.store_name}
                                style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", marginTop: store.banner ? -40 : 0 }} />
                        ) : (
                            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <i className="bx bx-store" style={{ fontSize: 36, color: "#2196F3" }} />
                            </div>
                        )}
                        <div>
                            <h1 style={{ margin: 0, fontWeight: 800, fontSize: "1.4rem" }}>{store.store_name}</h1>
                            <div className="d-flex gap-3 mt-1" style={{ fontSize: "0.85rem", color: "#888" }}>
                                <span><i className="bx bxs-star" style={{ color: "#FFC107" }} /> {store.rating.toFixed(1)} ({store.rating_count} تقييم)</span>
                                {store.city && <span><i className="bx bx-map" /> {store.city}</span>}
                                <span><i className="bx bx-package" /> {store.products.length} منتج</span>
                            </div>
                        </div>
                    </div>
                    {store.description && (
                        <div style={{ padding: "0 28px 20px" }}>
                            <p style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.8, margin: 0 }}>{store.description}</p>
                        </div>
                    )}
                </div>

                {/* Products */}
                <h2 style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: 20 }}>
                    <i className="bx bx-package" /> منتجات {store.store_name}
                </h2>

                {store.products.length === 0 ? (
                    <div className="text-center py-5">
                        <p className="text-muted">لا يوجد منتجات حالياً</p>
                    </div>
                ) : (
                    <div className="row g-3">
                        {store.products.map(p => (
                            <div key={p.id} className="col-6 col-md-4 col-lg-3">
                                <Link href={`/products/${p.id}`} className="text-decoration-none">
                                    <div className="shop-page-card" style={{ overflow: "hidden", cursor: "pointer", transition: "transform 0.15s" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
                                        <div style={{ position: "relative" }}>
                                            <img src={formatStoreImage(p.image)} alt={p.name}
                                                style={{ width: "100%", height: 180, objectFit: "cover" }} />
                                            {p.discount > 0 && (
                                                <span style={{ position: "absolute", top: 8, right: 8, background: "#f44336", color: "#fff", padding: "2px 8px", borderRadius: 6, fontSize: "0.75rem" }}>
                                                    -{p.discount}%
                                                </span>
                                            )}
                                            {!p.in_stock && (
                                                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <span style={{ background: "#fff", padding: "4px 16px", borderRadius: 8, fontWeight: 700, fontSize: "0.85rem" }}>نفد المخزون</span>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ padding: "12px 14px" }}>
                                            <h4 style={{ fontSize: "0.88rem", fontWeight: 600, margin: "0 0 6px", color: "#222" }}>{p.name}</h4>
                                            <div className="d-flex align-items-center gap-2">
                                                <span style={{ fontWeight: 700, color: "var(--alha-primary, #0071CE)", fontSize: "0.95rem" }}>{formatMoneyEGP(p.final_price)}</span>
                                                {p.discount > 0 && (
                                                    <span style={{ textDecoration: "line-through", color: "#aaa", fontSize: "0.8rem" }}>{formatMoneyEGP(p.price)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
