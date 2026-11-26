import { Suspense } from "react";
import { connection } from "next/server";
import { runSql } from "@/lib/mysql";
import QueryCard from "@/components/QueryCard";
import { cobaSql } from "@/lib/konsol";
import Memuat from "@/components/Memuat";
import Kepala from "@/components/Kepala";

const ASAL = "SELECT c.id_cabang, c.nama_cabang FROM PENGIRIMAN p JOIN KANTOR_CABANG c ON p.id_cabang_asal = c.id_cabang";
const TUJUAN = "SELECT c.id_cabang, c.nama_cabang FROM PENGIRIMAN p JOIN KANTOR_CABANG c ON p.id_cabang_tujuan = c.id_cabang";

const Q: { title: string; materi: string; sql: string }[] = [
    { materi: "INNER JOIN (3 tabel)", title: "Pengiriman yang sudah ditagih", sql:
`SELECT p.id_pengiriman, pl.nama_perusahaan, f.id_faktur,
       f.total_biaya_dasar + f.biaya_tambahan + f.pajak AS total_tagihan, f.status_pembayaran
FROM PENGIRIMAN p
INNER JOIN PELANGGAN pl ON p.id_pelanggan = pl.id_pelanggan
INNER JOIN FAKTUR f ON p.id_pengiriman = f.id_pengiriman
ORDER BY p.id_pengiriman` },
    { materi: "LEFT OUTER JOIN", title: "Semua pengiriman beserta fakturnya (kosong = belum ditagih)", sql:
`SELECT p.id_pengiriman, p.status_pengiriman, f.id_faktur, f.status_pembayaran
FROM PENGIRIMAN p
LEFT OUTER JOIN FAKTUR f ON p.id_pengiriman = f.id_pengiriman
ORDER BY p.id_pengiriman` },
    { materi: "RIGHT OUTER JOIN", title: "Semua kendaraan beserta penugasannya", sql:
`SELECT k.id_kendaraan, k.plat_nomor, k.jenis_kendaraan, pa.id_penugasan, pa.status_penugasan
FROM PENUGASAN_ARMADA pa
RIGHT OUTER JOIN KENDARAAN k ON pa.id_kendaraan = k.id_kendaraan
ORDER BY k.id_kendaraan` },
    { materi: "CROSS JOIN", title: "Jumlah kombinasi pengemudi × kendaraan", sql:
`SELECT COUNT(*) AS jumlah_kombinasi FROM PENGEMUDI CROSS JOIN KENDARAAN` },
    { materi: "CROSS JOIN + WHERE", title: "Calon pasangan pengemudi dan kendaraan Cabang Surabaya", sql:
`SELECT pg.nama_pengemudi, k.plat_nomor, k.jenis_kendaraan
FROM PENGEMUDI pg CROSS JOIN KENDARAAN k
WHERE pg.id_cabang = 'CBG001' AND k.id_cabang_pool = 'CBG001'
ORDER BY pg.nama_pengemudi, k.plat_nomor` },
    { materi: "Subquery skalar", title: "Barang bernilai di atas rata-rata", sql:
`SELECT id_barang, deskripsi_barang, nilai_barang
FROM DETAIL_BARANG
WHERE nilai_barang > (SELECT AVG(nilai_barang) FROM DETAIL_BARANG)
ORDER BY nilai_barang DESC` },
    { materi: "Subquery NOT IN", title: "Pengemudi yang belum pernah ditugaskan", sql:
`SELECT id_pengemudi, nama_pengemudi, id_cabang
FROM PENGEMUDI
WHERE id_pengemudi NOT IN (SELECT id_pengemudi FROM PENUGASAN_ARMADA)` },
    { materi: "Subquery berkorelasi NOT EXISTS", title: "Kendaraan yang belum pernah ditugaskan", sql:
`SELECT k.id_kendaraan, k.plat_nomor
FROM KENDARAAN k
WHERE NOT EXISTS (SELECT 1 FROM PENUGASAN_ARMADA pa WHERE pa.id_kendaraan = k.id_kendaraan)` },
    { materi: "UNION", title: "Cabang yang terlibat pengiriman (asal ∪ tujuan)", sql: `${ASAL}\nUNION\n${TUJUAN}\nORDER BY id_cabang` },
    { materi: "UNION ALL", title: "Sama, tetapi duplikat dipertahankan", sql: `${ASAL}\nUNION ALL\n${TUJUAN}\nORDER BY id_cabang` },
    { materi: "INTERSECT", title: "Cabang yang menjadi asal sekaligus tujuan", sql: `${ASAL}\nINTERSECT\n${TUJUAN}\nORDER BY id_cabang` },
    { materi: "EXCEPT", title: "Cabang yang hanya menjadi asal", sql: `${ASAL}\nEXCEPT\n${TUJUAN}\nORDER BY id_cabang` },
    { materi: "INTERSECT", title: "Pengemudi berotorisasi aktif yang sudah ditugaskan", sql:
`SELECT id_pengemudi FROM OTORISASI_OPERASIONAL WHERE status_otorisasi = 'Aktif'
INTERSECT
SELECT id_pengemudi FROM PENUGASAN_ARMADA
ORDER BY id_pengemudi` },
    { materi: "GROUP BY + HAVING", title: "Kategori dengan total berat di atas 5.000 kg", sql:
`SELECT kategori_barang, COUNT(*) AS jumlah_barang, SUM(berat_kg) AS total_berat_kg, SUM(nilai_barang) AS total_nilai
FROM DETAIL_BARANG
GROUP BY kategori_barang
HAVING SUM(berat_kg) > 5000
ORDER BY total_berat_kg DESC` },
    { materi: "WITH RECURSIVE (padanan $graphLookup)", title: "Hierarki cabang", sql:
`WITH RECURSIVE hierarki AS (
    SELECT id_cabang, nama_cabang, id_cabang_induk, 0 AS tingkat
    FROM KANTOR_CABANG WHERE id_cabang_induk IS NULL
    UNION ALL
    SELECT c.id_cabang, c.nama_cabang, c.id_cabang_induk, h.tingkat + 1
    FROM KANTOR_CABANG c JOIN hierarki h ON c.id_cabang_induk = h.id_cabang
)
SELECT * FROM hierarki ORDER BY tingkat, id_cabang` },
    { materi: "Window function (padanan $setWindowFields)", title: "Tagihan kumulatif", sql:
`SELECT id_faktur, tanggal_terbit,
       total_biaya_dasar + biaya_tambahan + pajak AS total_tagihan,
       SUM(total_biaya_dasar + biaya_tambahan + pajak) OVER (ORDER BY tanggal_terbit, id_faktur) AS tagihan_kumulatif
FROM FAKTUR` },
    { materi: "VIEW", title: "View pengiriman yang belum ditagih", sql: "SELECT * FROM v_pengiriman_belum_ditagih" },
    { materi: "INDEX + EXPLAIN", title: "Pencarian lewat index unik plat_nomor", sql: "EXPLAIN SELECT * FROM KENDARAAN WHERE plat_nomor = 'L 9123 UA'" },
];

async function Isi() {
    await connection();
    const hasil = await Promise.all(Q.map((q) => runSql(q.sql)));
    return Q.map((q, i) => <QueryCard key={i} title={q.title} materi={q.materi} query={q.sql} coba={cobaSql(q.sql)} rows={hasil[i].rows} error={hasil[i].error} />);
}

export default function LaporanSql() {
    return (
        <>
            <Kepala sumber="MySQL (TiDB)" judul="Laporan SQL">
                JOIN, subquery, operasi himpunan, agregasi, CTE rekursif, window function, view, dan index. Setiap kartu menjalankan query-nya langsung.
            </Kepala>
            <Suspense fallback={<Memuat apa="laporan SQL" />}><Isi /></Suspense>
        </>
    );
}
