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

type SearchParams = {
    page?: string;
};

export const revalidate = 60;

export const metadata = {
    title: "وصل حديثاً | الحمد",
    description: "أحدث المنتجات اللي وصلت متجر الحمد — تسوق الجديد أول بأول",
};

export default async function NewArrivalsPage({ searchParams }: { searchParams?: SearchParams }) {
    const page = Math.max(1, Number(searchParams?.page || 1));
    const pageSize = 12;

    const data = await flaskServerJson<ProductsResponse>(
        `/api/shop/products?page=${page}&per_page=${pageSize}&sort=default`,
        { next: { revalidate: 60 } } as RequestInit,
    );

    const products = data?.products || [];
    const totalPages = Math.max(1, data?.pages || 1);
    const currentPage = Math.min(page, totalPages);
    const total = data?.total || 0;

    return (
        <main className="new-arrivals-page" dir="rtl">
            <div className="container-fluid px-3 px-lg-4">
                {/* ── Header ── */}
                <div className="na-header">
                    <div className="na-header-text">
                        <h1>
                            <i className="bx bx-star" /> وصل حديثاً
                        </h1>
                        <p>أحدث المنتجات اللي ضفناها — كل جديد في مكان واحد</p>
                    </div>
                    <div className="na-header-breadcrumb">
                        <Link href="/shop">الرئيسية</Link>
                        <span>/</span>
                        <span>وصل حديثاً</span>
                    </div>
                    <span className="na-count-badge">{total} منتج</span>
                </div>

                {/* ── Products Grid ── */}
                <div className="row g-3">
                    {products.map((product) => (
                        <div key={product.id} className="col-6 col-md-4 col-lg-3">
                            <article className="product-card-modern h-100">
                                {product.discount > 0 && (
                                    <span className="product-badge-modern">-{product.discount}%</span>
                                )}
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
                                        {product.discount > 0 && (
                                            <span className="old-price">{formatMoneyEGP(product.price)}</span>
                                        )}
                                    </div>
                                </div>
                            </article>
                        </div>
                    ))}
                </div>

                {products.length === 0 && (
                    <div className="na-empty">
                        <i className="bx bx-package" />
                        <p>لا توجد منتجات جديدة حالياً — تابعنا لمعرفة كل جديد!</p>
                    </div>
                )}

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                    <nav className="na-pagination" aria-label="التنقل بين الصفحات">
                        {currentPage > 1 && (
                            <Link
                                href={`/shop/new-arrivals?page=${currentPage - 1}`}
                                className="na-page-btn"
                            >
                                <i className="bx bx-right-arrow-alt" /> السابق
                            </Link>
                        )}
                        <div className="na-page-numbers">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(
                                    (p) =>
                                        p === 1 ||
                                        p === totalPages ||
                                        Math.abs(p - currentPage) <= 1,
                                )
                                .map((p, idx, arr) => (
                                    <span key={p}>
                                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                                            <span className="na-page-dots">…</span>
                                        )}
                                        <Link
                                            href={`/shop/new-arrivals?page=${p}`}
                                            className={`na-page-num ${p === currentPage ? "active" : ""}`}
                                        >
                                            {p}
                                        </Link>
                                    </span>
                                ))}
                        </div>
                        {currentPage < totalPages && (
                            <Link
                                href={`/shop/new-arrivals?page=${currentPage + 1}`}
                                className="na-page-btn"
                            >
                                التالي <i className="bx bx-left-arrow-alt" />
                            </Link>
                        )}
                    </nav>
                )}
            </div>
        </main>
    );
}
