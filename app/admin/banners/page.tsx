"use client";

// Suggested path: app/admin/banners/page.tsx
// Converted from: templates/admin/banners.html

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Banner {
  id: number; title: string; subtitle: string; image_url: string;
  link_url: string; order: number; is_active: boolean;
}

export default function AdminBannersPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);

  useEffect(() => {
    fetch("/api/flask/admin/api/banners", { credentials: "include" }).then((r) => r.json()).then(setBanners).catch(() => { });
  }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/flask/admin/banners/add", { method: "POST", body: fd, credentials: "include" });
    setAddOpen(false); router.refresh();
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch(`/api/flask/admin/banners/${editBanner?.id}/edit`, { method: "POST", body: fd, credentials: "include" });
    setEditBanner(null); router.refresh();
  }

  async function handleDelete(id: number) {
    if (!confirm("حذف البانر؟")) return;
    await fetch(`/api/flask/admin/banners/${id}`, { method: "DELETE", credentials: "include" });
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }

  async function toggleActive(id: number) {
    await fetch(`/api/flask/admin/banners/${id}/toggle`, { method: "POST", credentials: "include" });
    setBanners((prev) => prev.map((b) => b.id === id ? { ...b, is_active: !b.is_active } : b));
  }

  const inputCls = "w-full px-4 py-3 rounded-xl text-gray-800 outline-none bg-white border border-[#cfd8dc] focus:border-[#0071ce]";

  const BannerModal = ({ banner, onClose, onSubmit }: { banner?: Banner; onClose: () => void; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="rounded-2xl w-full max-w-lg shadow-2xl" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
        <div className="flex justify-between items-center p-6" style={{ borderBottom: "1px solid #222" }}>
          <h2 className="text-xl font-bold text-gray-800">{banner ? "تعديل البانر" : "إضافة بانر جديد"}</h2>
          <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800 w-10 h-10 flex items-center justify-center rounded-xl"><i className="bx bx-x" /></button>
        </div>
        <form onSubmit={onSubmit} encType="multipart/form-data" className="p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-300 mb-2">العنوان</label><input type="text" name="title" defaultValue={banner?.title} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-2">العنوان الفرعي</label><input type="text" name="subtitle" defaultValue={banner?.subtitle} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-2">رابط البانر</label><input type="url" name="link_url" defaultValue={banner?.link_url} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-2">الترتيب</label><input type="number" name="order" defaultValue={banner?.order ?? 0} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-2">الصورة {!banner && <span className="text-red-500">*</span>}</label>
            <input type="file" name="image" accept="image/*" required={!banner} className="w-full text-gray-500" /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="is_active" id="is_active" defaultChecked={banner?.is_active ?? true} className="rounded" />
            <label htmlFor="is_active" className="text-gray-300 text-sm">مفعّل</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 rounded-xl font-medium bg-white border border-[#cfd8dc] text-gray-300">إلغاء</button>
            <button type="submit" className="flex-1 btn-accent py-3 px-4 rounded-xl font-medium">{banner ? "حفظ" : "إضافة"}</button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="backdrop-blur-sm sticky top-0 z-10 shadow-sm" style={{ background: "rgba(255,255,255,0.97)", borderBottom: "1px solid #222" }}>
        <div className="px-6 py-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center text-gray-800 shadow-lg"><i className="bx bx-image-alt text-2xl" /></div>
            <div><h1 className="text-2xl font-bold text-gray-800">إدارة البانرات</h1><p className="text-gray-500 text-sm">تحكم في صور وشرائح الصفحة الرئيسية</p></div>
          </div>
          <button onClick={() => setAddOpen(true)} className="btn-accent px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg">
            <i className="bx bx-plus text-lg" /><span className="font-medium">إضافة بانر جديد</span>
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "إجمالي البانرات", value: banners.length, icon: "bx-image", color: "bg-blue-600" },
            { label: "بانرات مفعّلة", value: banners.filter((b) => b.is_active).length, icon: "bx-show", color: "bg-green-600" },
            { label: "بانرات مخفية", value: banners.filter((b) => !b.is_active).length, icon: "bx-hide", color: "bg-yellow-600" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="rounded-2xl p-6 border border-gray-800 shadow-lg" style={{ background: "#fff" }}>
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-gray-800`}><i className={`bx ${icon} text-xl`} /></div>
                <span className="text-3xl font-bold text-gray-800">{value}</span>
              </div>
              <h3 className="text-gray-500 font-medium">{label}</h3>
            </div>
          ))}
        </div>

        {banners.length === 0 ? (
          <div className="text-center py-16">
            <i className="bx bx-image-alt text-5xl text-gray-600 block mb-4" />
            <p className="text-gray-500">لا توجد بانرات بعد. أضف بانر جديد للبدء.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {banners.map((b) => (
              <div key={b.id} className="rounded-2xl border border-gray-800 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300" style={{ background: "#fff" }}>
                <div className="relative h-44 bg-gray-800 overflow-hidden">
                  {b.image_url ? (
                    <img src={`/api/flask/${b.image_url}`} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><i className="bx bx-image text-5xl text-gray-600" /></div>
                  )}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${b.is_active ? "bg-green-500" : "bg-gray-500"} text-gray-800`}>
                    {b.is_active ? "مفعّل" : "مخفي"}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 text-lg mb-1">{b.title || "بلا عنوان"}</h3>
                  <p className="text-sm text-gray-500 mb-3">{b.subtitle}</p>
                  {b.link_url && <p className="text-xs text-[#0071ce] mb-3 truncate">{b.link_url}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => toggleActive(b.id)} className="flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors" style={{ background: b.is_active ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)", color: b.is_active ? "#f87171" : "#4ade80" }}>
                      {b.is_active ? "إخفاء" : "تفعيل"}
                    </button>
                    <button onClick={() => setEditBanner(b)} className="py-2 px-3 rounded-xl text-sm font-medium transition-colors" style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}><i className="bx bx-edit" /></button>
                    <button onClick={() => handleDelete(b.id)} className="py-2 px-3 rounded-xl text-sm font-medium transition-colors" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}><i className="bx bx-trash" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {addOpen && <BannerModal onClose={() => setAddOpen(false)} onSubmit={handleAdd} />}
      {editBanner && <BannerModal banner={editBanner} onClose={() => setEditBanner(null)} onSubmit={handleEdit} />}
    </div>
  );
}
