import Link from "next/link";
import { flaskServerJson } from "@/lib/flask-server";
import { WishlistIconButton } from "@/components/shop/wishlist-icon-button";
import { formatMoneyEGP, formatStoreImage } from "@/lib/store-utils";

type ApiProduct = {
    id: number;
    name: string;
    image: string;
    price: number;
    discount: number;
    final_price: number;
    category: string;
};

type ProductsResponse = {
    products: ApiProduct[];
};

type CategoryNode = {
    id: number;
    name: string;
    icon: string | null;
    image: string | null;
    children?: CategoryNode[];
};

type CategoryTreeResponse = {
    tree: CategoryNode[];
};

type BannerSlide = {
    id: number;
    image_url: string;
    title: string;
    subtitle: string;
    description: string;
    link_url: string;
    is_active: boolean;
};

type BannersResponse = {
    banners: BannerSlide[];
};

function flattenCategories(tree: CategoryNode[]): CategoryNode[] {
    const result: CategoryNode[] = [];
    const visit = (node: CategoryNode) => {
        result.push(node);
        (node.children || []).forEach(visit);
    };
    tree.forEach(visit);
    return result;
}

export default async function ShopHomePage() {
    const [productsData, categoryTree, bannersData] = await Promise.all([
        flaskServerJson<ProductsResponse>("/api/shop/products?per_page=12&sort=default", { next: { revalidate: 60 } } as RequestInit),
        flaskServerJson<CategoryTreeResponse>("/api/categories/tree", { next: { revalidate: 300 } } as RequestInit),
        flaskServerJson<BannersResponse>("/api/frontend/banners", { next: { revalidate: 300 } } as RequestInit),
    ]);

    const allProducts = productsData?.products || [];
    const flashProducts = allProducts.slice(0, 4);
    const topProducts = allProducts.slice(4, 8).length ? allProducts.slice(4, 8) : allProducts.slice(0, 4);
    const categories = flattenCategories(categoryTree?.tree || []).slice(0, 8);
    const banners = bannersData?.banners || [];
    const heroBanner = banners[0] || null;

    return (
        <main className="pb-4" dir="rtl">
            <div className="container-fluid px-3 px-lg-4 mt-3">

            </div>

            <section className="hero-section hp-hero">
                <div className="container-fluid px-3 px-lg-4">
                    <div className="hero-slide position-relative overflow-hidden" style={{ borderRadius: 22 }}>
                        <div className="hero-bg">
                            <img
                                src={heroBanner?.image_url || "/static/images/banner-image2.jpg"}
                                alt={heroBanner?.title || "Hero"}
                            />
                        </div>
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-7">
                                    <div className="hero-content">
                                        {heroBanner?.subtitle && (
                                            <p className="hero-subtitle">{heroBanner.subtitle}</p>
                                        )}
                                        <h1 className="hero-title">
                                            {heroBanner?.title || "متجر الحمد للاجهزة الكهربائية"}
                                        </h1>
                                        {heroBanner?.description && (
                                            <p className="hero-description">{heroBanner.description}</p>
                                        )}
                                        <div className="hero-buttons d-flex gap-2 flex-wrap">
                                            <Link href={heroBanner?.link_url || "/shop/products"} className="btn-shop btn-primary">
                                                تسوق الآن <i className="bx bx-left-arrow-alt" />
                                            </Link>
                                            <Link href="/shop/about" className="btn-shop btn-outline">
                                                اعرف أكثر
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="hp-categories-strip" dir="rtl">
                <div className="container-fluid px-3 px-lg-4">
                    <div className="hp-cat-scroll">
                        {categories.map((cat) => (
                            <Link key={cat.id} href={`/shop/products?category=${encodeURIComponent(cat.name)}`} className="hp-cat-item">
                                {cat.image ? (
                                    <div className="hp-cat-icon">
                                        <img
                                            src={formatStoreImage(cat.image)}
                                            alt={cat.name}
                                            loading="lazy"
                                        />
                                    </div>
                                ) : (
                                    <div className="hp-cat-icon">
                                        <i className={`bx ${cat.icon ? `bx-${cat.icon}` : "bx-category"}`} />
                                    </div>
                                )}
                                <span className="hp-cat-name">{cat.name}</span>
                            </Link>
                        ))}
                        <Link href="/shop/products" className="hp-cat-item">
                            <div className="hp-cat-icon">
                                <i className="bx bx-grid-alt" />
                            </div>
                            <span className="hp-cat-name">عرض الكل</span>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="hp-trust-strip" dir="rtl">
                <div className="container-fluid px-3 px-lg-4">
                    <div className="hp-trust-grid">
                        <div className="hp-trust-item">
                            <div className="hp-trust-icon">
                                <i className="bx bxs-truck" />
                            </div>
                            <div>
                                <div className="hp-trust-text">شحن سريع</div>
                                <div className="hp-trust-sub">لجميع أنحاء مصر</div>
                            </div>
                        </div>
                        <div className="hp-trust-item">
                            <div className="hp-trust-icon">
                                <i className="bx bxs-shield-plus" />
                            </div>
                            <div>
                                <div className="hp-trust-text">ضمان الجودة</div>
                                <div className="hp-trust-sub">منتجات أصلية 100%</div>
                            </div>
                        </div>
                        <div className="hp-trust-item">
                            <div className="hp-trust-icon">
                                <i className="bx bx-support" />
                            </div>
                            <div>
                                <div className="hp-trust-text">دعم فني مباشر</div>
                                <div className="hp-trust-sub">طوال أيام الأسبوع</div>
                            </div>
                        </div>
                        <div className="hp-trust-item">
                            <div className="hp-trust-icon">
                                <i className="bx bxs-lock-alt" />
                            </div>
                            <div>
                                <div className="hp-trust-text">دفع آمن</div>
                                <div className="hp-trust-sub">بطاقات وكاش</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="hp-flash-section" dir="rtl">
                <div className="container-fluid px-3 px-lg-4">
                    <div className="hp-flash-header">
                        <h2 className="hp-flash-title">
                            <i className="bx bxs-zap" /> عروض خاطفة
                        </h2>
                        <Link href="/shop/products?sort=discount" className="hp-flash-viewall">
                            عرض الكل <i className="bx bx-left-arrow-alt" />
                        </Link>
                    </div>

                    <div className="row g-3">
                        {flashProducts.map((product) => (
                            <div key={product.id} className="col-sm-6 col-lg-3">
                                <Link href={`/shop/products/${product.id}`} className="hp-flash-card d-block h-100">
                                    <div className="hp-flash-img-wrap">
                                        <img src={formatStoreImage(product.image)} alt={product.name} />
                                        {product.discount > 0 ? (
                                            <span className="hp-flash-discount-badge">-{product.discount}%</span>
                                        ) : null}
                                    </div>
                                    <div className="hp-flash-info">
                                        <div className="hp-flash-name">{product.name}</div>
                                        <div className="hp-flash-prices">
                                            <span className="hp-flash-deal-price">{formatMoneyEGP(product.final_price)}</span>
                                            {product.discount > 0 ? (
                                                <span className="hp-flash-original-price">{formatMoneyEGP(product.price)}</span>
                                            ) : null}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-4" dir="rtl">
                <div className="container-fluid px-3 px-lg-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2 style={{ fontWeight: 800, margin: 0 }}>منتجات مميزة</h2>
                        <Link href="/shop/products" className="hp-flash-viewall">
                            تصفح المتجر <i className="bx bx-left-arrow-alt" />
                        </Link>
                    </div>
                    <div className="row g-3">
                        {topProducts.map((product) => (
                            <div key={product.id} className="col-sm-6 col-lg-3">
                                <article className="product-card-modern h-100">
                                    {product.discount > 0 ? <span className="product-badge-modern">-{product.discount}%</span> : null}
                                    <WishlistIconButton productId={product.id} />
                                    <Link href={`/shop/products/${product.id}`} className="product-img-wrapper">
                                        <img src={formatStoreImage(product.image)} alt={product.name} />
                                    </Link>
                                    <div className="product-info-modern">
                                        <div className="product-cat">{product.category}</div>
                                        <h3 className="product-title-modern">
                                            <Link href={`/shop/products/${product.id}`}>{product.name}</Link>
                                        </h3>
                                        <div className="price-wrapper">
                                            <span className="current-price">{formatMoneyEGP(product.final_price)}</span>
                                            {product.discount > 0 ? <span className="old-price">{formatMoneyEGP(product.price)}</span> : null}
                                        </div>
                                    </div>
                                </article>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
