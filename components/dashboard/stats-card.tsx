"use client";

import CountUp from "react-countup";
import { motion } from "framer-motion";
import { Line, LineChart, ResponsiveContainer } from "recharts";

interface StatsCardProps {
    title: string;
    value: number;
    suffix?: string;
    changePercent: number;
    trend: number[];
    details: string;
    loading?: boolean;
    expanded?: boolean;
    onToggle?: () => void;
}

export function StatsCard({
    title,
    value,
    suffix,
    changePercent,
    trend,
    details,
    loading,
    expanded,
    onToggle,
}: StatsCardProps) {
    if (loading) {
        return <div className="skeleton-card h-[156px]" aria-hidden="true" />;
    }

    const isPositive = changePercent >= 0;
    const chartData = trend.map((point, index) => ({ index, value: point }));

    return (
        <motion.button
            aria-label={`Open ${title} details`}
            onClick={onToggle}
            whileHover={{ y: -2, scale: 1.01 }}
            className="glass-card interactive ripple w-full rounded-xl p-4 text-left"
            type="button"
        >
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
            <div className="mt-1 flex items-end justify-between gap-2">
                <p className="font-heading text-2xl text-foreground">
                    <CountUp end={value} duration={1.2} separator="," />
                    {suffix}
                </p>
                <p className={`text-xs font-medium ${isPositive ? "text-success" : "text-danger"}`}>
                    {isPositive ? "↑" : "↓"} {Math.abs(changePercent)}%
                </p>
            </div>

            <div className="mt-3 h-12 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={isPositive ? "#2A9D8F" : "#E63946"}
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {expanded && <p className="mt-2 text-xs text-muted-foreground">{details}</p>}
        </motion.button>
    );
}
