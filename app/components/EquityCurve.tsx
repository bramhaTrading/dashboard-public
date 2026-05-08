"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import type { EquityPoint } from "@/lib/types";

export function EquityCurve({ data }: { data: EquityPoint[] }) {
  if (!data.length) return <div className="text-muted">No equity data yet.</div>;
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#222" strokeDasharray="3 3" />
        <XAxis dataKey="date" stroke="#999" fontSize={12} />
        <YAxis stroke="#999" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          contentStyle={{ background: "#1a1a1a", border: "1px solid #222", color: "#f5f5f5" }}
          formatter={(value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        />
        <Legend wrapperStyle={{ color: "#999" }} />
        <Line type="monotone" dataKey="equity" stroke="#34d399" name="Arya" dot={false} strokeWidth={2} />
        <Line type="monotone" dataKey="spy_equiv" stroke="#999" name="SPY" dot={false} strokeWidth={1.5} strokeDasharray="4 4" />
      </LineChart>
    </ResponsiveContainer>
  );
}
