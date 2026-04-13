"use client";

// Phone loaded from Next.js public env (set NEXT_PUBLIC_STORE_PHONE in .env)
const STORE_PHONE = process.env.NEXT_PUBLIC_STORE_PHONE || "201050188516";

export function BuyNowButton({
    productId,
    productName,
    inStock,
}: {
    productId: number;
    productName: string;
    inStock: boolean;
}) {
    const handleBuyNow = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!inStock) return;

        const productUrl = `${window.location.origin}/shop/products/${productId}`;
        const message = [
            "مرحباً، أريد شراء هذا المنتج:",
            `📦 ${productName}`,
            `🔗 ${productUrl}`,
            "",
            "هل هذا المنتج متوفر حالياً؟ وكم سعره؟",
        ].join("\n");

        const waUrl = `https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, "_blank", "noopener,noreferrer");
    };

    return (
        <button
            onClick={handleBuyNow}
            className="btn btn-success"
            disabled={!inStock}
        >
            <i className="bx bxl-whatsapp" /> اشتري الآن
        </button>
    );
}
