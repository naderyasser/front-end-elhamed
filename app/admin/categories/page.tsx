"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ───────────── Types ───────────── */
interface Attr { id: number; name: string; attr_type: string }
interface AttrFull extends Attr { values: { id: number; value: string; color_hex: string | null }[] }
interface Category {
  id: number; name: string; name_en: string; description: string;
  image: string; slug: string; icon: string; display_order: number;
  is_active: boolean; parent_id: number | null;
  meta_title: string; meta_description: string; canonical_url: string;
  products: { id: number; name: string }[];
  attributes: Attr[];
  children: Category[];
}

type ModalMode = null | "add" | "edit";

/* ───────────── Helpers ───────────── */
function countAll(cat: Category): number {
  return (cat.products?.length ?? 0) + (cat.children ?? []).reduce((s, c) => s + countAll(c), 0);
}
function flattenTree(cats: Category[]): Category[] {
  const out: Category[] = [];
  function walk(list: Category[]) { list.forEach(c => { out.push(c); walk(c.children ?? []); }); }
  walk(cats);
  return out;
}
function depthOf(cat: Category, map: Map<number, Category>): number {
  let d = 0, pid = cat.parent_id;
  while (pid) { d++; const p = map.get(pid); pid = p?.parent_id ?? null; }
  return d;
}

