"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { initialNotifications, type AppNotification, type NotificationType } from "@/lib/mock-data";

interface ToastItem {
    id: number;
    type: NotificationType;
    title: string;
    description: string;
}

interface NotificationContextValue {
    notifications: AppNotification[];
    unreadCount: number;
    toasts: ToastItem[];
    addNotification: (payload: {
        type: NotificationType;
        title: string;
        description: string;
    }) => void;
    markAllAsRead: () => void;
    dismissToast: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const addNotification = useCallback(
        (payload: { type: NotificationType; title: string; description: string }) => {
            const id = Date.now();
            const next: AppNotification = {
                id,
                type: payload.type,
                title: payload.title,
                description: payload.description,
                createdAt: new Date().toISOString(),
                read: false,
            };
            setNotifications((prev) => [next, ...prev].slice(0, 10));
            setToasts((prev) => [
                ...prev,
                { id, type: payload.type, title: payload.title, description: payload.description },
            ]);
            setTimeout(() => {
                setToasts((prev) => prev.filter((toast) => toast.id !== id));
            }, 4200);
        },
        []
    );

    const markAllAsRead = useCallback(() => {
        setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    }, []);

    const dismissToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const value = useMemo(
        () => ({
            notifications,
            unreadCount: notifications.filter((item) => !item.read).length,
            toasts,
            addNotification,
            markAllAsRead,
            dismissToast,
        }),
        [notifications, toasts, addNotification, markAllAsRead, dismissToast]
    );

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used inside NotificationProvider");
    }
    return context;
}
