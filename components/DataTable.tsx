import Status, { adalahStatus } from "./Status";

const ISO = /^\d{4}-\d{2}-\d{2}T/;
const tanggal = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });
const judulKolom = (c: string) => (c === "_id" ? "id" : c.replace(/_/g, " "));

function Sel({ v }: { v: unknown }) {
    if (v == null) return <span className="text-muted">-</span>;
    if (adalahStatus(v)) return <Status s={v} />;
    if (typeof v === "number") return <>{v.toLocaleString("id-ID")}</>;
    if (typeof v === "boolean") return <>{v ? "ya" : "tidak"}</>;
    if (typeof v === "string" && ISO.test(v)) return <>{tanggal.format(new Date(v))}</>;
    if (Array.isArray(v) && v.every((x) => typeof x !== "object")) {
        return (
            <span className="flex flex-wrap gap-1">
                {v.map((x, i) => adalahStatus(x)
                    ? <Status key={i} s={x} />
                    : <span key={i} className="rounded-md bg-raised px-1.5 py-0.5 font-mono text-xs">{String(x)}</span>)}
            </span>
        );
    }
    if (typeof v === "object") return <code className="font-mono text-xs text-muted">{JSON.stringify(v)}</code>;
    return <>{String(v)}</>;
}

export default function DataTable({ rows }: { rows: Record<string, unknown>[] }) {
    if (!rows.length) {
        return <p className="rounded-lg border border-dashed border-line p-4 text-sm text-muted">Query berjalan, tetapi tidak ada baris atau dokumen yang cocok.</p>;
    }
    const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
    const angka = new Set(cols.filter((c) => rows.every((r) => r[c] == null || typeof r[c] === "number")));
    return (
        <div className="overflow-x-auto rounded-lg border border-line">
            <table className="w-full text-sm">
                <caption className="sr-only">{rows.length} baris hasil query</caption>
                <thead className="bg-raised">
                    <tr>
                        {cols.map((c) => (
                            <th key={c} scope="col" className={`whitespace-nowrap px-3 py-2 font-medium text-muted ${angka.has(c) ? "text-right" : "text-left"}`}>
                                {judulKolom(c)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-line">
                    {rows.map((r, i) => (
                        <tr key={i} className="hover:bg-raised/60">
                            {cols.map((c) => (
                                <td key={c} className={`px-3 py-2 align-top ${angka.has(c) ? "text-right tabular-nums" : ""}`}><Sel v={r[c]} /></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
