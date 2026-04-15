"use client";

import { useState, useEffect } from "react";

interface TrustBadgeItem {
    id: number;
    name: string;
    image_url: string;
    sort_order: number;
    is_active: boolean;
}

const inputCls = "w-full px-4 py-3 rounded-xl text-gray-800 outline-none bg-white border border-[#cfd8dc] focus:border-[#0071ce] text-right";

export default function AdminTrustBadgesPage() {
    const [badges, setBadges] = useState<TrustBadgeItem[]>([]);
    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState<TrustBadgeItem | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/flask/admin/api/trust-badges", { credentials: "include" })
            .then((r) => r.json())
            .then((d) => setBadges(d?.badges ?? []))
            .catch(() => {});
    }, []);

    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        const fd = new FormData(e.currentTarget);
        const body = {
            name: fd.get("name"),
            image_url: fd.get("image_url"),
            sort_order: Number(fd.get("sort_order") || 0),
            is_active: true,
        };
        const url = editing
            ? `/api/flask/admin/api/trust-badges/${editing.id}`
            : "/api/flask/admin/api/trust-badges/add";
        const res = await fetch(url, {
            method: editing ? "PUT" : "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }).then((r) => r.json()).catch(() => ({}));
        setSaving(false);
        if (res?.ok) {
            const updated = await fetch("/api/flask/admin/api/trust-badges", { credentials: "include" }).then((r) => r.json());
            setBadges(updated?.badges ?? []);
        }
        setAdding(false);
        setEditing(null);
    }

    async function handleDelete(id: number) {
        if (!confirm("حذف هذه الشارة؟")) return;
        await fetch(`/api/flask/admin/api/trust-badges/${id}`, { method: "DELETE", credentials: "include" });
        setBadges((prev) => prev.filter((b) => b.id !== id));
    }

    async function toggleActive(id: number) {
        const b = badges.find((x) => x.id === id);
        if (!b) return;
        await fetch(`/api/flask/admin/api/trust-badges/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...b, is_active: !b.is_active }),
        });
        setBadges((prev) => prev.map((x) => x.id === id ? { ...x, is_active: !x.is_active } : x));
    }

    const editItem = editing || null;

    const Modal = ({ onClose }: { onClose: () => void }) => (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="rounded-2xl w-full max-w-md shadow-2xl bg-white">
                <div className="flex justify-between items-center p-5 border-b">
                    <h2 className="text-lg font-bold">{editItem ? "تعديل الشارة" : "إضافة شارة دفع"}</h2>
                    <button onClick={onClose} className="text-gray-400 text-2xl"><i className="bx bx-x" /></button>
                </div>
                <form onSubmit={handleSave} className="p-5 space-y-4" dir="rtl">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">الاسم (Visa / Mastercard / فوري ...)</label>
                        <input name="name" required defaultValue={editItem?.name} className={inputCls} placeholder="اسم وسيلة الدفع" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">رابط الصورة</label>
                        <input name="image_url" defaultValue={editItem?.image_url} className={inputCls} placeholder="/static/images/visa.png" />
                        {editItem?.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={editItem.image_url} alt="preview" className="mt-2 h-10 object-contain" />
                        )}
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
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600"><i className="bx bx-shield-quarter text-xl" /></div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">شارات الثقة والدفع</h1>
                        <p className="text-gray-400 text-xs">شعارات وسائل الدفع أسفل صفحة المتجر</p>
                    </div>
                </div>
                <button onClick={() => { setEditing(null); setAdding(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#0071ce] text-white rounded-xl font-bold text-sm">
                    <i className="bx bx-plus" /> إضافة شارة
                </button>
            </div>

            <div className="px-6 py-6">
                {badges.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <i className="bx bx-credit-card text-5xl block mb-3" />
                        <p>لا توجد شارات بعد.</p>
                        <p className="text-sm mt-1">أضف شعارات فيزا، ماستركارد، فوري، إنستاباي...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {badges.map((b) => (
                            <div key={b.id} className="bg-white rounded-2xl p-4 shadow border border-gray-100 flex flex-col items-center gap-3">
                                {b.image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={b.image_url} alt={b.name} className="h-12 object-contain" />
                                ) : (
                                    <div className="h-12 w-full flex items-center justify-center bg-gray-100 rounded-lg text-gray-500 font-bold text-sm">{b.name}</div>
                                )}
                                <p className="text-sm font-semibold text-gray-700 text-center">{b.name}</p>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${b.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                    {b.is_active ? "نشط" : "مخفي"}
                                </span>
                                <div className="flex gap-2 w-full">
                                    <button onClick={() => { setEditing(b); setAdding(true); }} className="flex-1 px-2 py-1.5 rounded-lg border text-xs font-semibold text-gray-600 hover:bg-gray-50">
                                        <i className="bx bx-edit" />
                                    </button>
                                    <button onClick={() => toggleActive(b.id)} className="px-2 py-1.5 rounded-lg border text-xs text-gray-600 hover:bg-gray-50">
                                        <i className={`bx ${b.is_active ? "bx-hide" : "bx-show"}`} />
                                    </button>
                                    <button onClick={() => handleDelete(b.id)} className="px-2 py-1.5 rounded-lg border border-red-100 text-xs text-red-500 hover:bg-red-50">
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
