import Link from "next/link";
import { flaskServerJson } from "@/lib/flask-server";

export const dynamic = "force-dynamic";

interface BlogPost {
    id: number; title: string; slug: string; excerpt: string;
    cover_image: string; author_name: string; category_name: string;
    views: number; published_at: string;
}

export default async function PublicBlogPage() {
    let posts: BlogPost[] = [];
    try {
        const data = await flaskServerJson<{ posts: BlogPost[] }>("/admin/api/blog/public");
        posts = data?.posts || [];
    } catch { /* noop */ }

    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container">
                <div className="text-center mb-5">
                    <h1 style={{ fontWeight: 800, fontSize: "2rem" }}>
                        <i className="bx bx-news" style={{ color: "var(--alha-primary, #0071CE)" }} /> مدونة الحمد
                    </h1>
                    <p className="text-muted" style={{ fontSize: "1rem" }}>نصائح العناية والجمال، وأحدث الأخبار</p>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-5">
                        <i className="bx bx-news" style={{ fontSize: 64, color: "#ddd", display: "block", marginBottom: 16 }} />
                        <p className="text-muted" style={{ fontSize: "1.1rem" }}>لا يوجد مقالات منشورة بعد</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {posts.map(p => (
                            <div key={p.id} className="col-md-6 col-lg-4">
                                <Link href={`/blog/${p.slug}`} className="text-decoration-none">
                                    <div className="shop-page-card" style={{ overflow: "hidden", cursor: "pointer", transition: "transform 0.2s" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
                                        {p.cover_image && (
                                            <div style={{ height: 200, background: `url(/api/flask${p.cover_image}) center/cover` }} />
                                        )}
                                        <div style={{ padding: "16px 20px" }}>
                                            {p.category_name && (
                                                <span style={{ background: "#e3f2fd", color: "#1976D2", padding: "2px 10px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600 }}>
                                                    {p.category_name}
                                                </span>
                                            )}
                                            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "8px 0", color: "#222" }}>{p.title}</h3>
                                            {p.excerpt && <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.7, margin: "0 0 12px" }}>{p.excerpt}</p>}
                                            <div className="d-flex justify-content-between" style={{ fontSize: "0.78rem", color: "#aaa" }}>
                                                <span><i className="bx bx-user" /> {p.author_name}</span>
                                                <span><i className="bx bx-show" /> {p.views} مشاهدة</span>
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
