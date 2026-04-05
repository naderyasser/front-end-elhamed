import Link from "next/link";

type ProductVariantsPageProps = {
    params: {
        id: string;
    };
};

export default function ProductVariantsPage({ params }: ProductVariantsPageProps) {
    const productId = encodeURIComponent(params.id);
    const legacyUrl = `/api/flask/admin/product/${productId}/variants`;

    return (
        <div className="space-y-4">
            <div className="admin-card p-4 md:p-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">إدارة متغيرات المنتج</h1>
                    <p className="text-sm text-gray-500 mt-1">إدارة الأحجام والألوان والأسعار والمخزون لكل متغير من صفحة Flask الأصلية.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href={`/admin/products/${productId}/edit`}
                        className="px-4 py-2 rounded-xl bg-white border border-[#cfd8dc] text-gray-300 hover:border-[#0071ce]"
                    >
                        العودة لتعديل المنتج
                    </Link>
                    <a
                        href={legacyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl btn-accent"
                    >
                        فتح الصفحة في تبويب جديد
                    </a>
                </div>
            </div>

            <div className="admin-card p-0 overflow-hidden" style={{ minHeight: "78vh" }}>
                <iframe
                    src={legacyUrl}
                    title="إدارة متغيرات المنتج"
                    className="w-full border-0"
                    style={{ minHeight: "78vh", background: "#fff" }}
                />
            </div>
        </div>
    );
}
