import Link from "next/link";
import { notFound } from "next/navigation";
import { flaskServerJson } from "@/lib/flask-server";
import { formatMoneyEGP, formatStoreImage } from "@/lib/store-utils";
import ProductDetailClient, { ShareButton, NotifyButton } from "./product-detail-client";

type ProductDetailsPageProps = {
    params: {
        id: string;
    };
};

export const dynamic = "force-dynamic";

type ProductDetailsResponse = {
    id: number;
    name: string;
    description: string;
    brand: string;
    category: string;
    price: number;
    discount: number;
    final_price: number;
    stock: number;
    in_stock: boolean;
    rating: number;
    reviews: number;
    images: string[];
    vendor_name?: string;
    vendor_slug?: string;
    meta_title?: string;
    meta_description?: string;
};

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
    const productId = Number(params.id);
    if (Number.isNaN(productId)) {
        notFound();
    }

    const product = await flaskServerJson<ProductDetailsResponse>(`/api/shop/products/${productId}`);

    if (!product) {
        notFound();
    }

    const finalPrice = product.final_price;
    const stars = Math.max(0, Math.min(5, Math.round(product.rating || 0)));
    const images = (product.images || []).map((img) => formatStoreImage(img));
    const mainImage = images[0] || formatStoreImage("");

    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container">
                <div className="row g-4">
                    {/* === Image Gallery === */}
                    <div className="col-lg-6">
                        <div className="shop-page-card p-3 p-lg-4">
                            <ProductDetailClient images={images.length ? images : [mainImage]} productName={product.name} />
                        </div>
                    </div>

                    {/* === Product Info === */}
                    <div className="col-lg-6">
                        <div className="shop-page-card h-100">
                            {/* Breadcrumb */}
                            <div className="mb-2 text-muted" style={{ fontSize: "0.9rem" }}>
                                <Link href="/shop" className="text-decoration-none">الرئيسية</Link>
                                <span className="mx-2">/</span>
                                <Link href="/shop/products" className="text-decoration-none">المتجر</Link>
                                <span className="mx-2">/</span>
                                <span>{product.category}</span>
                            </div>

                            <h1 style={{ fontWeight: 800 }}>{product.name}</h1>

                            {/* Vendor badge */}
                            {product.vendor_name && (
                                <div className="mb-2">
                                    <Link href={`/vendors/${product.vendor_slug}`} className="text-decoration-none"
                                        style={{ fontSize: "0.85rem", color: "var(--alha-primary, #0071CE)" }}>
                                        <i className="bx bx-store" /> {product.vendor_name}
                                    </Link>
                                </div>
                            )}

                            {/* Rating */}
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <span style={{ color: "#f59e0b" }}>
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <i key={index} className={`bx ${index < stars ? "bxs-star" : "bx-star"}`} />
                                    ))}
                                </span>
                                <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                                    ({product.rating.toFixed(1)} من 5) - {product.reviews} مراجعة
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-muted mt-2" style={{ lineHeight: 1.8 }}>
                                {product.description}
                            </p>

                            {/* Price */}
                            <div className="mt-3 shop-page-card" style={{ background: "var(--lux-surface-2, #f5f5f0)" }}>
                                {product.discount > 0 ? (
                                    <>
                                        <span className="badge bg-danger me-2">خصم {product.discount}%</span>
                                        <span className="me-2 text-muted" style={{ textDecoration: "line-through", fontSize: "1.1rem" }}>
                                            {formatMoneyEGP(product.price)}
                                        </span>
                                    </>
                                ) : null}
                                <strong style={{ fontSize: "1.8rem", color: "var(--alha-primary-dark, #b71c1c)" }}>{formatMoneyEGP(finalPrice)}</strong>
                            </div>

                            {/* Add to cart */}
                            <form className="d-flex align-items-center gap-2 mt-4 mb-3" action={`/api/flask/cart/add/${product.id}`} method="post">
                                <label htmlFor="qty" className="fw-semibold">الكمية:</label>
                                <input id="qty" type="number" min={1} max={Math.max(product.stock || 1, 1)} defaultValue={1} name="quantity" className="form-control" style={{ width: 90 }} />
                                <button type="submit" className="btn btn-warning" style={{ fontWeight: 700 }} disabled={!product.in_stock}>
                                    <i className="bx bx-cart-add" /> أضف إلى السلة
                                </button>
                            </form>

                            {/* Action buttons */}
                            <div className="d-flex gap-2 flex-wrap mt-2">
                                <Link href="/shop/checkout" className="btn btn-primary">
                                    <i className="bx bx-bolt-circle" /> شراء الآن
                                </Link>
                                <Link href="/shop/wishlist" className="btn btn-outline-secondary">
                                    <i className="bx bx-heart" /> للمفضلة
                                </Link>
                                <ShareButton productName={product.name} />
                            </div>

                            {!product.in_stock ? (
                                <div className="alert alert-warning mt-3 mb-0">
                                    هذا المنتج غير متوفر حاليا.
                                    <NotifyButton productId={product.id} />
                                </div>
                            ) : null}

                            {/* Product details */}
                            <div className="pt-3 mt-3 border-top">
                                <div className="small mb-1"><strong>الماركة:</strong> <span className="text-muted">{product.brand}</span></div>
                                <div className="small mb-1"><strong>الفئة:</strong> <span className="text-muted">{product.category}</span></div>
                                <div className="small mb-1">
                                    <strong>التوفر:</strong>{" "}
                                    <span className={product.in_stock ? "text-success" : "text-danger"}>
                                        {product.in_stock ? "متوفر" : "غير متوفر"}
                                    </span>
                                </div>
                                <div className="small mb-0">
                                    <strong>سياسة الاسترجاع:</strong>{" "}
                                    <Link href="/shop/return-policy" className="text-decoration-none">عرض التفاصيل</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* === Reviews & Q&A Tabs === */}
                <ReviewsAndQA productId={product.id} />
            </div>
        </section>
    );
}

