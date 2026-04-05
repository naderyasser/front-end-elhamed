import Link from "next/link";
import { flaskServerJson } from "@/lib/flask-server";
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
    children?: CategoryNode[];
};

type CategoryTreeResponse = {
    tree: CategoryNode[];
};

function flattenCategoryNames(tree: CategoryNode[]): string[] {
    const result: string[] = [];
    const visit = (node: CategoryNode) => {
        result.push(node.name);
        (node.children || []).forEach(visit);
    };
    tree.forEach(visit);
    return result;
}

export default async function ShopHomePage() {
    const productsData = await flaskServerJson<ProductsResponse>("/api/shop/products?per_page=12&sort=default");
    const categoryTree = await flaskServerJson<CategoryTreeResponse>("/api/categories/tree");

    const allProducts = productsData?.products || [];
    const flashProducts = allProducts.slice(0, 4);
    const topProducts = allProducts.slice(4, 8).length ? allProducts.slice(4, 8) : allProducts.slice(0, 4);
    const categoryNames = flattenCategoryNames(categoryTree?.tree || []).slice(0, 8);

    return (
        <main className="pb-4" dir="rtl">
            <div className="container-fluid px-3 px-lg-4 mt-3">
                <div className="hp-greeting" id="greetingBanner">
                    <span className="hp-greeting-icon">👋</span>
                    <div className="hp-greeting-text">
                        <h3>أهلاً بك في الحامد!</h3>
                        <p>اكتشف أحدث العروض والمنتجات المميزة - شحن سريع لجميع أنحاء مصر</p>
                    </div>
                </div>
            </div>

            <section className="hero-section hp-hero">
                <div className="container-fluid px-3 px-lg-4">
                    <div className="hero-slide position-relative overflow-hidden" style={{ borderRadius: 22 }}>
                        <div className="hero-bg">
                            <img src="/static/images/banner-image2.jpg" alt="Hero" />
                        </div>
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-7">
                                    <div className="hero-content">
                                        <p className="hero-subtitle">منتجات العناية والجمال</p>
                                        <h1 className="hero-title">الحامد سبراي الشعر المتطور</h1>
                                        <p className="hero-description">
                                            جودة احترافية، نتائج ملحوظة، وتجربة شراء بنفس تصميم المتجر الأصلي.
                                        </p>
                                        <div className="hero-buttons d-flex gap-2 flex-wrap">
                                            <Link href="/shop/products" className="btn-shop btn-primary">
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
                        {categoryNames.map((category) => (
                            <Link key={category} href={`/shop/products?category=${encodeURIComponent(category)}`} className="hp-cat-item">
                                <div className="hp-cat-icon">
                                    <i className="bx bx-category" />
                                </div>
                                <span className="hp-cat-name">{category}</span>
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
                                    <Link href={`/shop/wishlist`} className="product-wishlist-btn" aria-label="المفضلة">
                                        <i className="bx bx-heart" />
                                    </Link>
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
