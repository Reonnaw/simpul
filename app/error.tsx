"use client";
import Logo from "@/components/Logo";

export default function HalamanError({ error, retry }: { error: unknown; retry: () => void }) {
    const pesan = error instanceof Error ? error.message : String(error);
    return (
        <div className="max-w-xl space-y-4 rounded-xl border border-bad/50 bg-surface p-6">
            <Logo className="size-12 grayscale" />
            <h1 className="font-display text-2xl font-bold">Halaman ini gagal dimuat</h1>
            <p className="text-sm text-muted">Biasanya karena koneksi ke database terputus. Pesan aslinya:</p>
            <pre className="overflow-x-auto rounded-lg bg-bg p-3 font-mono text-xs">{pesan}</pre>
            <button onClick={() => retry()} className="min-h-11 rounded-lg bg-fox px-4 font-semibold text-bg hover:bg-fox-deep">
                Muat ulang halaman
            </button>
        </div>
    );
}
