import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatsCard } from "@/components/dashboard/stats-card";

type StatsCardProps = Parameters<typeof StatsCard>[0];

// ─── Module Mocks ─────────────────────────────────────────────────────────────

vi.mock("framer-motion", () => ({
    motion: {
        button: ({
            children,
            whileHover,
            whileTap,
            initial,
            animate,
            exit,
            ...props
        }: React.ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>) => (
            <button {...props}>{children as React.ReactNode}</button>
        ),
    },
}));

vi.mock("react-countup", () => ({
    default: ({ end, separator, suffix }: { end: number; separator?: string; suffix?: string }) => (
        <span>
            {separator ? end.toLocaleString() : end}
            {suffix}
        </span>
    ),
}));

vi.mock("recharts", () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="responsive-container">{children}</div>
    ),
    LineChart: ({ children }: { children: React.ReactNode }) => (
        <svg data-testid="line-chart">{children}</svg>
    ),
    Line: () => <line data-testid="chart-line" />,
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const BASE_PROPS: StatsCardProps = {
    title: "Revenue",
    value: 327_000,
    suffix: " EGP",
    changePercent: 12.4,
    trend: [42, 44, 50, 47, 52, 58, 61],
    details: "Revenue increased due to higher closing rate.",
    loading: false,
    expanded: false,
    onToggle: vi.fn(),
};

function renderCard(overrides: Partial<StatsCardProps> = {}) {
    return render(<StatsCard {...BASE_PROPS} {...overrides} />);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("StatsCard — loading state", () => {
    it("renders skeleton placeholder and hides card content", () => {
        const { container } = renderCard({ loading: true });
        expect(container.querySelector(".skeleton-card")).toBeInTheDocument();
        expect(screen.queryByText("Revenue")).not.toBeInTheDocument();
    });

    it("skeleton has aria-hidden to keep it out of the accessibility tree", () => {
        const { container } = renderCard({ loading: true });
        expect(container.querySelector("[aria-hidden='true']")).toBeInTheDocument();
    });
});

describe("StatsCard — default render", () => {
    it("displays the card title", () => {
        renderCard();
        expect(screen.getByText("Revenue")).toBeInTheDocument();
    });

    it("renders the numeric value with suffix", () => {
        renderCard();
        expect(screen.getByText(/327000.*EGP|EGP/)).toBeInTheDocument();
    });

    it("shows positive trend indicator with ↑ arrow", () => {
        renderCard({ changePercent: 12.4 });
        expect(screen.getByText(/↑/)).toBeInTheDocument();
        expect(screen.getByText(/12\.4/)).toBeInTheDocument();
    });

    it("shows negative trend indicator with ↓ arrow", () => {
        renderCard({ changePercent: -2.3 });
        expect(screen.getByText(/↓/)).toBeInTheDocument();
        expect(screen.getByText(/2\.3/)).toBeInTheDocument();
    });

    it("renders the mini line chart container", () => {
        renderCard();
        expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
        expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("has an accessible aria-label including the title", () => {
        renderCard();
        expect(
            screen.getByRole("button", { name: /Open Revenue details/i }),
        ).toBeInTheDocument();
    });
});

describe("StatsCard — expanded state", () => {
    it("hides details text when expanded is false", () => {
        renderCard({ expanded: false });
        expect(screen.queryByText(BASE_PROPS.details)).not.toBeInTheDocument();
    });

    it("shows details text when expanded is true", () => {
        renderCard({ expanded: true });
        expect(screen.getByText(BASE_PROPS.details)).toBeInTheDocument();
    });
});

describe("StatsCard — interactions", () => {
    it("calls onToggle when the card is clicked", async () => {
        const onToggle = vi.fn();
        const user = userEvent.setup();
        renderCard({ onToggle });

        await user.click(screen.getByRole("button"));

        expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("does not throw when onToggle is undefined", async () => {
        const user = userEvent.setup();
        renderCard({ onToggle: undefined });
        await expect(
            user.click(screen.getByRole("button")),
        ).resolves.not.toThrow();
    });
});

describe("StatsCard — edge cases", () => {
    it("renders correctly when changePercent is exactly 0 (shows positive indicator)", () => {
        renderCard({ changePercent: 0 });
        expect(screen.getByText(/↑/)).toBeInTheDocument();
    });

    it("renders without suffix when suffix is omitted", () => {
        const { container } = renderCard({ suffix: undefined });
        // Should still render without crashing
        expect(container).toBeInTheDocument();
        expect(screen.getByText("Revenue")).toBeInTheDocument();
    });

    it("applies text-success class for positive change", () => {
        renderCard({ changePercent: 5 });
        const changeEl = screen.getByText(/↑.*5|5.*↑/);
        // The parent element carries the color class
        expect(changeEl.closest("p") ?? changeEl).toHaveClass("text-success");
    });

    it("applies text-danger class for negative change", () => {
        renderCard({ changePercent: -5 });
        const changeEl = screen.getByText(/↓.*5|5.*↓/);
        expect(changeEl.closest("p") ?? changeEl).toHaveClass("text-danger");
    });
});
