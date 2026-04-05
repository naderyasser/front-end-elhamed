import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationToaster } from "@/components/ui/notification-toaster";

// ─── Module Mocks ─────────────────────────────────────────────────────────────

const mockDismissToast = vi.fn();
const mockToasts: { id: number; type: "info" | "success" | "warning"; title: string; description: string }[] = [];

vi.mock("@/contexts/notification-context", () => ({
    useNotifications: () => ({
        toasts: mockToasts,
        dismissToast: mockDismissToast,
    }),
}));

vi.mock("framer-motion", () => ({
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
        div: ({
            children,
            initial,
            animate,
            exit,
            ...props
        }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => (
            <div {...props}>{children as React.ReactNode}</div>
        ),
    },
}));

// lucide-react icons — render as accessible SVGs
vi.mock("lucide-react", () => ({
    CircleCheckBig: () => <svg data-testid="icon-success" />,
    TriangleAlert: () => <svg data-testid="icon-warning" />,
    Info: () => <svg data-testid="icon-info" />,
    X: () => <svg data-testid="icon-dismiss" />,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setToasts(toasts: typeof mockToasts) {
    mockToasts.splice(0, mockToasts.length, ...toasts);
}

function renderToaster() {
    return render(<NotificationToaster />);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
    setToasts([]);
    mockDismissToast.mockClear();
});

describe("NotificationToaster — empty state", () => {
    it("renders nothing visible when there are no toasts", () => {
        const { container } = renderToaster();
        // The fixed container is always in the DOM but holds no toast items
        expect(container.querySelectorAll("[class*='rounded-xl border']")).toHaveLength(0);
    });
});

describe("NotificationToaster — single toast rendering", () => {
    it("renders the toast title and description", () => {
        setToasts([{ id: 1, type: "success", title: "Saved!", description: "Changes persisted." }]);
        renderToaster();
        expect(screen.getByText("Saved!")).toBeInTheDocument();
        expect(screen.getByText("Changes persisted.")).toBeInTheDocument();
    });

    it("renders the success icon for a success toast", () => {
        setToasts([{ id: 1, type: "success", title: "OK", description: "" }]);
        renderToaster();
        expect(screen.getByTestId("icon-success")).toBeInTheDocument();
    });

    it("renders the warning icon for a warning toast", () => {
        setToasts([{ id: 2, type: "warning", title: "Slow", description: "" }]);
        renderToaster();
        expect(screen.getByTestId("icon-warning")).toBeInTheDocument();
    });

    it("renders the info icon for an info toast", () => {
        setToasts([{ id: 3, type: "info", title: "FYI", description: "" }]);
        renderToaster();
        expect(screen.getByTestId("icon-info")).toBeInTheDocument();
    });

    it("renders dismiss button with aria-label", () => {
        setToasts([{ id: 1, type: "info", title: "Note", description: "" }]);
        renderToaster();
        expect(screen.getByRole("button", { name: /dismiss toast/i })).toBeInTheDocument();
    });
});

describe("NotificationToaster — multiple toasts", () => {
    it("renders the correct number of toast items", () => {
        setToasts([
            { id: 1, type: "success", title: "A", description: "" },
            { id: 2, type: "warning", title: "B", description: "" },
            { id: 3, type: "info", title: "C", description: "" },
        ]);
        renderToaster();
        expect(screen.getAllByRole("button", { name: /dismiss toast/i })).toHaveLength(3);
    });
});

describe("NotificationToaster — dismiss interaction", () => {
    it("calls dismissToast with the correct toast id when dismiss is clicked", async () => {
        const user = userEvent.setup();
        setToasts([{ id: 42, type: "info", title: "Hello", description: "World" }]);
        renderToaster();

        await user.click(screen.getByRole("button", { name: /dismiss toast/i }));

        expect(mockDismissToast).toHaveBeenCalledWith(42);
        expect(mockDismissToast).toHaveBeenCalledTimes(1);
    });
});

describe("NotificationToaster — CSS tone classes", () => {
    it("applies success tone classes to success toast", () => {
        setToasts([{ id: 1, type: "success", title: "OK", description: "" }]);
        const { container } = renderToaster();
        const toast = container.querySelector(".border-success\\/30");
        expect(toast).toBeInTheDocument();
    });

    it("applies warning tone classes to warning toast", () => {
        setToasts([{ id: 2, type: "warning", title: "Warn", description: "" }]);
        const { container } = renderToaster();
        const toast = container.querySelector(".border-warning\\/30");
        expect(toast).toBeInTheDocument();
    });

    it("applies info tone classes to info toast", () => {
        setToasts([{ id: 3, type: "info", title: "Info", description: "" }]);
        const { container } = renderToaster();
        const toast = container.querySelector(".border-secondary\\/30");
        expect(toast).toBeInTheDocument();
    });
});
