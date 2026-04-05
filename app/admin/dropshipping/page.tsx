"use client";

// Suggested path: app/admin/dropshipping/page.tsx
// Converted from: templates/admin/dropshipping.html

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface DropItem {
  id: number; title: string; price: string; image: string; source_url: string;
  status: string; created_at: string;
}

export default function AdminDropshippingPage() {
  const router = useRouter();
  const [items, setItems] = useState<DropItem[]>([]);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/flask/admin/api/dropshipping").then((r) => r.json()).then((d) => setItems(d?.items ?? [])).catch(() => { });
  }, []);

  const imported = items.filter((i) => i.status === "imported").length;
  const pending = items.filter((i) => i.status === "pending").length;

  async function handleScrape(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("url", url);
      const res = await fetch("/api/flask/admin/dropshipping/scrape", { method: "POST", body: fd });
      if (!res.ok) throw new Error("فشل الجلب");
      setUrl(""); router.refresh();
    } catch {
      setError("تعذر جلب البيانات من هذا الرابط");
    } finally { setLoading(false); }
  }

  async function handleImport(id: number) {
    await fetch(`/api/flask/admin/dropshipping/${id}/import`, { method: "POST" });
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status: "imported" } : i));
  }

  async function handleDelete(id: number) {
    await fetch(`/api/flask/admin/dropshipping/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-card p-6 rounded-xl" style={{ border: "1px solid #cfd8dc" }}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center text-gray-800 shadow-lg"><i className="bx bx-link-external text-2xl" /></div>
            <div><h1 className="text-2xl font-bold text-gray-800">دروب شوبينج</h1><p className="text-gray-500 text-sm">استورد منتجات من أي موقع بلصق الرابط فقط</p></div>
          </div>
        </div>
      </div>

      {/* Scrape Form */}
      <div className="admin-card p-6 rounded-xl" style={{ border: "1px solid #cfd8dc" }}>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="bx bx-search-alt text-red-500" /> جلب منتج من رابط
        </h2>
        <form onSubmit={handleScrape} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="الصق رابط المنتج هنا... (مثال: https://www.amazon.eg/product/...)"
                className="w-full p-3 pr-10 rounded-lg text-sm bg-white border border-[#cfd8dc] text-gray-800 focus:border-[#0071ce] focus:outline-none" dir="ltr" />
              <i className="bx bx-link absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
            <button type="submit" disabled={loading} className="btn-accent px-6 py-3 rounded-lg flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-60">
              <i className={loading ? "bx bx-loader-alt animate-spin" : "bx bx-import"} />
              <span>{loading ? "جاري الجلب..." : "جلب البيانات"}</span>
            </button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <p className="text-xs text-gray-600">يدعم معظم المتاجر الإلكترونية - الصق رابط المنتج وسيتم جلب البيانات تلقائياً</p>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "إجمالي المنتجات", value: items.length, icon: "bx-package", color: "bg-blue-900/30 text-blue-400" },
          { label: "تم الاستيراد", value: imported, icon: "bx-check-circle", color: "bg-green-900/30 text-green-400" },
          { label: "قيد الانتظار", value: pending, icon: "bx-time", color: "bg-yellow-900/30 text-yellow-400" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="admin-card p-5 rounded-xl" style={{ border: "1px solid #cfd8dc" }}>
            <div className="flex items-center justify-between">
              <div><p className="text-gray-500 text-sm">{label}</p><p className="text-2xl font-bold text-gray-800 mt-1">{value}</p></div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><i className={`bx ${icon} text-xl`} /></div>
            </div>
          </div>
        ))}
      </div>

      {/* Items List */}
      {items.length > 0 && (
        <div className="admin-card rounded-xl overflow-hidden" style={{ border: "1px solid #cfd8dc" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid #222" }}>
            <h2 className="text-lg font-bold text-gray-800">المنتجات المجلوبة</h2>
          </div>
          <div className="divide-y" style={{ borderColor: "#1a1a1a" }}>
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-white transition-colors">
                {item.image && <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-xl border border-[#cfd8dc]" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{item.title}</p>
                  <p className="text-sm text-[#0071ce] font-bold">{item.price}</p>
                  <a href={item.source_url} target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:text-[#0071ce] truncate block">{item.source_url}</a>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === "imported" ? "bg-green-600 text-gray-800" : "bg-yellow-600/30 text-yellow-400"}`}>
                    {item.status === "imported" ? "تم الاستيراد" : "قيد الانتظار"}
                  </span>
                  {item.status !== "imported" && (
                    <button onClick={() => handleImport(item.id)} className="btn-accent px-3 py-1.5 rounded-lg text-xs">استيراد</button>
                  )}
                  <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 rounded-lg text-xs transition-colors" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
                    <i className="bx bx-trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
