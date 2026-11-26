// Warna mengikuti peta 3D: oranye = sedang bergerak, biru es = singgah, hijau = selesai.
const NADA: Record<string, string> = {
    "Menunggu Penjadwalan": "border-line text-muted",
    "Dalam Perjalanan": "border-fox/50 bg-fox/10 text-fox",
    Transit: "border-ice/50 bg-ice/10 text-ice",
    Terkirim: "border-ok/40 bg-ok/10 text-ok",
};

export const adalahStatus = (v: unknown): v is string => typeof v === "string" && v in NADA;

export default function Status({ s }: { s: string }) {
    return (
        <span className={`inline-flex whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium ${NADA[s] ?? "border-line text-muted"}`}>
            {s}
        </span>
    );
}
