"use client";

import { Funnel, FunnelChart as RechartsFunnelChart, LabelList, ResponsiveContainer, Tooltip } from "recharts";

interface FunnelItem {
    stage: string;
    value: number;
}

export default function FunnelChart({ data }: { data: FunnelItem[] }) {
    return (
        <div className="glass-card rounded-xl p-4">
            <h3 className="font-heading text-lg text-foreground">Conversion Funnel</h3>
            <p className="mb-3 text-xs text-muted-foreground">Visitors to clients journey</p>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsFunnelChart>
                        <Tooltip
                            contentStyle={{
                                borderRadius: 12,
                                border: "1px solid hsl(var(--border))",
                                background: "hsl(var(--card))",
                            }}
                        />
                        <Funnel dataKey="value" data={data} isAnimationActive fill="#0077B6">
                            <LabelList position="right" fill="#94a3b8" stroke="none" dataKey="stage" />
                        </Funnel>
                    </RechartsFunnelChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
