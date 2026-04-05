"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Trash2 } from "lucide-react";
import { useNotifications } from "@/contexts/notification-context";

interface NotificationPrefs {
    inquiryEmail: boolean;
    inquiryPush: boolean;
    inquiryInApp: boolean;
    paymentEmail: boolean;
    paymentPush: boolean;
    paymentInApp: boolean;
}

export default function SettingsPage() {
    const { setTheme, resolvedTheme } = useTheme();
    const { addNotification } = useNotifications();

    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    const [profile, setProfile] = useState({
        name: "Admin User",
        email: "admin@alhamed.app",
        bio: "Operating ecommerce + service flows.",
        timezone: "Africa/Cairo",
    });

    const [business, setBusiness] = useState({
        storeName: "Alhamed",
        phone: "+20 100 000 0000",
        address: "Cairo, Egypt",
    });

    const [prefs, setPrefs] = useState<NotificationPrefs>({
        inquiryEmail: true,
        inquiryPush: true,
        inquiryInApp: true,
        paymentEmail: true,
        paymentPush: false,
        paymentInApp: true,
    });

    async function saveSettings() {
        setSaving(true);
        await new Promise((resolve) => setTimeout(resolve, 900));
        setSaving(false);
        addNotification({
            type: "success",
            title: "Settings saved",
            description: "Your changes were saved successfully.",
        });
    }

    return (
        <div className="space-y-4">
            <section className="glass-card rounded-xl p-4">
                <h2 className="font-heading text-lg text-foreground">Profile</h2>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-border p-3">
                        <p className="mb-1 text-xs uppercase text-muted-foreground">Avatar</p>
                        <div className="flex items-center gap-3">
                            <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                                AU
                            </div>
                            <button
                                aria-label="Upload avatar"
                                className="interactive ripple rounded-lg border border-border px-3 py-1.5 text-sm"
                                type="button"
                            >
                                Upload avatar
                            </button>
                        </div>
                    </div>
                    <label className="grid gap-1 text-sm">
                        Name
                        <input
                            value={profile.name}
                            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                            className="rounded-xl border border-border bg-muted px-3 py-2"
                        />
                    </label>
                    <label className="grid gap-1 text-sm">
                        Email
                        <input
                            value={profile.email}
                            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                            className="rounded-xl border border-border bg-muted px-3 py-2"
                        />
                    </label>
                    <label className="grid gap-1 text-sm">
                        Timezone
                        <input
                            value={profile.timezone}
                            onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))}
                            className="rounded-xl border border-border bg-muted px-3 py-2"
                        />
                    </label>
                    <label className="grid gap-1 text-sm md:col-span-2">
                        Bio
                        <textarea
                            value={profile.bio}
                            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                            rows={3}
                            className="rounded-xl border border-border bg-muted px-3 py-2"
                        />
                    </label>
                </div>
            </section>

            <section className="glass-card rounded-xl p-4">
                <h2 className="font-heading text-lg text-foreground">Notification Preferences</h2>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {Object.entries(prefs).map(([key, value]) => (
                        <label key={key} className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
                            <span>{key}</span>
                            <button
                                aria-label={`Toggle ${key}`}
                                onClick={() => setPrefs((prev) => ({ ...prev, [key]: !value }))}
                                className={`interactive ripple relative inline-flex h-6 w-11 items-center rounded-full transition ${value ? "bg-primary" : "bg-muted"}`}
                                type="button"
                            >
                                <span
                                    className={`h-5 w-5 rounded-full bg-white transition ${value ? "translate-x-5" : "translate-x-0.5"}`}
                                />
                            </button>
                        </label>
                    ))}
                </div>
            </section>

            <section className="glass-card rounded-xl p-4">
                <h2 className="font-heading text-lg text-foreground">Appearance</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                    {(["light", "dark", "system"] as const).map((mode) => (
                        <button
                            key={mode}
                            aria-label={`Set theme to ${mode}`}
                            onClick={() => setTheme(mode)}
                            className={`interactive ripple rounded-xl border px-3 py-2 text-sm ${(resolvedTheme === "dark" && mode === "dark") ||
                                    (resolvedTheme === "light" && mode === "light") ||
                                    mode === "system"
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border"
                                }`}
                            type="button"
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </section>

            <section className="glass-card rounded-xl p-4">
                <h2 className="font-heading text-lg text-foreground">Store and Business Info</h2>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <label className="grid gap-1 text-sm">
                        Store name
                        <input
                            value={business.storeName}
                            onChange={(e) => setBusiness((b) => ({ ...b, storeName: e.target.value }))}
                            className="rounded-xl border border-border bg-muted px-3 py-2"
                        />
                    </label>
                    <label className="grid gap-1 text-sm">
                        Phone
                        <input
                            value={business.phone}
                            onChange={(e) => setBusiness((b) => ({ ...b, phone: e.target.value }))}
                            className="rounded-xl border border-border bg-muted px-3 py-2"
                        />
                    </label>
                    <label className="grid gap-1 text-sm md:col-span-2">
                        Address
                        <input
                            value={business.address}
                            onChange={(e) => setBusiness((b) => ({ ...b, address: e.target.value }))}
                            className="rounded-xl border border-border bg-muted px-3 py-2"
                        />
                    </label>
                </div>
            </section>

            <section className="glass-card rounded-xl border-danger/30 p-4">
                <h2 className="font-heading text-lg text-danger">Danger Zone</h2>
                <p className="mt-1 text-sm text-muted-foreground">Deleting account is permanent and cannot be undone.</p>
                {!deleteConfirm ? (
                    <button
                        aria-label="Delete account"
                        onClick={() => setDeleteConfirm(true)}
                        className="interactive ripple mt-3 inline-flex items-center gap-2 rounded-xl border border-danger/40 px-3 py-2 text-sm text-danger"
                        type="button"
                    >
                        <Trash2 className="h-4 w-4" /> Delete account
                    </button>
                ) : (
                    <div className="mt-3 rounded-xl border border-danger/40 bg-danger/10 p-3">
                        <p className="text-sm text-danger">Are you sure? This action cannot be undone.</p>
                        <div className="mt-2 flex gap-2">
                            <button
                                aria-label="Confirm account deletion"
                                className="interactive ripple rounded-lg bg-danger px-3 py-1.5 text-sm text-white"
                                type="button"
                            >
                                Confirm delete
                            </button>
                            <button
                                aria-label="Cancel account deletion"
                                onClick={() => setDeleteConfirm(false)}
                                className="interactive ripple rounded-lg border border-border px-3 py-1.5 text-sm"
                                type="button"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </section>

            <div className="flex justify-end">
                <button
                    aria-label="Save settings"
                    onClick={saveSettings}
                    className="interactive ripple rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground"
                    type="button"
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save changes"}
                </button>
            </div>
        </div>
    );
}
