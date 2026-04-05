import { render, screen } from "@testing-library/react";
import { GlobalOverlays } from "@/components/ui/global-overlays";

const pathnameMock = vi.fn();

vi.mock("next/navigation", () => ({
    usePathname: () => pathnameMock(),
}));

vi.mock("@/components/ui/top-progress", () => ({
    TopProgress: () => <div data-testid="top-progress" />,
}));

vi.mock("@/components/ui/command-palette", () => ({
    CommandPalette: () => <div data-testid="command-palette" />,
}));

vi.mock("@/components/ui/chat-widget", () => ({
    ChatWidget: () => <div data-testid="chat-widget" />,
}));

vi.mock("@/components/ui/notification-toaster", () => ({
    NotificationToaster: () => <div data-testid="notification-toaster" />,
}));

describe("GlobalOverlays", () => {
    it("hides overlays on shop routes", () => {
        pathnameMock.mockReturnValue("/shop");
        render(<GlobalOverlays />);

        expect(screen.queryByTestId("top-progress")).not.toBeInTheDocument();
        expect(screen.queryByTestId("chat-widget")).not.toBeInTheDocument();
    });

    it("shows overlays on dashboard routes", () => {
        pathnameMock.mockReturnValue("/dashboard/settings");
        render(<GlobalOverlays />);

        expect(screen.getByTestId("top-progress")).toBeInTheDocument();
        expect(screen.getByTestId("command-palette")).toBeInTheDocument();
        expect(screen.getByTestId("notification-toaster")).toBeInTheDocument();
        expect(screen.getByTestId("chat-widget")).toBeInTheDocument();
    });
});
