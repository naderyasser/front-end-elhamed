import { POST } from "@/app/api/chat/route";

async function postMessage(message: string) {
    const request = new Request("http://localhost/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
    });

    const response = await POST(request);
    return response.json() as Promise<{ reply: string }>;
}

describe("POST /api/chat", () => {
    it("returns track response", async () => {
        const data = await postMessage("Track my order");
        expect(data.reply.toLowerCase()).toContain("order number");
    });

    it("returns pricing response", async () => {
        const data = await postMessage("pricing details");
        expect(data.reply.toLowerCase()).toContain("pricing");
    });

    it("returns support response", async () => {
        const data = await postMessage("contact support");
        expect(data.reply.toLowerCase()).toContain("support@alhamed.app");
    });

    it("returns default fallback response", async () => {
        const data = await postMessage("hello");
        expect(data.reply.toLowerCase()).toContain("specialist");
    });
});
