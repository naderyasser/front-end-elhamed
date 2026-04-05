"use client";

import { format } from "date-fns";

interface ActivityCell {
    date: string;
    value: number;
}

function levelClass(value: number) {
    if (value <= 0) return "bg-muted";
    if (value <= 1) return "bg-primary/25";
    if (value <= 3) return "bg-primary/50";
    return "bg-primary";
}

export default function ActivityGrid({ data }: { data: ActivityCell[] }) {
    return (
        <div className="glass-card rounded-xl p-4">
            <h3 className="font-heading text-lg text-foreground">Inquiry Activity Heatmap</h3>
            <p className="mb-3 text-xs text-muted-foreground">Daily inquiry volume over the past weeks</p>
            <div className="grid grid-cols-12 gap-1">
                {data.map((cell) => (
                    <div
                        key={cell.date}
                        className={`h-4 w-4 rounded-[4px] ${levelClass(cell.value)}`}
                        title={`${format(new Date(cell.date), "MMM dd")}: ${cell.value} inquiries`}
                    />
                ))}
            </div>
        </div>
    );
}
