"use client";

import { useState, useEffect, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authenticatedGet, authenticatedPost, logout, getCsrfToken, clearCsrfToken } from "@/lib/admin-auth";
import dynamic from "next/dynamic";
import "./admin.css";

// ─── Dynamic Import of AddProductModal with ssr: false ─────────────────────────
const AddProductModal = dynamic(() => import("@/components/admin/AddProductModal"), {
  ssr: false,
  loading: () => null,
});

// ─── Isolated Clock Component (prevents full layout re-render) ─────────────────
const AdminClock = memo(function AdminClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("ar-EG", { hour: "numeric", minute: "numeric", second: "numeric", hour12: true }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="admin-clock" suppressHydrationWarning>{time}</span>;
});

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

// ─── Admin Layout ──────────────────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [flashMessages, setFlashMessages] = useState<FlashMessage[]>([]);
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [mounted, setMounted] = useState(false);

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
      const r = await authenticatedPost("/api/flask/admin/backup_project", {});
      addFlash(r.ok ? "success" : "error", r.ok ? "تم النسخ الاحتياطي بنجاح" : "تعذر تنفيذ النسخ الاحتياطي");
    } catch {
      addFlash("error", "فشل الاتصال بالخادم");
    } finally {
      setIsBackingUp(false);
    }
  }

  // Set mounted state on client-side only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for custom event to open Add Product modal from child pages
  useEffect(() => {
    const handleOpenAddProductModal = () => {
      setProductModalOpen(true);
    };

    window.addEventListener('open-add-product-modal', handleOpenAddProductModal);

    return () => {
      window.removeEventListener('open-add-product-modal', handleOpenAddProductModal);
    };
  }, []);

  // ─── Global fetch interceptor: auto-add credentials + CSRF token for admin API ──
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async function patchedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);
      if (url.includes('/api/flask/admin/')) {
        init = { ...init, credentials: 'include' };
        const method = (init.method || 'GET').toUpperCase();
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
          const csrfToken = await getCsrfToken();
          if (csrfToken) {
            const headers = new Headers(init.headers);
            if (!headers.has('X-CSRF-Token')) {
              headers.set('X-CSRF-Token', csrfToken);
            }
            init.headers = headers;
          }
        }
      }
      return originalFetch.call(window, input, init);
    };
    return () => { window.fetch = originalFetch; };
  }, []);

  // Authentication check - verify session with server, not just localStorage
  useEffect(() => {
    if (!mounted) return;

    const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';

    if (!isLoggedIn && pathname !== '/admin/login') {
      window.location.href = '/admin/login';
      return;
    }

    // Verify with server that the session cookie is still valid
    if (isLoggedIn && pathname !== '/admin/login') {
      authenticatedGet('/api/flask/admin/api/latest_orders')
        .then(r => {
          if (r.status === 401) {
            localStorage.removeItem('admin_logged_in');
            window.location.href = '/admin/login';
          }
        })
        .catch(() => { });
    }
  }, [mounted, pathname]);

  // Helper function to extract a cookie value by name
  function getCookieValue(cookies: string, name: string): string | null {
    const value = `; ${cookies}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  useEffect(() => {
    if (!notifOpen) return;
    authenticatedGet("/api/flask/admin/api/latest_orders").then((r) => r.json()).then((d) => setNotifications(Array.isArray(d) ? d : [])).catch(() => { });
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
    { href: "/admin/homepage-cms/why-shop", icon: "bx-badge-check", label: "مزايا التسوق" },
    { href: "/admin/homepage-cms/trust-badges", icon: "bx-shield-quarter", label: "شارات الدفع" },
    { href: "/admin/homepage-cms/promo-banners", icon: "bx-image", label: "بانرات ترويجية" },
    { href: "/admin/homepage-cms/newsletter", icon: "bx-mail-send", label: "النشرة (إعدادات)" },
    { href: "/admin/bundles", icon: "bx-box", label: "الباقات" },
    { href: "/admin/showcase", icon: "bx-collection", label: "المجموعات" },
    {
      href: "/admin/blog", icon: "bx-news", label: "المدونة"

    },
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
        {(Array.isArray(flashMessages) ? flashMessages : []).map((msg) => (
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
          <button onClick={logout} className="d-none d-md-inline" style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}><i className="bx bx-log-out" /> تسجيل الخروج</button>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="d-none d-sm-inline">لوحة تحكم الحمد</span>
          <AdminClock />
        </div>
      </div>

      {/* ── Main Header ────────────────────────────── */}
      <header className="admin-main-header">
        <Link href="/admin/dashboard" className="admin-brand">
          <img src="/static/images/logo-alha.jpeg" alt="الحمد" />
          <div>
            <div className="admin-brand-title">الحمد — لوحة التحكم</div>
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
                  ) : (Array.isArray(notifications) ? notifications : []).map((n) => (
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
          {(Array.isArray(navLinks) ? navLinks : []).map((link) => (
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
        الحمد — لوحة التحكم &copy; 2026 |{" "}
        <a href="/shop" target="_blank">عرض المتجر</a>
      </footer>

      {/* ── Mobile Bottom Nav ──────────────────────── */}
      <nav className="admin-mobile-nav">
        {(Array.isArray(mobileLinks) ? mobileLinks : []).map((link) => (
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
      {/* Modal is dynamically imported with ssr: false, preventing hydration mismatch */}
      <AddProductModal isOpen={productModalOpen} onClose={() => setProductModalOpen(false)} />
    </div>
  );
}
