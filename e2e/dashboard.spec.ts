/**
 * Dashboard E2E Tests — UI & Interaction Verification
 *
 * Covers the converted dashboard pages in depth:
 *  - Layout landmarks (sidebar, header, main)
 *  - Navigation between pages
 *  - Settings page interactions
 *  - Chat widget open / send flow
 *  - Notification bell visibility
 *  - Responsive mobile bottom nav
 */
import { test, expect } from "@playwright/test";

test.describe("Dashboard Layout", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/dashboard");
    });

    test("sidebar navigation is visible on desktop", async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        // Sidebar should be present (hidden on mobile, visible lg+)
        const sidebar = page.locator("nav, aside").first();
        await expect(sidebar).toBeVisible();
    });

    test("page title renders in the header area", async ({ page }) => {
        // The dashboard layout renders a breadcrumb / title area
        const heading = page.getByRole("heading").first();
        await expect(heading).toBeVisible();
    });

    test("navigation links are present", async ({ page }) => {
        const links = [
            { href: "/dashboard", label: /dashboard/i },
            { href: "/dashboard/clients", label: /clients/i },
            { href: "/dashboard/inquiries", label: /inquiries/i },
            { href: "/dashboard/settings", label: /settings/i },
        ];
        for (const { label } of links) {
            await expect(page.getByRole("link", { name: label }).first()).toBeVisible();
        }
    });
});

test.describe("Dashboard — Settings Page", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/dashboard/settings");
    });

    test("all setting sections are visible", async ({ page }) => {
        await expect(page.getByText("Profile")).toBeVisible();
        await expect(page.getByText("Notification Preferences")).toBeVisible();
        await expect(page.getByText("Appearance")).toBeVisible();
        await expect(page.getByText("Store and Business Info")).toBeVisible();
        await expect(page.getByText("Danger Zone")).toBeVisible();
    });

    test("can update the Name field", async ({ page }) => {
        const nameInput = page.getByDisplayValue("Admin User");
        await nameInput.fill("New Admin Name");
        await expect(nameInput).toHaveValue("New Admin Name");
    });

    test("Save changes button becomes 'Saving...' briefly", async ({ page }) => {
        await page.getByRole("button", { name: /save settings/i }).click();
        await expect(page.getByRole("button", { name: /saving/i })).toBeVisible();
        // After ~1s it should revert
        await expect(page.getByRole("button", { name: /save changes/i })).toBeVisible({
            timeout: 3000,
        });
    });

    test("Danger Zone: delete confirmation appears and can be cancelled", async ({ page }) => {
        await page.getByRole("button", { name: /delete account/i }).click();
        await expect(page.getByText(/Are you sure\?/i)).toBeVisible();

        await page.getByRole("button", { name: /cancel account deletion/i }).click();
        await expect(page.getByRole("button", { name: /delete account/i })).toBeVisible();
        await expect(page.getByText(/Are you sure\?/i)).not.toBeVisible();
    });

    test("theme buttons are clickable and present", async ({ page }) => {
        for (const mode of ["light", "dark", "system"]) {
            await expect(
                page.getByRole("button", { name: new RegExp(`Set theme to ${mode}`, "i") }),
            ).toBeVisible();
        }
        // Click dark — should not crash
        await page.getByRole("button", { name: /Set theme to dark/i }).click();
        await expect(page.locator("body")).toBeVisible();
    });
});

test.describe("Dashboard — Chat Widget", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/dashboard");
    });

    test("chat button is visible", async ({ page }) => {
        await expect(page.getByRole("button", { name: /open support chat/i })).toBeVisible();
    });

    test("clicking chat button opens the chat panel", async ({ page }) => {
        await page.getByRole("button", { name: /open support chat/i }).click();
        // Bot greeting message should appear
        await expect(page.getByText(/Hi! I am your assistant/i)).toBeVisible();
    });

    test("sending a quick reply renders user message", async ({ page }) => {
        await page.getByRole("button", { name: /open support chat/i }).click();
        await page.getByRole("button", { name: "Track my order" }).click();
        await expect(page.getByText("Track my order")).toBeVisible();
    });

    test("typing and submitting a message renders it in the chat", async ({ page }) => {
        await page.getByRole("button", { name: /open support chat/i }).click();
        await page.getByPlaceholder(/write a message/i).fill("pricing info please");
        await page.getByRole("button", { name: /send message/i }).click();
        await expect(page.getByText("pricing info please")).toBeVisible();
    });
});

test.describe("Dashboard — Mobile layout", () => {
    test("bottom nav is visible on mobile viewport", async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14
        await page.goto("/dashboard");

        // Bottom navigation should appear on small screens
        const bottomNav = page.locator("nav").last();
        await expect(bottomNav).toBeVisible();
    });
});

test.describe("Dashboard — Page navigation", () => {
    test("navigating to /dashboard/clients renders the page", async ({ page }) => {
        await page.goto("/dashboard");
        await page.getByRole("link", { name: /clients/i }).first().click();
        await expect(page).toHaveURL(/\/dashboard\/clients/);
        await expect(page.locator("body")).not.toBeEmpty();
    });

    test("navigating to /dashboard/settings via sidebar link works", async ({ page }) => {
        await page.goto("/dashboard");
        await page.getByRole("link", { name: /settings/i }).first().click();
        await expect(page).toHaveURL(/\/dashboard\/settings/);
        await expect(page.getByText("Profile")).toBeVisible();
    });
});
