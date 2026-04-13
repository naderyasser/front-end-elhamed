import Link from "next/link";
import { Suspense } from "react";
import { flaskServerJson } from "@/lib/flask-server";
import { ProductCardItem } from "@/components/shop/product-card-item";
import { ProductsFilterDrawer, FilterDrawerTrigger } from "@/components/shop/products-filter-drawer";
import { ProductsSortBar } from "@/components/shop/products-sort-bar";
import { SidebarPriceFilter } from "@/components/shop/sidebar-price-filter";

type SearchParams = {
    category?: string;
    brand?: string;
    q?: string;
    sort?: string;
    min?: string;
    max?: string;
    stock?: string;
    page?: string;
    rating?: string;
    [key: string]: string | undefined;
};

type ApiProduct = {
    id: number;
    name: string;
    image: string;
    price: number;
    discount: number;
    final_price: number;
    brand: string;
    category: string;
    stock: number;
};

type ProductsResponse = {
    products: ApiProduct[];
    total: number;
    page: number;
    pages: number;
};

type FiltersResponse = {
    brands: Array<{ name: string; count: number }>;
    attributes?: Array<{
        id: number; name: string; attr_type: string;
        values: Array<{ id: number; value: string; color_hex?: string | null; count: number }>;
    }>;
    rating_counts?: Array<{ stars: number; count: number }>;
    price_range?: { min: number; max: number };
};

type CategoryNode = {
    id: number;
    name: string;
    slug: string | null;
    icon: string | null;
    product_count: number;
    children: CategoryNode[];
};

type CategoriesResponse = {
    tree: CategoryNode[];
};

const SORT_MAP: Record<string, string> = {
    newest: "default",
    price_asc: "price-asc",
    price_desc: "price-desc",
    discount: "discount",
    rating: "rating",
};

function buildQueryString(current: SearchParams | undefined, updates: Record<string, string | undefined>): string {
    const params = new URLSearchParams();

    if (current) {
        Object.entries(current).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
    }

    Object.entries(updates).forEach(([key, value]) => {
        if (!value) { params.delete(key); return; }
        params.set(key, value);
    });

    params.delete("page");
    const query = params.toString();
    return query ? `/shop/products?${query}` : "/shop/products";
}

/** Flatten the category tree into a flat list (depth-first) */
function flattenCategories(nodes: CategoryNode[]): CategoryNode[] {
    const result: CategoryNode[] = [];
    function walk(list: CategoryNode[]) {
        list.forEach((node) => {
            result.push(node);
            if (node.children?.length) walk(node.children);
        });
    }
    walk(nodes);
    return result;
}

export const revalidate = 30;

