"use client";

import { useState, useEffect } from "react";
import { authenticatedGet } from "@/lib/admin-auth";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Add Product Modal ─────────────────────────────────────────────────────────
export default function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  // ALL hooks must be called before any early returns (React Rules of Hooks)
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [categories, setCategories] = useState<Array<{ id?: number | string; _id?: number | string; name?: string; title?: string }>>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoadingCategories(true);
      authenticatedGet("/api/flask/admin/api/categories")
        .then((r) => r.json())
        .then((data) => {
          // API returns object with 'tree', 'flat', and 'attributes' arrays
          const cats = data?.flat || data?.tree || [];
          setCategories(cats);
        })
        .catch(() => setCategories([]))
        .finally(() => setIsLoadingCategories(false));
    }
  }, [isOpen]);
  
  // categories state is always an array (initialized as [] and set from data?.flat || data?.tree || [])
  const categoryArray = categories;
  
  // Early return if modal is closed (after all hooks are called)
  if (!isOpen) return null;

  function handleMainImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setMainImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleAdditionalImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const readers = files.map(
      (file) =>
        new Promise<string>((resolve) => {
          const r = new FileReader();
          r.onload = (ev) => resolve(ev.target?.result as string);
          r.readAsDataURL(file);
        })
    );
    Promise.all(readers).then(setAdditionalPreviews);
  }

  async function handleSubmit(e?: React.FormEvent | React.MouseEvent) {
    if (e && e.preventDefault) e.preventDefault();
    console.log("CRITICAL: handleSubmit triggered!");
    
    try {
      // Check if admin is logged in using session cookie auth
      const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('admin_logged_in') === 'true';
      if (!isLoggedIn) {
        console.error("Admin not logged in");
        alert('يرجى تسجيل الدخول أولاً');
        window.location.href = '/admin/login';
        return;
      }
      
      setSubmitting(true);
      setSubmitMsg(null);
      
      const formElement = document.getElementById('add-product-form') as HTMLFormElement;
      const formData = new FormData(formElement);
      const res = await fetch("/api/flask/admin/add_product", {
        method: "POST",
        body: formData,
        credentials: 'include', // CRITICAL: Send HTTP-only session cookies
      });
      const data = await res.json().catch(() => ({}));
      
      console.log("[AddProduct] Response status:", res.status);
      console.log("[AddProduct] Response data:", data);
      
      if (res.ok && data.success !== false) {
        const successMsg = data.message || "تمت إضافة المنتج بنجاح!";
        setSubmitMsg({ ok: true, text: successMsg });
        alert(successMsg); // Visible alert for success
        setTimeout(() => { onClose(); window.location.reload(); }, 800);
      } else {
        const errorMsg = data.message || "حدث خطأ أثناء الإضافة";
        setSubmitMsg({ ok: false, text: errorMsg });
        alert("حدث خطأ: " + errorMsg); // Visible alert for error
        if (res.status === 401) {
          setTimeout(() => window.location.href = '/admin/login', 1500);
        }
      }
    } catch (error) {
      console.error("CRITICAL: Error inside handleSubmit before fetch:", error);
      const errorMsg = error instanceof Error ? error.message : "حدث خطأ في الاتصال";
      setSubmitMsg({ ok: false, text: errorMsg });
      alert("حدث خطأ أثناء تجهيز البيانات: " + errorMsg); // Visible alert for connection error
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-modal">
        <div className="admin-modal-header">
          <h2><i className="bx bx-package" /> إضافة منتج جديد</h2>
          <button className="admin-modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="admin-modal-body">
          {submitMsg && (
            <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontSize: "0.9rem", background: submitMsg.ok ? "#ecfdf5" : "#fef2f2", color: submitMsg.ok ? "#065f46" : "#991b1b", border: `1px solid ${submitMsg.ok ? "#a7f3d0" : "#fecaca"}` }}>
              <i className={`bx ${submitMsg.ok ? "bx-check-circle" : "bx-error-circle"}`} /> {submitMsg.text}
            </div>
          )}
          <form id="add-product-form" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="admin-form-label">اسم المنتج <span className="text-danger">*</span></label>
              <input type="text" name="name" className="admin-form-control" placeholder="أدخل اسم المنتج" />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="admin-form-label">السعر (ج.م) <span className="text-danger">*</span></label>
                <input type="number" step="0.01" name="price" className="admin-form-control" placeholder="0.00" />
              </div>
              <div className="col-6">
                <label className="admin-form-label">الكمية <span className="text-danger">*</span></label>
                <input type="number" name="quantity" className="admin-form-control" placeholder="0" />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="admin-form-label">التصنيف <span className="text-danger">*</span></label>
                <select name="category" className="admin-form-control">
                  <option value="">اختر التصنيف</option>
                  {categoryArray.length > 0 ? (
                    categoryArray.map((cat) => (
                      <option key={cat.id || cat._id || Math.random()} value={cat.id || cat._id}>
                        {cat.name || cat.title || 'تصنيف بدون اسم'}
                      </option>
                    ))
                  ) : (
                    <option disabled>...Loading</option>
                  )}
                </select>
              </div>
              <div className="col-6">
                <label className="admin-form-label">نسبة الخصم (%)</label>
                <input type="number" name="discount" min="0" max="100" className="admin-form-control" placeholder="0" />
              </div>
            </div>

            {/* Main Image */}
            <div className="mb-3">
              <label className="admin-form-label">الصورة الرئيسية <span className="text-danger">*</span></label>
              <div className="admin-dropzone">
                <input type="file" name="image" className="d-none" id="mainImg" accept="image/*" onChange={handleMainImage} />
                <label htmlFor="mainImg" className="d-flex flex-column align-items-center gap-1 cursor-pointer" style={{ cursor: "pointer" }}>
                  <i className="bx bx-cloud-upload" style={{ fontSize: 28, color: "var(--alha-primary, #0071ce)" }} />
                  <span style={{ fontSize: "0.85rem", color: "var(--alha-text-secondary)" }}>انقر لرفع الصورة</span>
                </label>
                {mainImagePreview && <img src={mainImagePreview} alt="preview" className="mt-2 rounded" style={{ maxHeight: 100, maxWidth: "100%" }} />}
              </div>
            </div>

            {/* Additional Images */}
            <div className="mb-3">
              <label className="admin-form-label">صور إضافية</label>
              <div className="admin-dropzone">
                <input type="file" name="additional_images" multiple className="d-none" id="addImgs" accept="image/*" onChange={handleAdditionalImages} />
                <label htmlFor="addImgs" className="d-flex flex-column align-items-center gap-1" style={{ cursor: "pointer" }}>
                  <i className="bx bx-images" style={{ fontSize: 28, color: "var(--alha-primary, #0071ce)" }} />
                  <span style={{ fontSize: "0.85rem", color: "var(--alha-text-secondary)" }}>انقر لرفع أكثر من صورة</span>
                </label>
                {additionalPreviews.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mt-2 justify-content-center">
                    {(Array.isArray(additionalPreviews) ? additionalPreviews : []).map((src, i) => (
                      <img key={i} src={src} alt="preview" className="rounded" style={{ width: 72, height: 72, objectFit: "cover" }} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="admin-form-label">وصف المنتج</label>
              <textarea name="description" rows={3} className="admin-form-control" placeholder="أدخل وصف المنتج..." />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button type="button" onClick={onClose} className="btn-outline-alha">إلغاء</button>
              <button type="button" onClick={handleSubmit} className="btn-cta-alha d-flex align-items-center gap-2" disabled={submitting}>
                {submitting ? <><span className="spinner-border spinner-border-sm" /> جاري الحفظ...</> : <><i className="bx bx-save" /> حفظ المنتج</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
