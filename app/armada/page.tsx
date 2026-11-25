import { Suspense } from "react";
import { connection } from "next/server";
import { runPipeline } from "@/lib/mongo";
import QueryCard from "@/components/QueryCard";
import Memuat from "@/components/Memuat";
import TruckScene, { type Util } from "@/components/three/TruckScene";

const UTIL = [
    { $lookup: { from: "PENGIRIMAN", localField: "_id", foreignField: "id_penugasan", as: "kirim" } },
    { $lookup: { from: "DETAIL_BARANG", localField: "kirim._id", foreignField: "id_pengiriman", as: "barang" } },
    { $lookup: { from: "KENDARAAN", localField: "id_kendaraan", foreignField: "_id", as: "kendaraan" } },
    { $unwind: "$kendaraan" },
    { $project: {
        plat_nomor: "$kendaraan.plat_nomor", jenis: "$kendaraan.jenis_kendaraan",
        muatan_kg: { $sum: "$barang.berat_kg" }, kapasitas_kg: "$kendaraan.kapasitas_berat_kg",
        utilisasi_persen: { $round: [{ $multiply: [100, { $divide: [{ $sum: "$barang.berat_kg" },
"$kendaraan.kapasitas_berat_kg"] }] }, 1] } } },
    { $sort: { utilisasi_persen: -1 } },
];

async function Isi() {
    await connection();
    const u = await runPipeline("PENUGASAN_ARMADA", UTIL);
    return (
        <>
            <TruckScene data={u.rows as Util[]} />
            <QueryCard title="Utilisasi per penugasan (4 collection)" materi="$lookup ×3 + $unwind + $divide" query=
{UTIL} rows={u.rows} error={u.error} />
        </>
    );
}

export default function Armada() {
    return (
        <>
            <h1 className="text-2xl font-bold">Utilisasi Kapasitas Armada</h1>
            <p className="text-muted">Isi bak = berat muatan ÷ kapasitas. Hijau di bawah 70%, kuning 70–90%, merah di
atas 90%.</p>
            <Suspense fallback={<Memuat />}><Isi /></Suspense>
        </>
    );
}