export default async function ProductsIndexPage({ searchParams }: { searchParams?: SearchParams }) {
    const selectedCategory = searchParams?.category?.trim() || "";
    const selectedBrand = searchParams?.brand?.trim() || "";
    const searchQuery = searchParams?.q?.trim() || "";
    const sort = searchParams?.sort?.trim() || "newest";
    const minPrice = Number(searchParams?.min || 0);
    const maxPrice = Number(searchParams?.max || 0);
    const stockOnly = searchParams?.stock === "1";
    const ratingFilter = Number(searchParams?.rating || 0);
    const page = Math.max(1, Number(searchParams?.page || 1));
    const pageSize = 12;

    // Collect dynamic attribute filters (attr_<id>=<value>)
    const attrFilters: Record<string, string> = {};
    if (searchParams) {
        Object.keys(searchParams).forEach(key => {
            if (key.startsWith("attr_") && searchParams[key]) {
                attrFilters[key] = searchParams[key]!;
            }
        });
    }

    const backendParams = new URLSearchParams();
    backendParams.set("page", String(page));
    backendParams.set("per_page", String(pageSize));
    backendParams.set("sort", SORT_MAP[sort] || "default");
    if (selectedCategory) backendParams.set("category", selectedCategory);
    if (selectedBrand) backendParams.set("brand", selectedBrand);
    if (searchQuery) backendParams.set("search", searchQuery);
    if (minPrice > 0) backendParams.set("price_min", String(minPrice));
    if (maxPrice > 0) backendParams.set("price_max", String(maxPrice));
    if (stockOnly) backendParams.set("in_stock", "1");
    if (ratingFilter > 0) backendParams.set("rating", String(ratingFilter));
    Object.entries(attrFilters).forEach(([k, v]) => backendParams.set(k, v));

    // Fetch all data in parallel
    const [productsData, filtersData, categoriesData] = await Promise.all([
        flaskServerJson<ProductsResponse>(`/api/shop/products?${backendParams.toString()}`, { next: { revalidate: 30 } } as RequestInit),
        flaskServerJson<FiltersResponse>(`/api/shop/filters?${backendParams.toString()}`, { next: { revalidate: 60 } } as RequestInit),
        flaskServerJson<CategoriesResponse>("/api/categories/tree", { next: { revalidate: 300 } } as RequestInit),
    ]);

    const products = productsData?.products || [];
    const totalPages = Math.max(1, productsData?.pages || 1);
    const currentPage = Math.min(page, totalPages);
    const total = productsData?.total || 0;
    const brandCounts = filtersData?.brands || [];
    const dynamicAttrs = filtersData?.attributes || [];
    const ratingCounts = filtersData?.rating_counts || [];
    const priceRange = filtersData?.price_range || null;
    const allCategories = flattenCategories(categoriesData?.tree || []);
    const categoryTree = categoriesData?.tree || [];

    const attrFilterCount = Object.keys(attrFilters).length;
    const selectedFiltersCount = [
        selectedCategory,
        selectedBrand,
        searchQuery,
        stockOnly ? "stock" : "",
        minPrice > 0 ? "min" : "",
        maxPrice > 0 ? "max" : "",
        ratingFilter > 0 ? "rating" : "",
    ].filter(Boolean).length + attrFilterCount;

    const baseParams = new URLSearchParams();
    if (selectedCategory) baseParams.set("category", selectedCategory);
    if (selectedBrand) baseParams.set("brand", selectedBrand);
    if (searchQuery) baseParams.set("q", searchQuery);
    if (sort) baseParams.set("sort", sort);
    if (minPrice > 0) baseParams.set("min", String(minPrice));
    if (maxPrice > 0) baseParams.set("max", String(maxPrice));
    if (stockOnly) baseParams.set("stock", "1");
    if (ratingFilter > 0) baseParams.set("rating", String(ratingFilter));
    Object.entries(attrFilters).forEach(([k, v]) => baseParams.set(k, v));

    const clearFiltersHref = sort && sort !== "newest"
        ? `/shop/products?sort=${encodeURIComponent(sort)}`
        : "/shop/products";

    /** Build ellipsis pagination sequence */
    function buildPaginationSequence(current: number, total: number): (number | "\u2026")[] {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        const pages: (number | "\u2026")[] = [1];
        if (current > 3) pages.push("\u2026");
        for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
        if (current < total - 2) pages.push("\u2026");
        if (total > 1) pages.push(total);
        return pages;
    }

    function buildPageHref(targetPage: number): string {
        const pParams = new URLSearchParams(baseParams.toString());
        if (targetPage > 1) pParams.set("page", String(targetPage));
        else pParams.delete("page");
        const qs = pParams.toString();
        return `/shop/products${qs ? `?${qs}` : ""}`;
    }

    const paginationPages = buildPaginationSequence(currentPage, totalPages);

    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container">
                {/* ── Breadcrumb ───────────────────────── */}
                <div className="shop-page-card mb-3 p-3">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                        <div>
                            <h1 className="m-0" style={{ fontWeight: 800, fontSize: "1.55rem" }}>
                                {selectedCategory ? selectedCategory : "منتجات المتجر"}
                            </h1>
                            <div className="text-muted mt-1" style={{ fontSize: "0.9rem" }}>
                                <Link href="/shop" className="text-decoration-none">الرئيسية</Link>
                                <span className="mx-2">/</span>
                                <Link href="/shop/products" className="text-decoration-none">المتجر</Link>
                                {selectedCategory && (
                                    <>
                                        <span className="mx-2">/</span>
                                        <span>{selectedCategory}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <span className="badge text-bg-light border" style={{ fontSize: "0.82rem" }}>
                            {total} منتج
                        </span>
                    </div>
                </div>

                <div className="row g-3">
                    {/* ── Sidebar ──────────────────────── */}
                    <div className="col-lg-3 order-2 order-lg-1">
                        <ProductsFilterDrawer activeCount={selectedFiltersCount}>

                            {/* Search */}
                            <aside className="shop-page-card mb-3">
                                <h3 style={{ fontSize: "1rem", fontWeight: 800 }} className="mb-3">البحث</h3>
                                <form action="/shop/products" method="get">
                                    {selectedCategory ? <input type="hidden" name="category" value={selectedCategory} /> : null}
                                    {selectedBrand ? <input type="hidden" name="brand" value={selectedBrand} /> : null}
                                    {sort ? <input type="hidden" name="sort" value={sort} /> : null}
                                    {minPrice > 0 ? <input type="hidden" name="min" value={String(minPrice)} /> : null}
                                    {maxPrice > 0 ? <input type="hidden" name="max" value={String(maxPrice)} /> : null}
                                    {stockOnly ? <input type="hidden" name="stock" value="1" /> : null}
                                    <input
                                        type="text"
                                        name="q"
                                        defaultValue={searchQuery}
                                        className="form-control"
                                        placeholder="ابحث في المنتجات..."
                                    />
                                </form>
                            </aside>

                            {/* ── Price Filter ──────────── */}
                            <SidebarPriceFilter
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                absMin={50}
                                absMax={30000}
                            />

                            {/* ── Categories (Hierarchical) ── */}
                            {categoryTree.length > 0 && (
                                <aside className="shop-page-card mb-3">
                                    <h3 style={{ fontSize: "1rem", fontWeight: 800 }} className="mb-3">
                                        <i className="bx bx-category" /> الأقسام
                                    </h3>
                                    <ul className="list-unstyled m-0">
                                        <li className="mb-2">
                                            <Link
                                                href={buildQueryString(searchParams, { category: undefined })}
                                                className="text-decoration-none d-flex align-items-center justify-content-between"
                                                style={{ fontWeight: !selectedCategory ? 800 : 400, color: !selectedCategory ? "var(--alha-primary, #0071ce)" : "inherit" }}
                                            >
                                                <span>كل الأقسام</span>
                                                <span className="badge rounded-pill text-bg-light border" style={{ fontSize: "0.72rem" }}>{total}</span>
                                            </Link>
                                        </li>
                                        {categoryTree.map((rootCat) => (
                                            <li key={rootCat.id} className="mb-1">
                                                <Link
                                                    href={buildQueryString(searchParams, { category: rootCat.name })}
                                                    className="text-decoration-none d-flex align-items-center justify-content-between"
                                                    style={{
                                                        fontWeight: selectedCategory === rootCat.name ? 800 : 600,
                                                        color: selectedCategory === rootCat.name ? "var(--alha-primary, #0071ce)" : "inherit",
                                                        fontSize: "0.92rem",
                                                    }}
                                                >
                                                    <span className="d-flex align-items-center gap-1">
                                                        {rootCat.icon ? <i className={`bx ${rootCat.icon}`} /> : null}
                                                        {rootCat.name}
                                                    </span>
                                                    <span className="badge rounded-pill text-bg-light border" style={{ fontSize: "0.72rem" }}>
                                                        {rootCat.product_count}
                                                    </span>
                                                </Link>
                                                {/* Sub-categories */}
                                                {rootCat.children?.length > 0 && (
                                                    <ul className="list-unstyled m-0" style={{ paddingRight: 16, marginTop: 4 }}>
                                                        {rootCat.children.map(sub => (
                                                            <li key={sub.id} className="mb-1">
                                                                <Link
                                                                    href={buildQueryString(searchParams, { category: sub.name })}
                                                                    className="text-decoration-none d-flex align-items-center justify-content-between"
                                                                    style={{
                                                                        fontWeight: selectedCategory === sub.name ? 700 : 400,
                                                                        color: selectedCategory === sub.name ? "var(--alha-primary, #0071ce)" : "inherit",
                                                                        fontSize: "0.85rem",
                                                                    }}
                                                                >
                                                                    <span>{sub.name}</span>
                                                                    <span className="badge rounded-pill text-bg-light border" style={{ fontSize: "0.68rem" }}>
                                                                        {sub.product_count}
                                                                    </span>
                                                                </Link>
                                                                {/* Leaf categories */}
                                                                {sub.children?.length > 0 && (
                                                                    <ul className="list-unstyled m-0" style={{ paddingRight: 14, marginTop: 2 }}>
                                                                        {sub.children.map(leaf => (
                                                                            <li key={leaf.id}>
                                                                                <Link
                                                                                    href={buildQueryString(searchParams, { category: leaf.name })}
                                                                                    className="text-decoration-none d-flex align-items-center justify-content-between"
                                                                                    style={{
                                                                                        fontWeight: selectedCategory === leaf.name ? 700 : 400,
                                                                                        color: selectedCategory === leaf.name ? "var(--alha-primary, #0071ce)" : "var(--hz-text-muted, #888)",
                                                                                        fontSize: "0.8rem",
                                                                                    }}
                                                                                >
                                                                                    <span>{leaf.name}</span>
                                                                                    <span style={{ fontSize: "0.68rem", color: "#aaa" }}>{leaf.product_count}</span>
                                                                                </Link>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </aside>
                            )}

                            {/* ── Brands ──────────────────── */}
                            {brandCounts.length > 0 && (
                                <aside className="shop-page-card mb-3">
                                    <h3 style={{ fontSize: "1rem", fontWeight: 800 }} className="mb-3">الماركات</h3>
                                    <ul className="list-unstyled m-0">
                                        <li className="mb-2">
                                            <Link
                                                href={buildQueryString(searchParams, { brand: undefined })}
                                                className="text-decoration-none"
                                                style={{ fontWeight: !selectedBrand ? 800 : 400 }}
                                            >
                                                كل الماركات
                                            </Link>
                                        </li>
                                        {brandCounts.map((item) => (
                                            <li key={item.name} className="mb-2 d-flex align-items-center justify-content-between">
                                                <Link
                                                    href={buildQueryString(searchParams, { brand: item.name })}
                                                    className="text-decoration-none"
                                                    style={{ fontWeight: selectedBrand === item.name ? 800 : 400 }}
                                                >
                                                    {item.name}
                                                </Link>
                                                <span className="text-muted" style={{ fontSize: "0.8rem" }}>{item.count}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </aside>
                            )}

                            {/* ── Active Filters ──────────── */}
                            {selectedFiltersCount > 0 && (
                                <aside className="shop-page-card mb-3 p-3">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                                            {selectedFiltersCount} فلتر نشط
                                        </span>
                                        <Link href={clearFiltersHref} className="text-danger text-decoration-none" style={{ fontSize: "0.82rem" }}>
                                            مسح الكل
                                        </Link>
                                    </div>
                                    {selectedCategory && (
                                        <div className="d-flex align-items-center justify-content-between mb-1" style={{ fontSize: "0.82rem" }}>
                                            <span className="text-muted">القسم: <strong>{selectedCategory}</strong></span>
                                            <Link href={buildQueryString(searchParams, { category: undefined })} className="text-danger text-decoration-none"><i className="bx bx-x" /></Link>
                                        </div>
                                    )}
                                    {selectedBrand && (
                                        <div className="d-flex align-items-center justify-content-between mb-1" style={{ fontSize: "0.82rem" }}>
                                            <span className="text-muted">الماركة: <strong>{selectedBrand}</strong></span>
                                            <Link href={buildQueryString(searchParams, { brand: undefined })} className="text-danger text-decoration-none"><i className="bx bx-x" /></Link>
                                        </div>
                                    )}
                                    {searchQuery && (
                                        <div className="d-flex align-items-center justify-content-between mb-1" style={{ fontSize: "0.82rem" }}>
                                            <span className="text-muted">البحث: <strong>{searchQuery}</strong></span>
                                            <Link href={buildQueryString(searchParams, { q: undefined })} className="text-danger text-decoration-none"><i className="bx bx-x" /></Link>
                                        </div>
                                    )}
                                    {ratingFilter > 0 && (
                                        <div className="d-flex align-items-center justify-content-between mb-1" style={{ fontSize: "0.82rem" }}>
                                            <span className="text-muted">التقييم: <strong>{ratingFilter}+ نجوم</strong></span>
                                            <Link href={buildQueryString(searchParams, { rating: undefined })} className="text-danger text-decoration-none"><i className="bx bx-x" /></Link>
                                        </div>
                                    )}
                                    {Object.entries(attrFilters).map(([key, val]) => (
                                        <div key={key} className="d-flex align-items-center justify-content-between mb-1" style={{ fontSize: "0.82rem" }}>
                                            <span className="text-muted"><strong>{val}</strong></span>
                                            <Link href={buildQueryString(searchParams, { [key]: undefined })} className="text-danger text-decoration-none"><i className="bx bx-x" /></Link>
                                        </div>
                                    ))}
                                </aside>
                            )}

                            {/* ── Rating Filter ──────────── */}
                            {ratingCounts.length > 0 && (
                                <aside className="shop-page-card mb-3">
                                    <h3 style={{ fontSize: "1rem", fontWeight: 800 }} className="mb-3">
                                        <i className="bx bx-star" /> التقييم
                                    </h3>
                                    <ul className="list-unstyled m-0">
                                        {[5, 4, 3, 2, 1].map(stars => {
                                            const rc = ratingCounts.find(r => r.stars === stars);
                                            const count = rc?.count ?? 0;
                                            const isActive = ratingFilter === stars;
                                            return (
                                                <li key={stars} className="mb-1">
                                                    <Link
                                                        href={buildQueryString(searchParams, { rating: isActive ? undefined : String(stars) })}
                                                        className="text-decoration-none d-flex align-items-center justify-content-between"
                                                        style={{ fontWeight: isActive ? 700 : 400, color: isActive ? "var(--alha-primary, #0071ce)" : "inherit", fontSize: "0.88rem" }}
                                                    >
                                                        <span className="d-flex align-items-center gap-1">
                                                            {Array.from({ length: 5 }, (_, i) => (
                                                                <i key={i} className={`bx ${i < stars ? "bxs-star" : "bx-star"}`} style={{ color: i < stars ? "#f59e0b" : "#ddd", fontSize: "0.85rem" }} />
                                                            ))}
                                                            <span style={{ marginRight: 4 }}>وأعلى</span>
                                                        </span>
                                                        <span className="text-muted" style={{ fontSize: "0.75rem" }}>({count})</span>
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </aside>
                            )}

                            {/* ── Dynamic Attribute Filters ── */}
                            {dynamicAttrs.filter(a => a.values.length > 0).map(attr => (
                                <aside key={attr.id} className="shop-page-card mb-3">
                                    <h3 style={{ fontSize: "1rem", fontWeight: 800 }} className="mb-3">
                                        <i className={`bx ${attr.attr_type === "color" ? "bx-palette" : attr.attr_type === "size" ? "bx-ruler" : "bx-slider-alt"}`} /> {attr.name}
                                    </h3>
                                    {attr.attr_type === "color" ? (
                                        <div className="d-flex flex-wrap gap-2">
                                            {attr.values.map(v => {
                                                const key = `attr_${attr.id}`;
                                                const isActive = attrFilters[key] === v.value;
                                                return (
                                                    <Link
                                                        key={v.id}
                                                        href={buildQueryString(searchParams, { [key]: isActive ? undefined : v.value })}
                                                        className="text-decoration-none"
                                                        title={v.value}
                                                        style={{
                                                            display: "inline-flex", alignItems: "center", gap: 4,
                                                            padding: "4px 10px", borderRadius: 20,
                                                            border: `2px solid ${isActive ? "var(--alha-primary, #0071ce)" : "#ddd"}`,
                                                            fontSize: "0.8rem", fontWeight: isActive ? 700 : 400,
                                                            background: isActive ? "rgba(0,113,206,0.06)" : "transparent",
                                                        }}
                                                    >
                                                        {v.color_hex && (
                                                            <span title={`${v.value} — ${v.color_hex}`} aria-hidden="true" style={{ display: "inline-block", width: 14, height: 14, borderRadius: "50%", background: v.color_hex, border: "1px solid #ccc" }} />
                                                        )}
                                                        {v.value}
                                                        <span className="text-muted" style={{ fontSize: "0.7rem" }}>({v.count})</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <ul className="list-unstyled m-0">
                                            {attr.values.map(v => {
                                                const key = `attr_${attr.id}`;
                                                const isActive = attrFilters[key] === v.value;
                                                return (
                                                    <li key={v.id} className="mb-1">
                                                        <Link
                                                            href={buildQueryString(searchParams, { [key]: isActive ? undefined : v.value })}
                                                            className="text-decoration-none d-flex align-items-center justify-content-between"
                                                            style={{ fontWeight: isActive ? 700 : 400, color: isActive ? "var(--alha-primary, #0071ce)" : "inherit", fontSize: "0.85rem" }}
                                                        >
                                                            <span>{v.value}</span>
                                                            <span className="text-muted" style={{ fontSize: "0.75rem" }}>({v.count})</span>
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </aside>
                            ))}
                        </ProductsFilterDrawer>
                    </div>

                    {/* ── Products Grid ─────────────── */}
                    <div className="col-lg-9 order-1 order-lg-2">
                        {/* Mobile filter trigger */}
                        <FilterDrawerTrigger activeCount={selectedFiltersCount} total={total} />

                        {/* Sticky sort/filter bar */}
                        <Suspense fallback={
                            <div className="products-sort-bar">
                                <span className="sort-bar-count">{total} منتج</span>
                            </div>
                        }>
                            <ProductsSortBar
                                total={total}
                                sort={sort}
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                            />
                        </Suspense>

                        {/* Product Grid */}
                        <div className="row g-3" id="products-grid">
                            {products.length === 0 ? (
                                <div className="col-12">
                                    <div className="shop-page-card p-4 text-center">
                                        <i className="bx bx-search-alt" style={{ fontSize: 40, opacity: 0.3 }} />
                                        <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }} className="mt-2">لا توجد نتائج مطابقة</h3>
                                        <p className="text-muted mb-3">جرب تخفيف الفلاتر أو استخدام كلمات بحث أخرى.</p>
                                        <Link href="/shop/products" className="btn btn-outline-primary btn-sm">
                                            العودة إلى كل المنتجات
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                products.map((product) => (
                                    <div key={product.id} className="col-sm-6 col-xl-4 product-col">
                                        <ProductCardItem product={product} />
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <nav aria-label="pagination" className="mt-4">
                                <ul className="pagination justify-content-center products-pagination gap-1">
                                    <li className={`page-item${currentPage <= 1 ? " disabled" : ""}`}>
                                        <Link className="page-link pagination-arrow" href={buildPageHref(currentPage - 1)} aria-label="السابق">
                                            <i className="bx bx-chevron-right" />
                                        </Link>
                                    </li>
                                    {paginationPages.map((p, idx) =>
                                        p === "\u2026" ? (
                                            <li key={`e${idx}`} className="page-item disabled">
                                                <span className="page-link pagination-ellipsis">…</span>
                                            </li>
                                        ) : (
                                            <li key={p} className={`page-item${p === currentPage ? " active" : ""}`}>
                                                <Link className="page-link" href={buildPageHref(p as number)}>{p}</Link>
                                            </li>
                                        )
                                    )}
                                    <li className={`page-item${currentPage >= totalPages ? " disabled" : ""}`}>
                                        <Link className="page-link pagination-arrow" href={buildPageHref(currentPage + 1)} aria-label="التالي">
                                            <i className="bx bx-chevron-left" />
                                        </Link>
                                    </li>
                                </ul>
                                <p className="text-center text-muted mt-2" style={{ fontSize: "0.8rem" }}>
                                    صفحة {currentPage} من {totalPages}
                                </p>
                            </nav>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
