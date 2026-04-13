import "server-only";

import { cookies } from "next/headers";

const BACKEND_BASE = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:1911";

export async function flaskServerJson<T>(path: string, init: RequestInit = {}): Promise<T | null> {
    const cookieStore = cookies();
    const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");

    const headers = new Headers(init.headers || {});
    headers.set("Accept", "application/json");
    if (cookieHeader) {
        headers.set("Cookie", cookieHeader);
    }

    try {
        const response = await fetch(`${BACKEND_BASE}${path}`, {
            ...init,
            headers,
            // Allow callers to pass { next: { revalidate: N } } for public/cacheable data.
            // Defaults to no-store for private/user-specific data.
            cache: init.cache ?? "no-store",
        });

        if (!response.ok) {
            return null;
        }

        return (await response.json()) as T;
    } catch (error) {
        console.error('Flask Server Unreachable:', error);
        return null;
    }
}
