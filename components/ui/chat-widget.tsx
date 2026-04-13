"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";

interface ChatMessage {
    id: number;
    text: string;
    sender: "user" | "bot";
    at: string;
}

const quickReplies = ["Track my order", "Pricing", "Contact support", "Book a meeting"];

export function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [typing, setTyping] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 1,
            text: "Hi! I am your assistant. How can I help today?",
            sender: "bot",
            at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
    ]);

    async function send(text: string) {
        const cleaned = text.trim();
        if (!cleaned) return;

        const userMsg: ChatMessage = {
            id: Date.now(),
            text: cleaned,
            sender: "user",
            at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setTyping(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: cleaned }),
            });
            const data = (await res.json()) as { reply: string };
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    text: data.reply,
                    sender: "bot",
                    at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    text: "Connection issue. Please try again in a moment.",
                    sender: "bot",
                    at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
            ]);
        } finally {
            setTyping(false);
        }
    }

    return (
        <div className="fixed bottom-4 right-4 z-[65]">
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 14, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        className="mb-3 h-[500px] w-[400px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card shadow-lg"
                    >
                        <div className="flex items-center justify-between border-b border-border p-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Support assistant</p>
                                    <p className="text-xs text-muted-foreground">Typically replies in under 1 minute</p>
                                </div>
                            </div>
                            <button
                                aria-label="Close chat"
                                onClick={() => setOpen(false)}
                                className="interactive ripple rounded-lg p-1 text-muted-foreground hover:bg-muted"
                                type="button"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex h-[calc(100%-132px)] flex-col overflow-auto p-3">
                            <div className="mb-3 flex flex-wrap gap-2">
                                {quickReplies.map((reply) => (
                                    <button
                                        key={reply}
                                        aria-label={reply}
                                        onClick={() => send(reply)}
                                        className="interactive ripple rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground"
                                        type="button"
                                    >
                                        {reply}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-2">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                                        <div
                                            className={`max-w-[84%] rounded-2xl px-3 py-2 text-sm ${msg.sender === "user"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "border border-border bg-muted text-foreground"
                                                }`}
                                        >
                                            <p>{msg.text}</p>
                                            <p className="mt-1 text-[10px] opacity-70">{msg.at}</p>
                                        </div>
                                    </div>
                                ))}
                                {typing && (
                                    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-2">
                                        <span className="typing-dot" />
                                        <span className="typing-dot" />
                                        <span className="typing-dot" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                void send(input);
                            }}
                            className="flex items-center gap-2 border-t border-border p-3"
                        >
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Write a message..."
                                className="w-full rounded-xl border border-border bg-muted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                            />
                            <button
                                aria-label="Send message"
                                className="interactive ripple inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
                                type="submit"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                aria-label="Open support chat"
                onClick={() => setOpen((prev) => !prev)}
                className="interactive ripple relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
                type="button"
            >
                <MessageCircle className="h-6 w-6" />
                {!open && <span className="chat-pulse" aria-hidden="true" />}
            </button>
        </div>
    );
}
