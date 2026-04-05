import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration for the Alhamed Next.js migration.
 * Run against a locally running dev server: `npm run dev`
 *
 * Quick start:
 *   npx playwright install --with-deps
 *   npx playwright test
 */
export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,

    reporter: [
        ["list"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
    ],

    use: {
        baseURL: "http://localhost:3000",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
    },

    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
        },
        {
            name: "mobile-safari",
            use: { ...devices["iPhone 13"] },
        },
    ],

    /* Automatically start the dev server before running tests */
    webServer: {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
