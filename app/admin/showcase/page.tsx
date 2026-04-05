"use client";

// Suggested path: app/admin/showcase/page.tsx
// Converted from: templates/admin/showcase.html

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ShowcaseCard {
  id: number; title: string; subtitle: string; image_url: string;
  link_url: string; badge_text: string; is_active: boolean; sort_order: number;
}

export default function AdminShowcasePage() {
  const router = useRouter();
  const [cards, setCards] = useState<ShowcaseCard[]>([]);
  const [showcaseTitle, setShowcaseTitle] = useState("مجموعة العناية المتطورة");
  const [showcaseSubtitle, setShowcaseSubtitle] = useState("تركيبات فاخرة مصنوعة من مكونات طبيعية");
  const [addOpen, setAddOpen] = useState(false);
  const [editCard, setEditCard] = useState<ShowcaseCard | null>(null);

  useEffect(() => {
    fetch("/api/flask/admin/api/showcase")
      .then((r) => r.json())
      .then((d) => { setCards(d.cards ?? []); setShowcaseTitle(d.showcase_title ?? ""); setShowcaseSubtitle(d.showcase_subtitle ?? ""); })
      .catch(() => {});
  }, []);

  async function handleSaveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/flask/admin/showcase/settings", { method: "POST", body: fd });
    router.refresh();
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/flask/admin/showcase/add", { method: "POST", body: fd });
    setAddOpen(false); router.refresh();
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch(`/api/flask/admin/showcase/${editCard?.id}/edit`, { method: "POST", body: fd });
    setEditCard(null); router.refresh();
  }

  async function handleDelete(id: number) {
    if (!confirm("حذف هذه البطاقة؟")) return;
    await fetch(`/api/flask/admin/showcase/${id}`, { method: "DELETE" });
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleToggle(id: number) {
    await fetch(`/api/flask/admin/showcase/${id}/toggle`, { method: "POST" });
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, is_active: !c.is_active } : c));
  }

  const inputCls = "w-full px-4 py-3 rounded-xl text-gray-800 outline-none bg-white border border-[#cfd8dc] focus:border-[#0071ce]";

  const CardModal = ({ card, onClose, onSubmit }: { card?: ShowcaseCard; onClose: () => void; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
        <div className="flex justify-between items-center p-6" style={{ borderBottom: "1px solid #222" }}>
          <h2 className="text-xl font-bold text-gray-800">{card ? "تعديل البطاقة" : "إضافة بطاقة جديدة"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl"><i className="bx bx-x" /></button>
        </div>
        <form onSubmit={onSubmit} encType="multipart/form-data" className="p-6 space-y-4">
          <div><label className="block text-sm font-medium text-gray-300 mb-2">العنوان</label><input type="text" name="title" defaultValue={card?.title} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-2">العنوان الفرعي</label><input type="text" name="subtitle" defaultValue={card?.subtitle} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-2">نص الشارة</label><input type="text" name="badge_text" defaultValue={card?.badge_text} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-2">الرابط</label><input type="url" name="link_url" defaultValue={card?.link_url} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-2">الترتيب</label><input type="number" name="sort_order" defaultValue={card?.sort_order ?? 0} className={inputCls} /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-2">الصورة {!card && <span className="text-red-500">*</span>}</label>
            <input type="file" name="image" accept="image/*" required={!card} className="w-full text-gray-500" /></div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="is_active" id="card_active" defaultChecked={card?.is_active ?? true} className="rounded" />
            <label htmlFor="card_active" className="text-gray-300 text-sm">مفعّل</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-white border border-[#cfd8dc] text-gray-300">إلغاء</button>
            <button type="submit" className="flex-1 btn-accent py-3 rounded-xl font-medium">{card ? "حفظ" : "إضافة"}</button>
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
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center text-gray-800 shadow-lg"><i className="bx bx-collection text-2xl" /></div>
            <div><h1 className="text-2xl font-bold text-gray-800">مجموعة العناية المتطورة</h1><p className="text-gray-500 text-sm">إدارة بطاقات القسم المميز في الصفحة الرئيسية</p></div>
          </div>
          <button onClick={() => setAddOpen(true)} className="btn-accent px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg">
            <i className="bx bx-plus text-lg" /> <span>إضافة بطاقة جديدة</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Settings */}
        <div className="rounded-2xl p-6" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center text-gray-800"><i className="bx bx-heading text-xl" /></div>
            <div><h3 className="text-gray-800 font-bold text-lg">إعدادات القسم</h3><p className="text-gray-500 text-xs">العنوان والوصف الذي يظهر فوق البطاقات في الصفحة الرئيسية</p></div>
          </div>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-gray-300 text-sm font-medium mb-2">عنوان القسم</label>
                <input type="text" name="showcase_title" value={showcaseTitle} onChange={(e) => setShowcaseTitle(e.target.value)} required className={inputCls} /></div>
              <div><label className="block text-gray-300 text-sm font-medium mb-2">وصف القسم</label>
                <input type="text" name="showcase_subtitle" value={showcaseSubtitle} onChange={(e) => setShowcaseSubtitle(e.target.value)} required className={inputCls} /></div>
            </div>
            <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2" style={{ background: "linear-gradient(to right, #7c3aed, #6d28d9)", color: "white" }}>
              <i className="bx bx-save" /> حفظ الإعدادات
            </button>
          </form>
        </div>

        {/* Cards Grid */}
        {cards.length === 0 ? (
          <div className="text-center py-16">
            <i className="bx bx-collection text-5xl text-gray-600 block mb-4" />
            <p className="text-gray-500">لا توجد بطاقات بعد.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cards.map((card) => (
              <div key={card.id} className="rounded-2xl overflow-hidden shadow-lg" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
                <div className="relative h-40">
                  {card.image_url ? <img src={`/api/flask/${card.image_url}`} alt={card.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center" style={{ background: "#f8f9fa" }}><i className="bx bx-image text-4xl text-gray-600" /></div>}
                  {card.badge_text && <span className="absolute top-2 right-2 btn-accent px-2 py-0.5 rounded-full text-xs font-bold">{card.badge_text}</span>}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-1">{card.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{card.subtitle}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggle(card.id)} className="flex-1 py-2 rounded-xl text-xs font-medium transition-colors" style={{ background: card.is_active ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)", color: card.is_active ? "#f87171" : "#4ade80" }}>
                      {card.is_active ? "إخفاء" : "تفعيل"}
                    </button>
                    <button onClick={() => setEditCard(card)} className="py-2 px-3 rounded-xl text-xs transition-colors" style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}><i className="bx bx-edit" /></button>
                    <button onClick={() => handleDelete(card.id)} className="py-2 px-3 rounded-xl text-xs transition-colors" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}><i className="bx bx-trash" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {addOpen && <CardModal onClose={() => setAddOpen(false)} onSubmit={handleAdd} />}
      {editCard && <CardModal card={editCard} onClose={() => setEditCard(null)} onSubmit={handleEdit} />}
    </div>
  );
}
