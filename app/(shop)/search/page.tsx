import Link from "next/link";
import { flaskServerJson } from "@/lib/flask-server";
import { formatMoneyEGP, formatStoreImage } from "@/lib/store-utils";

type SearchPageProps = {
    searchParams?: {
        q?: string;
    };
};

type SearchProduct = {
    id: number;
    name: string;
    category: string;
    image: string;
    final_price: number;
};

type SearchResponse = {
    products: SearchProduct[];
};

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const query = searchParams?.q?.trim() ?? "";
    const endpoint = query
        ? `/api/shop/products?search=${encodeURIComponent(query)}&per_page=24`
        : "/api/shop/products?per_page=24";
    const data = await flaskServerJson<SearchResponse>(endpoint);
    const results = data?.products || [];

    return (
        <section className="shop-page-shell" dir="rtl">
            <div className="container">
                <div className="shop-page-card">
                    <h1 className="mb-2" style={{ fontWeight: 800 }}>
                        نتائج البحث
                    </h1>
                    <p className="text-muted">
                        {query ? `نتائج البحث عن: ${query}` : "اكتب كلمة بحث لاكتشاف المنتجات"}
                    </p>

                    {results.length === 0 ? (
                        <div className="alert alert-warning">لا توجد نتائج مطابقة، جرّب كلمة بحث مختلفة.</div>
                    ) : (
                        <div className="row g-3 mt-1">
                            {results.map((product) => (
                                <div key={product.id} className="col-md-6 col-lg-4">
                                    <article className="shop-page-card h-100">
                                        <img
                                            src={formatStoreImage(product.image)}
                                            alt={product.name}
                                            className="w-100"
                                            style={{ height: 190, objectFit: "cover", borderRadius: 10 }}
                                        />
                                        <h5 className="mt-3">{product.name}</h5>
                                        <p className="text-muted mb-2">{product.category}</p>
                                        <strong>{formatMoneyEGP(product.final_price)}</strong>
                                        <div className="mt-3">
                                            <Link href={`/shop/products/${product.id}`} className="btn btn-outline-primary btn-sm">
                                                عرض التفاصيل
                                            </Link>
                                        </div>
                                    </article>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
