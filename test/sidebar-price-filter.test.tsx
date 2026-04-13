/**
 * Unit tests for /components/shop/sidebar-price-filter.tsx
 *
 * Covers:
 *  - Initial render: inputs, presets, apply button
 *  - Active state: clear button + active badge visibility
 *  - Apply button → router.push called with correct URL params
 *  - Enter key → triggers navigation
 *  - Preset chips → navigate with preset values
 *  - Clear button → removes min/max from URL
 *  - "أقل من 500" preset → navigates with max only (min=0)
 *  - "أكثر من 8000" preset → navigates with min only (max=0)
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SidebarPriceFilter } from "@/components/shop/sidebar-price-filter";

// ── Navigation mocks ────────────────────────────────────────────────────────
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush }),
    useSearchParams: () => mockSearchParams,
}));

// ── Helpers ─────────────────────────────────────────────────────────────────
function renderFilter(min = 0, max = 0) {
    return render(<SidebarPriceFilter minPrice={min} maxPrice={max} />);
}

// ─── Tests ───────────────────────────────────────────────────────────────────
describe("SidebarPriceFilter — render", () => {
    beforeEach(() => mockPush.mockClear());

    it("renders min and max inputs", () => {
        renderFilter();
        expect(screen.getByLabelText("أقل سعر")).toBeInTheDocument();
        expect(screen.getByLabelText("أعلى سعر")).toBeInTheDocument();
    });

    it("renders the apply button", () => {
        renderFilter();
        expect(
            screen.getByRole("button", { name: /عرض النتائج/i })
        ).toBeInTheDocument();
    });

    it("renders all four preset chips", () => {
        renderFilter();
        expect(screen.getByText("أقل من 500")).toBeInTheDocument();
        expect(screen.getByText("500 – 2000")).toBeInTheDocument();
        expect(screen.getByText("2000 – 8000")).toBeInTheDocument();
        expect(screen.getByText("أكثر من 8000")).toBeInTheDocument();
    });

    it("renders the section header", () => {
        renderFilter();
        expect(screen.getByText("نطاق السعر")).toBeInTheDocument();
    });

    it("renders the quick-select label", () => {
        renderFilter();
        expect(screen.getByText("اختيار سريع")).toBeInTheDocument();
    });
});

describe("SidebarPriceFilter — active state", () => {
    beforeEach(() => mockPush.mockClear());

    it("hides clear button when no filter is active", () => {
        renderFilter(0, 0);
        expect(screen.queryByText(/مسح/)).not.toBeInTheDocument();
    });

    it("shows clear button when minPrice is set", () => {
        renderFilter(500, 0);
        expect(screen.getByText(/مسح/)).toBeInTheDocument();
    });

    it("shows clear button when maxPrice is set", () => {
        renderFilter(0, 2000);
        expect(screen.getByText(/مسح/)).toBeInTheDocument();
    });

    it("shows clear button when both prices are set", () => {
        renderFilter(500, 2000);
        expect(screen.getByText(/مسح/)).toBeInTheDocument();
    });

    it("pre-fills min input with active minPrice", () => {
        renderFilter(200, 0);
        const input = screen.getByLabelText("أقل سعر") as HTMLInputElement;
        expect(input.value).toBe("200");
    });

    it("pre-fills max input with active maxPrice", () => {
        renderFilter(0, 1500);
        const input = screen.getByLabelText("أعلى سعر") as HTMLInputElement;
        expect(input.value).toBe("1500");
    });
});

describe("SidebarPriceFilter — apply navigation", () => {
    beforeEach(() => mockPush.mockClear());

    it("calls router.push with min and max on apply click", () => {
        renderFilter();
        fireEvent.change(screen.getByLabelText("أقل سعر"), {
            target: { value: "100" },
        });
        fireEvent.change(screen.getByLabelText("أعلى سعر"), {
            target: { value: "900" },
        });
        fireEvent.click(screen.getByRole("button", { name: /عرض النتائج/i }));

        expect(mockPush).toHaveBeenCalledOnce();
        const url: string = mockPush.mock.calls[0][0];
        expect(url).toContain("min=100");
        expect(url).toContain("max=900");
    });

    it("omits min from URL when min input is empty", () => {
        renderFilter();
        fireEvent.change(screen.getByLabelText("أعلى سعر"), {
            target: { value: "500" },
        });
        fireEvent.click(screen.getByRole("button", { name: /عرض النتائج/i }));

        const url: string = mockPush.mock.calls[0][0];
        expect(url).not.toContain("min=");
        expect(url).toContain("max=500");
    });

    it("omits max from URL when max input is empty", () => {
        renderFilter();
        fireEvent.change(screen.getByLabelText("أقل سعر"), {
            target: { value: "300" },
        });
        fireEvent.click(screen.getByRole("button", { name: /عرض النتائج/i }));

        const url: string = mockPush.mock.calls[0][0];
        expect(url).toContain("min=300");
        expect(url).not.toContain("max=");
    });

    it("calls router.push on Enter key in min input", () => {
        renderFilter();
        fireEvent.change(screen.getByLabelText("أقل سعر"), {
            target: { value: "200" },
        });
        fireEvent.keyDown(screen.getByLabelText("أقل سعر"), { key: "Enter" });
        expect(mockPush).toHaveBeenCalledOnce();
    });

    it("calls router.push on Enter key in max input", () => {
        renderFilter();
        fireEvent.change(screen.getByLabelText("أعلى سعر"), {
            target: { value: "800" },
        });
        fireEvent.keyDown(screen.getByLabelText("أعلى سعر"), { key: "Enter" });
        expect(mockPush).toHaveBeenCalledOnce();
    });

    it("does NOT call router.push on non-Enter key", () => {
        renderFilter();
        fireEvent.keyDown(screen.getByLabelText("أقل سعر"), { key: "a" });
        expect(mockPush).not.toHaveBeenCalled();
    });

    it("navigates to /shop/products base URL", () => {
        renderFilter();
        fireEvent.click(screen.getByRole("button", { name: /عرض النتائج/i }));
        const url: string = mockPush.mock.calls[0][0];
        expect(url).toMatch(/^\/shop\/products/);
    });

    it("passes { scroll: false } option to router.push", () => {
        renderFilter();
        fireEvent.click(screen.getByRole("button", { name: /عرض النتائج/i }));
        const options = mockPush.mock.calls[0][1];
        expect(options).toEqual({ scroll: false });
    });
});

describe("SidebarPriceFilter — preset chips", () => {
    beforeEach(() => mockPush.mockClear());

    it("'500 – 2000' preset navigates with min=500&max=2000", () => {
        renderFilter();
        fireEvent.click(screen.getByText("500 – 2000"));
        const url: string = mockPush.mock.calls[0][0];
        expect(url).toContain("min=500");
        expect(url).toContain("max=2000");
    });

    it("'2000 – 8000' preset navigates with min=2000&max=8000", () => {
        renderFilter();
        fireEvent.click(screen.getByText("2000 – 8000"));
        const url: string = mockPush.mock.calls[0][0];
        expect(url).toContain("min=2000");
        expect(url).toContain("max=8000");
    });

    it("'أقل من 500' preset navigates with max=500 and no min", () => {
        renderFilter();
        fireEvent.click(screen.getByText("أقل من 500"));
        const url: string = mockPush.mock.calls[0][0];
        expect(url).toContain("max=500");
        expect(url).not.toContain("min=");
    });

    it("'أكثر من 8000' preset navigates with min=8000 and no max", () => {
        renderFilter();
        fireEvent.click(screen.getByText("أكثر من 8000"));
        const url: string = mockPush.mock.calls[0][0];
        expect(url).toContain("min=8000");
        expect(url).not.toContain("max=");
    });

    it("updates input values to match chosen preset", async () => {
        renderFilter();
        fireEvent.click(screen.getByText("500 – 2000"));
        await waitFor(() => {
            const minInput = screen.getByLabelText("أقل سعر") as HTMLInputElement;
            expect(minInput.value).toBe("500");
        });
    });
});

describe("SidebarPriceFilter — clear", () => {
    beforeEach(() => mockPush.mockClear());

    it("clear button removes min and max from URL", () => {
        renderFilter(500, 1000);
        fireEvent.click(screen.getByText(/مسح/));
        const url: string = mockPush.mock.calls[0][0];
        expect(url).not.toContain("min=");
        expect(url).not.toContain("max=");
    });

    it("clear button calls router.push exactly once", () => {
        renderFilter(200, 800);
        fireEvent.click(screen.getByText(/مسح/));
        expect(mockPush).toHaveBeenCalledOnce();
    });

    it("clears the input fields after clearing", async () => {
        renderFilter(300, 1500);
        fireEvent.click(screen.getByText(/مسح/));
        await waitFor(() => {
            const minInput = screen.getByLabelText("أقل سعر") as HTMLInputElement;
            const maxInput = screen.getByLabelText("أعلى سعر") as HTMLInputElement;
            expect(minInput.value).toBe("");
            expect(maxInput.value).toBe("");
        });
    });
});
