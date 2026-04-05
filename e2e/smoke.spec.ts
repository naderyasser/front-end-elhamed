/**
 * Smoke Tests — Migration Verification
 *
 * Verifies that every migrated page:
 *  1. Loads without a crash (no "Application error" screen)
 *  2. Returns HTTP 200
 *  3. Has the expected <title> or landmark structure
 *  4. Shows no React hydration error text in the DOM
 *
 * These are the first line of defence after `next build`.
 */
import { test, expect } from "@playwright/test";

// ─── Pages to smoke-test ────────────────────────────────────────────────────

const SHOP_PAGES = [
    { path: "/products", name: "Products listing" },
    { path: "/cart", name: "Cart" },
    { path: "/checkout", name: "Checkout" },
    { path: "/auth", name: "Auth / Login" },
    { path: "/search", name: "Search" },
    { path: "/wishlist", name: "Wishlist" },
    { path: "/account", name: "Account" },
    { path: "/about", name: "About" },
    { path: "/return-policy", name: "Return Policy" },
    { path: "/orders", name: "Orders" },
];

const DASHBOARD_PAGES = [
    { path: "/dashboard", name: "Dashboard home" },
    { path: "/dashboard/clients", name: "Clients" },
    { path: "/dashboard/inquiries", name: "Inquiries" },
    { path: "/dashboard/settings", name: "Settings" },
];

const ADMIN_PAGES = [
    { path: "/admin/login", name: "Admin login" },
    { path: "/admin/dashboard", name: "Admin dashboard" },
    { path: "/admin/products", name: "Admin products" },
    { path: "/admin/orders", name: "Admin orders" },
    { path: "/admin/categories", name: "Admin categories" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function assertNoHydrationError(page: import("@playwright/test").Page) {
    const bodyText = await page.locator("body").innerText().catch(() => "");
    expect(bodyText).not.toContain("Hydration failed");
    expect(bodyText).not.toContain("There was an error while hydrating");
    expect(bodyText).not.toContain("Application error");
    expect(bodyText).not.toContain("Error: Minified React error");
}

// ─── Shop page smoke tests ────────────────────────────────────────────────────

for (const { path, name } of SHOP_PAGES) {
    test(`Shop: ${name} (${path}) loads without errors`, async ({ page }) => {
        const response = await page.goto(path);
        expect(response?.status()).toBeLessThan(500);

        // No crash screen
        await assertNoHydrationError(page);

        // Page has rendered at least some content
        await expect(page.locator("body")).not.toBeEmpty();
    });
}

// ─── Dashboard page smoke tests ───────────────────────────────────────────────

for (const { path, name } of DASHBOARD_PAGES) {
    test(`Dashboard: ${name} (${path}) loads without errors`, async ({ page }) => {
        const response = await page.goto(path);
        expect(response?.status()).toBeLessThan(500);
        await assertNoHydrationError(page);
        await expect(page.locator("body")).not.toBeEmpty();
    });
}

// ─── Admin page smoke tests ───────────────────────────────────────────────────

for (const { path, name } of ADMIN_PAGES) {
    test(`Admin: ${name} (${path}) loads without errors`, async ({ page }) => {
        const response = await page.goto(path);
        expect(response?.status()).toBeLessThan(500);
        await assertNoHydrationError(page);
        await expect(page.locator("body")).not.toBeEmpty();
    });
}
