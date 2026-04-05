import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatWidget } from "@/components/ui/chat-widget";

vi.mock("framer-motion", () => ({
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: {
        div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    },
}));

describe("ChatWidget", () => {
    it("opens chat and sends quick reply", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
            json: async () => ({ reply: "Bot answer from API" }),
        } as Response);

        render(<ChatWidget />);

        await user.click(screen.getByRole("button", { name: /open support chat/i }));
        await user.click(screen.getByRole("button", { name: "Track my order" }));

        expect(fetchMock).toHaveBeenCalledWith(
            "/api/chat",
            expect.objectContaining({ method: "POST" }),
        );

        await waitFor(() => {
            expect(screen.getByText("Bot answer from API")).toBeInTheDocument();
        });

        fetchMock.mockRestore();
    });

    it("shows fallback message when API fails", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network error"));

        render(<ChatWidget />);
        await user.click(screen.getByRole("button", { name: /open support chat/i }));

        await user.type(screen.getByPlaceholderText(/write a message/i), "Need help");
        await user.click(screen.getByRole("button", { name: /send message/i }));

        await waitFor(() => {
            expect(screen.getByText(/connection issue/i)).toBeInTheDocument();
        });

        fetchMock.mockRestore();
    });
});
