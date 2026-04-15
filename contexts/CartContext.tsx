"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";

export type CartItem = {
    id: number;
    quantity: number;
    max_quantity?: number;
    line_total?: number;
    unit_price?: number;
    product: {
        id: number;
        name: string;
        image: string;
        price?: number;
        final_price?: number;
    };
};

export type CartResponse = {
    items: CartItem[];
    items_count: number;
    subtotal: number;
    total: number;
};

interface CartContextType {
    cart: CartResponse | null;
    isMounted: boolean;
    addToCart: (productId: number, quantity?: number) => Promise<void>;
    removeFromCart: (itemId: number) => Promise<void>;
    updateQuantity: (itemId: number, quantity: number) => Promise<void>;
    clearCart: () => void;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartResponse | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // H-02: Serialize cart mutations to prevent race conditions
    const opQueueRef = useRef<Promise<void>>(Promise.resolve());
    const enqueue = (op: () => Promise<void>): Promise<void> => {
        // Keep the queue alive even when op() throws, but propagate the error to the caller.
        const result = opQueueRef.current.then(() => op());
        opQueueRef.current = result.catch(() => { });
        return result;
    };

    // Initialize cart from localStorage on mount (to avoid hydration errors)
    useEffect(() => {
        setIsMounted(true);
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (error) {
                console.error("Failed to parse saved cart:", error);
                localStorage.removeItem("cart");
            }
        }
    }, []);

    // Sync cart to localStorage whenever it changes
    useEffect(() => {
        if (isMounted && cart) {
            localStorage.setItem("cart", JSON.stringify(cart));
        }
    }, [cart, isMounted]);

    // Fetch cart from API and sync with localStorage
    const refreshCart = async () => {
        try {
            const response = await fetch("/api/flask/api/frontend/cart", { cache: "no-store" });
            if (!response.ok) {
                throw new Error(`Cart fetch failed: ${response.status}`);
            }
            const data = await response.json();
            setCart(data);
            localStorage.setItem("cart", JSON.stringify(data));
        } catch (error) {
            console.error("Failed to refresh cart:", error);
        }
    };

    // Add item to cart
    const addToCart = async (productId: number, quantity: number = 1) => {
        // M-21: Optimistic update — bump count immediately
        setCart(prev => prev ? { ...prev, items_count: prev.items_count + quantity } : prev);
        return enqueue(async () => {
            const response = await fetch("/api/flask/api/frontend/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: quantity,
                }),
            });

            if (!response.ok) {
                throw new Error("فشلت عملية إضافة المنتج");
            }

            const data = await response.json();
            setCart(data);
            localStorage.setItem("cart", JSON.stringify(data));

            // Trigger cart-updated event for other components
            window.dispatchEvent(new Event("cart-updated"));
        });
    };

    // Remove item from cart
    const removeFromCart = async (itemId: number) => {
        // M-21: Optimistic update — remove item from local state immediately
        setCart(prev => {
            if (!prev) return prev;
            const item = prev.items.find(i => i.id === itemId);
            return {
                ...prev,
                items: prev.items.filter(i => i.id !== itemId),
                items_count: Math.max(0, prev.items_count - (item?.quantity ?? 1)),
            };
        });
        return enqueue(async () => {
            const response = await fetch(`/api/flask/api/frontend/cart/remove/${itemId}`, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("فشل حذف العنصر");
            }

            const data = await response.json();
            setCart(data);
            localStorage.setItem("cart", JSON.stringify(data));
        });
    };

    // Update item quantity
    const updateQuantity = async (itemId: number, quantity: number) => {
        return enqueue(async () => {
            const response = await fetch(`/api/flask/api/frontend/cart/update/${itemId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity }),
            });

            if (!response.ok) {
                throw new Error("فشل تحديث الكمية");
            }

            const data = await response.json();
            setCart(data);
            localStorage.setItem("cart", JSON.stringify(data));
        });
    };

    // Clear cart
    const clearCart = () => {
        setCart({
            items: [],
            items_count: 0,
            subtotal: 0,
            total: 0,
        });
        localStorage.setItem("cart", JSON.stringify({
            items: [],
            items_count: 0,
            subtotal: 0,
            total: 0,
        }));
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                isMounted,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                refreshCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
