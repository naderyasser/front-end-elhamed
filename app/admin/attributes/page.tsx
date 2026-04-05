"use client";

// Suggested path: app/admin/attributes/page.tsx
// Converted from: templates/admin/attributes.html

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AttrValue { id: number; value: string; color_hex?: string }
interface Attribute { id: number; name: string; attr_type: string; values: AttrValue[] }

export default function AdminAttributesPage() {
  const router = useRouter();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editAttr, setEditAttr] = useState<Attribute | null>(null);
  const [addValueAttrId, setAddValueAttrId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/flask/admin/api/attributes").then((r) => r.json()).then(setAttributes).catch(() => {});
  }, []);

  async function handleAddAttr(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/flask/admin/attributes/add", { method: "POST", body: fd });
    setAddOpen(false); router.refresh();
  }

  async function handleEditAttr(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch(`/api/flask/admin/attributes/${editAttr?.id}/edit`, { method: "POST", body: fd });
    setEditAttr(null); router.refresh();
  }

  async function handleDeleteAttr(id: number) {
    if (!confirm("حذف السمة وجميع قيمها؟")) return;
    await fetch(`/api/flask/admin/attributes/${id}`, { method: "DELETE" });
    setAttributes((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleAddValue(e: React.FormEvent<HTMLFormElement>, attrId: number) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.append("attr_id", String(attrId));
    await fetch("/api/flask/admin/attributes/values/add", { method: "POST", body: fd });
    setAddValueAttrId(null); router.refresh();
  }

  async function handleDeleteValue(valId: number) {
    await fetch(`/api/flask/admin/attributes/values/${valId}`, { method: "DELETE" });
    setAttributes((prev) => prev.map((a) => ({ ...a, values: a.values.filter((v) => v.id !== valId) })));
  }

  const typeIcon: Record<string, string> = { color: "bx-palette", size: "bx-ruler", number: "bx-hash" };
  const typeColor: Record<string, string> = { color: "bg-pink-500", size: "bg-blue-500", number: "bg-orange-500" };

  const inputCls = "w-full px-4 py-3 rounded-xl text-gray-800 outline-none bg-white border border-[#cfd8dc] focus:border-[#0071ce]";

  return (
    <div className="min-h-screen">
      <div className="backdrop-blur-sm sticky top-0 z-10 shadow-sm" style={{ background: "rgba(255,255,255,0.97)", borderBottom: "1px solid #222" }}>
        <div className="px-6 py-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-gray-800 shadow-lg"><i className="bx bx-purchase-tag text-2xl" /></div>
            <div><h1 className="text-2xl font-bold text-gray-800">إدارة السمات</h1><p className="text-gray-500 text-sm">سمات المنتجات (لون، مقاس، إلخ)</p></div>
          </div>
          <button onClick={() => setAddOpen(true)} className="btn-accent px-6 py-3 rounded-xl flex items-center gap-2">
            <i className="bx bx-plus text-lg" /> سمة جديدة
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {attributes.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
            <i className="bx bx-purchase-tag text-5xl text-gray-600 block mb-4" />
            <p className="text-gray-500">لا توجد سمات بعد. أضف سمة مثل "اللون" أو "المقاس".</p>
          </div>
        ) : attributes.map((attr) => (
          <div key={attr.id} className="rounded-2xl overflow-hidden shadow" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid #222" }}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-gray-800 text-sm font-bold ${typeColor[attr.attr_type] ?? "bg-gray-500"}`}>
                  <i className={`bx ${typeIcon[attr.attr_type] ?? "bx-text"}`} />
                </div>
                <div>
                  <span className="font-bold text-gray-800 text-lg">{attr.name}</span>
                  <span className="mr-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{attr.attr_type}</span>
                </div>
                <span className="text-sm text-gray-500">({attr.values.length} قيمة)</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditAttr(attr)} className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors" style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}>
                  <i className="bx bx-edit" /> تعديل
                </button>
                <button onClick={() => handleDeleteAttr(attr.id)} className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
                  <i className="bx bx-trash" /> حذف
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-3 mb-4">
                {attr.values.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">لا توجد قيم بعد</p>
                ) : attr.values.map((val) => (
                  <div key={val.id} className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "#f8f9fa", border: "1px solid #cfd8dc" }}>
                    {attr.attr_type === "color" && val.color_hex && (
                      <span className="w-5 h-5 rounded-full border border-gray-600 inline-block flex-shrink-0" style={{ background: val.color_hex }} />
                    )}
                    <span className="text-sm font-medium text-gray-300">{val.value}</span>
                    {val.color_hex && <span className="text-xs text-gray-500">{val.color_hex}</span>}
                    <button onClick={() => handleDeleteValue(val.id)} className="text-red-400 hover:text-red-300 transition-colors">
                      <i className="bx bx-x text-lg" />
                    </button>
                  </div>
                ))}
              </div>
              {addValueAttrId === attr.id ? (
                <form onSubmit={(e) => handleAddValue(e, attr.id)} className="flex gap-2 mt-2">
                  <input type="text" name="value" placeholder="القيمة" required className="flex-1 px-3 py-2 rounded-lg bg-white border border-[#cfd8dc] text-gray-800 text-sm focus:border-[#0071ce] focus:outline-none" />
                  {attr.attr_type === "color" && <input type="color" name="color_hex" className="w-10 h-10 rounded-lg border border-[#cfd8dc] cursor-pointer" />}
                  <button type="submit" className="btn-accent px-4 py-2 rounded-lg text-sm">إضافة</button>
                  <button type="button" onClick={() => setAddValueAttrId(null)} className="px-4 py-2 rounded-lg text-sm bg-gray-100 text-gray-500">إلغاء</button>
                </form>
              ) : (
                <button onClick={() => setAddValueAttrId(attr.id)} className="flex items-center gap-1 text-sm font-medium transition-colors" style={{ color: "#0071ce" }}>
                  <i className="bx bx-plus" /> إضافة قيمة
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Attr Modal */}
      {addOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-md shadow-2xl" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
            <div className="flex justify-between items-center p-6" style={{ borderBottom: "1px solid #222" }}>
              <h2 className="text-xl font-bold text-gray-800">إضافة سمة جديدة</h2>
              <button onClick={() => setAddOpen(false)} className="text-2xl text-gray-500 hover:text-gray-800 w-10 h-10 flex items-center justify-center rounded-xl"><i className="bx bx-x" /></button>
            </div>
            <form onSubmit={handleAddAttr} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-300 mb-2">اسم السمة <span className="text-red-500">*</span></label><input type="text" name="name" required className={inputCls} /></div>
              <div><label className="block text-sm font-medium text-gray-300 mb-2">النوع</label>
                <select name="attr_type" className={inputCls}>
                  <option value="text">نص</option><option value="color">لون</option><option value="size">مقاس</option><option value="number">رقم</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setAddOpen(false)} className="flex-1 py-3 px-4 rounded-xl font-medium bg-white border border-[#cfd8dc] text-gray-300">إلغاء</button>
                <button type="submit" className="flex-1 btn-accent py-3 px-4 rounded-xl font-medium">إضافة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editAttr && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-md shadow-2xl" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
            <div className="flex justify-between items-center p-6" style={{ borderBottom: "1px solid #222" }}>
              <h2 className="text-xl font-bold text-gray-800">تعديل السمة</h2>
              <button onClick={() => setEditAttr(null)} className="text-2xl text-gray-500 hover:text-gray-800 w-10 h-10 flex items-center justify-center rounded-xl"><i className="bx bx-x" /></button>
            </div>
            <form onSubmit={handleEditAttr} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-300 mb-2">الاسم</label><input type="text" name="name" defaultValue={editAttr.name} required className={inputCls} /></div>
              <div><label className="block text-sm font-medium text-gray-300 mb-2">النوع</label>
                <select name="attr_type" defaultValue={editAttr.attr_type} className={inputCls}>
                  <option value="text">نص</option><option value="color">لون</option><option value="size">مقاس</option><option value="number">رقم</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditAttr(null)} className="flex-1 py-3 px-4 rounded-xl font-medium bg-white border border-[#cfd8dc] text-gray-300">إلغاء</button>
                <button type="submit" className="flex-1 btn-accent py-3 px-4 rounded-xl font-medium">حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
