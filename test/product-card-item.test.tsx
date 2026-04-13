/**
 * Unit tests for /components/shop/product-card-item.tsx
 *
 * Covers:
 *  - Renders product name and category
 *  - Shows formatted final_price
 *  - Shows old strikethrough price + discount badge when discount > 0
 *  - Hides old price when discount = 0
 *  - Shows "اتصل للسعر" when final_price = 0
 *  - Shows "غير متوفر" when stock = 0
 *  - Links point to correct product URL
 *  - Brand is rendered when provided
 *  - Brand is omitted when empty string
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductCardItem } from "@/components/shop/product-card-item";

// Mock WishlistIconButton to isolate from fetch behaviour
vi.mock("@/components/shop/wishlist-icon-button", () => ({
    WishlistIconButton: () => null,
}));

// ── Factory ──────────────────────────────────────────────────────────────────

const BASE_PRODUCT = {
    id: 1,
    name: "كريم مرطب",
    image: "static/uploads/product.jpg",
    price: 200,
    discount: 0,
    final_price: 200,
    brand: "Nivea",
    category: "العناية بالبشرة",
    stock: 10,
};

function makeProduct(overrides: Partial<typeof BASE_PRODUCT> = {}) {
    return { ...BASE_PRODUCT, ...overrides };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("ProductCardItem — basic render", () => {
    it("renders the product name", () => {
        render(<ProductCardItem product={makeProduct()} />);
        expect(screen.getByText("كريم مرطب")).toBeInTheDocument();
    });

    it("renders the product category", () => {
        render(<ProductCardItem product={makeProduct()} />);
        expect(screen.getByText("العناية بالبشرة")).toBeInTheDocument();
    });

    it("renders the brand when provided", () => {
        render(<ProductCardItem product={makeProduct({ brand: "Garnier" })} />);
        expect(screen.getByText("Garnier")).toBeInTheDocument();
    });

    it("does not render brand element when brand is empty", () => {
        const { container } = render(
            <ProductCardItem product={makeProduct({ brand: "" })} />
        );
        // No .small.text-muted div for brand
        const brandEl = container.querySelector(".small.text-muted");
        expect(brandEl).toBeFalsy();
    });

    it("renders as an article element", () => {
        const { container } = render(<ProductCardItem product={makeProduct()} />);
        expect(container.querySelector("article")).toBeTruthy();
    });
});

describe("ProductCardItem — links", () => {
    it("product image links to /shop/products/:id", () => {
        render(<ProductCardItem product={makeProduct({ id: 7 })} />);
        const links = screen.getAllByRole("link");
        const hrefs = links.map((l) => l.getAttribute("href"));
        expect(hrefs).toContain("/shop/products/7");
    });

    it("product title links to /shop/products/:id", () => {
        render(<ProductCardItem product={makeProduct({ id: 12 })} />);
        const titleLink = screen.getByRole("link", { name: "كريم مرطب" });
        expect(titleLink.getAttribute("href")).toBe("/shop/products/12");
    });
});

describe("ProductCardItem — pricing (no discount)", () => {
    it("shows the final_price formatted with ج.م", () => {
        render(<ProductCardItem product={makeProduct({ final_price: 350 })} />);
        const priceEl = document.querySelector(".current-price");
        expect(priceEl?.textContent).toContain("ج.م");
    });

    it("does not render old-price element when discount is 0", () => {
        const { container } = render(
            <ProductCardItem product={makeProduct({ discount: 0, price: 200, final_price: 200 })} />
        );
        expect(container.querySelector(".old-price")).toBeFalsy();
    });

    it("does not render discount badge when discount is 0", () => {
        const { container } = render(
            <ProductCardItem product={makeProduct({ discount: 0 })} />
        );
        expect(container.querySelector(".product-badge-modern")).toBeFalsy();
    });
});

describe("ProductCardItem — pricing (with discount)", () => {
    const discountedProduct = makeProduct({
        price: 300,
        discount: 20,
        final_price: 240,
    });

    it("renders old (original) price", () => {
        const { container } = render(<ProductCardItem product={discountedProduct} />);
        expect(container.querySelector(".old-price")).toBeTruthy();
    });

    it("renders a discount badge with the percentage", () => {
        const { container } = render(<ProductCardItem product={discountedProduct} />);
        const badge = container.querySelector(".product-badge-modern");
        expect(badge).toBeTruthy();
        expect(badge?.textContent).toContain("20%");
    });

    it("badge shows negative sign before percentage", () => {
        const { container } = render(<ProductCardItem product={discountedProduct} />);
        const badge = container.querySelector(".product-badge-modern");
        expect(badge?.textContent).toMatch(/-20%/);
    });
});

describe("ProductCardItem — call for price", () => {
    it("shows 'اتصل للسعر' when final_price is 0", () => {
        render(
            <ProductCardItem
                product={makeProduct({ final_price: 0, price: 0 })}
            />
        );
        expect(screen.getByText(/اتصل للسعر/i)).toBeInTheDocument();
    });

    it("hides current-price element when final_price is 0", () => {
        const { container } = render(
            <ProductCardItem product={makeProduct({ final_price: 0 })} />
        );
        expect(container.querySelector(".current-price")).toBeFalsy();
    });
});

describe("ProductCardItem — stock status", () => {
    it("shows 'غير متوفر' badge when stock is 0", () => {
        render(<ProductCardItem product={makeProduct({ stock: 0 })} />);
        expect(screen.getByText("غير متوفر")).toBeInTheDocument();
    });

    it("does not show 'غير متوفر' when stock is positive", () => {
        render(<ProductCardItem product={makeProduct({ stock: 5 })} />);
        expect(screen.queryByText("غير متوفر")).not.toBeInTheDocument();
    });

    it("does not show 'غير متوفر' for high stock values", () => {
        render(<ProductCardItem product={makeProduct({ stock: 999 })} />);
        expect(screen.queryByText("غير متوفر")).not.toBeInTheDocument();
    });
});
