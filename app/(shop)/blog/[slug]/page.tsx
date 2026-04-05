import Link from "next/link";
import { notFound } from "next/navigation";
import { flaskServerJson } from "@/lib/flask-server";

export const dynamic = "force-dynamic";

interface BlogPostDetail {
    id: number; title: string; slug: string; excerpt: string; body_html: string;
    cover_image: string; author_name: string; category_name: string;
    views: number; published_at: string; meta_title: string; meta_description: string;
    related_products: { id: number; name: string; price: number; image: string }[];
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    let post: BlogPostDetail | null = null;
    try {
        post = await flaskServerJson<BlogPostDetail>(`/admin/api/blog/public/${params.slug}`);
    } catch { /* noop */ }

    if (!post) notFound();

    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container" style={{ maxWidth: 800 }}>
                {/* Breadcrumb */}
                <div className="mb-3 text-muted" style={{ fontSize: "0.9rem" }}>
                    <Link href="/shop" className="text-decoration-none">الرئيسية</Link>
                    <span className="mx-2">/</span>
                    <Link href="/blog" className="text-decoration-none">المدونة</Link>
                    <span className="mx-2">/</span>
                    <span>{post.title}</span>
                </div>

                {/* Cover image */}
                {post.cover_image && (
                    <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
                        <img src={`/api/flask${post.cover_image}`} alt={post.title} style={{ width: "100%", maxHeight: 400, objectFit: "cover" }} />
                    </div>
                )}

                {/* Header */}
                <div className="shop-page-card" style={{ marginBottom: 24 }}>
                    {post.category_name && (
                        <span style={{ background: "#e3f2fd", color: "#1976D2", padding: "3px 12px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600 }}>
                            {post.category_name}
                        </span>
                    )}
                    <h1 style={{ fontWeight: 800, fontSize: "1.8rem", margin: "12px 0 8px" }}>{post.title}</h1>
                    <div className="d-flex gap-3" style={{ fontSize: "0.85rem", color: "#888" }}>
                        <span><i className="bx bx-user" /> {post.author_name}</span>
                        {post.published_at && <span><i className="bx bx-calendar" /> {new Date(post.published_at).toLocaleDateString("ar-EG")}</span>}
                        <span><i className="bx bx-show" /> {post.views} مشاهدة</span>
                    </div>
                </div>

                {/* Body */}
                <div className="shop-page-card">
                    <div
                        style={{ fontSize: "1rem", lineHeight: 2, color: "#333" }}
                        dangerouslySetInnerHTML={{ __html: post.body_html }}
                    />
                </div>

                {/* Related products */}
                {post.related_products && post.related_products.length > 0 && (
                    <div style={{ marginTop: 32 }}>
                        <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 16 }}>
                            <i className="bx bx-package" /> منتجات ذات صلة
                        </h3>
                        <div className="row g-3">
                            {post.related_products.map(p => (
                                <div key={p.id} className="col-6 col-md-3">
                                    <Link href={`/products/${p.id}`} className="text-decoration-none">
                                        <div className="shop-page-card text-center" style={{ overflow: "hidden" }}>
                                            <img src={`/api/flask/${p.image}`} alt={p.name} style={{ width: "100%", height: 120, objectFit: "cover" }} />
                                            <div style={{ padding: "8px 12px" }}>
                                                <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#222" }}>{p.name}</div>
                                                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--alha-primary, #0071CE)" }}>{Math.round(p.price).toLocaleString("ar-EG")} ج.م</div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
