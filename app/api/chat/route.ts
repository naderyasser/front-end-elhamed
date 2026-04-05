import { NextResponse } from "next/server";

const responses: Record<string, string> = {
    track: "Please share your order number and I will check the latest shipping update.",
    pricing: "Our pricing depends on scope and timeline. I can share starter, growth, and premium options.",
    support: "You can reach support at support@alhamed.app or I can collect your issue here.",
    meeting: "Great. I can book a 30-minute discovery call for tomorrow. What time works for you?",
};

export async function POST(request: Request) {
    const body = (await request.json()) as { message?: string };
    const message = (body.message ?? "").toLowerCase();

    let reply = "Thanks for your message. A specialist will follow up shortly.";

    if (message.includes("track") || message.includes("order")) {
        reply = responses.track;
    } else if (message.includes("price") || message.includes("pricing")) {
        reply = responses.pricing;
    } else if (message.includes("support") || message.includes("contact")) {
        reply = responses.support;
    } else if (message.includes("meeting") || message.includes("book")) {
        reply = responses.meeting;
    }

    return NextResponse.json({ reply });
}
