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
        <section className="space-y-3 rounded-xl border border-line bg-surface p-4">
            <div className="flex flex-wrap gap-2" role="tablist">
                {LANGKAH.map((x, j) => (
                    <button key={x.nama} role="tab" aria-selected={i === j} onClick={() => setI(j)}
                        className={`rounded-lg px-3 py-1 text-sm ${i === j ? "bg-accent text-bg" : "border border-line"}`}>
                        {x.nama}
                    </button>
                ))}
            </div>
            <p className="text-sm text-muted">{l.ket}</p>
            <div className="grid gap-3 sm:grid-cols-2">
                {l.tabel.map((t) => (
                    <div key={t.n} className="rounded-lg border border-line bg-bg p-3">
                        <h3 className="mb-2 font-mono text-sm font-semibold text-primary">{t.n}</h3>
                        <div className="flex flex-wrap gap-1">
                            {t.k.map((k) => (
                                <span key={k} className={`rounded px-1.5 py-0.5 font-mono text-xs ${k.startsWith("#") ? "bg-accent/20 underline" : k.endsWith("→") ? "bg-primary/20" : "bg-surface"}`}>
                                    {k.replace("#", "")}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-xs text-muted">Garis bawah = PRIMARY KEY, latar teal = FOREIGN KEY.</p>
        </section>
    );
}
