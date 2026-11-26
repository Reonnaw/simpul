"use client";
import { useState } from "react";

// Format kolom: awalan "#" = PRIMARY KEY, akhiran "→" = FOREIGN KEY.
const LANGKAH = [
    {
        nama: "UNF",
        ket: "Satu nota menyimpan banyak barang dalam satu baris (grup berulang).",
        tabel: [
            { n: "NOTA_PENGIRIMAN", k: ["#id_pengiriman", "tanggal_pesan", "id_pelanggan", "nama_perusahaan", "alamat_lengkap",
                "id_cabang_asal", "nama_cabang_asal", "{id_barang, deskripsi_barang, kategori_barang, berat_kg, nilai_barang}*"] },
        ],
    },
    {
        nama: "1NF",
        ket: "Grup berulang dipecah: satu baris per barang dan semua nilai atomik. Kunci menjadi gabungan.",
        tabel: [
            { n: "NOTA_PENGIRIMAN", k: ["#id_pengiriman", "#id_barang", "tanggal_pesan", "id_pelanggan", "nama_perusahaan",
                "alamat_lengkap", "id_cabang_asal", "nama_cabang_asal", "deskripsi_barang", "kategori_barang", "berat_kg", "nilai_barang"] },
        ],
    },
    {
        nama: "2NF",
        ket: "Ketergantungan parsial dihapus: atribut barang hanya bergantung pada id_barang, atribut nota hanya pada id_pengiriman.",
        tabel: [
            { n: "PENGIRIMAN", k: ["#id_pengiriman", "tanggal_pesan", "id_pelanggan", "nama_perusahaan", "alamat_lengkap",
                "id_cabang_asal", "nama_cabang_asal"] },
            { n: "DETAIL_BARANG", k: ["#id_barang", "id_pengiriman→", "deskripsi_barang", "kategori_barang", "berat_kg", "nilai_barang"] },
        ],
    },
    {
        nama: "3NF",
        ket: "Ketergantungan transitif dihapus: nama_perusahaan bergantung pada id_pelanggan, nama_cabang pada id_cabang.",
        tabel: [
            { n: "PENGIRIMAN", k: ["#id_pengiriman", "tanggal_pesan", "id_pelanggan→", "id_cabang_asal→"] },
            { n: "PELANGGAN", k: ["#id_pelanggan", "nama_perusahaan", "alamat_lengkap"] },
            { n: "KANTOR_CABANG", k: ["#id_cabang", "nama_cabang"] },
            { n: "DETAIL_BARANG", k: ["#id_barang", "id_pengiriman→", "deskripsi_barang", "kategori_barang", "berat_kg", "nilai_barang"] },
        ],
    },
];

export default function NormalisasiStepper() {
    const [i, setI] = useState(0);
    const l = LANGKAH[i];
    return (
        <section className="space-y-4 rounded-xl border border-line bg-surface p-4 sm:p-5">
            <ol className="flex flex-wrap gap-2">
                {LANGKAH.map((x, j) => (
                    <li key={x.nama}>
                        <button aria-pressed={i === j} onClick={() => setI(j)}
                            className={`flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm ${i === j ? "border-fox bg-raised font-semibold" : "border-line text-muted hover:text-ink"}`}>
                            <span className={`grid size-6 place-items-center rounded-md text-xs ${i === j ? "bg-fox text-bg" : "bg-raised"}`}>{j + 1}</span>
                            {x.nama}
                        </button>
                    </li>
                ))}
            </ol>
            <p className="max-w-3xl leading-relaxed">{l.ket}</p>
            <div className="grid gap-3 sm:grid-cols-2">
                {l.tabel.map((t) => (
                    <div key={t.n} className="rounded-lg border border-line bg-bg p-3">
                        <h3 className="mb-2 font-mono text-sm font-semibold">{t.n}</h3>
                        <div className="flex flex-wrap gap-1">
                            {t.k.map((k) => (
                                <span key={k} className={`rounded-md px-1.5 py-0.5 font-mono text-xs ${
                                    k.startsWith("#") ? "bg-fox/15 text-fox underline underline-offset-2" : k.endsWith("→") ? "bg-ice/15 text-ice" : "bg-raised"}`}>
                                    {k.replace("#", "")}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-xs text-muted">
                <span className="text-fox underline underline-offset-2">Oranye bergaris bawah</span> = PRIMARY KEY,{" "}
                <span className="text-ice">biru es dengan →</span> = FOREIGN KEY.
            </p>
        </section>
    );
}
