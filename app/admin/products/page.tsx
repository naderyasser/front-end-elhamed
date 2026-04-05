"use client";

// Suggested path: app/admin/products/page.tsx
// Converted from: templates/admin/products.html

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Product {
  id: number; name: string; image: string; price: number; discount: number;
  stock: number; views: number; category_id: number;
  category: { id: number; name: string };
  created_at: string;
}

interface Category { id: number; name: string }

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    fetch("/api/flask/admin/api/products")
      .then((r) => r.json())
      .then((d) => { setProducts(d?.products ?? []); setCategories(d?.categories ?? []); })
      .catch(() => { });
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (categoryFilter) list = list.filter((p) => String(p.category_id) === categoryFilter);
    if (stockFilter === "available") list = list.filter((p) => p.stock > 0);
    else if (stockFilter === "low") list = list.filter((p) => p.stock > 0 && p.stock <= 10);
    else if (stockFilter === "out") list = list.filter((p) => p.stock === 0);
    list.sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "stock") return a.stock - b.stock;
      if (sortBy === "created") return a.created_at > b.created_at ? -1 : 1;
      return a.name.localeCompare(b.name, "ar");
    });
    return list;
  }, [products, search, categoryFilter, stockFilter, sortBy]);

  async function handleDelete(id: number, name: string) {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return;
    await fetch(`/api/flask/admin/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  const stockBadge = (stock: number) => {
    if (stock === 0) return <div className="absolute top-3 right-3 bg-red-500 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">نفد المخزون</div>;
    if (stock <= 10) return <div className="absolute top-3 right-3 bg-orange-500 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">مخزون منخفض</div>;
    return <div className="absolute top-3 right-3 bg-green-500 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">متوفر</div>;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="backdrop-blur-sm sticky top-0 z-10 shadow-sm" style={{ background: "rgba(255,255,255,0.97)", borderBottom: "1px solid #222" }}>
        <div className="px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0071ce] to-[#004c91] rounded-xl flex items-center justify-center text-gray-800 shadow-lg">
                <i className="bx bx-package text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">إدارة المنتجات</h1>
                <p className="text-gray-500 text-sm">إدارة وتنظيم جميع منتجات المتجر</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/products/missing-images" className="px-6 py-3 rounded-xl flex items-center gap-2 hover:opacity-80 transition-all" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                <i className="bx bx-image-alt text-lg" /> <span className="font-medium">منتجات بدون صور</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "إجمالي المنتجات", value: products.length, icon: "bx-package", color: "from-blue-500 to-blue-600" },
            { label: "منتجات متوفرة", value: products.filter((p) => p.stock > 0).length, icon: "bx-check-circle", color: "from-green-500 to-green-600" },
            { label: "مخزون منخفض", value: products.filter((p) => p.stock > 0 && p.stock <= 10).length, icon: "bx-error", color: "from-orange-500 to-orange-600" },
            { label: "نفد المخزون", value: products.filter((p) => p.stock === 0).length, icon: "bx-x-circle", color: "from-red-500 to-red-600" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-gray-800`}>
                  <i className={`bx ${icon} text-xl`} />
                </div>
                <span className="text-3xl font-bold text-gray-800">{value}</span>
              </div>
              <h3 className="text-gray-500 font-medium">{label}</h3>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="rounded-2xl shadow-lg p-6 mb-8" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-500 mb-2">البحث في المنتجات</label>
              <div className="relative">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالاسم، الفئة، أو SKU..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-[#cfd8dc] text-gray-800 focus:border-[#0071ce] focus:outline-none" />
                <i className="bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
              </div>
            </div>
            <div className="lg:w-48">
              <label className="block text-sm font-medium text-gray-500 mb-2">الفئة</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#cfd8dc] text-gray-800 focus:border-[#0071ce] focus:outline-none">
                <option value="">جميع الفئات</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="lg:w-48">
              <label className="block text-sm font-medium text-gray-500 mb-2">المخزون</label>
              <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#cfd8dc] text-gray-800 focus:border-[#0071ce] focus:outline-none">
                <option value="">الكل</option>
                <option value="available">متوفر</option>
                <option value="low">مخزون منخفض</option>
                <option value="out">نفد المخزون</option>
              </select>
            </div>
            <div className="lg:w-48">
              <label className="block text-sm font-medium text-gray-500 mb-2">ترتيب</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#cfd8dc] text-gray-800 focus:border-[#0071ce] focus:outline-none">
                <option value="name">الاسم</option>
                <option value="price">السعر</option>
                <option value="stock">الكمية</option>
                <option value="created">تاريخ الإضافة</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(211,47,47,0.1)" }}>
              <i className="bx bx-package text-4xl text-[#0071ce]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-500 mb-6">لم يتم العثور على منتجات تطابق معايير البحث</p>
            <button onClick={() => { setSearch(""); setCategoryFilter(""); setStockFilter(""); }} className="btn-accent px-6 py-3 rounded-xl font-medium">
              مسح الفلاتر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <div key={product.id} className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
                {/* Image */}
                <div className="relative overflow-hidden h-48" style={{ background: "rgba(211,47,47,0.04)" }}>
                  <img src={`/api/flask/${product.image}`} alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }} />
                  {stockBadge(product.stock)}
                  {product.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-green-500 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                      خصم {product.discount}%
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <Link href={`/admin/products/${product.id}/edit`} className="bg-white/90 hover:bg-white text-gray-700 w-10 h-10 rounded-full flex items-center justify-center">
                      <i className="bx bx-edit text-lg" />
                    </Link>
                    <button onClick={() => handleDelete(product.id, product.name)} className="bg-white/90 hover:bg-white text-red-500 w-10 h-10 rounded-full flex items-center justify-center">
                      <i className="bx bx-trash text-lg" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: "rgba(211,47,47,0.1)", color: "#0071ce" }}>
                      {product.category?.name}
                    </span>
                    <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelect(product.id)} className="rounded" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    {product.discount > 0 ? (
                      <>
                        <span className="text-lg font-bold text-green-400">{(product.price * (1 - product.discount / 100)).toFixed(2)} ج.م</span>
                        <span className="text-sm text-gray-500 line-through">{product.price.toFixed(2)} ج.م</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-800">{product.price.toFixed(2)} ج.م</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><i className="bx bx-package text-sm" />{product.stock} قطعة</span>
                    <span className="flex items-center gap-1"><i className="bx bx-show text-sm" />{product.views} مشاهدة</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/products/${product.id}/edit`} className="flex-1 py-2 px-3 rounded-xl font-medium flex items-center justify-center gap-1 transition-all duration-200" style={{ background: "rgba(211,47,47,0.1)", color: "#0071ce" }}>
                      <i className="bx bx-edit text-sm" /> <span>تعديل</span>
                    </Link>
                    <Link href={`/admin/products/${product.id}/variants`} className="py-2 px-3 rounded-xl font-medium flex items-center justify-center transition-all duration-200" style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}>
                      <i className="bx bx-copy text-sm" />
                    </Link>
                    <button onClick={() => handleDelete(product.id, product.name)} className="py-2 px-3 rounded-xl font-medium flex items-center justify-center transition-all duration-200" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
                      <i className="bx bx-trash text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
