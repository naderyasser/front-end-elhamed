/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: "http", hostname: "localhost" },
            { protocol: "https", hostname: "**" },
        ],
    },
    async rewrites() {
        return [
            {
                source: "/api/flask/:path*",
                destination: "http://localhost:1911/:path*",
            },
        ];
    },
    async headers() {
        return [
            {
                // HTML pages: never cache so stale action IDs never persist after a rebuild
                source: "/((?!_next/static|_next/image|favicon.ico).*)",
                headers: [
                    { key: "Cache-Control", value: "no-store, must-revalidate" },
                    { key: "Pragma",        value: "no-cache" },
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
