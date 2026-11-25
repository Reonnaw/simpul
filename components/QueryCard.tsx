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

export default function QueryCard({ title, materi, query, rows, error, note, children }: Props) {
    const text = typeof query === "string" ? query : JSON.stringify(query, null, 2);
    return (
        <section className="space-y-3 rounded-xl border border-line bg-surface p-4">
            <header className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-semibold">{title}</h2>
                <span className="rounded-full border border-primary/40 px-2 py-0.5 text-xs text-primary">{materi} </span>
            </header>

            {note && <p className="text-sm text-muted">{note}</p>}
            <details>
                <summary className="cursor-pointer text-sm text-accent">Query Inspector</summary>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-bg p-3 font-mono text-xs leading-relaxed">{text}</pre>
            </details>
            {children}
            {error ? <p className="text-sm text-bad">Error: {error}</p> : rows && <DataTable rows={rows} />}
        </section>
    );
}