/* ── Reviews & Questions Tabs (SSR-fetched) ── */
async function ReviewsAndQA({ productId }: { productId: number }) {
    let reviews: { id: number; user_name: string; rating: number; title: string; comment: string; created_at: string }[] = [];
    let questions: { id: number; user_name: string; question: string; answer: string; created_at: string }[] = [];

    try {
        const [rData, qData] = await Promise.all([
            flaskServerJson<{ reviews: typeof reviews }>(`/admin/api/products/${productId}/reviews`),
            flaskServerJson<{ questions: typeof questions }>(`/admin/api/products/${productId}/questions`),
        ]);
        reviews = rData?.reviews || [];
        questions = qData?.questions || [];
    } catch { /* noop */ }

    return (
        <div className="mt-4">
            <div className="row g-4">
                {/* Reviews */}
                <div className="col-lg-6">
                    <div className="shop-page-card">
                        <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 16 }}>
                            <i className="bx bx-star" style={{ color: "#FFC107" }} /> المراجعات ({reviews.length})
                        </h3>
                        {reviews.length === 0 ? (
                            <p className="text-muted" style={{ fontSize: "0.9rem" }}>لا توجد مراجعات بعد.</p>
                        ) : reviews.map(r => (
                            <div key={r.id} style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <span style={{ color: "#f59e0b" }}>
                                        {[1, 2, 3, 4, 5].map(s => <i key={s} className={`bx ${s <= r.rating ? "bxs-star" : "bx-star"}`} />)}
                                    </span>
                                    <strong style={{ fontSize: "0.85rem" }}>{r.user_name}</strong>
                                    <span style={{ fontSize: "0.75rem", color: "#aaa" }}>{new Date(r.created_at).toLocaleDateString("ar-EG")}</span>
                                </div>
                                {r.title && <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{r.title}</div>}
                                <p style={{ fontSize: "0.85rem", color: "#555", margin: "4px 0 0", lineHeight: 1.7 }}>{r.comment}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Questions */}
                <div className="col-lg-6">
                    <div className="shop-page-card">
                        <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 16 }}>
                            <i className="bx bx-help-circle" style={{ color: "var(--alha-primary, #0071CE)" }} /> أسئلة وأجوبة ({questions.length})
                        </h3>
                        {questions.length === 0 ? (
                            <p className="text-muted" style={{ fontSize: "0.9rem" }}>لا توجد أسئلة بعد.</p>
                        ) : questions.map(q => (
                            <div key={q.id} style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <i className="bx bx-user" style={{ color: "#888" }} />
                                    <strong style={{ fontSize: "0.85rem" }}>{q.user_name}</strong>
                                </div>
                                <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{q.question}</div>
                                {q.answer && (
                                    <div style={{ fontSize: "0.85rem", color: "#4CAF50", marginTop: 6, paddingRight: 16, borderRight: "3px solid #4CAF50" }}>
                                        <i className="bx bx-check-circle" /> {q.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
