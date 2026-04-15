import Link from "next/link";
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

type Props = {
    products: ApiProduct[];
};

export function FeaturedProducts({ products }: Props) {
    if (!products.length) return null;

    return (
        <section className="hp-featured" dir="rtl">
            <div className="container-fluid px-3 px-lg-4">
                <div className="hp-section-header">
                    <h2 className="hp-section-title">
                        <i className="bx bxs-crown" style={{ color: "#f59e0b" }} />
                        منتجات مميزة
                    </h2>
                    <Link href="/shop/products" className="hp-viewall-link">
                        تصفح المتجر <i className="bx bx-left-arrow-alt" />
                    </Link>
                </div>

                <div className="row g-3">
                    {products.slice(0, 8).map((product) => (
                        <div key={product.id} className="col-6 col-lg-3">
                            <article className="product-card-modern h-100">
                                {product.discount > 0 && (
                                    <span className="product-badge-modern">-{product.discount}%</span>
                                )}
                                <WishlistIconButton productId={product.id} />
                                <Link href={`/shop/products/${product.id}`} className="product-img-wrapper">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={formatStoreImage(product.image)}
                                        alt={product.name}
                                        loading="lazy"
                                    />
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

                <div className="text-center mt-4">
                    <Link href="/shop/products" className="hp-viewmore-btn">
                        <i className="bx bx-package" /> عرض المزيد من المنتجات
                    </Link>
                </div>
            </div>
        </section>
    );
}
