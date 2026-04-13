/**
 * Unit tests for /lib/store-utils.ts
 * Pure functions — no DOM or React needed.
 */
import { describe, it, expect } from "vitest";
import { formatMoneyEGP, formatStoreImage } from "@/lib/store-utils";

// ─── formatMoneyEGP ──────────────────────────────────────────────────────────

describe("formatMoneyEGP", () => {
    it("appends ج.م suffix", () => {
        expect(formatMoneyEGP(100)).toContain("ج.م");
    });

    it("rounds down correctly", () => {
        const a = formatMoneyEGP(99.4);
        const b = formatMoneyEGP(99);
        expect(a).toBe(b);
    });

    it("rounds up correctly", () => {
        const a = formatMoneyEGP(99.5);
        const b = formatMoneyEGP(100);
        expect(a).toBe(b);
    });

    it("handles zero", () => {
        const result = formatMoneyEGP(0);
        expect(result).toContain("ج.م");
    });

    it("handles large values", () => {
        const result = formatMoneyEGP(30000);
        expect(result).toContain("ج.م");
        // Should contain the number in some locale form
        expect(result.replace(/[^\d٠-٩]/g, "")).not.toBe("");
    });

    it("returns the same result for identical integer inputs", () => {
        expect(formatMoneyEGP(500)).toBe(formatMoneyEGP(500));
    });

    it("result length is sane (not empty string)", () => {
        expect(formatMoneyEGP(1000).length).toBeGreaterThan(3);
    });
});

// ─── formatStoreImage ─────────────────────────────────────────────────────────

describe("formatStoreImage", () => {
    const PLACEHOLDER = "/static/images/placeholder-product.svg";

    it("returns placeholder for undefined", () => {
        expect(formatStoreImage(undefined)).toBe(PLACEHOLDER);
    });

    it("returns placeholder for null", () => {
        expect(formatStoreImage(null)).toBe(PLACEHOLDER);
    });

    it("returns placeholder for empty string", () => {
        expect(formatStoreImage("")).toBe(PLACEHOLDER);
    });

    it("returns placeholder for whitespace-only string", () => {
        expect(formatStoreImage("   ")).toBe(PLACEHOLDER);
    });

    it("returns https URLs as-is", () => {
        const url = "https://example.com/product.jpg";
        expect(formatStoreImage(url)).toBe(url);
    });

    it("returns http URLs as-is", () => {
        const url = "http://cdn.example.com/img.png";
        expect(formatStoreImage(url)).toBe(url);
    });

    it("returns /api/flask/ prefixed paths as-is", () => {
        const path = "/api/flask/static/uploads/foo.jpg";
        expect(formatStoreImage(path)).toBe(path);
    });

    it("keeps /static/images/ paths unchanged", () => {
        const path = "/static/images/placeholder-product.svg";
        expect(formatStoreImage(path)).toBe(path);
    });

    it("proxies static/uploads/ paths through /api/flask/", () => {
        expect(formatStoreImage("static/uploads/foo.jpg")).toBe(
            "/api/flask/static/uploads/foo.jpg"
        );
    });

    it("proxies paths starting with uploads/ through /api/flask/", () => {
        expect(formatStoreImage("uploads/bar.jpg")).toBe(
            "/api/flask/uploads/bar.jpg"
        );
    });

    it("preserves leading slash for other absolute paths", () => {
        const result = formatStoreImage("/some/other/path.jpg");
        expect(result).toBe("/some/other/path.jpg");
    });

    it("adds leading slash for relative paths not matching uploads", () => {
        const result = formatStoreImage("images/product.jpg");
        expect(result).toMatch(/^\/images\/product\.jpg$/);
    });
});
