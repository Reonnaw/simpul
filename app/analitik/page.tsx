import { Suspense } from "react";
import { connection } from "next/server";
import type { Document } from "mongodb";
import { runPipeline } from "@/lib/mongo";
import QueryCard from "@/components/QueryCard";
import Memuat from "@/components/Memuat";
import BarMini from "@/components/BarMini";
import { bangunRingkasan } from "@/app/actions";
import { MERGE_JUMLAH, MERGE_TAGIHAN, OUT_REKAP } from "@/lib/ringkasan";

type Item = { title: string; materi: string; coll: string; pipeline: Document[]; chart?: [string, string] };
const TOTAL = { $add: ["$total_biaya_dasar", "$biaya_tambahan", "$pajak"] };

function daftar(): Item[] {
    return [
        { title: "Dasbor barang (3 sudut pandang)", materi: "$facet", coll: "DETAIL_BARANG", pipeline: [{ $facet: {
            per_tingkat_bahaya: [{ $group: { _id: "$tingkat_bahaya", jumlah: { $sum: 1 } } }, { $sort: { _id: 1 } }],
            statistik_nilai: [{ $group: { _id: null, total: { $sum: "$nilai_barang" }, rata_rata: { $avg: "$nilai_barang" } } }, { $project: { _id: 0 } }],
            barang_terberat: [{ $sort: { berat_kg: -1 } }, { $limit: 1 }, { $project: { deskripsi_barang: 1, berat_kg: 1 } }],
        } }] },
        { title: "Rekap nilai per kategori", materi: "$group: $sum $avg $min $max + $sort", coll: "DETAIL_BARANG", chart: ["_id", "total_nilai"], pipeline: [
            { $group: { _id: "$kategori_barang", jumlah_barang: { $sum: 1 }, total_berat_kg: { $sum: "$berat_kg" },
                total_nilai: { $sum: "$nilai_barang" }, rata_rata_nilai: { $avg: "$nilai_barang" },
                nilai_terendah: { $min: "$nilai_barang" }, nilai_tertinggi: { $max: "$nilai_barang" } } },
            { $sort: { total_nilai: -1 } }] },
        { title: "WHERE + GROUP BY + HAVING + SELECT + ORDER BY + LIMIT", materi: "$match → $group → $match → $project → $sort → $limit", coll: "DETAIL_BARANG", pipeline: [
            { $match: { tingkat_bahaya: "Non-B3" } },
            { $group: { _id: "$id_pengiriman", jumlah_barang: { $sum: 1 }, total_nilai: { $sum: "$nilai_barang" } }
},
            { $match: { total_nilai: { $gte: 100000000 } } },
            { $project: { _id: 0, id_pengiriman: "$_id", jumlah_barang: 1, total_nilai: 1 } },
            { $sort: { total_nilai: -1 } }, { $limit: 3 }] },
        { title: "Halaman 2 barang termahal (paginasi)", materi: "$sort + $skip + $limit", coll: "DETAIL_BARANG", pipeline: [
            { $sort: { nilai_barang: -1 } }, { $skip: 3 }, { $limit: 3 }, { $project: { deskripsi_barang: 1, nilai_barang: 1 } }] },
        { title: "Jumlah pengiriman terkirim", materi: "$count", coll: "PENGIRIMAN", pipeline: [
            { $match: { status_pengiriman: "Terkirim" } }, { $count: "jumlah_terkirim" }] },
        { title: "Jumlah barang per kategori", materi: "$sortByCount", coll: "DETAIL_BARANG", pipeline: [{ $sortByCount: "$kategori_barang" }] },
        { title: "Barang per rentang nilai", materi: "$bucket", coll: "DETAIL_BARANG", pipeline: [{ $bucket: { groupBy: "$nilai_barang", boundaries: [0, 50000000, 100000000, 200000000, 300000000], default: "300 juta ke atas", output: { jumlah: { $sum: 1 }, total_nilai: { $sum: "$nilai_barang" }, daftar_barang: { $push: "$_id" } }
} }] },
        { title: "4 kelompok berat (otomatis)", materi: "$bucketAuto", coll: "DETAIL_BARANG", pipeline: [{
$bucketAuto: {
                groupBy: "$berat_kg", buckets: 4, output: { jumlah: { $sum: 1 }, total_berat_kg: { $sum: "$berat_kg" } }
} }] },
        { title: "Nilai per kg & kepadatan barang elektronik", materi: "$addFields + $divide + $round", coll:
"DETAIL_BARANG", pipeline: [
            { $match: { kategori_barang: "Elektronik" } },
            { $addFields: { nilai_per_kg: { $round: [{ $divide: ["$nilai_barang", "$berat_kg"] }, 0] },
kepadatan_kg_m3: { $round: [{ $divide: ["$berat_kg", "$volume_m3"] }, 1] } } },
            { $project: { deskripsi_barang: 1, nilai_per_kg: 1, kepadatan_kg_m3: 1 } }] },
        { title: "Durasi penugasan", materi: "$set + $dateDiff + $toUpper", coll: "PENUGASAN_ARMADA", pipeline: [
            { $set: { durasi_jam: { $dateDiff: { startDate: "$waktu_berangkat", endDate: "$waktu_tiba_estimasi",
unit: "hour" } },
status_penugasan: { $toUpper: "$status_penugasan" } } },
            { $project: { status_penugasan: 1, durasi_jam: 1 } }] },
        { title: "Pengemudi Surabaya tanpa data pribadi", materi: "$unset", coll: "PENGEMUDI", pipeline: [
            { $match: { id_cabang: "CBG001" } }, { $unset: ["no_ktp", "alamat", "tanggal_lahir", "no_telepon"] }] },
        { title: "Lisensi per pengemudi", materi: "$push + $addToSet", coll: "SERTIFIKASI_PENGEMUDI", pipeline: [
            { $group: { _id: "$id_pengemudi", jumlah_lisensi: { $sum: 1 }, daftar_lisensi: { $push: "$jenis_lisensi"
}, status_unik: { $addToSet: "$status_verifikasi" } } }, { $sort: { _id: 1 } }] },
        { title: "Transit pertama & terakhir", materi: "$first + $last", coll: "RUTE_TRANSIT", pipeline: [
            { $sort: { id_penugasan: 1, urutan_transit: 1 } },
            { $group: { _id: "$id_penugasan", jumlah_transit: { $sum: 1 }, transit_pertama: { $first: "$id_cabang" },
transit_terakhir: { $last: "$id_cabang" } } },
            { $sort: { _id: 1 } }] },
        { title: "Faktur + nama pelanggan", materi: "$lookup bertingkat + $unwind", coll: "FAKTUR", pipeline: [
            { $lookup: { from: "PENGIRIMAN", localField: "id_pengiriman", foreignField: "_id", as: "kirim" } }, {
            $unwind: "$kirim" },
            { $lookup: { from: "PELANGGAN", localField: "kirim.id_pelanggan", foreignField: "_id", as: "pelanggan" }
            }, { $unwind: "$pelanggan" },
            { $project: { id_pengiriman: 1, pelanggan: "$pelanggan.nama_perusahaan", status_pembayaran: 1,
total_tagihan: TOTAL } }] },
        { title: "Pengemudi per cabang (cabang kosong tetap tampil)", materi: "$unwind preserveNullAndEmptyArrays",
coll: "KANTOR_CABANG", pipeline: [
            { $lookup: { from: "PENGEMUDI", localField: "_id", foreignField: "id_cabang", as: "pengemudi" } },
            { $unwind: { path: "$pengemudi", preserveNullAndEmptyArrays: true } },
            { $project: { _id: 1, nama: "$pengemudi.nama_pengemudi" } }] },
        { title: "Total berat & nilai per pengiriman", materi: "$lookup sub-pipeline (let + $expr)", coll:
"PENGIRIMAN", pipeline: [
            { $lookup: { from: "DETAIL_BARANG", let: { kode_kirim: "$_id" }, as: "ringkasan", pipeline: [
            { $match: { $expr: { $eq: ["$id_pengiriman", "$$kode_kirim"] } } },
            { $group: { _id: null, total_berat_kg: { $sum: "$berat_kg" }, total_nilai: { $sum: "$nilai_barang" } }
}] } },
            { $unwind: "$ringkasan" },
            { $project: { total_berat_kg: "$ringkasan.total_berat_kg", total_nilai: "$ringkasan.total_nilai" } }] },
        { title: "Validasi nilai pertanggungan asuransi", materi: "$lookup + $cond", coll: "ASURANSI", pipeline: [
            { $lookup: { from: "DETAIL_BARANG", localField: "id_pengiriman", foreignField: "id_pengiriman", as:
            "barang" } },
            { $project: { id_pengiriman: 1, nilai_pertanggungan: 1, total_nilai_barang: { $sum:
            "$barang.nilai_barang" },
keterangan: { $cond: [{ $eq: ["$nilai_pertanggungan", { $sum: "$barang.nilai_barang" }] }, "Sesuai",
"Tidak sesuai"] } } }] },
        { title: "Ketepatan waktu transit", materi: "$dateDiff + $switch", coll: "RUTE_TRANSIT", pipeline: [
            { $match: { waktu_aktual_tiba: { $exists: true } } },
            { $lookup: { from: "KANTOR_CABANG", localField: "id_cabang", foreignField: "_id", as: "cabang" } },
            { $set: { cabang: { $first: "$cabang.nama_cabang" },
selisih_menit: { $dateDiff: { startDate: "$waktu_estimasi_tiba", endDate: "$waktu_aktual_tiba",
unit: "minute" } } } },
            { $set: { keterangan: { $switch: { branches: [
                { case: { $gt: ["$selisih_menit", 0] }, then: "Terlambat" },
                { case: { $lt: ["$selisih_menit", 0] }, then: "Lebih Cepat" }], default: "Tepat Waktu" } } } },
            { $project: { id_penugasan: 1, cabang: 1, selisih_menit: 1, keterangan: 1 } }] },
        { title: "Rekap kinerja pengemudi", materi: "$group lalu $lookup", coll: "PENUGASAN_ARMADA", pipeline: [
            { $group: { _id: "$id_pengemudi", jumlah_tugas: { $sum: 1 }, total_uang_jalan: { $sum: "$uang_jalan" },
total_bbm_liter: { $sum: "$konsumsi_bbm_liter" } } },
            { $lookup: { from: "PENGEMUDI", localField: "_id", foreignField: "_id", as: "p" } },
            { $project: { nama: { $first: "$p.nama_pengemudi" }, jumlah_tugas: 1, total_uang_jalan: 1,
total_bbm_liter: 1 } },
            { $sort: { total_uang_jalan: -1 } }] },
        { title: "Lisensi yang paling dekat kedaluwarsa (per hari ini)", materi: "$sum + $cond + $min + $$NOW",
coll: "SERTIFIKASI_PENGEMUDI", pipeline: [
            { $group: { _id: "$id_pengemudi", jumlah_lisensi: { $sum: 1 },
            lisensi_kedaluwarsa: { $sum: { $cond: [{ $lt: ["$tanggal_berlaku_hingga", "$$NOW"] }, 1, 0] } },
            berakhir_terdekat: { $min: "$tanggal_berlaku_hingga" } } },
            { $sort: { berakhir_terdekat: 1 } }, { $limit: 3 }] },
        { title: "Tagihan per bulan", materi: "$dateToString", coll: "FAKTUR", chart: ["_id", "total_tagihan"],
pipeline: [
            { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$tanggal_terbit" } }, jumlah_faktur: { $sum:
            1 }, total_tagihan: { $sum: TOTAL } } },
            { $sort: { _id: 1 } }] },
        { title: "Tagihan kumulatif", materi: "$setWindowFields", coll: "FAKTUR", chart: ["_id",
"tagihan_kumulatif"], pipeline: [
            { $set: { total_tagihan: TOTAL } },
            { $setWindowFields: { sortBy: { tanggal_terbit: 1, _id: 1 },
output: { tagihan_kumulatif: { $sum: "$total_tagihan", window: { documents: ["unbounded", "current"]
} } } } },
            { $project: { tanggal_terbit: 1, total_tagihan: 1, tagihan_kumulatif: 1 } }] },
        { title: "3 pelanggan acak (berubah tiap refresh)", materi: "$sample", coll: "PELANGGAN", pipeline: [
            { $sample: { size: 3 } }, { $project: { nama_perusahaan: 1 } }] },
        { title: "Statistik collection PENGIRIMAN", materi: "$collStats", coll: "PENGIRIMAN", pipeline: [
            { $collStats: { count: {}, storageStats: {} } },
            { $project: { ns: 1, count: 1, "storageStats.size": 1, "storageStats.avgObjSize": 1,
"storageStats.nindexes": 1 } }] },
        { title: "Pemakaian index KANTOR_CABANG", materi: "$indexStats", coll: "KANTOR_CABANG", pipeline: [
            { $indexStats: {} }, { $project: { name: 1, key: 1, "accesses.ops": 1 } }] },
    ];
}

