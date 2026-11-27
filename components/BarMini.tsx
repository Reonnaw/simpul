"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const rupiah = (v: unknown) => "Rp" + Number(v).toLocaleString("id-ID");

export default function BarMini({ data, x, y }: { data: Record<string, unknown>[]; x: string; y: string }) {
    return (
        <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ left: 8, right: 8 }}>
                    <CartesianGrid vertical={false} stroke="#e3dacd" />
                    <XAxis dataKey={x} stroke="#6b5e52" fontSize={12} tickLine={false} />
                    <YAxis stroke="#6b5e52" fontSize={12} tickLine={false} axisLine={false}
                        tickFormatter={(v) => (Number(v) / 1e6).toLocaleString("id-ID") + " jt"} />
                    <Tooltip
                        cursor={{ fill: "#f1ece4" }}
                        contentStyle={{ background: "#ffffff", border: "1px solid #e3dacd", borderRadius: 8, color: "#1f1a16" }}
                        formatter={rupiah}
                    />
                    <Bar dataKey={y} fill="#1f6f9e" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
