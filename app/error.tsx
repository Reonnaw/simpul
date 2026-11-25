"use client";

export default function HalamanError({ error, retry }: { error: unknown; retry: () => void }) {
    const pesan = error instanceof Error ? error.message : String(error);
    return (
        <div className="space-y-3">
            <h1 className="text-xl font-semibold">Gagal memuat halaman</h1>
            <p className="text-sm text-muted">{pesan}</p>
            <button onClick={() => retry()} className="rounded-lg bg-accent px-3 py-1.5 font-medium text-bg">Coba lagi</button>
        </div>
    );
}