export function formatStoreImage(imagePath?: string | null): string {
    if (!imagePath) return "/static/images/placeholder-product.svg";

    const value = String(imagePath).trim();
    if (!value) return "/static/images/placeholder-product.svg";

    if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
    }

    if (value.startsWith("/api/flask/")) {
        return value;
    }

    // Keep local static placeholders/images served by Next public/.
    if (value.startsWith("/static/images/")) {
        return value;
    }

    const normalized = value.startsWith("/") ? value.slice(1) : value;

    // Backend-uploaded files should be proxied through Next -> Flask.
    if (normalized.startsWith("static/uploads/") || normalized.startsWith("uploads/")) {
        return `/api/flask/${normalized}`;
    }

    if (value.startsWith("/")) {
        return value;
    }

    return `/${normalized}`;
}

export function formatMoneyEGP(value: number): string {
    return Math.round(value).toLocaleString("ar-EG") + " ج.م";
}
