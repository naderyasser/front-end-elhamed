import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationProvider, useNotifications } from "@/contexts/notification-context";
import { initialNotifications } from "@/lib/mock-data";

// ─── Test Helpers ────────────────────────────────────────────────────────────

function TestConsumer() {
    const { notifications, unreadCount, toasts, addNotification, markAllAsRead, dismissToast } =
        useNotifications();

    return (
        <div>
            <output data-testid="unread-count">{unreadCount}</output>
            <output data-testid="notifications-count">{notifications.length}</output>
            <output data-testid="toasts-count">{toasts.length}</output>
            <button
                onClick={() =>
                    addNotification({ type: "success", title: "Test Title", description: "Test Desc" })
                }
            >
                Add Notification
            </button>
            <button onClick={markAllAsRead}>Mark All Read</button>
            {toasts.map((t) => (
                <div key={t.id} data-testid="toast-item">
                    <span data-testid="toast-title">{t.title}</span>
                    <button
                        aria-label={`dismiss-toast-${t.id}`}
                        onClick={() => dismissToast(t.id)}
                    >
                        Dismiss
                    </button>
                </div>
            ))}
            {notifications.map((n) => (
                <div key={n.id} data-testid="notification-item" data-read={String(n.read)}>
                    {n.title}
                </div>
            ))}
        </div>
    );
}

function ThrowingConsumer() {
    useNotifications(); // must throw outside provider
    return null;
}

function renderWithProvider() {
    return render(
        <NotificationProvider>
            <TestConsumer />
        </NotificationProvider>,
    );
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("NotificationProvider — initial state", () => {
    it("loads initialNotifications from mock-data on mount", () => {
        renderWithProvider();
        expect(screen.getByTestId("notifications-count")).toHaveTextContent(
            String(initialNotifications.length),
        );
    });

    it("calculates unreadCount correctly from seeded data", () => {
        const expected = initialNotifications.filter((n) => !n.read).length;
        renderWithProvider();
        expect(screen.getByTestId("unread-count")).toHaveTextContent(String(expected));
    });

    it("starts with zero toasts", () => {
        renderWithProvider();
        expect(screen.getByTestId("toasts-count")).toHaveTextContent("0");
    });
});

describe("NotificationProvider — addNotification", () => {
    it("increments notification list and creates a toast", async () => {
        const user = userEvent.setup();
        renderWithProvider();
        const before = initialNotifications.length;

        await user.click(screen.getByText("Add Notification"));

        expect(screen.getByTestId("notifications-count")).toHaveTextContent(String(before + 1));
        expect(screen.getByTestId("toasts-count")).toHaveTextContent("1");
        expect(screen.getByTestId("toast-title")).toHaveTextContent("Test Title");
    });

    it("auto-dismisses toast after 4 200 ms", async () => {
        vi.useFakeTimers();
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderWithProvider();

        await user.click(screen.getByText("Add Notification"));
        expect(screen.getByTestId("toasts-count")).toHaveTextContent("1");

        act(() => vi.advanceTimersByTime(4_200));

        await waitFor(() =>
            expect(screen.getByTestId("toasts-count")).toHaveTextContent("0"),
        );

        vi.useRealTimers();
    });

    it("caps the notification list at 10 entries", async () => {
        const user = userEvent.setup();
        renderWithProvider();

        // Click 15 times — starting from initialNotifications.length items
        for (let i = 0; i < 15; i++) {
            await user.click(screen.getByText("Add Notification"));
        }

        const count = Number(screen.getByTestId("notifications-count").textContent);
        expect(count).toBeLessThanOrEqual(10);
    });

    it("prepends new notification so it appears first in the list", async () => {
        const user = userEvent.setup();
        renderWithProvider();

        await user.click(screen.getByText("Add Notification"));

        const items = screen.getAllByTestId("notification-item");
        expect(items[0]).toHaveTextContent("Test Title");
    });
});

describe("NotificationProvider — markAllAsRead", () => {
    it("sets unreadCount to zero", async () => {
        const user = userEvent.setup();
        renderWithProvider();

        await user.click(screen.getByText("Mark All Read"));

        expect(screen.getByTestId("unread-count")).toHaveTextContent("0");
    });

    it("marks every notification item as read", async () => {
        const user = userEvent.setup();
        renderWithProvider();

        await user.click(screen.getByText("Mark All Read"));

        const items = screen.getAllByTestId("notification-item");
        for (const item of items) {
            expect(item).toHaveAttribute("data-read", "true");
        }
    });
});

describe("NotificationProvider — dismissToast", () => {
    it("removes the targeted toast from the list", async () => {
        const user = userEvent.setup();
        renderWithProvider();

        await user.click(screen.getByText("Add Notification"));
        expect(screen.getByTestId("toasts-count")).toHaveTextContent("1");

        await user.click(screen.getByText("Dismiss"));

        expect(screen.getByTestId("toasts-count")).toHaveTextContent("0");
    });
});

describe("useNotifications — guard", () => {
    it("throws a descriptive error when used outside NotificationProvider", () => {
        const spy = vi.spyOn(console, "error").mockImplementation(() => {});
        expect(() => render(<ThrowingConsumer />)).toThrow(
            "useNotifications must be used inside NotificationProvider",
        );
        spy.mockRestore();
    });
});
