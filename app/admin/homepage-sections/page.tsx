"use client";

// Suggested path: app/admin/homepage-sections/page.tsx
// Converted from: templates/admin/homepage_sections.html

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Section {
  id: number; title: string; section_type: string; is_active: boolean;
  sort_order: number; items: unknown[];
}

export default function AdminHomepageSectionsPage() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    fetch("/api/flask/admin/api/homepage-sections").then((r) => r.json()).then((d) => setSections(d?.sections ?? [])).catch(() => { });
  }, []);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/flask/admin/homepage-sections/add", { method: "POST", body: fd });
    setAddOpen(false); router.refresh();
  }

  async function handleToggle(id: number) {
    await fetch(`/api/flask/admin/homepage-sections/${id}/toggle`, { method: "POST" });
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, is_active: !s.is_active } : s));
  }

  async function handleDelete(id: number) {
    if (!confirm("حذف هذا القسم؟")) return;
    await fetch(`/api/flask/admin/homepage-sections/${id}`, { method: "DELETE" });
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  const typeColor: Record<string, string> = {
    grid_4: "bg-blue-600/20 text-blue-400",
    promo_banner: "bg-purple-600/20 text-purple-400",
  };

  const inputCls = "w-full px-4 py-3 rounded-xl text-gray-800 outline-none bg-white border border-[#cfd8dc] focus:border-[#0071ce]";

  return (
    <div className="min-h-screen">
      <div className="backdrop-blur-sm sticky top-0 z-10 shadow-sm" style={{ background: "rgba(255,255,255,0.97)", borderBottom: "1px solid #222" }}>
        <div className="px-6 py-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-gray-800 shadow-lg"><i className="bx bx-grid-alt text-2xl" /></div>
            <div><h1 className="text-2xl font-bold text-gray-800">أقسام الصفحة الرئيسية</h1><p className="text-gray-500 text-sm">إدارة البطاقات الشبكية والبانرات الترويجية</p></div>
          </div>
          <button onClick={() => setAddOpen(true)} className="btn-accent px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg">
            <i className="bx bx-plus text-lg" /> <span className="font-medium">إضافة قسم جديد</span>
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {sections.length === 0 ? (
          <div className="text-center py-16">
            <i className="bx bx-grid-alt text-5xl text-gray-600 block mb-4" />
            <p className="text-gray-500">لا توجد أقسام بعد.</p>
          </div>
        ) : sections.map((section) => (
          <div key={section.id} className="rounded-2xl overflow-hidden shadow-lg" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${typeColor[section.section_type] ?? "bg-gray-600/20 text-gray-500"}`}>
                    {section.section_type}
                  </span>
                  <h3 className="text-gray-800 font-bold text-lg">{section.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${section.is_active ? "bg-green-600 text-gray-800" : "bg-gray-700 text-gray-500"}`}>
                    {section.is_active ? "نشط" : "متوقف"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleToggle(section.id)} className="px-3 py-1.5 rounded-lg text-xs transition-all" style={{ background: "#e2e8f0", color: "#4a5568" }}>
                    <i className={`bx ${section.is_active ? "bx-pause" : "bx-play"}`} /> {section.is_active ? "إيقاف" : "تفعيل"}
                  </button>
                  <button onClick={() => handleDelete(section.id)} className="px-3 py-1.5 rounded-lg text-xs transition-all" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
                    <i className="bx bx-trash" /> حذف
                  </button>
                </div>
              </div>
              <p className="text-gray-500 text-sm">{(section.items as unknown[]).length ?? 0} عنصر · ترتيب {section.sort_order}</p>
            </div>
          </div>
        ))}
      </div>

      {addOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-md shadow-2xl" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
            <div className="flex justify-between items-center p-6" style={{ borderBottom: "1px solid #222" }}>
              <h2 className="text-xl font-bold text-gray-800">إضافة قسم جديد</h2>
              <button onClick={() => setAddOpen(false)} className="text-gray-500 hover:text-gray-800 text-2xl"><i className="bx bx-x" /></button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-300 mb-2">عنوان القسم <span className="text-red-500">*</span></label><input type="text" name="title" required className={inputCls} /></div>
              <div><label className="block text-sm font-medium text-gray-300 mb-2">نوع القسم</label>
                <select name="section_type" className={inputCls}>
                  <option value="grid_4">شبكة 4 بطاقات</option>
                  <option value="promo_banner">بانر ترويجي</option>
                  <option value="slider">سلايدر</option>
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-300 mb-2">الترتيب</label><input type="number" name="sort_order" defaultValue={0} className={inputCls} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setAddOpen(false)} className="flex-1 py-3 rounded-xl bg-white border border-[#cfd8dc] text-gray-300">إلغاء</button>
                <button type="submit" className="flex-1 btn-accent py-3 rounded-xl font-medium">إضافة</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
