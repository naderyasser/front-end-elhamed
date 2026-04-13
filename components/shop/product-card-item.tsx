/**
 * L-30: Extracted product card sub-component from products/page.tsx
 * Reduces that file's size by extracting the repeating card template.
 */
import Link from "next/link";
import { formatMoneyEGP, formatStoreImage } from "@/lib/store-utils";
import { WishlistIconButton } from "@/components/shop/wishlist-icon-button";

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

export function ProductCardItem({ product }: { product: ApiProduct }) {
    const hasPrice = product.final_price > 0;

    return (
        <article className="product-card-modern h-100">
            {product.discount > 0 && (
                <span className="product-badge-modern">-{product.discount}%</span>
            )}
            <WishlistIconButton productId={product.id} />
            <Link href={`/shop/products/${product.id}`} className="product-img-wrapper">
                <img
                    src={formatStoreImage(product.image)}
                    alt={product.name}
                    loading="lazy"
                />
                <div className="product-overlay">
                    <Link href={`/shop/products/${product.id}`} className="overlay-btn add-cart-accent">
                        <i className="bx bx-show" /> عرض التفاصيل
                    </Link>
                    <Link href={`/shop/cart?add=${product.id}`} className="overlay-btn overlay-btn-cart" title="أضف للسلة">
                        <i className="bx bx-cart-add" />
                    </Link>
                </div>
            </Link>
            <div className="product-info-modern">
                <div className="product-cat">{product.category}</div>
                <h3 className="product-title-modern">
                    <Link href={`/shop/products/${product.id}`}>{product.name}</Link>
                </h3>
                {product.brand && (
                    <div className="small text-muted">{product.brand}</div>
                )}
                <div className="price-wrapper">
                    {hasPrice ? (
                        <>
                            <span className="current-price">{formatMoneyEGP(product.final_price)}</span>
                            {product.discount > 0 && (
                                <span className="old-price">{formatMoneyEGP(product.price)}</span>
                            )}
                        </>
                    ) : (
                        <span className="call-for-price">
                            <i className="bx bx-phone-call" /> اتصل للسعر
                        </span>
                    )}
                    {product.stock <= 0 && (
                        <span className="discount-pill">غير متوفر</span>
                    )}
                </div>
            </div>
        </article>
    );
}

