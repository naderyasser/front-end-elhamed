"use client";

import { Component, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div dir="rtl" style={{ textAlign: "center", padding: "2rem 1rem" }}>
                    <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>حدث خطأ غير متوقع</h3>
                    <p style={{ color: "#666", marginBottom: "1rem" }}>
                        {this.state.error?.message || "يرجى المحاولة مرة أخرى."}
                    </p>
                    <button
                        type="button"
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="btn btn-primary"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
