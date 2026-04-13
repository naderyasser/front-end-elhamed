import Link from "next/link";
import { flaskServerJson } from "@/lib/flask-server";
import { formatMoneyEGP, formatStoreImage } from "@/lib/store-utils";
import { WishlistRemoveButton } from "@/components/shop/wishlist-remove-button";

type WishlistProduct = {
    id: number;
    name: string;
    category: string;
    final_price: number;
    image: string;
    in_stock: boolean;
};

type WishlistResponse = {
    products: WishlistProduct[];
};

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
    const data = await flaskServerJson<WishlistResponse>("/api/frontend/wishlist");
    const items = data?.products || [];

    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container">
                <div className="shop-page-card">
                    <h1 className="mb-3" style={{ fontWeight: 800 }}>
                        المفضلة
                    </h1>
                    {items.length === 0 ? (
                        <div className="alert alert-info mb-0">المفضلة فارغة حاليا.</div>
                    ) : (
                        <div className="row g-3">
                            {items.map((product) => (
                                <div key={product.id} className="col-md-6 col-lg-4">
                                    <div className="shop-page-card h-100">
                                        <img src={formatStoreImage(product.image)} alt={product.name} className="w-100" style={{ height: 200, borderRadius: 10, objectFit: "cover" }} />
                                        <h5 className="mt-3">{product.name}</h5>
                                        <p className="text-muted">{product.category}</p>
                                        <strong>{formatMoneyEGP(product.final_price)}</strong>
                                        {!product.in_stock ? <div className="small text-danger mt-1">غير متوفر حاليا</div> : null}
                                        <div className="d-flex gap-2 mt-3 flex-wrap">
                                            <Link href={`/shop/products/${product.id}`} className="btn btn-primary btn-sm">
                                                عرض المنتج
                                            </Link>
                                            <WishlistRemoveButton productId={product.id} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
