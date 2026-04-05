import React from "react";
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("next/link", () => ({
    default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
        React.createElement("a", { href: typeof href === "string" ? href : String(href), ...props }, children),
}));

vi.mock("next/image", () => ({
    default: ({ alt = "", ...props }: { alt?: string }) => React.createElement("img", { alt, ...props }),
}));

Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

class ResizeObserverMock {
    observe() { }
    unobserve() { }
    disconnect() { }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).ResizeObserver = ResizeObserverMock;
