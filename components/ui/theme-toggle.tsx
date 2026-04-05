"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    return (
        <button
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="interactive ripple inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm"
            type="button"
        >
            <span className="relative flex h-5 w-5 items-center justify-center">
                <Sun
                    className={`absolute h-5 w-5 transition-all duration-300 ${isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
                        }`}
                />
                <Moon
                    className={`absolute h-5 w-5 transition-all duration-300 ${isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
                        }`}
                />
            </span>
        </button>
    );
}
