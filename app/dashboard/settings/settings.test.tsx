import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsPage from "@/app/dashboard/settings/page";

// ─── Module Mocks ─────────────────────────────────────────────────────────────

const mockSetTheme = vi.fn();
const mockAddNotification = vi.fn();

vi.mock("next-themes", () => ({
    useTheme: () => ({ setTheme: mockSetTheme, resolvedTheme: "light" }),
}));

vi.mock("@/contexts/notification-context", () => ({
    useNotifications: () => ({ addNotification: mockAddNotification }),
}));

vi.mock("lucide-react", () => ({
    Trash2: () => <svg data-testid="trash-icon" />,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderSettings() {
    return render(<SettingsPage />);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("SettingsPage — section rendering", () => {
    it("renders all four section headings", () => {
        renderSettings();
        expect(screen.getByText("Profile")).toBeInTheDocument();
        expect(screen.getByText("Notification Preferences")).toBeInTheDocument();
        expect(screen.getByText("Appearance")).toBeInTheDocument();
        expect(screen.getByText("Store and Business Info")).toBeInTheDocument();
    });

    it("renders the Danger Zone section heading", () => {
        renderSettings();
        expect(screen.getByText("Danger Zone")).toBeInTheDocument();
    });

    it("renders a Save changes button", () => {
        renderSettings();
        expect(screen.getByRole("button", { name: /save settings/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /save settings/i })).toHaveTextContent(
            "Save changes",
        );
    });
});

describe("SettingsPage — Profile section", () => {
    it("pre-fills Name input with default value", () => {
        renderSettings();
        expect(screen.getByDisplayValue("Admin User")).toBeInTheDocument();
    });

    it("pre-fills Email input with default value", () => {
        renderSettings();
        expect(screen.getByDisplayValue("admin@alhamed.app")).toBeInTheDocument();
    });

    it("pre-fills Timezone input", () => {
        renderSettings();
        expect(screen.getByDisplayValue("Africa/Cairo")).toBeInTheDocument();
    });

    it("updates Name input when user types", async () => {
        const user = userEvent.setup();
        renderSettings();
        const input = screen.getByDisplayValue("Admin User");

        await user.clear(input);
        await user.type(input, "New Name");

        expect(input).toHaveValue("New Name");
    });

    it("updates Email input when user types", async () => {
        const user = userEvent.setup();
        renderSettings();
        const input = screen.getByDisplayValue("admin@alhamed.app");

        await user.clear(input);
        await user.type(input, "new@email.com");

        expect(input).toHaveValue("new@email.com");
    });

    it("renders Upload avatar button", () => {
        renderSettings();
        expect(screen.getByRole("button", { name: /upload avatar/i })).toBeInTheDocument();
    });
});

describe("SettingsPage — Notification Preferences", () => {
    it("renders all six notification toggle buttons", () => {
        renderSettings();
        const toggleKeys = [
            "inquiryEmail",
            "inquiryPush",
            "inquiryInApp",
            "paymentEmail",
            "paymentPush",
            "paymentInApp",
        ];
        for (const key of toggleKeys) {
            expect(screen.getByRole("button", { name: new RegExp(`Toggle ${key}`, "i") })).toBeInTheDocument();
        }
    });

    it("toggles inquiryEmail preference on click", async () => {
        const user = userEvent.setup();
        renderSettings();
        const toggle = screen.getByRole("button", { name: /Toggle inquiryEmail/i });

        // Default is true → primary bg; after click should be false → muted bg
        expect(toggle).toHaveClass("bg-primary");
        await user.click(toggle);
        expect(toggle).toHaveClass("bg-muted");
    });

    it("toggles paymentPush preference (initially false) on click", async () => {
        const user = userEvent.setup();
        renderSettings();
        const toggle = screen.getByRole("button", { name: /Toggle paymentPush/i });

        // Default is false → muted bg
        expect(toggle).toHaveClass("bg-muted");
        await user.click(toggle);
        expect(toggle).toHaveClass("bg-primary");
    });
});

describe("SettingsPage — Appearance section", () => {
    it("renders light, dark, and system theme buttons", () => {
        renderSettings();
        expect(screen.getByRole("button", { name: /Set theme to light/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Set theme to dark/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Set theme to system/i })).toBeInTheDocument();
    });

    it("calls setTheme with 'dark' when the dark button is clicked", async () => {
        const user = userEvent.setup();
        renderSettings();
        await user.click(screen.getByRole("button", { name: /Set theme to dark/i }));
        expect(mockSetTheme).toHaveBeenCalledWith("dark");
    });

    it("calls setTheme with 'system' when the system button is clicked", async () => {
        const user = userEvent.setup();
        renderSettings();
        await user.click(screen.getByRole("button", { name: /Set theme to system/i }));
        expect(mockSetTheme).toHaveBeenCalledWith("system");
    });
});

describe("SettingsPage — Store and Business Info", () => {
    it("pre-fills Store name input", () => {
        renderSettings();
        expect(screen.getByDisplayValue("Alhamed")).toBeInTheDocument();
    });

    it("pre-fills Phone input", () => {
        renderSettings();
        expect(screen.getByDisplayValue("+20 100 000 0000")).toBeInTheDocument();
    });

    it("updates Address input when user types", async () => {
        const user = userEvent.setup();
        renderSettings();
        const input = screen.getByDisplayValue("Cairo, Egypt");
        await user.clear(input);
        await user.type(input, "Alexandria, Egypt");
        expect(input).toHaveValue("Alexandria, Egypt");
    });
});

describe("SettingsPage — Danger Zone", () => {
    it("shows Delete account button and hides confirmation by default", () => {
        renderSettings();
        expect(screen.getByRole("button", { name: /delete account/i })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /confirm account deletion/i })).not.toBeInTheDocument();
    });

    it("shows confirmation dialog after clicking Delete account", async () => {
        const user = userEvent.setup();
        renderSettings();

        await user.click(screen.getByRole("button", { name: /delete account/i }));

        expect(screen.getByText(/Are you sure\? This action cannot be undone\./i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /confirm account deletion/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /cancel account deletion/i })).toBeInTheDocument();
    });

    it("hides confirmation dialog after clicking Cancel", async () => {
        const user = userEvent.setup();
        renderSettings();

        await user.click(screen.getByRole("button", { name: /delete account/i }));
        await user.click(screen.getByRole("button", { name: /cancel account deletion/i }));

        expect(screen.queryByRole("button", { name: /confirm account deletion/i })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: /delete account/i })).toBeInTheDocument();
    });
});

describe("SettingsPage — Save flow", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        mockAddNotification.mockClear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("disables Save button and shows 'Saving...' while saving", async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderSettings();

        const saveBtn = screen.getByRole("button", { name: /save settings/i });
        await user.click(saveBtn);

        expect(saveBtn).toBeDisabled();
        expect(saveBtn).toHaveTextContent("Saving...");
    });

    it("re-enables Save button and fires success notification after save completes", async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        renderSettings();

        await user.click(screen.getByRole("button", { name: /save settings/i }));

        // Advance past the 900 ms simulated delay
        await vi.runAllTimersAsync();

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /save settings/i })).not.toBeDisabled();
            expect(screen.getByRole("button", { name: /save settings/i })).toHaveTextContent(
                "Save changes",
            );
        });

        expect(mockAddNotification).toHaveBeenCalledWith(
            expect.objectContaining({ type: "success", title: "Settings saved" }),
        );
    });
});