async function Isi() {
    await connection();
    const items = daftar();
    const hasil = await Promise.all(items.map((it) => runPipeline(it.coll, it.pipeline)));
    const [rekap, ringkasan] = await Promise.all([
        runPipeline("REKAP_KATEGORI_BARANG", [{ $sort: { total_nilai: -1 } }]),
        runPipeline("RINGKASAN_PELANGGAN", [{ $sort: { _id: 1 } }]),
    ]);

    return (
        <>
            <QueryCard title="Simpan ringkasan ke collection" materi="$out + $merge"
                query={{ "DETAIL_BARANG ($out)": OUT_REKAP, "PENGIRIMAN ($merge 1)": MERGE_JUMLAH, "FAKTUR ($merge 2)":
MERGE_TAGIHAN }}
                note="Klik tombol untuk menjalankan ketiga pipeline. Tambah pengiriman di halaman Transaksi, lalu klik
lagi: angkanya ikut berubah.">
                <form action={bangunRingkasan}><button className="rounded-lg bg-accent px-4 py-2 font-medium textbg">Bangun ulang ringkasan</button></form>
                <QueryCard title="Isi REKAP_KATEGORI_BARANG" materi="find()"
query="db.REKAP_KATEGORI_BARANG.find().sort({ total_nilai: -1 })" rows={rekap.rows} error={rekap.error} />
                <QueryCard title="Isi RINGKASAN_PELANGGAN" materi="find()" query="db.RINGKASAN_PELANGGAN.find().sort({
_id: 1 })" rows={ringkasan.rows} error={ringkasan.error} />
                </QueryCard>

                {items.map((it, i) => (
                    <QueryCard key={i} title={it.title} materi={it.materi} query={it.pipeline} rows={hasil[i].rows} error=
{hasil[i].error}>
                        {it.chart && !hasil[i].error && <BarMini data={hasil[i].rows} x={it.chart[0]} y={it.chart[1]} />}
                    </QueryCard>
                ))}
        </>
    );
}

export default function Analitik() {
    return (
        <>
            <h1 className="text-2xl font-bold">Analitik: Aggregation Pipeline</h1>
            <p className="text-muted">Pipeline diambil dari laporan praktikum. Kalau sebuah tahap tidak didukung
Atlas Free, pesan error-nya ikut tampil di kartunya sebagai bukti batasan.</p>
            <Suspense fallback={<Memuat />}><Isi /></Suspense>
        </>
    );
}
