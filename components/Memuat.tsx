import Logo from "./Logo";

// fallback <Suspense> selama data dari database dimuat
export default function Memuat({ apa = "data" }: { apa?: string }) {
    return (
        <p role="status" className="flex items-center gap-3 rounded-xl border border-line bg-surface p-5 text-sm text-muted">
            <Logo className="size-6 animate-pulse motion-reduce:animate-none" />
            Mengambil {apa} dari database…
        </p>
    );
}
