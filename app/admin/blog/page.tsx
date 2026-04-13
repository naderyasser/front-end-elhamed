"use client";
import { useState, useEffect } from "react";

interface BlogPost {
    id: number; title: string; slug: string; excerpt: string;
    status: string; category_name: string; author_name: string;
    views: number; cover_image: string; published_at: string; created_at: string;
}
interface BlogCategory { id: number; name: string; slug: string; }

const STATUS_LABEL: Record<string, { bg: string; label: string }> = {
    draft: { bg: "#9E9E9E", label: "مسودة" },
    published: { bg: "#4CAF50", label: "منشور" },
    archived: { bg: "#FF9800", label: "أرشيف" },
};

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPostModal, setShowPostModal] = useState(false);
    const [showCatModal, setShowCatModal] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [postForm, setPostForm] = useState({ title: "", excerpt: "", body_html: "", category_id: "", status: "draft", meta_title: "", meta_description: "", author_name: "الحمد" });
    const [catForm, setCatForm] = useState({ name: "" });
    const [coverImage, setCoverImage] = useState<File | null>(null);

    const load = () => {
        setLoading(true);
        Promise.all([
            fetch("/api/flask/admin/api/blog/posts", { credentials: "include" }).then(r => r.json()),
            fetch("/api/flask/admin/api/blog/categories", { credentials: "include" }).then(r => r.json()),
        ]).then(([p, c]) => {
            setPosts(p.posts || []);
            setCategories(c.categories || []);
        }).finally(() => setLoading(false));
    };
    useEffect(load, []);

    function openAddPost() {
        setEditingPost(null);
        setPostForm({ title: "", excerpt: "", body_html: "", category_id: categories[0]?.id?.toString() || "", status: "draft", meta_title: "", meta_description: "", author_name: "الحمد" });
        setCoverImage(null);
        setShowPostModal(true);
    }
    function openEditPost(p: BlogPost) {
        setEditingPost(p);
        setPostForm({ title: p.title, excerpt: p.excerpt || "", body_html: "", category_id: "", status: p.status, meta_title: "", meta_description: "", author_name: p.author_name || "الحمد" });
        setCoverImage(null);
        setShowPostModal(true);
    }

    async function savePost() {
        const fd = new FormData();
        Object.entries(postForm).forEach(([k, v]) => fd.append(k, v));
        if (coverImage) fd.append("cover_image", coverImage);
        const url = editingPost ? `/api/flask/admin/api/blog/posts/${editingPost.id}` : "/api/flask/admin/api/blog/posts";
        await fetch(url, { method: editingPost ? "PUT" : "POST", body: fd, credentials: "include" });
        setShowPostModal(false);
        load();
    }

    async function deletePost(id: number) {
        if (!confirm("هل أنت متأكد من حذف هذا المقال؟")) return;
        await fetch(`/api/flask/admin/api/blog/posts/${id}`, { method: "DELETE", credentials: "include" });
        load();
    }

    async function saveCat() {
        await fetch("/api/flask/admin/api/blog/categories", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(catForm), credentials: "include",
        });
        setCatForm({ name: "" });
        setShowCatModal(false);
        load();
    }

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h1 className="admin-page-title"><i className="bx bx-news" /> المدونة</h1>
                <div className="d-flex gap-2">
                    <button onClick={() => setShowCatModal(true)} className="btn-outline-alha d-flex align-items-center gap-1"
                        style={{ padding: "8px 14px", borderRadius: 10, fontSize: "0.85rem", border: "1px solid #ddd" }}>
                        <i className="bx bx-folder-plus" /> تصنيف جديد
                    </button>
                    <button onClick={openAddPost} className="btn-cta-alha d-flex align-items-center gap-2"
                        style={{ padding: "8px 18px", borderRadius: 10, fontSize: "0.88rem" }}>
                        <i className="bx bx-plus" /> مقال جديد
                    </button>
                </div>
            </div>

            {/* Categories bar */}
            {categories.length > 0 && (
                <div className="d-flex gap-2 mb-4 flex-wrap">
                    {(Array.isArray(categories) ? categories : []).map(c => (
                        <span key={c.id} style={{ background: "#f0f4f8", padding: "4px 14px", borderRadius: 20, fontSize: "0.82rem", color: "#555" }}>
                            {c.name}
                        </span>
                    ))}
                </div>
            )}

            {loading ? <div className="text-center p-5"><i className="bx bx-loader-alt bx-spin" style={{ fontSize: 32 }} /></div> : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
                    {posts.map(p => (
                        <div key={p.id} className="admin-card" style={{ overflow: "hidden" }}>
                            {p.cover_image && (
                                <div style={{ height: 160, background: `url(/api/flask${p.cover_image}) center/cover`, borderRadius: "12px 12px 0 0" }} />
                            )}
                            <div style={{ padding: "16px 20px" }}>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>{p.title}</h3>
                                    <span style={{
                                        background: STATUS_LABEL[p.status]?.bg || "#888", color: "#fff",
                                        padding: "2px 10px", borderRadius: 10, fontSize: "0.72rem", whiteSpace: "nowrap",
                                    }}>{STATUS_LABEL[p.status]?.label || p.status}</span>
                                </div>
                                {p.excerpt && <p style={{ fontSize: "0.82rem", color: "#666", margin: "8px 0", lineHeight: 1.7 }}>{p.excerpt}</p>}
                                <div style={{ fontSize: "0.78rem", color: "#aaa", marginBottom: 12 }}>
                                    <i className="bx bx-user" /> {p.author_name}
                                    {p.category_name && <> · <i className="bx bx-folder" /> {p.category_name}</>}
                                    · <i className="bx bx-show" /> {p.views} مشاهدة
                                </div>
                                <div className="d-flex gap-2">
                                    <button onClick={() => openEditPost(p)} style={{ background: "#2196F3", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: "0.78rem", cursor: "pointer" }}>
                                        <i className="bx bx-edit" /> تعديل
                                    </button>
                                    <button onClick={() => deletePost(p.id)} style={{ background: "#f44336", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: "0.78rem", cursor: "pointer" }}>
                                        <i className="bx bx-trash" /> حذف
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {posts.length === 0 && (
                        <div className="admin-card text-center" style={{ padding: 40, color: "#aaa", gridColumn: "1 / -1" }}>
                            <i className="bx bx-news" style={{ fontSize: 48, display: "block", marginBottom: 12 }} />
                            لا يوجد مقالات بعد
                        </div>
                    )}
                </div>
            )}

            {/* Post Modal */}
            {showPostModal && (
                <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowPostModal(false); }}>
                    <div className="admin-modal" style={{ maxWidth: 640 }}>
                        <div className="admin-modal-header">
                            <h2><i className="bx bx-news" /> {editingPost ? "تعديل المقال" : "مقال جديد"}</h2>
                            <button className="admin-modal-close" onClick={() => setShowPostModal(false)}>&times;</button>
                        </div>
                        <div className="admin-modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                            <div className="mb-3">
                                <label className="admin-form-label">العنوان <span className="text-danger">*</span></label>
                                <input className="admin-form-control" value={postForm.title} onChange={e => setPostForm({ ...postForm, title: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label className="admin-form-label">المقتطف</label>
                                <textarea className="admin-form-control" rows={2} value={postForm.excerpt} onChange={e => setPostForm({ ...postForm, excerpt: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label className="admin-form-label">المحتوى (HTML)</label>
                                <textarea className="admin-form-control" rows={8} value={postForm.body_html} onChange={e => setPostForm({ ...postForm, body_html: e.target.value })} style={{ fontFamily: "monospace", fontSize: "0.82rem" }} />
                            </div>
                            <div className="row g-3 mb-3">
                                <div className="col-6">
                                    <label className="admin-form-label">التصنيف</label>
                                    <select className="admin-form-control" value={postForm.category_id} onChange={e => setPostForm({ ...postForm, category_id: e.target.value })}>
                                        <option value="">بدون تصنيف</option>
                                        {(Array.isArray(categories) ? categories : []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-6">
                                    <label className="admin-form-label">الحالة</label>
                                    <select className="admin-form-control" value={postForm.status} onChange={e => setPostForm({ ...postForm, status: e.target.value })}>
                                        <option value="draft">مسودة</option>
                                        <option value="published">منشور</option>
                                        <option value="archived">أرشيف</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="admin-form-label">اسم الكاتب</label>
                                <input className="admin-form-control" value={postForm.author_name} onChange={e => setPostForm({ ...postForm, author_name: e.target.value })} />
                            </div>
                            <div className="mb-3">
                                <label className="admin-form-label">صورة الغلاف</label>
                                <input type="file" accept="image/*" className="admin-form-control" onChange={e => setCoverImage(e.target.files?.[0] || null)} />
                            </div>
                            <div className="row g-3 mb-4">
                                <div className="col-6">
                                    <label className="admin-form-label">عنوان SEO</label>
                                    <input className="admin-form-control" value={postForm.meta_title} onChange={e => setPostForm({ ...postForm, meta_title: e.target.value })} />
                                </div>
                                <div className="col-6">
                                    <label className="admin-form-label">وصف SEO</label>
                                    <input className="admin-form-control" value={postForm.meta_description} onChange={e => setPostForm({ ...postForm, meta_description: e.target.value })} />
                                </div>
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" onClick={() => setShowPostModal(false)} className="btn-outline-alha">إلغاء</button>
                                <button onClick={savePost} className="btn-cta-alha d-flex align-items-center gap-2"><i className="bx bx-save" /> حفظ</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {showCatModal && (
                <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowCatModal(false); }}>
                    <div className="admin-modal" style={{ maxWidth: 400 }}>
                        <div className="admin-modal-header">
                            <h2><i className="bx bx-folder-plus" /> تصنيف جديد</h2>
                            <button className="admin-modal-close" onClick={() => setShowCatModal(false)}>&times;</button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="mb-4">
                                <label className="admin-form-label">اسم التصنيف <span className="text-danger">*</span></label>
                                <input className="admin-form-control" value={catForm.name} onChange={e => setCatForm({ name: e.target.value })} />
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                                <button type="button" onClick={() => setShowCatModal(false)} className="btn-outline-alha">إلغاء</button>
                                <button onClick={saveCat} className="btn-cta-alha d-flex align-items-center gap-2"><i className="bx bx-save" /> حفظ</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}