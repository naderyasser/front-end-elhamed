"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./admin.css";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FlashMessage {
  id: number;
  category: "success" | "error" | "warning" | "info";
  message: string;
}

interface Notification {
  id: number;
  message: string;
  created_at: string;
  name: string;
  cod_amount: number;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { id: number; name: string }[];
}

// ─── Add Product Modal ─────────────────────────────────────────────────────────
function AddProductModal({ isOpen, onClose, categories }: AddProductModalProps) {
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);

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

  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch("/api/flask/admin/add_product", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) {
        setSubmitMsg({ ok: true, text: data.message || "تمت إضافة المنتج بنجاح!" });
        setTimeout(() => { onClose(); window.location.reload(); }, 800);
      } else {
        setSubmitMsg({ ok: false, text: data.message || "حدث خطأ أثناء الإضافة" });
      }
    } catch {
      setSubmitMsg({ ok: false, text: "حدث خطأ في الاتصال" });
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

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
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="admin-form-label">اسم المنتج <span className="text-danger">*</span></label>
              <input type="text" name="name" required className="admin-form-control" placeholder="أدخل اسم المنتج" />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="admin-form-label">السعر (ج.م) <span className="text-danger">*</span></label>
                <input type="number" step="0.01" name="price" required className="admin-form-control" placeholder="0.00" />
              </div>
              <div className="col-6">
                <label className="admin-form-label">الكمية <span className="text-danger">*</span></label>
                <input type="number" name="quantity" required className="admin-form-control" placeholder="0" />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="admin-form-label">التصنيف <span className="text-danger">*</span></label>
                <select name="category" required className="admin-form-control">
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
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
                <input type="file" name="image" required className="d-none" id="mainImg" accept="image/*" onChange={handleMainImage} />
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
                    {additionalPreviews.map((src, i) => (
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
              <button type="submit" className="btn-cta-alha d-flex align-items-center gap-2" disabled={submitting}>
                {submitting ? <><span className="spinner-border spinner-border-sm" /> جاري الحفظ...</> : <><i className="bx bx-save" /> حفظ المنتج</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Layout ──────────────────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [time, setTime] = useState("");
  const [flashMessages, setFlashMessages] = useState<FlashMessage[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [isBackingUp, setIsBackingUp] = useState(false);

  function addFlash(category: FlashMessage["category"], message: string) {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setFlashMessages((prev) => [...prev, { id, category, message }]);
    setTimeout(() => setFlashMessages((prev) => prev.filter((m) => m.id !== id)), 5000);
  }

  function handleExportReport() {
    if (!reportStartDate || !reportEndDate) { addFlash("warning", "يرجى اختيار تاريخي البداية والنهاية"); return; }
    window.open(`/api/flask/admin/export_income_stats?start_date=${reportStartDate}&end_date=${reportEndDate}`, "_blank", "noopener,noreferrer");
  }

  async function handleBackup() {
    setIsBackingUp(true);
    try {
      const r = await fetch("/api/flask/admin/backup_project", { method: "POST", credentials: "include" });
      addFlash(r.ok ? "success" : "error", r.ok ? "تم النسخ الاحتياطي بنجاح" : "تعذر تنفيذ النسخ الاحتياطي");
    } catch {
      addFlash("error", "فشل الاتصال بالخادم");
    } finally {
      setIsBackingUp(false);
    }
  }

  useEffect(() => {
    fetch("/api/flask/admin/api/categories").then((r) => r.json()).then(setCategories).catch(() => { });
  }, []);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("ar-EG", { hour: "numeric", minute: "numeric", second: "numeric", hour12: true }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!notifOpen) return;
    fetch("/api/flask/admin/api/latest_orders").then((r) => r.json()).then((d) => setNotifications(Array.isArray(d) ? d : [])).catch(() => { });
  }, [notifOpen]);

  function isActive(href: string) {
    if (href === "/admin/dashboard" || href === "/admin") return pathname === "/admin" || pathname === "/admin/dashboard";
    return pathname.startsWith(href);
  }

  const navLinks = [
    { href: "/admin/dashboard", icon: "bx-home-alt", label: "الرئيسية" },
    { href: "/admin/products", icon: "bx-package", label: "المنتجات" },
    { href: "/admin/categories", icon: "bx-category", label: "الأقسام" },
    { href: "/admin/attributes", icon: "bx-slider-alt", label: "الخصائص" },
    { href: "/admin/orders", icon: "bx-cart-alt", label: "الطلبات" },
    { href: "/admin/customers", icon: "bx-user", label: "العملاء" },
    { href: "/admin/vendors", icon: "bx-store-alt", label: "البائعين" },
    { href: "/admin/suppliers", icon: "bx-box", label: "الموردين" },
    { href: "/admin/reviews", icon: "bx-star", label: "المراجعات" },
    { href: "/admin/shipping", icon: "bx-truck", label: "الشحن" },
    { href: "/admin/dropshipping", icon: "bx-link-external", label: "دروب شوبينج" },
    { href: "/admin/banners", icon: "bx-image-alt", label: "البانرات" },
    { href: "/admin/flash-deals", icon: "bx-bolt-circle", label: "العروض السريعة" },
    { href: "/admin/homepage-sections", icon: "bx-layout", label: "الصفحة الرئيسية" },
    { href: "/admin/bundles", icon: "bx-box", label: "الباقات" },
    { href: "/admin/showcase", icon: "bx-collection", label: "المجموعات" },
    { href: "/admin/blog", icon: "bx-news", label: "المدونة" },
    { href: "/admin/newsletter", icon: "bx-envelope", label: "النشرة البريدية" },
    { href: "/admin/seo", icon: "bx-search-alt-2", label: "SEO" },
    { href: "/admin/roles", icon: "bx-shield-quarter", label: "الأدوار" },
    { href: "/admin/search-analytics", icon: "bx-search-alt", label: "تحليلات البحث" },
  ];

  const mobileLinks = [
    { href: "/admin/dashboard", icon: "bx-home-alt", label: "الرئيسية" },
    { href: "/admin/products", icon: "bx-package", label: "المنتجات" },
    { href: "/admin/orders", icon: "bx-cart-alt", label: "الطلبات" },
    { href: "/admin/shipping", icon: "bx-truck", label: "الشحن" },
  ];

  const flashIcons: Record<string, string> = {
    success: "bx-check-circle", error: "bx-error-circle", warning: "bx-error", info: "bx-info-circle",
  };

  return (
    <div className="admin-root">

      {/* ── Flash Messages ─────────────────────────── */}
      <div className="admin-flash">
        {flashMessages.map((msg) => (
          <div key={msg.id} className={`admin-flash-item ${msg.category}`}>
            <div className="d-flex align-items-center gap-2">
              <i className={`bx ${flashIcons[msg.category]}`} />
              <span>{msg.message}</span>
            </div>
            <button onClick={() => setFlashMessages((p) => p.filter((m) => m.id !== msg.id))}
              style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "1.1rem" }}>
              <i className="bx bx-x" />
            </button>
          </div>
        ))}
      </div>

      {/* ── Top Info Bar ───────────────────────────── */}
      <div className="admin-top-bar">
        <div className="d-flex align-items-center gap-3">
          <Link href="/shop" target="_blank"><i className="bx bx-store" /> عرض المتجر</Link>
          <span className="d-none d-md-inline" style={{ opacity: 0.4 }}>|</span>
          <Link href="/api/flask/admin/logout" className="d-none d-md-inline"><i className="bx bx-log-out" /> تسجيل الخروج</Link>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="d-none d-sm-inline">لوحة تحكم الحامد</span>
          <span className="admin-clock" suppressHydrationWarning>{time}</span>
        </div>
      </div>

      {/* ── Main Header ────────────────────────────── */}
      <header className="admin-main-header">
        <Link href="/admin/dashboard" className="admin-brand">
          <img src="/static/images/logo-alha.jpeg" alt="الحامد" />
          <div>
            <div className="admin-brand-title">الحامد — لوحة التحكم</div>
            <div className="admin-brand-sub">إدارة المتجر الإلكتروني</div>
          </div>
        </Link>

        <div className="admin-header-actions">
          {/* Notifications */}
          <div className="position-relative">
            <button className="admin-header-btn" onClick={() => setNotifOpen((v) => !v)} title="الإشعارات">
              <i className="bx bx-bell" style={{ fontSize: "1.2rem" }} />
              <span className="notif-badge">{notifications.length || "0"}</span>
            </button>
            {notifOpen && (
              <div className="notif-dropdown">
                <div className="notif-dropdown-header"><i className="bx bx-bell" /> آخر الطلبات</div>
                <div style={{ maxHeight: 280, overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center" style={{ color: "var(--alha-text-muted)" }}>
                      <i className="bx bx-inbox" style={{ fontSize: 28 }} /><br /><span style={{ fontSize: "0.8rem" }}>لا توجد إشعارات</span>
                    </div>
                  ) : notifications.map((n) => (
                    <div key={n.id} className="notif-item">
                      <div className="notif-name">{n.name}</div>
                      <div className="notif-msg">{n.message}</div>
                      <div className="notif-time">{n.created_at}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "0.75rem", borderTop: "1px solid var(--alha-border)" }}>
                  <Link href="/admin/orders" className="btn-primary-alha d-block text-center text-decoration-none"
                    style={{ padding: "0.45rem" }} onClick={() => setNotifOpen(false)}>
                    عرض جميع الطلبات
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Add Product */}
          <button className="admin-add-btn d-none d-md-flex" onClick={() => setProductModalOpen(true)}>
            <i className="bx bx-plus" /> إضافة منتج
          </button>
        </div>
      </header>

      {/* ── Sub Navigation Bar ─────────────────────── */}
      <nav className="admin-sub-nav">
        <div className="admin-sub-nav-inner">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={`admin-nav-link ${isActive(link.href) ? "active" : ""}`}>
              <i className={`bx ${link.icon}`} />{link.label}
            </Link>
          ))}

          {/* Inline report export in nav */}
          <div className="d-none d-xl-flex align-items-center gap-1 ms-auto px-3" style={{ borderRight: "1px solid rgba(255,255,255,0.15)", marginRight: "auto" }}>
            <input type="date" value={reportStartDate} onChange={(e) => setReportStartDate(e.target.value)}
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "3px 8px", color: "#fff", fontSize: "0.75rem" }} />
            <input type="date" value={reportEndDate} onChange={(e) => setReportEndDate(e.target.value)}
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "3px 8px", color: "#fff", fontSize: "0.75rem" }} />
            <button onClick={handleExportReport}
              style={{ background: "var(--alha-cta,#ff9900)", color: "#1a2b3c", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "Cairo, sans-serif" }}>
              <i className="bx bx-download" /> تصدير
            </button>
            <button onClick={handleBackup} disabled={isBackingUp}
              style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "4px 10px", fontSize: "0.75rem", cursor: "pointer", fontFamily: "Cairo, sans-serif" }}>
              <i className={`bx ${isBackingUp ? "bx-loader-alt" : "bx-data"}`} style={isBackingUp ? { animation: "spin 1s linear infinite" } : {}} />
              {isBackingUp ? " جاري..." : " نسخ احتياطي"}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Page Content ───────────────────────────── */}
      <main id="main-content" className="admin-body">{children}</main>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="admin-footer">
        الحامد — لوحة التحكم &copy; 2026 |{" "}
        <a href="/shop" target="_blank">عرض المتجر</a>
      </footer>

      {/* ── Mobile Bottom Nav ──────────────────────── */}
      <nav className="admin-mobile-nav">
        {mobileLinks.map((link) => (
          <Link key={link.href} href={link.href} className={`admin-mobile-nav-link ${isActive(link.href) ? "active" : ""}`}>
            <i className={`bx ${link.icon}`} style={{ fontSize: "1.3rem" }} />
            {link.label}
          </Link>
        ))}
        <button className="admin-mobile-nav-link cta" onClick={() => setProductModalOpen(true)}>
          <i className="bx bx-plus" style={{ fontSize: "1.3rem" }} />
        </button>
      </nav>

      {/* ── Add Product Modal ──────────────────────── */}
      <AddProductModal isOpen={productModalOpen} onClose={() => setProductModalOpen(false)} categories={categories} />
    </div>
  );
}
