"use client";

// Suggested path: app/admin/products/[id]/edit/page.tsx
// Converted from: templates/admin/edit_product_page.html

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Product {
  id: number; name: string; price: number; discount: number; stock: number;
  description: string; category_id: number; image: string;
}
interface Category { id: number; name: string }
interface SeoData {
  seo_meta_title: string; seo_meta_description: string; seo_brand: string;
  seo_image_alt: string; seo_gtin: string; seo_mpn: string;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [seoData, setSeoData] = useState<SeoData>({ seo_meta_title: "", seo_meta_description: "", seo_brand: "", seo_image_alt: "", seo_gtin: "", seo_mpn: "" });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/flask/admin/api/products/${productId}`)
      .then((r) => r.json())
      .then((d) => { setProduct(d.product); setCategories(d.categories ?? d.flat ?? []); setSeoData(d.seo_data ?? {}); })
      .catch(() => { });
  }, [productId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    await fetch(`/api/flask/admin/products/${productId}/edit`, { method: "POST", body: fd });
    setSaving(false);
    router.push("/admin/products");
  }

  if (!product) return <div className="flex items-center justify-center h-64 text-gray-500"><i className="bx bx-loader-alt animate-spin text-3xl ml-2" />جاري التحميل...</div>;

  const inputCls = "w-full px-4 py-3 rounded-xl text-gray-800 outline-none transition-all duration-200 bg-white border border-[#cfd8dc] focus:border-[#0071ce]";

  return (
    <div className="min-h-screen px-6 py-6" style={{ background: "#000" }}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/admin/dashboard" className="hover:text-white transition-colors">لوحة التحكم</Link>
        <i className="bx bx-chevron-left" />
        <Link href="/admin/products" className="hover:text-white transition-colors">المنتجات</Link>
        <i className="bx bx-chevron-left" />
        <span className="text-gray-200">تعديل: {product.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg" style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
            <i className="bx bx-edit" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">تعديل المنتج</h1>
            <p className="text-gray-400 text-sm mt-0.5">{product.name}</p>
          </div>
        </div>
        <Link href="/admin/products" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 bg-white border border-[#cfd8dc] text-gray-700 hover:border-[#0071ce]">
          <i className="bx bx-arrow-back" /> رجوع للمنتجات
        </Link>
      </div>

      {/* Form */}
      <div className="rounded-2xl shadow-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #cfd8dc" }}>
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">اسم المنتج <span className="text-red-500">*</span></label>
                <input type="text" name="name" defaultValue={product.name} required className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">التصنيف <span className="text-red-500">*</span></label>
                {/* key=category_id forces re-render once async data loads so defaultValue takes effect */}
                <select
                  key={product.category_id}
                  name="category_id"
                  required
                  defaultValue={String(product.category_id)}
                  className={inputCls}
                >
                  <option value="">اختر التصنيف</option>
                  {(Array.isArray(categories) ? categories : []).map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">السعر قبل الخصم <span className="text-red-500">*</span></label>
                  <input type="number" step="0.01" name="price" defaultValue={product.price} required className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">الخصم (%)</label>
                  <input type="number" name="discount" defaultValue={product.discount} min="0" max="100" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">الكمية في المخزون <span className="text-red-500">*</span></label>
                <input type="number" name="quantity" defaultValue={product.stock} required min="0" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">وصف المنتج</label>
                <textarea name="description" rows={5} defaultValue={product.description} className={inputCls + " resize-none"} />
              </div>

              {/* SEO */}
              <div className="rounded-2xl p-5 space-y-4" style={{ background: "#101622", border: "1px solid #243041" }}>
                <h3 className="text-base font-semibold flex items-center gap-2 text-gray-200">
                  <i className="bx bx-line-chart text-blue-400" /> إعدادات SEO للمنتج
                </h3>
                {[
                  { name: "seo_meta_title", label: "SEO Title", value: seoData.seo_meta_title },
                  { name: "seo_brand", label: "العلامة التجارية", value: seoData.seo_brand },
                  { name: "seo_image_alt", label: "Alt Text للصورة", value: seoData.seo_image_alt },
                  { name: "seo_gtin", label: "GTIN / Barcode", value: seoData.seo_gtin },
                  { name: "seo_mpn", label: "MPN", value: seoData.seo_mpn },
                ].map(({ name, label, value }) => (
                  <div key={name}>
                    <label className="block text-sm font-semibold mb-2 text-gray-500">{label}</label>
                    <input type="text" name={name} defaultValue={value} className="w-full px-4 py-3 rounded-xl text-gray-800 outline-none transition-all duration-200 bg-white border border-[#cfd8dc] focus:border-blue-400" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-500">SEO Description</label>
                  <textarea name="seo_meta_description" rows={3} defaultValue={seoData.seo_meta_description} className="w-full px-4 py-3 rounded-xl text-gray-800 resize-none outline-none bg-white border border-[#cfd8dc] focus:border-blue-400" />
                </div>
              </div>
            </div>

            {/* Right Column — Images */}
            <div className="space-y-6">
              {/* Current Image */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-700">الصورة الحالية</label>
                <div className="rounded-2xl overflow-hidden" style={{ background: "#f8f9fa", border: "1px solid #cfd8dc" }}>
                  <img src={imagePreview ?? `/api/flask/${product.image}`} alt={product.name} className="w-full h-64 object-contain p-4" />
                </div>
              </div>

              {/* Upload New */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-700">تغيير الصورة الرئيسية</label>
                <div className="border-2 border-dashed rounded-2xl p-6 text-center transition-colors hover:border-[#0071ce]" style={{ borderColor: "#333" }}>
                  <input type="file" name="image" accept="image/*" id="imageInput" className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) { const r = new FileReader(); r.onload = (ev) => setImagePreview(ev.target?.result as string); r.readAsDataURL(f); }
                    }} />
                  <label htmlFor="imageInput" className="cursor-pointer">
                    <i className="bx bx-cloud-upload text-4xl text-gray-500 mb-3 block" />
                    <p className="text-gray-500 mb-2">اسحب الصورة هنا أو انقر للاختيار</p>
                    <p className="text-xs text-gray-600">PNG, JPG, WebP — حتى 10MB</p>
                  </label>
                </div>
              </div>

              {/* Variants Link */}
              <div className="rounded-2xl p-5" style={{ background: "#f8f9fa", border: "1px solid #cfd8dc" }}>
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <i className="bx bx-git-branch text-[#0071ce]" /> إدارة المتغيرات
                </h3>
                <Link href={`/admin/products/${product.id}/variants`} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-200 font-medium" style={{ background: "rgba(211,47,47,0.1)", color: "#0071ce", border: "1px solid rgba(211,47,47,0.2)" }}>
                  <i className="bx bx-list-ul" /> عرض وإدارة المتغيرات
                </Link>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4 mt-10 pt-6" style={{ borderTop: "1px solid #222" }}>
            <Link href="/admin/products" className="px-8 py-3 rounded-xl font-semibold transition-all duration-200 bg-white border border-[#cfd8dc] text-gray-700 hover:border-[#0071ce]">
              إلغاء
            </Link>
            <button type="submit" disabled={saving} className="btn-accent px-8 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-60">
              <i className={saving ? "bx bx-loader-alt animate-spin" : "bx bx-save"} />
              {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}