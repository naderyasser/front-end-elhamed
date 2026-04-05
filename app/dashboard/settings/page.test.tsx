import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsPage from "@/app/dashboard/settings/page";

const setThemeMock = vi.fn();
const addNotificationMock = vi.fn();

vi.mock("next-themes", () => ({
    useTheme: () => ({
        setTheme: setThemeMock,
        resolvedTheme: "light",
    }),
}));

vi.mock("@/contexts/notification-context", () => ({
    useNotifications: () => ({
        addNotification: addNotificationMock,
    }),
}));

describe("SettingsPage", () => {
    beforeEach(() => {
        setThemeMock.mockClear();
        addNotificationMock.mockClear();
    });

    it("switches theme when theme button is clicked", async () => {
        const user = userEvent.setup();
        render(<SettingsPage />);

        await user.click(screen.getByRole("button", { name: /set theme to dark/i }));
        expect(setThemeMock).toHaveBeenCalledWith("dark");
    });

    it("opens and cancels delete confirmation", async () => {
        const user = userEvent.setup();
        render(<SettingsPage />);

        await user.click(screen.getByRole("button", { name: /delete account/i }));
        expect(screen.getByText(/are you sure\?/i)).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /cancel account deletion/i }));
        expect(screen.queryByText(/are you sure\?/i)).not.toBeInTheDocument();
    });

    it("saves settings and sends notification", async () => {
        const user = userEvent.setup();
        render(<SettingsPage />);

        await user.click(screen.getByRole("button", { name: /save settings/i }));
        expect(screen.getByRole("button", { name: /save settings/i })).toHaveTextContent("Saving...");

        await waitFor(() => {
            expect(addNotificationMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: "success",
                    title: "Settings saved",
                }),
            );
        }, { timeout: 2500 });
    });
});
