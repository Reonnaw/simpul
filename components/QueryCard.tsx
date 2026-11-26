import DataTable from "./DataTable";

type Props = {
    title: string;
    materi: string;
    query: unknown; // teks SQL atau array pipeline
    rows?: Record<string, unknown>[];
    error?: string | null;
    note?: string;
    children?: React.ReactNode;
};

export function GagalQuery({ error }: { error: string }) {
    return (
        <p role="alert" className="rounded-lg border border-bad/50 bg-bad/10 p-3 text-sm">
            <b className="text-bad">Query gagal dijalankan.</b> Pesan dari database: <span className="font-mono text-xs">{error}</span>
        </p>
    );
}

export default function QueryCard({ title, materi, query, rows, error, note, children }: Props) {
    const text = typeof query === "string" ? query : JSON.stringify(query, null, 2);
    return (
        <section className="rounded-xl border border-line bg-surface">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
                <div className="min-w-0 space-y-1">
                    <h2 className="font-display text-lg font-semibold">{title}</h2>
                    {note && <p className="text-sm text-muted">{note}</p>}
                </div>
                <code className="max-w-full rounded-md bg-raised px-2 py-1 font-mono text-xs text-ice">{materi}</code>
            </header>
            <div className="space-y-4 p-4 sm:p-5">
                <details className="group">
                    <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg text-sm font-medium hover:text-fox [&::-webkit-details-marker]:hidden">
                        <span aria-hidden="true" className="transition-transform group-open:rotate-90">▸</span>
                        Lihat query
                    </summary>
                    <pre className="mt-2 max-h-96 overflow-auto rounded-lg border border-line bg-bg p-4 font-mono text-xs leading-relaxed">{text}</pre>
                </details>
                {children}
                {error ? <GagalQuery error={error} /> : rows && <DataTable rows={rows} />}
            </div>
        </section>
    );
}
