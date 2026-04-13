import Link from "next/link";
import { flaskServerJson } from "@/lib/flask-server";
import { formatStoreImage } from "@/lib/store-utils";

type CategoryNode = {
    id: number;
    name: string;
    name_en: string;
    slug: string | null;
    icon: string | null;
    image: string | null;
    description: string;
    product_count: number;
    children: CategoryNode[];
};

type CategoriesResponse = {
    tree: CategoryNode[];
};

export const revalidate = 120;

export const metadata = {
    title: "الأقسام | الحمد",
    description: "تصفح جميع أقسام متجر الحمد — إلكترونيات، أجهزة منزلية، أزياء وأكثر",
};

/* ── Boxicons mapped to common category keywords ── */
const ICON_MAP: Record<string, string> = {
    إلكترونيات: "bx bx-devices",
    أجهزة: "bx bx-desktop",
    منزل: "bx bx-home-alt",
    مطبخ: "bx bx-restaurant",
    أزياء: "bx bx-closet",
    ملابس: "bx bx-closet",
    رياضة: "bx bx-run",
    جمال: "bx bx-spa",
    عناية: "bx bx-spa",
    أطفال: "bx bx-baby-carriage",
    سيارات: "bx bx-car",
    كتب: "bx bx-book-open",
    هواتف: "bx bx-mobile-alt",
};

function resolveIcon(cat: CategoryNode): string {
    if (cat.icon) return `bx ${cat.icon}`;
    const name = cat.name.toLowerCase();
    for (const [keyword, icon] of Object.entries(ICON_MAP)) {
        if (name.includes(keyword)) return icon;
    }
    return "bx bx-category";
}

export default async function CategoriesPage() {
    const data = await flaskServerJson<CategoriesResponse>(
        "/api/categories/tree",
        { next: { revalidate: 120 } } as RequestInit,
    );
    const categories = data?.tree || [];

    return (
        <main className="categories-page" dir="rtl">
            <div className="container-fluid px-3 px-lg-4">
                {/* ── Header ── */}
                <div className="cat-page-header">
                    <div className="cat-page-header-text">
                        <h1>
                            <i className="bx bx-category" /> تصفح الأقسام
                        </h1>
                        <p>اكتشف منتجاتنا المصنفة بعناية — اختر القسم اللي يناسبك</p>
                    </div>
                    <div className="cat-page-breadcrumb">
                        <Link href="/shop">الرئيسية</Link>
                        <span>/</span>
                        <span>الأقسام</span>
                    </div>
                </div>

                {/* ── Categories Grid ── */}
                <div className="cat-page-grid">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/shop/products?category=${encodeURIComponent(cat.name)}`}
                            className="cat-page-card"
                        >
                            <div className="cat-page-card-visual">
                                {cat.image ? (
                                    <img
                                        src={formatStoreImage(cat.image)}
                                        alt={cat.name}
                                        className="cat-page-card-img"
                                    />
                                ) : (
                                    <div className="cat-page-card-icon-wrap">
                                        <i className={resolveIcon(cat)} />
                                    </div>
                                )}
                                <div className="cat-page-card-overlay" />
                            </div>
                            <div className="cat-page-card-body">
                                <h2 className="cat-page-card-title">{cat.name}</h2>
                                {cat.name_en && (
                                    <span className="cat-page-card-en">{cat.name_en}</span>
                                )}
                                <span className="cat-page-card-count">
                                    {cat.product_count} منتج
                                </span>
                                {cat.children.length > 0 && (
                                    <div className="cat-page-card-subs">
                                        {cat.children.slice(0, 3).map((sub) => (
                                            <span key={sub.id} className="cat-page-sub-tag">
                                                {sub.name}
                                            </span>
                                        ))}
                                        {cat.children.length > 3 && (
                                            <span className="cat-page-sub-tag cat-page-sub-more">
                                                +{cat.children.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="cat-page-card-arrow">
                                <i className="bx bx-left-arrow-alt" />
                            </div>
                        </Link>
                    ))}
                </div>

                {categories.length === 0 && (
                    <div className="cat-page-empty">
                        <i className="bx bx-category" />
                        <p>لا توجد أقسام متاحة حالياً</p>
                    </div>
                )}
            </div>
        </main>
    );
}
