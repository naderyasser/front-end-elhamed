"use client";

// Suggested path: app/admin/bundles/page.tsx
// Converted from: templates/admin/bundles.html

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface BundleItem { product: { id: number; name: string; image: string } }
interface Bundle { id: number; title: string; discount_percent: number; is_active: boolean; items: BundleItem[] }
interface Product { id: number; name: string; price: number }

export default function AdminBundlesPage() {
  const router = useRouter();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    fetch("/api/flask/admin/api/bundles", { credentials: "include" }).then((r) => r.json()).then((d) => { setBundles(d?.bundles ?? []); setProducts(d?.products ?? []); }).catch(() => { });
  }, []);

  async function handleToggle(id: number) {
    await fetch(`/api/flask/admin/bundles/${id}/toggle`, { method: "POST", credentials: "include" });
    setBundles((prev) => prev.map((b) => b.id === id ? { ...b, is_active: !b.is_active } : b));
  }

  async function handleDelete(id: number) {
    if (!confirm("حذف هذه الباقة؟")) return;
    await fetch(`/api/flask/admin/bundles/${id}`, { method: "DELETE", credentials: "include" });
    setBundles((prev) => prev.filter((b) => b.id !== id));
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/flask/admin/bundles/add", { method: "POST", body: fd, credentials: "include" });
    setAddOpen(false); router.refresh();
  }

  return (
    <div className="min-h-screen">
      <div className="backdrop-blur-sm sticky top-0 z-10 shadow-sm" style={{ background: "rgba(255,255,255,0.97)", borderBottom: "1px solid #222" }}>
        <div className="px-6 py-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center text-gray-800 shadow-lg"><i className="bx bxs-gift text-2xl" /></div>
            <div><h1 className="text-2xl font-bold text-gray-800">باقات المنتجات</h1><p className="text-gray-500 text-sm">يتم شراؤهم معاً — عروض الباقات لزيادة المبيعات</p></div>
          </div>
          <button onClick={() => setAddOpen(true)} className="btn-accent px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg">
            <i className="bx bx-plus text-lg" /> <span className="font-medium">إضافة باقة جديدة</span>
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {bundles.length === 0 ? (
          <div className="text-center py-16">
            <i className="bx bxs-gift text-6xl text-gray-700 block mb-4" />
            <p className="text-gray-500 text-lg">لا توجد باقات — أنشئ باقة لعرضها كـ"يتم شراؤهم معاً"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bundles.map((bundle) => (
              <div key={bundle.id} className="rounded-2xl p-5 shadow-lg" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-gray-800 font-bold text-lg flex items-center gap-2">
                      <i className="bx bxs-gift text-green-400" /> {bundle.title}
                    </h3>
                    <span className="text-green-400 text-sm font-bold">خصم {bundle.discount_percent}%</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${bundle.is_active ? "bg-green-600 text-gray-800" : "bg-gray-700 text-gray-500"}`}>
                    {bundle.is_active ? "نشط" : "متوقف"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {bundle.items.map((bi, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="rounded-xl p-2 text-center" style={{ background: "#f8f9fa", width: 80 }}>
                        <img src={`/api/flask/${bi.product.image}`} alt={bi.product.name} className="w-14 h-14 mx-auto object-contain rounded-lg mb-1" />
                        <p className="text-gray-500 text-[10px] truncate">{bi.product.name.slice(0, 15)}</p>
                      </div>
                      {i < bundle.items.length - 1 && <span className="text-gray-600 text-xl font-bold">+</span>}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleToggle(bundle.id)} className="px-3 py-2 rounded-lg text-xs transition-all" style={{ background: "#e2e8f0", color: "#4a5568" }}>
                    <i className={`bx ${bundle.is_active ? "bx-pause" : "bx-play"}`} /> {bundle.is_active ? "إيقاف" : "تفعيل"}
                  </button>
                  <button onClick={() => handleDelete(bundle.id)} className="px-3 py-2 rounded-lg text-xs transition-all" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
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
                <h2 className="text-xl font-bold text-gray-800">إضافة باقة جديدة</h2>
                <button onClick={() => setAddOpen(false)} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div><label className="block text-gray-500 text-sm mb-1">عنوان الباقة</label>
                  <input type="text" name="title" defaultValue="يتم شراؤهم معاً" className="w-full bg-white border border-[#cfd8dc] text-gray-800 rounded-xl px-4 py-3" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-gray-500 text-sm mb-1">نسبة الخصم %</label>
                    <input type="number" name="discount_percent" defaultValue={10} step={0.1} className="w-full bg-white border border-[#cfd8dc] text-gray-800 rounded-xl px-4 py-3" /></div>
                  <div><label className="block text-gray-500 text-sm mb-1">ترتيب العرض</label>
                    <input type="number" name="sort_order" defaultValue={0} className="w-full bg-white border border-[#cfd8dc] text-gray-800 rounded-xl px-4 py-3" /></div>
                </div>
                <div><label className="block text-gray-500 text-sm mb-2">اختر المنتجات (Ctrl+Click لاختيار أكثر من منتج)</label>
                  <select name="product_ids" multiple required className="w-full bg-white border border-[#cfd8dc] text-gray-800 rounded-xl px-4 py-3" size={8}>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {Math.round(p.price)} ج.م</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full btn-accent py-3 rounded-xl font-bold">إنشاء الباقة</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
