"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const rupiah = (v: unknown) => "Rp" + Number(v).toLocaleString("id-ID");

export default function BarMini({ data, x, y }: { data: Record<string, unknown>[]; x: string; y: string }) {
    return (
        <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ left: 8, right: 8 }}>
                    <CartesianGrid vertical={false} stroke="#3a322c" />
                    <XAxis dataKey={x} stroke="#b3a595" fontSize={12} tickLine={false} />
                    <YAxis stroke="#b3a595" fontSize={12} tickLine={false} axisLine={false}
                        tickFormatter={(v) => (Number(v) / 1e6).toLocaleString("id-ID") + " jt"} />
                    <Tooltip
                        cursor={{ fill: "#27221e" }}
                        contentStyle={{ background: "#1d1916", border: "1px solid #3a322c", borderRadius: 8, color: "#f2e8da" }}
                        formatter={rupiah}
                    />
                    <Bar dataKey={y} fill="#8cc8e6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
