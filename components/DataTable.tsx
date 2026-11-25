export default function DataTable({ rows }: { rows: Record<string, unknown>[] }) {
    if (!rows.length) return <p className="text-sm text-muted">(tidak ada baris)</p>;
    const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
    const tampil = (v: unknown) => (v == null ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v));
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr>{cols.map((c) => <th key={c} className="border-b border-line px-2 py-1 text-left font-medium text-muted">{c}</th>)}</tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i} className="odd:bg-bg/40">
                            {cols.map((c) => <td key={c} className="px-2 py-1 align-top">{tampil(r[c])}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}