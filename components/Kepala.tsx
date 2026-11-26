// Judul halaman: sumber data di atas, supaya pembaca langsung tahu tabel/collection yang sedang dilihat.
export default function Kepala({ judul, sumber, children }: { judul: string; sumber: string; children?: React.ReactNode }) {
    return (
        <div className="max-w-3xl space-y-2">
            <p className="font-mono text-xs text-ice">{sumber}</p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">{judul}</h1>
            {children && <div className="leading-relaxed text-muted">{children}</div>}
        </div>
    );
}
