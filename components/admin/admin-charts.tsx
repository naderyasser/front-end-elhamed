"use client";

/**
 * Client-only Chart.js wrapper.
 * Scales are registered SYNCHRONOUSLY at module load time,
 * so they are always ready before any chart component mounts.
 * Loaded via dynamic(..., { ssr: false }) — never runs on the server.
 */

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    type ChartData,
    type ChartOptions,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

// Synchronous registration — no race condition
// Filler is required for the 'fill' option in line charts
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface AdminChartsProps {
    type: "line" | "bar";
    data: ChartData<"line"> | ChartData<"bar">;
    options?: ChartOptions<"line"> | ChartOptions<"bar">;
}

export default function AdminCharts({ type, data, options }: AdminChartsProps) {
    if (type === "bar") {
        return <Bar data={data as ChartData<"bar">} options={options as ChartOptions<"bar">} />;
    }
    return <Line data={data as ChartData<"line">} options={options as ChartOptions<"line">} />;
}
