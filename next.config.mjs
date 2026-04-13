/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: "http", hostname: "localhost" },
            { protocol: "http", hostname: "127.0.0.1" },
            { protocol: "https", hostname: "alhamdshob.com" },
            { protocol: "https", hostname: "*.alhamdshob.com" },
        ],
    },
    async rewrites() {
        return [
            {
                source: "/api/flask/:path*",
                destination: `${process.env.BACKEND_URL || "http://127.0.0.1:1911"}/:path*`,
            },
        ];
    },
    async headers() {
        return [
            {
                // HTML pages: short-lived cache — stale is fine for a few seconds,
                // but browsers must revalidate to pick up live changes.
                source: "/((?!_next/static|_next/image|favicon.ico).*)",
                headers: [
                    { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
                ],
            },
            {
                // Hashed JS/CSS assets: cache forever (safe — filenames change on rebuild)
                source: "/_next/static/(.*)",
                headers: [
                    { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
                ],
            },
        ];
    },
};

export default nextConfig;
