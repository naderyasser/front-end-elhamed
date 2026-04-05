"use client";

// Suggested path: app/admin/products/missing-images/page.tsx
// Converted from: templates/admin/products_missing_images.html

import { useState, useEffect } from "react";
import Link from "next/link";

interface Product {
  id: number; name: string; price: number; stock: number; image: string;
  category?: { name: string };
}

export default function AdminProductsMissingImagesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/flask/admin/api/products/missing-images")
      .then((r) => r.json())
      .then((d) => { setProducts(d?.products ?? []); setTotal(d?.total ?? 0); })
      .catch(() => { });
  }, []);

  const stockBadge = (stock: number) => {
    if (stock === 0) return <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">نفد المخزون</span>;
    if (stock < 5) return <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">{stock} قطعة</span>;
    return <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">{stock} قطعة</span>;
  };

  return (
    <div className="min-h-screen">
      <div className="backdrop-blur-sm sticky top-0 z-10 shadow-sm" style={{ background: "rgba(255,255,255,0.97)", borderBottom: "1px solid #222" }}>
        <div className="px-6 py-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-gray-800 shadow-lg"><i className="bx bx-image-alt text-2xl" /></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">منتجات بدون صور</h1>
              <p className="text-gray-500 text-sm">
                <span className="text-red-400 font-bold">{products.length}</span> منتج بدون صورة من أصل <span className="font-bold text-gray-800">{total}</span> منتج
              </p>
            </div>
          </div>
          <Link href="/admin/products" className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300" style={{ background: "#f8f9fa", border: "1px solid #cfd8dc", color: "#4a5568" }}>
            <i className="bx bx-arrow-back text-lg" /> <span className="font-medium">كل المنتجات</span>
          </Link>
        </div>
      </div>

      <div className="px-6 py-6">
        {products.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(34,197,94,0.1)" }}>
              <i className="bx bx-check-circle text-green-500 text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">ممتاز! كل المنتجات لديها صور</h3>
            <p className="text-gray-500 mb-6">جميع المنتجات ({total}) لديها صور معيّنة بشكل صحيح.</p>
            <Link href="/admin/products" className="btn-accent px-6 py-3 rounded-xl inline-flex items-center gap-2">
              <i className="bx bx-arrow-back" /> العودة لكل المنتجات
            </Link>
          </div>
        ) : (
          <>
            <div className="rounded-2xl p-4 mb-6 flex items-center gap-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}>
              <i className="bx bx-error-circle text-red-500 text-2xl" />
              <div>
                <p className="font-semibold text-red-400">تحذير: منتجات تحتاج إلى صور</p>
                <p className="text-red-500 text-sm">هذه المنتجات تظهر في المتجر بدون صورة مما يؤثر على المبيعات. يُنصح بإضافة صور لها فوراً.</p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ background: "#f8f9fa" }}>
                    <tr className="text-sm text-gray-500">
                      <th className="text-right px-6 py-4 font-bold">#</th>
                      <th className="text-right px-6 py-4 font-bold">المنتج</th>
                      <th className="text-right px-6 py-4 font-bold">الفئة</th>
                      <th className="text-right px-6 py-4 font-bold">السعر</th>
                      <th className="text-right px-6 py-4 font-bold">المخزون</th>
                      <th className="text-right px-6 py-4 font-bold">مسار الصورة</th>
                      <th className="text-right px-6 py-4 font-bold">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-white transition-colors" style={{ borderBottom: "1px solid #1a1a1a" }}>
                        <td className="px-6 py-4 text-gray-500 text-sm">{product.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.1)" }}>
                              <i className="bx bx-image text-red-400 text-xl" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{product.name}</p>
                              <p className="text-xs text-gray-500">ID: {product.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-sm" style={{ background: "#e2e8f0", color: "#4a5568" }}>
                            {product.category?.name ?? "بدون فئة"}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-800">{product.price} ج.م</td>
                        <td className="px-6 py-4">{stockBadge(product.stock)}</td>
                        <td className="px-6 py-4">
                          <code className="text-xs rounded px-2 py-1" style={{ background: "#f8f9fa", color: "#f87171" }}>{product.image || "فارغ"}</code>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/admin/products/${product.id}/edit`} className="bg-blue-600 hover:bg-blue-700 text-gray-800 px-4 py-2 rounded-lg text-sm inline-flex items-center gap-1 transition-colors">
                            <i className="bx bx-edit" /> تعديل وإضافة صورة
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 text-center text-sm text-gray-500" style={{ borderTop: "1px solid #222" }}>
                يُعرض {products.length} منتج بحاجة لصورة من أصل {total} منتج كلي
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
