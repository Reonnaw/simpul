"use client";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function BarMini({ data, x, y }: { data: Record<string, unknown>[]; x: string; y: string }) {
    return (
        <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis dataKey={x} stroke="#8FA3B3" fontSize={12} />
                    <YAxis stroke="#8FA3B3" fontSize={12} tickFormatter={(v) => (Number(v) / 1e6).toLocaleString("id-ID")
+ " jt"} />
                    <Tooltip
                        contentStyle={{ background: "#13222D", border: "1px solid #23394A" }}
                        formatter={(v) => "Rp" + Number(v).toLocaleString("id-ID")}
                    />
                    <Bar dataKey={y} fill="#2BB3A8" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}