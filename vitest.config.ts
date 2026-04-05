import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        setupFiles: "./test/setup.ts",
        globals: true,
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            include: [
                "app/**/*.{ts,tsx}",
                "components/**/*.{ts,tsx}",
                "lib/**/*.{ts,tsx}",
                "contexts/**/*.{ts,tsx}",
            ],
            exclude: ["**/*.d.ts", "**/*.test.*", "**/node_modules/**"],
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "."),
        },
    },
});
