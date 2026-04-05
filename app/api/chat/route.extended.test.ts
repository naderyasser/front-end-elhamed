/**
 * Extended tests for POST /api/chat
 * Covers edge cases not addressed by route.test.ts
 */
import { POST } from "@/app/api/chat/route";

async function post(message: string): Promise<{ reply: string }> {
    const req = new Request("http://localhost/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
    });
    const res = await POST(req);
    return res.json() as Promise<{ reply: string }>;
}

describe("POST /api/chat — keyword matching", () => {
    it("returns meeting response when message contains 'meeting'", async () => {
        const data = await post("I'd like to book a meeting");
        expect(data.reply.toLowerCase()).toContain("book");
    });

    it("returns meeting response when message contains 'book'", async () => {
        const data = await post("book a slot");
        expect(data.reply.toLowerCase()).toContain("book");
    });

    it("returns track response for 'track' keyword", async () => {
        const data = await post("track my shipment");
        expect(data.reply.toLowerCase()).toContain("order number");
    });

    it("returns pricing response for 'price' keyword variant", async () => {
        const data = await post("what is the price?");
        expect(data.reply.toLowerCase()).toContain("pricing");
    });

    it("returns support response for 'contact' keyword", async () => {
        const data = await post("I want to contact someone");
        expect(data.reply.toLowerCase()).toContain("support@alhamed.app");
    });
});

describe("POST /api/chat — edge cases", () => {
    it("handles empty message with fallback reply", async () => {
        const data = await post("");
        expect(typeof data.reply).toBe("string");
        expect(data.reply.length).toBeGreaterThan(0);
    });

    it("is case-insensitive (uppercase ORDER)", async () => {
        const data = await post("TRACK MY ORDER");
        expect(data.reply.toLowerCase()).toContain("order number");
    });

    it("returns a reply field (never null or undefined)", async () => {
        const data = await post("random gibberish xyz");
        expect(data.reply).toBeDefined();
        expect(data.reply).not.toBeNull();
    });

    it("response body is valid JSON with a reply string", async () => {
        const req = new Request("http://localhost/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "hello" }),
        });
        const res = await POST(req);
        expect(res.status).toBe(200);
        const body = await res.json() as { reply: string };
        expect(typeof body.reply).toBe("string");
    });

    it("handles missing message key — treats as empty", async () => {
        const req = new Request("http://localhost/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });
        const res = await POST(req);
        const body = await res.json() as { reply: string };
        expect(typeof body.reply).toBe("string");
    });
});
