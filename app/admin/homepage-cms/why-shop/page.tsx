"use client";

import { useState, useEffect } from "react";

interface WhyShopItem {
    id: number;
    title: string;
    description: string;
    icon: string;
    sort_order: number;
    is_active: boolean;
}

const inputCls = "w-full px-4 py-3 rounded-xl text-gray-800 outline-none bg-white border border-[#cfd8dc] focus:border-[#0071ce] text-right";

export default function AdminWhyShopPage() {
    const [items, setItems] = useState<WhyShopItem[]>([]);
    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState<WhyShopItem | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/flask/admin/api/why-shop", { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setItems(d?.items ?? []))
            .catch(() => {});
    }, []);

    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        const fd = new FormData(e.currentTarget);
        const body = {
            title: fd.get("title"),
            description: fd.get("description"),
            icon: fd.get("icon"),
            sort_order: Number(fd.get("sort_order") || 0),
            is_active: true,
        };
        const url = editing
            ? `/api/flask/admin/api/why-shop/${editing.id}`
            : "/api/flask/admin/api/why-shop/add";
        const method = editing ? "PUT" : "POST";
        const res = await fetch(url, {
            method,
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }).then((r) => r.json()).catch(() => ({}));
        setSaving(false);
        if (res?.ok) {
            const updated = await fetch("/api/flask/admin/api/why-shop", { credentials: "include" }).then((r) => r.json());
            setItems(updated?.items ?? []);
        }
        setAdding(false);
        setEditing(null);
    }

    async function handleDelete(id: number) {
        if (!confirm("حذف هذا العنصر؟")) return;
        await fetch(`/api/flask/admin/api/why-shop/${id}`, { method: "DELETE", credentials: "include" });
        setItems((prev) => prev.filter((i) => i.id !== id));
    }

    async function toggleActive(id: number) {
        const item = items.find((i) => i.id === id);
        if (!item) return;
        await fetch(`/api/flask/admin/api/why-shop/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...item, is_active: !item.is_active }),
        });
        setItems((prev) => prev.map((i) => i.id === id ? { ...i, is_active: !i.is_active } : i));
    }

    const editItem = editing || null;

    const Modal = ({ onClose }: { onClose: () => void }) => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="rounded-2xl w-full max-w-lg shadow-2xl bg-white">
                <div className="flex justify-between items-center p-5 border-b">
                    <h2 className="text-lg font-bold">{editItem ? "تعديل العنصر" : "إضافة عنصر جديد"}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center"><i className="bx bx-x" /></button>
                </div>
                <form onSubmit={handleSave} className="p-5 space-y-4" dir="rtl">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">العنوان*</label>
                        <input name="title" defaultValue={editItem?.title} required className={inputCls} placeholder="مثال: شحن سريع" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">الوصف</label>
                        <textarea name="description" defaultValue={editItem?.description} rows={2} className={inputCls} placeholder="وصف قصير للخدمة" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                            كلاس الأيقونة (من <a href="https://boxicons.com" target="_blank" rel="noopener noreferrer" className="text-blue-600">Boxicons</a>)
                        </label>
                        <input name="icon" defaultValue={editItem?.icon || "bx-star"} className={inputCls} placeholder="مثال: bxs-truck" />
                        <p className="text-xs text-gray-400 mt-1">أمثلة: bxs-truck، bxs-shield-plus، bx-support، bxs-lock-alt</p>
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
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><i className="bx bxs-badge-check text-xl" /></div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">لماذا تتسوق معنا</h1>
                        <p className="text-gray-400 text-xs">إدارة عناصر قسم مميزات المتجر في الصفحة الرئيسية</p>
                    </div>
                </div>
                <button onClick={() => { setEditing(null); setAdding(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#0071ce] text-white rounded-xl font-bold text-sm">
                    <i className="bx bx-plus" /> إضافة عنصر
                </button>
            </div>

            <div className="px-6 py-6">
                {items.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <i className="bx bxs-badge-check text-5xl block mb-3" />
                        <p>لا توجد عناصر بعد. أضف أول عنصر!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl p-5 shadow border border-gray-100">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl">
                                            <i className={`bx ${item.icon}`} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{item.title}</p>
                                            <p className="text-xs text-gray-400 font-mono">{item.icon}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                        {item.is_active ? "نشط" : "مخفي"}
                                    </span>
                                </div>
                                {item.description && (
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.description}</p>
                                )}
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditing(item); setAdding(true); }} className="flex-1 px-3 py-2 rounded-lg border text-sm font-semibold text-gray-600 hover:bg-gray-50">
                                        <i className="bx bx-edit ml-1" /> تعديل
                                    </button>
                                    <button onClick={() => toggleActive(item.id)} className="px-3 py-2 rounded-lg border text-sm font-semibold text-gray-600 hover:bg-gray-50">
                                        <i className={`bx ${item.is_active ? "bx-hide" : "bx-show"}`} />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="px-3 py-2 rounded-lg border border-red-100 text-sm font-semibold text-red-500 hover:bg-red-50">
                                        <i className="bx bx-trash" />
                                    </button>
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