/* ───────────── Tree Node Component ───────────── */
function TreeNode({ cat, depth, onEdit, onDelete, dragId, onDragStart, onDragOver, onDrop }: {
  cat: Category; depth: number;
  onEdit: (c: Category) => void; onDelete: (c: Category) => void;
  dragId: number | null;
  onDragStart: (id: number) => void; onDragOver: (e: React.DragEvent, id: number) => void; onDrop: (targetId: number) => void;
}) {
  const [open, setOpen] = useState(depth < 1);
  const hasKids = (cat.children ?? []).length > 0;
  const totalProducts = countAll(cat);

  return (
    <div>
      <div
        draggable
        onDragStart={(e) => { e.stopPropagation(); onDragStart(cat.id); }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onDragOver(e, cat.id); }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop(cat.id); }}
        className={`tree-node ${dragId === cat.id ? "dragging" : ""}`}
        style={{ paddingRight: `${depth * 28 + 16}px` }}
      >
        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => hasKids && setOpen(!open)}
          className="tree-expand"
          style={{ opacity: hasKids ? 1 : 0.2, pointerEvents: hasKids ? "auto" : "none", transform: open ? "rotate(0)" : "rotate(-90deg)" }}
        >
          <i className="bx bx-chevron-down" />
        </button>

        {/* Drag handle */}
        <span className="tree-drag" title="اسحب لإعادة الترتيب"><i className="bx bx-grid-vertical" /></span>

        {/* Icon / Image */}
        {cat.image ? (
          <img src={`/api/flask/${cat.image}`} alt={cat.name} className="tree-thumb" />
        ) : (
          <span className="tree-icon-box"><i className={`bx ${cat.icon || "bx-category"}`} /></span>
        )}

        {/* Name */}
        <div className="tree-name-col">
          <span className="tree-name">{cat.name}</span>
          {cat.name_en && <span className="tree-name-en">{cat.name_en}</span>}
        </div>

        {/* Badges */}
        <span className="tree-badge blue">{totalProducts} منتج</span>
        {(cat.attributes ?? []).length > 0 && (
          <span className="tree-badge orange">{cat.attributes.length} خاصية</span>
        )}
        {!cat.is_active && <span className="tree-badge red">مخفي</span>}

        {/* Level indicator */}
        <span className="tree-level">
          {depth === 0 ? "رئيسي" : depth === 1 ? "فرعي" : "فرعي ٢"}
        </span>

        {/* Actions */}
        <div className="tree-actions">
          <button onClick={() => onEdit(cat)} title="تعديل"><i className="bx bx-edit" /></button>
          <button onClick={() => onDelete(cat)} className="danger" title="حذف"><i className="bx bx-trash" /></button>
        </div>
      </div>

      {open && hasKids && (
        <div>
          {[...(cat.children ?? [])].sort((a, b) => a.display_order - b.display_order).map(child => (
            <TreeNode key={child.id} cat={child} depth={depth + 1}
              onEdit={onEdit} onDelete={onDelete}
              dragId={dragId} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────── Main Page ───────────── */
export default function AdminCategoriesPage() {
  const [tree, setTree] = useState<Category[]>([]);
  const [allAttrs, setAllAttrs] = useState<AttrFull[]>([]);
  const [modal, setModal] = useState<ModalMode>(null);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [search, setSearch] = useState("");
  const [dragId, setDragId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedAttrs, setSelectedAttrs] = useState<number[]>([]);
  const [seoOpen, setSeoOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    // Check if admin is logged in using session cookie auth
    const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('admin_logged_in') === 'true';
    if (!isLoggedIn) {
      console.error("Admin not logged in");
      window.location.href = '/admin/login';
      setLoading(false);
      return;
    }
    fetch("/api/flask/admin/api/categories", {
      credentials: 'include', // CRITICAL: Send HTTP-only session cookies
    })
      .then(r => { if (!r.ok) throw new Error(""); return r.json(); })
      .then(d => {
        setTree(d?.tree ?? []);
        setAllAttrs(d?.attributes ?? []);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const flat = flattenTree(tree);
  const catMap = new Map(flat.map(c => [c.id, c]));

  /* ── Search filter ── */
  const matchesSearch = (cat: Category): boolean => {
    if (!search) return true;
    const q = search.toLowerCase();
    if (cat.name.toLowerCase().includes(q) || (cat.name_en || "").toLowerCase().includes(q)) return true;
    return (cat.children ?? []).some(matchesSearch);
  };
  const filteredTree = search ? tree.filter(matchesSearch) : tree;

  /* ── Drag & Drop ── */
  function handleDragStart(id: number) { setDragId(id); }
  function handleDragOver(e: React.DragEvent, _targetId: number) { e.dataTransfer.dropEffect = "move"; }
  function handleDrop(targetId: number) {
    if (!dragId || dragId === targetId) { setDragId(null); return; }
    const dragged = catMap.get(dragId);
    const target = catMap.get(targetId);
    if (!dragged || !target) { setDragId(null); return; }
    const targetDepth = depthOf(target, catMap);
    if (targetDepth >= 2) { setDragId(null); return; }

    // Check if admin is logged in using session cookie auth
    const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('admin_logged_in') === 'true';
    if (!isLoggedIn) {
      console.error("Admin not logged in");
      window.location.href = '/admin/login';
      setDragId(null);
      return;
    }

    const updates = [{ id: dragId, order: 0, parent_id: targetId }];
    fetch("/api/flask/admin/reorder_categories", {
      method: "POST",
      credentials: 'include', // CRITICAL: Send HTTP-only session cookies
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }).then(() => fetchData());
    setDragId(null);
  }

  /* ── CRUD ── */
  function openAdd(parentId?: number) {
    setEditCat(null);
    setModal("add");
    setSelectedAttrs([]);
    setSeoOpen(false);
    setImagePreview(null);
    setTimeout(() => {
      if (formRef.current && parentId) {
        const el = formRef.current.querySelector('[name="parent_id"]') as HTMLSelectElement;
        if (el) el.value = String(parentId);
      }
    }, 50);
  }
  function openEdit(cat: Category) {
    setEditCat(cat);
    setModal("edit");
    setSelectedAttrs((cat.attributes ?? []).map(a => a.id));
    setSeoOpen(false);
    setImagePreview(null);
  }
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleDelete(cat: Category) {
    if ((cat.children ?? []).length > 0) return alert("لا يمكن حذف تصنيف يحتوي على أقسام فرعية");
    if ((cat.products ?? []).length > 0) return alert("لا يمكن حذف تصنيف يحتوي على منتجات");
    if (!confirm(`هل أنت متأكد من حذف "${cat.name}"؟`)) return;

    try {
      const res = await fetch(`/api/flask/admin/categories/${cat.id}`, {
        method: "DELETE",
        credentials: 'include', // CRITICAL: Send HTTP-only session cookies
      });
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/admin/login';
          return;
        }
        throw new Error('فشل الحذف');
      }
      fetchData();
    } catch (error) {
      alert('حدث خطأ أثناء حذف التصنيف');
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Check if admin is logged in using session cookie auth
    const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('admin_logged_in') === 'true';
    if (!isLoggedIn) {
      alert('يرجى تسجيل الدخول أولاً');
      window.location.href = '/admin/login';
      return;
    }

    setSubmitting(true);
    setSubmitMsg(null);

    const fd = new FormData(e.currentTarget);
    selectedAttrs.forEach(id => fd.append("attribute_ids", String(id)));

    // Handle checkbox — send "on" if checked, remove if not
    const activeCheckbox = e.currentTarget.querySelector('[name="is_active"]') as HTMLInputElement;
    if (activeCheckbox && !activeCheckbox.checked) {
      fd.set("is_active", "");
    }

    try {
      let res;

      if (modal === "edit" && editCat) {
        res = await fetch(`/api/flask/admin/categories/${editCat.id}/edit`, {
          method: "POST",
          body: fd,
          credentials: 'include', // CRITICAL: Send HTTP-only session cookies
        });
      } else {
        res = await fetch("/api/flask/admin/categories/add", {
          method: "POST",
          body: fd,
          credentials: 'include', // CRITICAL: Send HTTP-only session cookies
        });
      }

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success !== false) {
        setSubmitMsg({ ok: true, text: data.message || (modal === "edit" ? "تم تعديل التصنيف بنجاح" : "تم إضافة التصنيف بنجاح") });
        setTimeout(() => {
          setModal(null);
          setEditCat(null);
          fetchData();
        }, 800);
      } else {
        setSubmitMsg({ ok: false, text: data.message || "حدث خطأ أثناء الحفظ" });
        if (res.status === 401) {
          setTimeout(() => window.location.href = '/admin/login', 1500);
        }
      }
    } catch (error) {
      setSubmitMsg({ ok: false, text: "حدث خطأ في الاتصال" });
    } finally {
      setSubmitting(false);
    }
  }

  function toggleAttr(id: number) {
    setSelectedAttrs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  /* ── Stats ── */
  const rootCount = tree.length;
  const totalCount = flat.length;
  const activeCount = flat.filter(c => c.is_active).length;
  const totalProducts = flat.reduce((s, c) => s + (c.products?.length ?? 0), 0);

  const parentOptions = flat.filter(c => depthOf(c, catMap) < 2);

  const inputCls = "w-full px-4 py-3 rounded-xl text-gray-800 outline-none bg-white border border-[#cfd8dc] focus:border-[#0071ce] transition-colors";

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="backdrop-blur-sm sticky top-0 z-10 shadow-sm" style={{ background: "rgba(255,255,255,0.97)", borderBottom: "1px solid #cfd8dc" }}>
        <div className="px-6 py-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0071ce] to-[#004c91] rounded-xl flex items-center justify-center text-white shadow-lg">
              <i className="bx bx-category text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">شجرة التصنيفات</h1>
              <p className="text-gray-500 text-sm">إدارة هرمية — 3 مستويات مع خصائص ديناميكية</p>
            </div>
          </div>
          <button onClick={() => openAdd()} className="btn-accent px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg">
            <i className="bx bx-plus text-lg" /> <span className="font-medium">تصنيف جديد</span>
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "أقسام رئيسية", value: rootCount, icon: "bx-folder", color: "from-blue-500 to-blue-600" },
            { label: "إجمالي التصنيفات", value: totalCount, icon: "bx-category", color: "from-cyan-500 to-cyan-600" },
            { label: "تصنيفات نشطة", value: activeCount, icon: "bx-check-circle", color: "from-green-500 to-green-600" },
            { label: "إجمالي المنتجات", value: totalProducts, icon: "bx-package", color: "from-orange-500 to-orange-600" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="rounded-2xl p-5 shadow-sm hover:shadow-md transition-all" style={{ background: "#fff", border: "1px solid #e8edf2" }}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center text-white`}>
                  <i className={`bx ${icon} text-lg`} />
                </div>
                <span className="text-2xl font-bold text-gray-800">{value}</span>
              </div>
              <h3 className="text-gray-500 font-medium text-sm">{label}</h3>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="rounded-2xl p-4 mb-6" style={{ background: "#fff", border: "1px solid #e8edf2" }}>
          <div className="relative">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ابحث في التصنيفات..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-[#cfd8dc] text-gray-800 focus:border-[#0071ce] focus:outline-none" />
            <i className="bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          </div>
        </div>

        {/* Tree */}
        <div className="cat-tree-container rounded-2xl shadow-sm" style={{ background: "#fff", border: "1px solid #e8edf2" }}>
          <div className="cat-tree-header">
            <span className="cat-tree-header-title"><i className="bx bx-git-branch" /> هيكل التصنيفات</span>
            <span className="cat-tree-header-info">{totalCount} تصنيف</span>
          </div>
          {loading ? (
            <div className="p-12 text-center text-gray-400"><i className="bx bx-loader-alt bx-spin text-3xl" /></div>
          ) : filteredTree.length === 0 ? (
            <div className="p-12 text-center">
              <i className="bx bx-category text-5xl text-gray-300 block mb-4" />
              <p className="text-gray-500 mb-4">لا توجد تصنيفات بعد</p>
              <button onClick={() => openAdd()} className="btn-accent px-6 py-2 rounded-xl">أضف أول تصنيف</button>
            </div>
          ) : (
            <div className="cat-tree-body">
              {[...filteredTree].sort((a, b) => a.display_order - b.display_order).map(cat => (
                <TreeNode key={cat.id} cat={cat} depth={0}
                  onEdit={openEdit} onDelete={handleDelete}
                  dragId={dragId} onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto">
          <div className="rounded-2xl w-full max-w-2xl shadow-2xl mb-12" style={{ background: "#fff", border: "1px solid #e8edf2" }}>
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4" style={{ borderBottom: "1px solid #e8edf2" }}>
              <h2 className="text-xl font-bold text-gray-800">
                {modal === "edit" ? "تعديل التصنيف" : "تصنيف جديد"}
              </h2>
              <button onClick={() => { setModal(null); setEditCat(null); }}
                className="text-2xl text-gray-400 hover:text-gray-700 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100">
                <i className="bx bx-x" />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data" className="p-6 space-y-5">
              {/* Submit Message */}
              {submitMsg && (
                <div style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  marginBottom: 16,
                  fontSize: "0.9rem",
                  background: submitMsg.ok ? "#ecfdf5" : "#fef2f2",
                  color: submitMsg.ok ? "#065f46" : "#991b1b",
                  border: `1px solid ${submitMsg.ok ? "#a7f3d0" : "#fecaca"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <i className={`bx ${submitMsg.ok ? "bx-check-circle" : "bx-error-circle"}`} style={{ fontSize: "1.2rem" }} />
                  <span>{submitMsg.text}</span>
                </div>
              )}
              {/* Basic info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">الاسم بالعربي <span className="text-red-500">*</span></label>
                  <input type="text" name="name" required defaultValue={editCat?.name} className={inputCls} placeholder="مثال: العناية بالبشرة" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">الاسم بالإنجليزي</label>
                  <input type="text" name="name_en" defaultValue={editCat?.name_en} className={inputCls} placeholder="e.g. Skin Care" dir="ltr" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">الوصف</label>
                <textarea name="description" rows={2} defaultValue={editCat?.description} className={inputCls + " resize-none"} placeholder="وصف مختصر للتصنيف..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Parent */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">التصنيف الأب</label>
                  <select name="parent_id" defaultValue={editCat?.parent_id ?? ""} className={inputCls}>
                    <option value="">— رئيسي (بدون أب) —</option>
                    {parentOptions.filter(c => c.id !== editCat?.id).map(c => (
                      <option key={c.id} value={c.id}>
                        {"— ".repeat(depthOf(c, catMap))} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Slug */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Slug</label>
                  <input type="text" name="slug" defaultValue={editCat?.slug} className={inputCls} placeholder="auto-generated" dir="ltr" />
                </div>
                {/* Icon */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">الأيقونة <span className="text-xs text-gray-400">(Boxicons)</span></label>
                  <input type="text" name="icon" defaultValue={editCat?.icon} className={inputCls} placeholder="bx-spa" dir="ltr" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">الصورة</label>
                  {/* Preview: show newly-selected image first, then existing, then nothing */}
                  {(imagePreview || editCat?.image) && (
                    <div className="mb-2 rounded-xl overflow-hidden border border-[#e8edf2]" style={{ height: 120 }}>
                      <img
                        src={imagePreview ?? `/api/flask/${editCat!.image}`}
                        alt="معاينة الصورة"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="w-full text-gray-500 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#0071ce] file:text-white hover:file:bg-[#005baa] cursor-pointer"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setImagePreview(ev.target?.result as string);
                        reader.readAsDataURL(f);
                      } else {
                        setImagePreview(null);
                      }
                    }}
                  />
                  {!imagePreview && editCat?.image && (
                    <p className="text-xs text-gray-400 mt-1">الحالية: {editCat.image.split("/").pop()}</p>
                  )}
                </div>
                {/* Display order + Active */}
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">الترتيب</label>
                    <input type="number" name="display_order" defaultValue={editCat?.display_order ?? 0} className={inputCls} />
                  </div>
                  <label className="flex items-center gap-2 pb-3 cursor-pointer select-none">
                    <input type="checkbox" name="is_active" defaultChecked={editCat?.is_active ?? true}
                      className="w-5 h-5 rounded border-gray-300 text-[#0071ce] focus:ring-[#0071ce]" />
                    <span className="text-sm font-medium text-gray-700">نشط</span>
                  </label>
                </div>
              </div>

              {/* ── Attributes ── */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="bx bx-slider-alt" /> الخصائص المرتبطة
                  <span className="text-xs text-gray-400 mr-1">(تُستخدم كفلاتر في صفحة التصنيف)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {allAttrs.map(attr => {
                    const selected = selectedAttrs.includes(attr.id);
                    return (
                      <button key={attr.id} type="button" onClick={() => toggleAttr(attr.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${selected
                          ? "bg-[#0071ce] text-white border-[#0071ce] shadow-sm"
                          : "bg-white text-gray-600 border-[#cfd8dc] hover:border-[#0071ce]"
                          }`}>
                        <i className={`bx ${attr.attr_type === "color" ? "bx-palette" : attr.attr_type === "size" ? "bx-ruler" : "bx-text"} mr-1`} />
                        {attr.name}
                        {selected && <i className="bx bx-check mr-1" />}
                      </button>
                    );
                  })}
                  {allAttrs.length === 0 && <p className="text-gray-400 text-sm">لا توجد خصائص. أضف خصائص من صفحة الخصائص أولاً.</p>}
                </div>
              </div>

              {/* ── SEO Collapsible ── */}
              <div className="rounded-xl border border-[#e8edf2] overflow-hidden">
                <button type="button" onClick={() => setSeoOpen(!seoOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-700">
                  <span><i className="bx bx-search-alt mr-1" /> إعدادات SEO</span>
                  <i className={`bx bx-chevron-${seoOpen ? "up" : "down"}`} />
                </button>
                {seoOpen && (
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Meta Title</label>
                      <input type="text" name="meta_title" defaultValue={editCat?.meta_title} className={inputCls} dir="auto" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Meta Description</label>
                      <textarea name="meta_description" rows={2} defaultValue={editCat?.meta_description} className={inputCls + " resize-none"} dir="auto" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Canonical URL</label>
                      <input type="text" name="canonical_url" defaultValue={editCat?.canonical_url} className={inputCls} dir="ltr" placeholder="https://..." />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setModal(null); setEditCat(null); }}
                  className="flex-1 py-3 px-4 rounded-xl font-medium bg-white border border-[#cfd8dc] text-gray-600 hover:bg-gray-50"
                  disabled={submitting}>
                  إلغاء
                </button>
                <button type="submit" className="flex-1 btn-accent py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2"
                  disabled={submitting}>
                  {submitting ? (
                    <>
                      <i className="bx bx-loader-alt bx-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <span>{modal === "edit" ? "حفظ التعديلات" : "إضافة التصنيف"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── INLINE STYLES ── */}
      <style>{`
        .cat-tree-container { overflow: hidden; }
        .cat-tree-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 1.5rem; border-bottom: 1px solid #e8edf2;
          background: linear-gradient(135deg, rgba(0,113,206,0.03), rgba(255,153,0,0.03));
        }
        .cat-tree-header-title { font-weight: 700; font-size: 0.95rem; color: #1a2b3c; display: flex; align-items: center; gap: 8px; }
        .cat-tree-header-info { font-size: 0.8rem; color: #7b8a9c; background: #f0f2f5; padding: 4px 12px; border-radius: 20px; }
        .cat-tree-body { padding: 0.5rem 0; }
        .tree-node {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 16px; margin: 0;
          border-bottom: 1px solid #f3f5f7;
          transition: background 0.15s;
          cursor: default;
        }
        .tree-node:hover { background: rgba(0,113,206,0.03); }
        .tree-node.dragging { opacity: 0.4; background: rgba(0,113,206,0.06); }
        .tree-expand {
          width: 28px; height: 28px; border: none; background: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #7b8a9c; font-size: 1.1rem;
          transition: transform 0.2s, color 0.15s; flex-shrink: 0;
        }
        .tree-expand:hover { color: #0071ce; }
        .tree-drag {
          color: #c0c8d0; cursor: grab; font-size: 1.2rem; flex-shrink: 0;
          display: flex; align-items: center;
        }
        .tree-drag:active { cursor: grabbing; color: #0071ce; }
        .tree-thumb {
          width: 36px; height: 36px; border-radius: 8px; object-fit: cover;
          border: 1px solid #e8edf2; flex-shrink: 0;
        }
        .tree-icon-box {
          width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #e8f4ff, #fff3e0);
          color: #0071ce; font-size: 1.1rem;
        }
        .tree-name-col { flex: 1; min-width: 0; }
        .tree-name { font-weight: 700; font-size: 0.9rem; color: #1a2b3c; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tree-name-en { font-size: 0.75rem; color: #9ba8b6; display: block; direction: ltr; text-align: right; }
        .tree-badge {
          padding: 2px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 600;
          white-space: nowrap; flex-shrink: 0;
        }
        .tree-badge.blue { background: #e8f4ff; color: #0071ce; }
        .tree-badge.orange { background: #fff3e0; color: #e67e00; }
        .tree-badge.red { background: #ffebee; color: #d32f2f; }
        .tree-level {
          font-size: 0.7rem; color: #a0aab4; background: #f5f7f9;
          padding: 2px 8px; border-radius: 4px; flex-shrink: 0;
        }
        .tree-actions { display: flex; gap: 4px; flex-shrink: 0; }
        .tree-actions button {
          width: 32px; height: 32px; border: none; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          background: transparent; color: #7b8a9c; cursor: pointer; font-size: 1rem;
          transition: all 0.15s;
        }
        .tree-actions button:hover { background: #e8f4ff; color: #0071ce; }
        .tree-actions button.danger:hover { background: #ffebee; color: #d32f2f; }
        @media (max-width: 768px) {
          .tree-badge, .tree-level { display: none; }
          .tree-name-en { display: none; }
          .tree-node { gap: 6px; padding: 8px; }
        }
      `}</style>
    </div>
  );
}
