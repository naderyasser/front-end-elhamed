"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import "../admin/admin.css";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navLinks = [
        { href: "/vendor/dashboard", icon: "bx-home-alt", label: "لوحة التحكم" },
        { href: "/vendor/products", icon: "bx-package", label: "المنتجات" },
        { href: "/vendor/orders", icon: "bx-cart-alt", label: "الطلبات" },
        { href: "/vendor/earnings", icon: "bx-wallet", label: "الأرباح" },
        { href: "/vendor/messages", icon: "bx-message-square-dots", label: "الرسائل" },
        { href: "/vendor/profile", icon: "bx-user-circle", label: "الملف الشخصي" },
    ];

    function isActive(href: string) {
        if (href === "/vendor/dashboard") return pathname === "/vendor" || pathname === "/vendor/dashboard";
        return pathname.startsWith(href);
    }

    return (
        <div className="admin-root" dir="rtl">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-logo-area">
                    <Link href="/vendor/dashboard" className="text-decoration-none d-flex align-items-center gap-2">
                        <i className="bx bx-store" style={{ fontSize: 28, color: "var(--alha-cta, #FF9900)" }} />
                        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff" }}>بوابة البائع</span>
                    </Link>
                </div>
                <nav className="admin-nav">
                    {navLinks.map(l => (
                        <Link key={l.href} href={l.href}
                            className={`admin-nav-link ${isActive(l.href) ? "active" : ""}`}>
                            <i className={`bx ${l.icon}`} />
                            <span>{l.label}</span>
                        </Link>
                    ))}
                </nav>
                <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: "auto" }}>
                    <Link href="/" className="admin-nav-link text-decoration-none" style={{ opacity: 0.7 }}>
                        <i className="bx bx-arrow-back" />
                        <span>العودة للمتجر</span>
                    </Link>
                </div>
            </aside>

            {/* Main */}
            <div className="admin-main">
                <header className="admin-header">
                    <div className="d-flex align-items-center gap-3">
                        <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
                            <i className="bx bx-store" style={{ color: "var(--alha-cta, #FF9900)" }} /> بوابة البائع
                        </h2>
                    </div>
                </header>
                <main className="admin-content">{children}</main>
            </div>

            {/* Mobile nav */}
            <nav className="admin-mobile-nav">
                {navLinks.slice(0, 4).map(l => (
                    <Link key={l.href} href={l.href} className={`admin-mobile-tab ${isActive(l.href) ? "active" : ""}`}>
                        <i className={`bx ${l.icon}`} />
                        <span>{l.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
