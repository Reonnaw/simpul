import { Suspense } from "react";
import { connection } from "next/server";
import { runPipeline } from "@/lib/mongo";
import QueryCard, { GagalQuery } from "@/components/QueryCard";
import { cobaMongo } from "@/lib/konsol";
import Memuat from "@/components/Memuat";
import Kepala from "@/components/Kepala";
import TruckScene, { type Util } from "@/components/three/TruckScene";

const UTIL = [
    { $lookup: { from: "PENGIRIMAN", localField: "_id", foreignField: "id_penugasan", as: "kirim" } },
    { $lookup: { from: "DETAIL_BARANG", localField: "kirim._id", foreignField: "id_pengiriman", as: "barang" } },
    { $lookup: { from: "KENDARAAN", localField: "id_kendaraan", foreignField: "_id", as: "kendaraan" } },
    { $unwind: "$kendaraan" },
    { $project: {
        plat_nomor: "$kendaraan.plat_nomor", jenis: "$kendaraan.jenis_kendaraan",
        muatan_kg: { $sum: "$barang.berat_kg" }, kapasitas_kg: "$kendaraan.kapasitas_berat_kg",
        utilisasi_persen: { $round: [{ $multiply: [100, { $divide: [{ $sum: "$barang.berat_kg" }, "$kendaraan.kapasitas_berat_kg"] }] }, 1] },
    } },
    { $sort: { utilisasi_persen: -1 } },
];

async function Isi() {
    await connection();
    const u = await runPipeline("PENUGASAN_ARMADA", UTIL);
    return (
        <>
            {u.error ? <GagalQuery error={u.error} /> : <TruckScene data={u.rows as Util[]} />}
            <QueryCard title="Utilisasi per penugasan" materi="$lookup ×3 + $unwind + $divide" query={UTIL} coba={cobaMongo("PENUGASAN_ARMADA", UTIL)} rows={u.rows} error={u.error}
                note="Empat collection digabung: penugasan, pengiriman, barang, dan kendaraan." />
        </>
    );
}

export default function Armada() {
    return (
        <>
            <Kepala sumber="MongoDB · PENUGASAN_ARMADA, KENDARAAN, DETAIL_BARANG" judul="Seberapa penuh setiap truk?">
                Isi bak = total berat barang ÷ kapasitas kendaraan. <span className="text-ok">Hijau</span> di bawah 70%,{" "}
                <span className="text-warn">kuning</span> 70 sampai 90%, <span className="text-bad">merah</span> di atas 90%.
            </Kepala>
            <Suspense fallback={<Memuat apa="data armada" />}><Isi /></Suspense>
        </>
    );
}
