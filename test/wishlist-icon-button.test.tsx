/**
 * Unit tests for /components/shop/wishlist-icon-button.tsx
 *
 * Covers:
 *  - Initial render: unfilled heart, correct aria-label
 *  - Click → POST request sent to correct endpoint
 *  - Optimistic toggle: heart fills immediately
 *  - Second click → DELETE (toggle off)
 *  - Reverts on API failure (non-ok response)
 *  - Reverts on network error (fetch throws)
 *  - Disabled while loading (button disabled during fetch)
 *  - Spinner appears during load
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { WishlistIconButton } from "@/components/shop/wishlist-icon-button";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeOkFetch() {
    return vi.fn().mockResolvedValue({ ok: true });
}

function makeFailFetch() {
    return vi.fn().mockResolvedValue({ ok: false });
}

function makeThrowFetch() {
    return vi.fn().mockRejectedValue(new Error("network error"));
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("WishlistIconButton — initial render", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", makeOkFetch());
    });
    afterEach(() => vi.unstubAllGlobals());

    it("renders a button element", () => {
        render(<WishlistIconButton productId={1} />);
        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("button has aria-label 'إضافة للمفضلة' by default", () => {
        render(<WishlistIconButton productId={1} />);
        expect(
            screen.getByRole("button", { name: "إضافة للمفضلة" })
        ).toBeInTheDocument();
    });

    it("renders an unfilled heart icon by default", () => {
        const { container } = render(<WishlistIconButton productId={1} />);
        expect(container.querySelector(".bx-heart")).toBeTruthy();
        expect(container.querySelector(".bxs-heart")).toBeFalsy();
    });

    it("button is not disabled initially", () => {
        render(<WishlistIconButton productId={1} />);
        expect(screen.getByRole("button")).not.toBeDisabled();
    });
});

describe("WishlistIconButton — POST on first click", () => {
    // Never-resolving fetch: we only care the fetch was called correctly,
    // not about the resulting state update. Avoids act() warnings.
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => { })));
    });
    afterEach(() => vi.unstubAllGlobals());

    it("calls fetch with POST method", () => {
        render(<WishlistIconButton productId={42} />);
        fireEvent.click(screen.getByRole("button"));
        expect(fetch).toHaveBeenCalledWith(
            "/api/flask/api/wishlist/42",
            expect.objectContaining({ method: "POST" })
        );
    });

    it("uses correct product ID in URI", () => {
        render(<WishlistIconButton productId={99} />);
        fireEvent.click(screen.getByRole("button"));
        expect(fetch).toHaveBeenCalledWith(
            "/api/flask/api/wishlist/99",
            expect.anything()
        );
    });

    it("includes credentials: include", () => {
        render(<WishlistIconButton productId={1} />);
        fireEvent.click(screen.getByRole("button"));
        expect(fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ credentials: "include" })
        );
    });
});

describe("WishlistIconButton — optimistic toggle (success)", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", makeOkFetch());
    });
    afterEach(() => vi.unstubAllGlobals());

    it("immediately shows filled heart after click", async () => {
        const { container } = render(<WishlistIconButton productId={1} />);
        fireEvent.click(screen.getByRole("button"));
        // Optimistic update is synchronous before fetch resolves
        await waitFor(() => {
            expect(container.querySelector(".bxs-heart")).toBeTruthy();
        });
    });

    it("changes aria-label to 'إزالة من المفضلة' after adding", async () => {
        render(<WishlistIconButton productId={1} />);
        fireEvent.click(screen.getByRole("button"));
        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: "إزالة من المفضلة" })
            ).toBeInTheDocument();
        });
    });

    it("stays filled after successful API response", async () => {
        const { container } = render(<WishlistIconButton productId={1} />);
        fireEvent.click(screen.getByRole("button"));
        await waitFor(() => {
            expect(container.querySelector(".bxs-heart")).toBeTruthy();
        });
    });
});

describe("WishlistIconButton — DELETE on second click", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("sends DELETE on second click", async () => {
        vi.stubGlobal("fetch", makeOkFetch());
        render(<WishlistIconButton productId={5} />);

        // First click → POST; wait for fetch to resolve and button to re-enable
        fireEvent.click(screen.getByRole("button"));
        await waitFor(() =>
            expect(screen.getByRole("button")).not.toBeDisabled()
        );

        // Second click → DELETE
        fireEvent.click(screen.getByRole("button"));
        expect(fetch).toHaveBeenCalledWith(
            "/api/flask/api/wishlist/5",
            expect.objectContaining({ method: "DELETE" })
        );

        // Flush remaining state updates
        await act(async () => { });
    });
});

describe("WishlistIconButton — revert on API failure", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("reverts to unfilled heart when API returns ok=false", async () => {
        vi.stubGlobal("fetch", makeFailFetch());
        const { container } = render(<WishlistIconButton productId={1} />);
        fireEvent.click(screen.getByRole("button"));
        await waitFor(() => {
            expect(container.querySelector(".bx-heart")).toBeTruthy();
            expect(container.querySelector(".bxs-heart")).toBeFalsy();
        });
    });

    it("reverts to unfilled heart on network error (fetch throws)", async () => {
        vi.stubGlobal("fetch", makeThrowFetch());
        const { container } = render(<WishlistIconButton productId={1} />);
        fireEvent.click(screen.getByRole("button"));
        await waitFor(() => {
            expect(container.querySelector(".bx-heart")).toBeTruthy();
            expect(container.querySelector(".bxs-heart")).toBeFalsy();
        });
    });
});

describe("WishlistIconButton — loading state", () => {
    afterEach(() => vi.unstubAllGlobals());

    it("shows spinner during pending fetch", () => {
        // Never-resolving fetch to keep loading state indefinitely
        vi.stubGlobal(
            "fetch",
            vi.fn().mockReturnValue(new Promise(() => { }))
        );
        const { container } = render(<WishlistIconButton productId={1} />);
        fireEvent.click(screen.getByRole("button"));
        expect(container.querySelector(".spinner-border")).toBeTruthy();
    });

    it("disables button while loading", () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockReturnValue(new Promise(() => { }))
        );
        render(<WishlistIconButton productId={1} />);
        fireEvent.click(screen.getByRole("button"));
        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("does not fire duplicate fetch while already loading", () => {
        const mockFetch = vi.fn().mockReturnValue(new Promise(() => { }));
        vi.stubGlobal("fetch", mockFetch);
        render(<WishlistIconButton productId={1} />);
        fireEvent.click(screen.getByRole("button"));
        fireEvent.click(screen.getByRole("button")); // second click while loading
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });
});
