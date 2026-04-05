"use client";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="glass-card rounded-xl p-6 text-center">
            <h2 className="font-heading text-xl text-foreground">Something went wrong</h2>
            <p className="mt-2 text-sm text-muted-foreground">{error.message || "An unexpected error happened."}</p>
            <button
                aria-label="Retry dashboard loading"
                onClick={() => reset()}
                className="interactive ripple mt-4 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground"
                type="button"
            >
                Try again
            </button>
        </div>
    );
}
