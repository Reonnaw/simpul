// fallback <Suspense> selama data dari database dimuat
export default function Memuat() {
    return <p className="animate-pulse text-sm text-muted">Memuat data dari database…</p>;
}