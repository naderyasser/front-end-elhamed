"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type ShopShellProps = {
    children: React.ReactNode;
};

export function ShopShell({ children }: ShopShellProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [timeLeft, setTimeLeft] = useState("00:00:00");
    type CatNode = { name: string; name_en?: string; icon?: string; image?: string; children?: CatNode[] };
    const [catTree, setCatTree] = useState<CatNode[]>([]);
    const [megaOpen, setMegaOpen] = useState(false);
    const [activeMega, setActiveMega] = useState<CatNode | null>(null);
    const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("theme");
        if (stored === "dark" || stored === "light") {
            setTheme(stored);
            document.documentElement.setAttribute("data-theme", stored);
            return;
        }
        document.documentElement.setAttribute("data-theme", "light");
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            const endDate = new Date("2026-06-30T23:59:59").getTime();
            const now = Date.now();
            const diff = Math.max(endDate - now, 0);
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            setTimeLeft(
                `${hours.toString().padStart(2, "0")}:${minutes
                    .toString()
                    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
            );
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        async function loadCategories() {
            try {
                const response = await fetch("/api/flask/api/categories/tree", { cache: "no-store" });
                const data = await response.json();
                setCatTree(data?.tree || []);
            } catch {
                setCatTree([]);
            }
        }

        loadCategories();
    }, []);

    const categories = useMemo(() => {
        const names: string[] = [];
        function collect(node: CatNode) { names.push(node.name); (node.children || []).forEach(collect); }
        catTree.forEach(collect);
        return names.slice(0, 10);
    }, [catTree]);

    const categoryLinks = useMemo(
        () => categories.map((name) => ({ name, href: `/shop/products?category=${encodeURIComponent(name)}` })),
        [categories],
    );

    function openMega() {
        if (megaTimer.current) clearTimeout(megaTimer.current);
        setMegaOpen(true);
        if (!activeMega && catTree.length > 0) setActiveMega(catTree[0]);
    }
    function closeMega() {
        megaTimer.current = setTimeout(() => setMegaOpen(false), 200);
    }

    const toggleTheme = () => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        localStorage.setItem("theme", next);
        document.documentElement.setAttribute("data-theme", next);
    };

    return (
        <div className="shop-legacy-root luxury-dark-theme" dir="rtl">
            <div className="discount-banner">
                <div className="discount-content">
                    <span>✨ خصم خاص ✨</span>
                    <span className="discount-off">خصم 10%</span>
                    <span>
                        استخدم الكود: <span className="discount-code">ALHAMD10</span>
                    </span>
                    <span className="time-block">{timeLeft}</span>
                </div>
            </div>

            <div className="top-info-bar">
                <div className="container-fluid px-3 px-lg-4">
                    <div className="top-info-links">
                        <div className="d-flex align-items-center gap-3">
                            <a href="tel:+201050188516">
                                <i className="bx bx-phone" /> اتصل بنا
                            </a>
                            <span>|</span>
                            <Link href="/shop/orders">تتبع طلبك</Link>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <span>
                                <i className="bx bxs-truck" /> شحن سريع لجميع أنحاء مصر
                            </span>
                            <span>|</span>
                            <Link href="/shop/about">من نحن</Link>
                        </div>
                    </div>
                </div>
            </div>

            <header className="modern-header site-header">
                <nav className="modern-navbar navbar">
                    <div className="container-fluid px-3 px-lg-4 modern-navbar-inner">
                        <Link href="/shop" className="modern-brand">
                            <img src="/static/images/logo-alha.jpeg" className="modern-logo" alt="شعار الحامد" />
                        </Link>

                        <div className="modern-search-wrapper">
                            <form action="/shop/search" method="get" className="modern-search-box">
                                <input
                                    type="text"
                                    name="q"
                                    className="modern-search-input"
                                    placeholder="ابحث عن المنتجات، الماركات أو الفئات..."
                                />
                                <button type="submit" className="modern-search-btn" aria-label="بحث">
                                    <i className="bx bx-search" />
                                </button>
                            </form>
                        </div>

                        <div className="desktop-actions d-flex align-items-center gap-2">
                            <ul className="modern-nav-links">
                                <li>
                                    <Link className="modern-nav-link" href="/shop">
                                        الرئيسية
                                    </Link>
                                </li>
                                <li>
                                    <Link className="modern-nav-link" href="/shop/products">
                                        المتجر
                                    </Link>
                                </li>
                                <li>
                                    <Link className="modern-nav-link" href="/shop/about">
                                        من نحن
                                    </Link>
                                </li>
                                <li>
                                    <Link className="modern-nav-link" href="/shop/account">
                                        حسابي
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/shop/wishlist" className="modern-cart-btn" aria-label="المفضلة">
                                        <i className="bx bx-heart" />
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/shop/cart" className="modern-cart-btn" aria-label="السلة">
                                        <i className="bx bx-cart" />
                                    </Link>
                                </li>
                                <li>
                                    <button type="button" className="theme-toggle-btn" onClick={toggleTheme} aria-label="تبديل الوضع">
                                        <i className={theme === "dark" ? "bx bx-sun" : "bx bx-moon"} />
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <div className="d-flex d-lg-none align-items-center gap-2">
                            <button type="button" className="theme-toggle-btn" onClick={toggleTheme} aria-label="تبديل الوضع">
                                <i className={theme === "dark" ? "bx bx-sun" : "bx bx-moon"} />
                            </button>
                            <Link href="/shop/wishlist" className="modern-cart-btn" aria-label="المفضلة">
                                <i className="bx bx-heart" />
                            </Link>
                            <Link href="/shop/cart" className="modern-cart-btn" aria-label="السلة">
                                <i className="bx bx-cart" />
                            </Link>
                            <button
                                type="button"
                                className="mobile-menu-btn"
                                aria-label="فتح القائمة"
                                onClick={() => setMobileOpen(true)}
                            >
                                <i className="bx bx-menu" style={{ fontSize: 24 }} />
                            </button>
                        </div>
                    </div>
                </nav>
            </header>

            <nav className="sub-nav-bar" style={{ position: "relative" }}>
                <div className="container-fluid px-3 px-lg-4">
                    <div className="sub-nav-scroll">
                        <Link href="/shop/products?sort=discount" className="sub-nav-link sub-nav-deals">
                            <i className="bx bxs-hot" /> عروض اليوم
                        </Link>
                        <span
                            className="sub-nav-link"
                            style={{ cursor: "pointer", position: "relative" }}
                            onMouseEnter={openMega}
                            onMouseLeave={closeMega}
                        >
                            <i className="bx bx-category" /> الأقسام <i className="bx bx-chevron-down" style={{ fontSize: 12 }} />
                        </span>
                        <Link href="/shop/products?sort=rating" className="sub-nav-link">
                            <i className="bx bx-trending-up" /> الأكثر مبيعا
                        </Link>
                        <Link href="/shop/products?sort=newest" className="sub-nav-link">
                            <i className="bx bx-star" /> وصل حديثا
                        </Link>
                        {categoryLinks.map((category) => (
                            <Link href={category.href} key={category.name} className="sub-nav-link">
                                {category.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ── Mega Menu ── */}
                {megaOpen && catTree.length > 0 && (
                    <div
                        className="mega-menu-wrap"
                        onMouseEnter={openMega}
                        onMouseLeave={closeMega}
                    >
                        <div className="mega-menu-inner">
                            {/* Right column — root categories */}
                            <div className="mega-col-roots">
                                {catTree.map(root => (
                                    <div
                                        key={root.name}
                                        className={`mega-root-item ${activeMega?.name === root.name ? "active" : ""}`}
                                        onMouseEnter={() => setActiveMega(root)}
                                    >
                                        <i className={`bx ${root.icon || "bx-category"}`} />
                                        <Link
                                            href={`/shop/products?category=${encodeURIComponent(root.name)}`}
                                            onClick={() => setMegaOpen(false)}
                                        >
                                            {root.name}
                                        </Link>
                                        {(root.children ?? []).length > 0 && <i className="bx bx-chevron-left mega-arrow" />}
                                    </div>
                                ))}
                            </div>

                            {/* Left column — subcategories of active root */}
                            {activeMega && (activeMega.children ?? []).length > 0 && (
                                <div className="mega-col-subs">
                                    <h4 className="mega-sub-title">{activeMega.name}</h4>
                                    <div className="mega-sub-grid">
                                        {(activeMega.children ?? []).map(sub => (
                                            <div key={sub.name} className="mega-sub-group">
                                                <Link
                                                    href={`/shop/products?category=${encodeURIComponent(sub.name)}`}
                                                    className="mega-sub-head"
                                                    onClick={() => setMegaOpen(false)}
                                                >
                                                    {sub.name}
                                                </Link>
                                                {(sub.children ?? []).map(leaf => (
                                                    <Link
                                                        key={leaf.name}
                                                        href={`/shop/products?category=${encodeURIComponent(leaf.name)}`}
                                                        className="mega-sub-leaf"
                                                        onClick={() => setMegaOpen(false)}
                                                    >
                                                        {leaf.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            <div className="shop-content-wrap">{children}</div>

            <a href="https://wa.me/201050188516" className="social-float-btn whatsapp-float" target="_blank" aria-label="واتساب" rel="noreferrer">
                <i className="bx bxl-whatsapp" style={{ fontSize: 30 }} />
            </a>
            <a
                href="https://www.facebook.com/share/1HBiHzhNp9/"
                className="social-float-btn facebook-float"
                target="_blank"
                rel="noreferrer"
                aria-label="فيسبوك"
            >
                <i className="bx bxl-facebook" style={{ fontSize: 24 }} />
            </a>

            <footer id="footer" className="padding-large">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-3 col-sm-6 pb-3">
                            <img
                                src="/static/images/logo-alha.jpeg"
                                alt="شعار الحامد"
                                className="pb-3"
                                style={{ width: 150, borderRadius: 12 }}
                            />
                            <p>مرحباً بكم في الحامد، وجهتكم المثالية للمنتجات الفاخرة والعناية بالجمال.</p>
                        </div>

                        <div className="col-lg-2 col-sm-6 pb-3">
                            <h5 className="widget-title pb-2">الأقسام</h5>
                            <ul className="list-unstyled">
                                {categories.slice(0, 4).map((category) => (
                                    <li key={category}>
                                        <Link href={`/shop/products?category=${encodeURIComponent(category)}`}>{category}</Link>
                                    </li>
                                ))}
                                <li>
                                    <Link href="/shop/products">عرض الكل</Link>
                                </li>
                            </ul>
                        </div>

                        <div className="col-lg-2 col-sm-6 pb-3">
                            <h5 className="widget-title pb-2">روابط سريعة</h5>
                            <ul className="list-unstyled">
                                <li>
                                    <Link href="/shop">الرئيسية</Link>
                                </li>
                                <li>
                                    <Link href="/shop/about">من نحن</Link>
                                </li>
                                <li>
                                    <Link href="/shop/products">منتجاتنا</Link>
                                </li>
                                <li>
                                    <Link href="/shop/cart">سلة التسوق</Link>
                                </li>
                                <li>
                                    <Link href="/shop/contact">تواصل معنا</Link>
                                </li>
                                <li>
                                    <Link href="/shop/faq">الأسئلة الشائعة</Link>
                                </li>
                            </ul>
                        </div>

                        <div className="col-lg-2 col-sm-6 pb-3">
                            <h5 className="widget-title pb-2">تابعونا</h5>
                            <ul className="list-unstyled">
                                <li>
                                    <a href="https://www.facebook.com/share/1HBiHzhNp9/" target="_blank" rel="noreferrer">
                                        فيسبوك
                                    </a>
                                </li>
                                <li>
                                    <a href="https://wa.me/201050188516" target="_blank" rel="noreferrer">
                                        واتساب
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div className="col-lg-3 col-sm-6">
                            <h5 className="widget-title pb-2">تواصل معنا</h5>
                            <p>
                                <i className="bx bx-phone" /> <a href="tel:+201050188516">+20 105 018 8516</a>
                            </p>
                            <p>
                                <i className="bx bx-envelope" /> <a href="mailto:info@alhamd-store.com">info@alhamd-store.com</a>
                            </p>
                            <p>
                                <i className="bx bx-map" /> مصر
                            </p>
                        </div>
                    </div>
                </div>
            </footer>

            <nav className="mobile-bottom-nav d-md-none">
                <Link href="/shop" className="nav-item">
                    <i className="bx bx-home-alt" />
                    <span>الرئيسية</span>
                </Link>
                <Link href="/shop/products" className="nav-item">
                    <i className="bx bx-store" />
                    <span>المتجر</span>
                </Link>
                <Link href="/shop/cart" className="nav-item">
                    <i className="bx bx-cart" />
                    <span>السلة</span>
                </Link>
                <Link href="/shop/about" className="nav-item">
                    <i className="bx bx-info-circle" />
                    <span>من نحن</span>
                </Link>
            </nav>

            <div className={`mobile-drawer-overlay ${mobileOpen ? "open" : ""}`} onClick={() => setMobileOpen(false)} />
            <aside className={`mobile-nav-drawer ${mobileOpen ? "open" : ""}`} dir="rtl">
                <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
                    <img src="/static/images/logo-alha.jpeg" alt="شعار الحامد" style={{ width: 56, borderRadius: 8 }} />
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setMobileOpen(false)}>
                        <i className="bx bx-x" style={{ fontSize: 18 }} />
                    </button>
                </div>
                <div className="p-3">
                    <Link href="/shop" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
                        <i className="bx bx-home-alt" /> الرئيسية
                    </Link>
                    <Link href="/shop/products" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
                        <i className="bx bx-store" /> المتجر
                    </Link>
                    <Link href="/shop/about" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
                        <i className="bx bx-info-circle" /> من نحن
                    </Link>
                    <Link href="/shop/account" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
                        <i className="bx bx-user-circle" /> حسابي
                    </Link>
                    <Link href="/shop/auth/login" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
                        <i className="bx bx-log-in" /> تسجيل الدخول
                    </Link>
                    {/* Mobile categories accordion */}
                    {catTree.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                            <div style={{ fontWeight: 700, padding: "8px 0", borderTop: "1px solid var(--hz-border, #333)" }}>الأقسام</div>
                            {catTree.map(root => (
                                <div key={root.name} style={{ paddingRight: 8 }}>
                                    <Link href={`/shop/products?category=${encodeURIComponent(root.name)}`} className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
                                        <i className={`bx ${root.icon || "bx-category"}`} /> {root.name}
                                    </Link>
                                    {(root.children ?? []).map(sub => (
                                        <Link key={sub.name} href={`/shop/products?category=${encodeURIComponent(sub.name)}`} className="mobile-nav-item" onClick={() => setMobileOpen(false)} style={{ paddingRight: 24, fontSize: 13 }}>
                                            {sub.name}
                                        </Link>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </aside>

            {/* Mega Menu Styles */}
            <style>{`
                .mega-menu-wrap {
                    position: absolute; top: 100%; right: 0; left: 0;
                    z-index: 100; padding-top: 2px;
                    animation: megaFadeIn 0.15s ease;
                }
                @keyframes megaFadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
                .mega-menu-inner {
                    display: flex; direction: rtl;
                    background: var(--hz-card-bg, #fff); border: 1px solid var(--hz-border, #e8edf2);
                    border-radius: 0 0 16px 16px; box-shadow: 0 12px 40px rgba(0,0,0,0.12);
                    max-width: 900px; margin: 0 auto;
                    min-height: 260px; overflow: hidden;
                }
                .mega-col-roots {
                    width: 220px; flex-shrink: 0;
                    border-left: 1px solid var(--hz-border, #e8edf2);
                    padding: 12px 0;
                    background: var(--hz-card-bg, #fafbfc);
                }
                .mega-root-item {
                    display: flex; align-items: center; gap: 8px;
                    padding: 10px 16px; font-size: 0.88rem; font-weight: 600;
                    color: var(--hz-text, #333); cursor: pointer;
                    transition: background 0.15s, color 0.15s;
                    position: relative;
                }
                .mega-root-item:hover, .mega-root-item.active {
                    background: var(--hz-accent-bg, rgba(0,113,206,0.06));
                    color: var(--hz-accent, #0071ce);
                }
                .mega-root-item a { color: inherit; text-decoration: none; flex: 1; }
                .mega-arrow { margin-right: auto; font-size: 0.75rem; opacity: 0.5; }
                .mega-col-subs {
                    flex: 1; padding: 20px 24px;
                }
                .mega-sub-title {
                    font-size: 1rem; font-weight: 700;
                    color: var(--hz-accent, #0071ce);
                    margin-bottom: 16px; padding-bottom: 8px;
                    border-bottom: 2px solid var(--hz-accent, #0071ce);
                }
                .mega-sub-grid {
                    display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 16px;
                }
                .mega-sub-group { display: flex; flex-direction: column; gap: 4px; }
                .mega-sub-head {
                    font-weight: 700; font-size: 0.85rem;
                    color: var(--hz-text, #333); text-decoration: none;
                    padding: 4px 0; transition: color 0.15s;
                }
                .mega-sub-head:hover { color: var(--hz-accent, #0071ce); }
                .mega-sub-leaf {
                    font-size: 0.8rem; color: var(--hz-text-muted, #888);
                    text-decoration: none; padding: 2px 0;
                    transition: color 0.15s;
                }
                .mega-sub-leaf:hover { color: var(--hz-accent, #0071ce); }
                @media (max-width: 768px) {
                    .mega-menu-wrap { display: none; }
                }
            `}</style>
        </div>
    );
}
