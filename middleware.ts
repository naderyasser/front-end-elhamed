import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const STOREFRONT_HOSTS = new Set([
    "alhamdshob.com",
    "www.alhamdshob.com",
    "xn--mgbfgfkj8kdg.com",
    "www.xn--mgbfgfkj8kdg.com",
]);

function getHostname(hostHeader: string | null): string {
    if (!hostHeader) return "";
    return hostHeader.split(":")[0].toLowerCase();
}

export function middleware(request: NextRequest) {
    const hostname = getHostname(request.headers.get("host"));

    if (!STOREFRONT_HOSTS.has(hostname)) {
        return NextResponse.next();
    }

    const redirectUrl = new URL("/admin/dashboard", request.url);
    return NextResponse.redirect(redirectUrl);
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
