import nextConfig from "../next.config.mjs";

describe("next config rewrites", () => {
    it("proxies /api/flask/* to Flask backend", async () => {
        const rewrites = await nextConfig.rewrites?.();

        expect(rewrites).toContainEqual({
            source: "/api/flask/:path*",
            destination: "http://127.0.0.1:5000/:path*",
        });
    });
});
