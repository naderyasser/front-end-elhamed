"use client";

// Suggested path: app/admin/flash-deals/page.tsx
// Converted from: templates/admin/flash_deals.html

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Deal {
  id: number; is_active: boolean; deal_price: number; original_price: number;
  discount_percent: number; stock_sold: number; stock_total: number;
  percent_claimed: number; ends_at: string;
  product: { name: string };
}
interface Product { id: number; name: string }

export default function AdminFlashDealsPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    fetch("/api/flask/admin/api/flash-deals").then((r) => r.json()).then((d) => { setDeals(d?.deals ?? []); setProducts(d?.products ?? []); }).catch(() => { });
  }, []);

  async function handleToggle(id: number) {
    await fetch(`/api/flask/admin/flash-deals/${id}/toggle`, { method: "POST" });
    setDeals((prev) => prev.map((d) => d.id === id ? { ...d, is_active: !d.is_active } : d));
  }

  async function handleDelete(id: number) {
    if (!confirm("حذف هذا العرض؟")) return;
    await fetch(`/api/flask/admin/flash-deals/${id}`, { method: "DELETE" });
    setDeals((prev) => prev.filter((d) => d.id !== id));
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/flask/admin/flash-deals/add", { method: "POST", body: fd });
    setAddOpen(false); router.refresh();
  }

  return (
    <div className="min-h-screen">
      <div className="backdrop-blur-sm sticky top-0 z-10 shadow-sm" style={{ background: "rgba(255,255,255,0.97)", borderBottom: "1px solid #222" }}>
        <div className="px-6 py-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-red-800 rounded-xl flex items-center justify-center text-gray-800 shadow-lg"><i className="bx bxs-zap text-2xl" /></div>
            <div><h1 className="text-2xl font-bold text-gray-800">العروض الخاطفة</h1><p className="text-gray-500 text-sm">إدارة عروض الفلاش مع مؤقت العد التنازلي</p></div>
          </div>
          <button onClick={() => setAddOpen(true)} className="btn-accent px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg">
            <i className="bx bx-plus text-lg" /> <span className="font-medium">إضافة عرض جديد</span>
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {deals.length === 0 ? (
          <div className="text-center py-16">
            <i className="bx bxs-zap text-6xl text-gray-700 block mb-4" />
            <p className="text-gray-500 text-lg">لا توجد عروض خاطفة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <div key={deal.id} className="rounded-2xl p-5 shadow-lg" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-800 font-bold text-lg truncate max-w-[200px]">{deal.product.name}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${deal.is_active ? "bg-green-600 text-gray-800" : "bg-gray-700 text-gray-500"}`}>
                    {deal.is_active ? "نشط" : "متوقف"}
                  </span>
                </div>
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-red-400 font-bold text-xl">{Math.round(deal.deal_price)} ج.م</span>
                  <span className="text-gray-500 line-through text-sm">{Math.round(deal.original_price)} ج.م</span>
                  <span className="rounded text-xs font-bold px-2 py-0.5" style={{ background: "rgba(211,47,47,0.2)", color: "#f87171" }}>-{deal.discount_percent}%</span>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>تم بيع {deal.stock_sold} من {deal.stock_total}</span>
                    <span>{deal.percent_claimed}%</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ background: "#e2e8f0" }}>
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${deal.percent_claimed}%` }} />
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-3">ينتهي: {deal.ends_at ?? "غير محدد"}</div>
                <div className="flex gap-2">
                  <button onClick={() => handleToggle(deal.id)} className="px-3 py-2 rounded-lg text-xs transition-all" style={{ background: "#e2e8f0", color: "#4a5568" }}>
                    <i className={`bx ${deal.is_active ? "bx-pause" : "bx-play"}`} /> {deal.is_active ? "إيقاف" : "تفعيل"}
                  </button>
                  <button onClick={() => handleDelete(deal.id)} className="px-3 py-2 rounded-lg text-xs transition-all" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
                    <i className="bx bx-trash" /> حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {addOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">إضافة عرض خاطف</h2>
                <button onClick={() => setAddOpen(false)} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div><label className="block text-gray-500 text-sm mb-1">المنتج</label>
                  <select name="product_id" required className="w-full bg-white border border-[#cfd8dc] text-gray-800 rounded-xl px-4 py-3">
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-gray-500 text-sm mb-1">سعر العرض</label><input type="number" name="deal_price" step={0.01} required className="w-full bg-white border border-[#cfd8dc] text-gray-800 rounded-xl px-4 py-3" /></div>
                  <div><label className="block text-gray-500 text-sm mb-1">السعر الأصلي</label><input type="number" name="original_price" step={0.01} required className="w-full bg-white border border-[#cfd8dc] text-gray-800 rounded-xl px-4 py-3" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-gray-500 text-sm mb-1">الكمية الإجمالية</label><input type="number" name="stock_total" defaultValue={50} className="w-full bg-white border border-[#cfd8dc] text-gray-800 rounded-xl px-4 py-3" /></div>
                  <div><label className="block text-gray-500 text-sm mb-1">ترتيب العرض</label><input type="number" name="sort_order" defaultValue={0} className="w-full bg-white border border-[#cfd8dc] text-gray-800 rounded-xl px-4 py-3" /></div>
                </div>
                <div><label className="block text-gray-500 text-sm mb-1">ينتهي في</label><input type="datetime-local" name="ends_at" required className="w-full bg-white border border-[#cfd8dc] text-gray-800 rounded-xl px-4 py-3" /></div>
                <button type="submit" className="w-full btn-accent py-3 rounded-xl font-bold">إضافة العرض</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
