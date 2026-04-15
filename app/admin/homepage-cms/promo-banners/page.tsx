"use client";

import { useState, useEffect } from "react";

interface PromoBannerItem {
    id: number;
    title: string;
    subtitle: string;
    image_url: string;
    cta_text: string;
    cta_link: string;
    background_color: string | null;
    position: string;
    sort_order: number;
    is_active: boolean;
}

const inputCls = "w-full px-4 py-3 rounded-xl text-gray-800 outline-none bg-white border border-[#cfd8dc] focus:border-[#0071ce] text-right";

export default function AdminPromoBannersPage() {
    const [banners, setBanners] = useState<PromoBannerItem[]>([]);
    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState<PromoBannerItem | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/flask/admin/api/promo-banners", { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setBanners(d?.banners ?? []))
            .catch(() => {});
    }, []);

    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        const fd = new FormData(e.currentTarget);
        const body = {
            title: fd.get("title"),
            subtitle: fd.get("subtitle"),
            image_url: fd.get("image_url"),
            cta_text: fd.get("cta_text"),
            cta_link: fd.get("cta_link"),
            background_color: fd.get("background_color") || null,
            position: fd.get("position") || "mid_page",
            sort_order: Number(fd.get("sort_order") || 0),
            is_active: true,
        };
        const url = editing
            ? `/api/flask/admin/api/promo-banners/${editing.id}`
            : "/api/flask/admin/api/promo-banners/add";
        const res = await fetch(url, {
            method: editing ? "PUT" : "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }).then((r) => r.json()).catch(() => ({}));
        setSaving(false);
        if (res?.ok) {
            const updated = await fetch("/api/flask/admin/api/promo-banners", { credentials: "include" }).then((r) => r.json());
            setBanners(updated?.banners ?? []);
        }
        setAdding(false);
        setEditing(null);
    }

    async function handleDelete(id: number) {
        if (!confirm("حذف هذا البانر؟")) return;
        await fetch(`/api/flask/admin/api/promo-banners/${id}`, { method: "DELETE", credentials: "include" });
        setBanners((prev) => prev.filter((b) => b.id !== id));
    }

    async function toggleActive(id: number) {
        const b = banners.find((x) => x.id === id);
        if (!b) return;
        await fetch(`/api/flask/admin/api/promo-banners/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...b, is_active: !b.is_active }),
        });
        setBanners((prev) => prev.map((x) => x.id === id ? { ...x, is_active: !x.is_active } : x));
    }

    const editItem = editing || null;

    const Modal = ({ onClose }: { onClose: () => void }) => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="rounded-2xl w-full max-w-lg shadow-2xl bg-white my-4">
                <div className="flex justify-between items-center p-5 border-b">
                    <h2 className="text-lg font-bold">{editItem ? "تعديل البانر" : "بانر ترويجي جديد"}</h2>
                    <button onClick={onClose} className="text-gray-400 text-2xl"><i className="bx bx-x" /></button>
                </div>
                <form onSubmit={handleSave} className="p-5 space-y-4" dir="rtl">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">العنوان</label>
                        <input name="title" defaultValue={editItem?.title} className={inputCls} placeholder="عنوان البانر" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">العنوان الفرعي</label>
                        <input name="subtitle" defaultValue={editItem?.subtitle} className={inputCls} placeholder="وصف قصير" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">رابط الصورة</label>
                        <input name="image_url" defaultValue={editItem?.image_url} className={inputCls} placeholder="/static/images/..." />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">نص الزر</label>
                            <input name="cta_text" defaultValue={editItem?.cta_text || "تسوق الآن"} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">رابط الزر</label>
                            <input name="cta_link" defaultValue={editItem?.cta_link || "/shop/products"} className={inputCls} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">لون الخلفية (اختياري)</label>
                            <input name="background_color" type="color" defaultValue={editItem?.background_color || "#0071ce"} className="w-full h-10 rounded-xl border border-gray-200 cursor-pointer" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">الموضع</label>
                            <select name="position" defaultValue={editItem?.position || "mid_page"} className={inputCls}>
                                <option value="mid_page">وسط الصفحة</option>
                                <option value="bottom">أسفل الصفحة</option>
                                <option value="top">أعلى الصفحة</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">ترتيب العرض</label>
                        <input name="sort_order" type="number" defaultValue={editItem?.sort_order || 0} className={inputCls} />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl border font-semibold text-gray-600">إلغاء</button>
                        <button type="submit" disabled={saving} className="px-6 py-2 rounded-xl bg-[#0071ce] text-white font-bold">
                            {saving ? "جاري الحفظ..." : "حفظ"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen" dir="rtl">
            <div className="px-6 py-4 flex justify-between items-center border-b bg-white sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600"><i className="bx bx-image text-xl" /></div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">البانرات الترويجية</h1>
                        <p className="text-gray-400 text-xs">بانرات ترويجية داخل صفحة المتجر الرئيسية</p>
                    </div>
                </div>
                <button onClick={() => { setEditing(null); setAdding(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#0071ce] text-white rounded-xl font-bold text-sm">
                    <i className="bx bx-plus" /> إضافة بانر
                </button>
            </div>

            <div className="px-6 py-6">
                {banners.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <i className="bx bx-image text-5xl block mb-3" />
                        <p>لا توجد بانرات ترويجية بعد.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {banners.map((b) => (
                            <div key={b.id} className="bg-white rounded-2xl overflow-hidden shadow border border-gray-100">
                                {b.image_url && (
                                    <div className="h-36 bg-gray-100 overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                {!b.image_url && b.background_color && (
                                    <div className="h-20 rounded-t-2xl" style={{ background: b.background_color }} />
                                )}
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-gray-800">{b.title || "(بدون عنوان)"}</p>
                                            {b.subtitle && <p className="text-sm text-gray-400 mt-0.5">{b.subtitle}</p>}
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${b.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                            {b.is_active ? "نشط" : "مخفي"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-3">
                                        <span className="font-semibold">موقع:</span> {b.position === "mid_page" ? "وسط الصفحة" : b.position} &nbsp;|&nbsp;
                                        <span className="font-semibold">الزر:</span> {b.cta_text}
                                    </p>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditing(b); setAdding(true); }} className="flex-1 px-3 py-2 rounded-lg border text-sm font-semibold text-gray-600 hover:bg-gray-50">
                                            <i className="bx bx-edit ml-1" /> تعديل
                                        </button>
                                        <button onClick={() => toggleActive(b.id)} className="px-3 py-2 rounded-lg border text-sm font-semibold text-gray-600 hover:bg-gray-50">
                                            <i className={`bx ${b.is_active ? "bx-hide" : "bx-show"}`} />
                                        </button>
                                        <button onClick={() => handleDelete(b.id)} className="px-3 py-2 rounded-lg border border-red-100 text-sm font-semibold text-red-500 hover:bg-red-50">
                                            <i className="bx bx-trash" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {adding && <Modal onClose={() => { setAdding(false); setEditing(null); }} />}
        </div>
    );
}
