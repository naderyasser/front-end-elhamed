import type { ReactNode } from "react";

interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: ReactNode;
}

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
    return (
        <div className="glass-card rounded-xl p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {icon ?? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                            d="M4 7h16M6 7v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7M9 11h6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </div>
            <h3 className="font-heading text-xl text-foreground">{title}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
            {actionLabel && onAction && (
                <button
                    aria-label={actionLabel}
                    onClick={onAction}
                    className="interactive ripple mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
