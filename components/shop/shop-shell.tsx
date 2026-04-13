"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";

// Dynamic imports with SSR disabled to prevent hydration errors
const FooterLogo = dynamic(() => import("../FooterLogo"), { ssr: false });

// ─── Isolated Flash Deal Timer (avoids re-rendering the full ShopShell) ─────
const FlashDealTimer = memo(function FlashDealTimer() {
    const [timeLeft, setTimeLeft] = useState("00:00:00");
    useEffect(() => {
        const endDate = new Date("2026-06-30T23:59:59+02:00").getTime();
        const timer = setInterval(() => {
            const diff = Math.max(endDate - Date.now(), 0);
            if (diff === 0) clearInterval(timer);
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            setTimeLeft(
                `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
            );
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    return <span suppressHydrationWarning>{timeLeft}</span>;
});

// ─── Search Result Type ─────────────────────────────────────────────────────
type SearchResult = {
    id: number;
    path: string;
    name: string;
    image: string;
    price: number;
    old_price?: number;
    discount?: number;
    category?: string;
    brand?: string;
};

// ─── Smart Search Component ─────────────────────────────────────────────────
const RECENT_SEARCHES_KEY = "alha_recent_searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}
function addRecentSearch(q: string) {
    if (!q.trim()) return;
    const recent = getRecentSearches().filter(s => s !== q.trim());
    recent.unshift(q.trim());
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

const SmartSearch = memo(function SmartSearch({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const wrapRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load recent searches on mount
    useEffect(() => { setRecentSearches(getRecentSearches()); }, []);

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // Close on Escape
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
        }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, []);

    // Cleanup debounce timer on unmount
    useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

    const doSearch = useCallback(async (q: string) => {
        if (q.length < 2) { setResults([]); setLoading(false); return; }
        setLoading(true);
        try {
            const res = await fetch(`/api/flask/api/search?q=${encodeURIComponent(q)}&limit=6`);
            if (res.ok) {
                const data = await res.json();
                setResults(data.results || []);
            } else {
                setResults([]);
            }
        } catch { setResults([]); }
        setLoading(false);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setOpen(true);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(val), 300);
    };

    const handleFocus = () => {
        setOpen(true);
        setRecentSearches(getRecentSearches());
        if (query.length >= 2) doSearch(query);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        addRecentSearch(query);
        setOpen(false);
        window.location.href = `/shop/search?q=${encodeURIComponent(query.trim())}`;
        onNavigate?.();
    };

    const handleResultClick = (r: SearchResult) => {
        addRecentSearch(query);
        setOpen(false);
        onNavigate?.();
        // Log the click
        fetch("/api/flask/api/search/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, product_id: r.id }),
        }).catch(() => { });
    };

    const handleRecentClick = (term: string) => {
        setQuery(term);
        setOpen(true);
        doSearch(term);
    };

    const clearRecent = () => {
        localStorage.removeItem(RECENT_SEARCHES_KEY);
        setRecentSearches([]);
    };

    const showRecent = open && query.length < 2 && recentSearches.length > 0;
    const showResults = open && query.length >= 2;

    return (
        <div ref={wrapRef} className={`smart-search ${className || ""}`}>
            <form onSubmit={handleSubmit} className="smart-search-form">
                <i className="bx bx-search smart-search-icon" />
                <input
                    ref={inputRef}
                    type="search"
                    name="q"
                    value={query}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    className="smart-search-input"
                    placeholder="ابحث عن منتج..."
                    autoComplete="off"
                />
                {query && (
                    <button type="button" className="smart-search-clear" onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }} aria-label="مسح">
                        <i className="bx bx-x" />
                    </button>
                )}
                {loading && <span className="smart-search-spinner" />}
            </form>

            {/* Recent searches dropdown */}
            {showRecent && (
                <div className="smart-search-dropdown">
                    <div className="ssd-header">
                        <span>عمليات بحث سابقة</span>
                        <button type="button" onClick={clearRecent} className="ssd-clear-btn">مسح</button>
                    </div>
                    {recentSearches.map(term => (
                        <button key={term} type="button" className="ssd-recent-item" onClick={() => handleRecentClick(term)}>
                            <i className="bx bx-history" />
                            <span>{term}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Autocomplete results dropdown */}
            {showResults && (
                <div className="smart-search-dropdown">
                    {loading && results.length === 0 ? (
                        <div className="ssd-loading">
                            <span className="smart-search-spinner" /> جاري البحث...
                        </div>
                    ) : results.length === 0 && !loading ? (
                        <div className="ssd-empty">
                            <i className="bx bx-search-alt" />
                            <span>لا توجد نتائج لـ &quot;{query}&quot;</span>
                        </div>
                    ) : (
                        <>
                            {results.map(r => (
                                <Link
                                    key={r.id}
                                    href={`/shop/products/${r.id}`}
                                    className="ssd-result-item"
                                    onClick={() => handleResultClick(r)}
                                >
                                    <img
                                        src={r.image || "/static/images/placeholder.png"}
                                        alt={r.name}
                                        className="ssd-result-img"
                                        loading="lazy"
                                    />
                                    <div className="ssd-result-info">
                                        <span className="ssd-result-name">{r.name}</span>
                                        <div className="ssd-result-meta">
                                            <span className="ssd-result-price">{r.price} ج.م</span>
                                            {r.old_price && r.old_price > r.price && (
                                                <span className="ssd-result-old-price">{r.old_price} ج.م</span>
                                            )}
                                            {r.category && <span className="ssd-result-cat">{r.category}</span>}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            <Link href={`/shop/search?q=${encodeURIComponent(query)}`} className="ssd-view-all" onClick={() => { addRecentSearch(query); setOpen(false); onNavigate?.(); }}>
                                عرض كل النتائج <i className="bx bx-left-arrow-alt" />
                            </Link>
                        </>
                    )}
                </div>
            )}
        </div>
    );
});

type ShopShellProps = {
    children: React.ReactNode;
};

export function ShopShell({ children }: ShopShellProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [scrolled, setScrolled] = useState(false);
    type CatNode = { name: string; name_en?: string; icon?: string; image?: string; children?: CatNode[] };
    const [catTree, setCatTree] = useState<CatNode[]>([]);
    const [megaOpen, setMegaOpen] = useState(false);
    const [activeMega, setActiveMega] = useState<CatNode | null>(null);
    const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isAuthed, setIsAuthed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        async function loadAuth() {
            try {
                const res = await fetch("/api/flask/api/frontend/me", { cache: "no-store", credentials: "include" });
                if (!res.ok) return;
                const data = await res.json();
                if (!cancelled) setIsAuthed(Boolean(data?.authenticated));
            } catch {
                /* ignore */
            }
        }
        loadAuth();
        return () => {
            cancelled = true;
        };
    }, []);

    async function handleLogout(e: React.MouseEvent) {
        e.preventDefault();
        try {
            await fetch("/api/flask/logout", { method: "POST", credentials: "include" });
        } catch {
            /* ignore */
        }
        setIsAuthed(false);
        if (typeof window !== "undefined") {
            window.location.href = "/shop";
        }
    }

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
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);


    useEffect(() => {
        async function loadCategories() {
            try {
                const response = await fetch("/api/flask/api/categories/tree", { cache: "no-store" });
                if (!response.ok) {
                    throw new Error(`Categories fetch failed: ${response.status}`);
                }
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

    // Cleanup mega timer on unmount
    useEffect(() => () => { if (megaTimer.current) clearTimeout(megaTimer.current); }, []);

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
                    <span className="time-block"><FlashDealTimer /></span>
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

            <header className={`alha-header${scrolled ? " scrolled" : ""}`}>
                <div className="alha-header-inner">
                    {/* ── Logo ── */}
                    <Link href="/shop" className="alha-header-logo">
                        <img src="/static/images/logo-alha.jpeg" alt="شعار الحمد" suppressHydrationWarning />
                    </Link>

                    {/* ── Desktop Nav Links ── */}
                    <nav className="alha-desktop-nav">
                        <Link href="/shop" className="alha-nav-link">الرئيسية</Link>
                        <Link href="/shop/products" className="alha-nav-link">المتجر</Link>
                        <div
                            className="alha-nav-link alha-nav-categories"
                            onMouseEnter={openMega}
                            onMouseLeave={closeMega}
                        >
                            الأقسام <i className="bx bx-chevron-down" style={{ fontSize: 12, marginRight: 2 }} />
                        </div>
                        <Link href="/shop/about" className="alha-nav-link">من نحن</Link>
                    </nav>

                    {/* ── Desktop Search ── */}
                    <SmartSearch className="alha-desktop-search" />

                    {/* ── Header Actions ── */}
                    <div className="alha-header-actions">
                        {/* Mobile search toggle */}
                        <button
                            type="button"
                            className="alha-action-btn alha-mobile-search-toggle"
                            aria-label="بحث"
                            onClick={() => setMobileSearchOpen(prev => {
                                const next = !prev;
                                if (next) {
                                    setTimeout(() => {
                                        (document.querySelector(".alha-mobile-search .smart-search-input") as HTMLInputElement | null)?.focus();
                                    }, 250);
                                }
                                return next;
                            })}
                        >
                            <i className={mobileSearchOpen ? "bx bx-x" : "bx bx-search"} />
                        </button>

                        <button type="button" className="alha-action-btn" onClick={toggleTheme} aria-label="تبديل الوضع">
                            <i className={theme === "dark" ? "bx bx-sun" : "bx bx-moon"} />
                        </button>
                        <Link href="/shop/wishlist" className="alha-action-btn" aria-label="المفضلة">
                            <i className="bx bx-heart" />
                        </Link>
                        <Link href="/shop/cart" className="alha-action-btn alha-cart-action" aria-label="السلة">
                            <i className="bx bx-cart" />
                        </Link>

                        {/* Desktop user menu */}
                        {isAuthed ? (
                            <div className="alha-user-menu">
                                <Link href="/shop/account" className="alha-action-btn" aria-label="حسابي">
                                    <i className="bx bx-user" />
                                </Link>
                                <a href="#" className="alha-action-btn alha-desktop-only" onClick={handleLogout} aria-label="خروج" title="تسجيل الخروج">
                                    <i className="bx bx-log-out" />
                                </a>
                            </div>
                        ) : (
                            <Link href="/shop/auth/login" className="alha-action-btn alha-desktop-only" aria-label="تسجيل الدخول">
                                <i className="bx bx-user" />
                            </Link>
                        )}

                        {/* Mobile hamburger */}
                        <button
                            type="button"
                            className="alha-action-btn alha-hamburger"
                            aria-label="القائمة"
                            onClick={() => setMobileOpen(true)}
                        >
                            <i className="bx bx-menu" />
                        </button>
                    </div>
                </div>

                {/* ── Mobile Expandable Search ── */}
                <div className={`alha-mobile-search${mobileSearchOpen ? " open" : ""}`}>
                    <SmartSearch className="alha-mobile-search-inner" onNavigate={() => setMobileSearchOpen(false)} />
                </div>
            </header>

            <nav className="sub-nav-bar">
                <div className="container-fluid px-3 px-lg-4">
                    <div className="sub-nav-scroll">
                        <Link href="/shop/products?sort=discount" className="sub-nav-link sub-nav-deals">
                            <i className="bx bxs-hot" /> عروض اليوم
                        </Link>
                        <Link
                            href="/shop/categories"
                            className="sub-nav-link"
                            style={{ position: "relative" }}
                            onMouseEnter={openMega}
                            onMouseLeave={closeMega}
                        >
                            <i className="bx bx-category" /> الأقسام <i className="bx bx-chevron-down" style={{ fontSize: 12 }} />
                        </Link>
                        <Link href="/shop/products?sort=rating" className="sub-nav-link">
                            <i className="bx bx-trending-up" /> الأكثر مبيعا
                        </Link>
                        <Link href="/shop/new-arrivals" className="sub-nav-link">
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

            <footer id="footer" className="padding-large footer-premium">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-3 col-sm-6 pb-3">
                            <div className="footer-logo-section">
                                <FooterLogo />
                            </div>
                        </div>

                        <div className="col-lg-2 col-sm-6 pb-3">
                            <h5 className="footer-title">الأقسام</h5>
                            <ul className="footer-links">
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
                            <h5 className="footer-title">روابط سريعة</h5>
                            <ul className="footer-links">
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
                            <h5 className="footer-title">خدمة العملاء</h5>
                            <ul className="footer-links">
                                <li>
                                    <Link href="/shop/faq">الأسئلة الشائعة</Link>
                                </li>
                                <li>
                                    <Link href="/shop/orders">تتبع الطلبات</Link>
                                </li>
                                <li>
                                    <Link href="/shop/account">حسابي</Link>
                                </li>
                            </ul>
                        </div>

                        <div className="col-lg-3 col-sm-6">
                            <h5 className="footer-title">تواصل معنا</h5>
                            <div className="footer-contact-info">
                                <div className="footer-contact-item">
                                    <i className="bx bx-phone footer-contact-icon" />
                                    <a href="tel:+201050188516" className="footer-contact-link">
                                        +20 105 018 8516
                                    </a>
                                </div>
                                <div className="footer-contact-item">
                                    <i className="bx bx-map footer-contact-icon" />
                                    <span className="footer-contact-text">مصر</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <div className="row align-items-center">
                            <div className="col-md-6 text-center text-md-end">
                                <p className="footer-copyright mb-0">
                                    <i className="bx bx-copyright" /> 2026 الحمد - جميع الحقوق محفوظة
                                </p>
                            </div>
                            <div className="col-md-6 text-center text-md-start">
                                <div className="footer-payment-methods">
                                    <span className="footer-cash-badge">الدفع عند الاستلام</span>
                                </div>
                            </div>
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
                <div className="d-flex align-items-center justify-content-between p-3 border-bottom" style={{ flexShrink: 0 }}>
                    <img src="/static/images/logo-alha.jpeg" alt="شعار الحمد" style={{ width: 56, borderRadius: 8 }} suppressHydrationWarning />
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setMobileOpen(false)}>
                        <i className="bx bx-x" style={{ fontSize: 18 }} />
                    </button>
                </div>
                {/* Search area — not clipped by overflow */}
                <div className="px-3 pt-3 pb-1" style={{ flexShrink: 0, position: 'relative', zIndex: 10 }}>
                    <SmartSearch className="mb-0" onNavigate={() => setMobileOpen(false)} />
                </div>
                {/* Scrollable nav links */}
                <div className="mobile-drawer-scroll px-3 pb-3 pt-2">
                    <Link href="/shop" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
                        <i className="bx bx-home-alt" /> الرئيسية
                    </Link>
                    <Link href="/shop/products" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
                        <i className="bx bx-store" /> المتجر
                    </Link>
                    <Link href="/shop/about" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
                        <i className="bx bx-info-circle" /> من نحن
                    </Link>
                    {isAuthed ? (
                        <>
                            <Link href="/shop/account" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
                                <i className="bx bx-user-circle" /> حسابي
                            </Link>
                            <a
                                href="#"
                                className="mobile-nav-item"
                                onClick={(e) => {
                                    setMobileOpen(false);
                                    handleLogout(e);
                                }}
                            >
                                <i className="bx bx-log-out" /> تسجيل الخروج
                            </a>
                        </>
                    ) : (
                        <Link href="/shop/auth/login" className="mobile-nav-item" onClick={() => setMobileOpen(false)}>
                            <i className="bx bx-log-in" /> إنشاء حساب / تسجيل الدخول
                        </Link>
                    )}
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
        </div>
    );
}
