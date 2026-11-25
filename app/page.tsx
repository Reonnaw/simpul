import { Suspense } from "react";
import { connection } from "next/server";
import { getDb, plain, runPipeline } from "@/lib/mongo";
import QueryCard from "@/components/QueryCard";
import Memuat from "@/components/Memuat";
import MapScene, { type Cabang, type Rute } from "@/components/three/MapScene";

const RUTE = [
  { $group: { _id: { asal: "$id_cabang_asal", tujuan: "$id_cabang_tujuan" },
    jumlah: { $sum: 1 }, status: { $addToSet: "$status_pengiriman" } } },
  { $project: { _id: 0, asal: "$_id.asal", tujuan: "$_id.tujuan", jumlah: 1, status: 1 } },
];

async function Isi() {
  await connection(); // data dibaca dari database setiap request
  const db = await getDb();
  const cabang = plain(await db.collection("KANTOR_CABANG")
    .find({}, { projection: { nama_cabang: 1, kota: 1, kapasitas_gudang_ton: 1, lokasi: 1 } }).toArray());
  const rute = await runPipeline("PENGIRIMAN", RUTE);
  return (
    <>

      <MapScene cabang={cabang as unknown as Cabang[]} rute={rute.rows as Rute[]} />
      <QueryCard title="Rute antarcabang" materi="$group + $addToSet" query={RUTE} rows={rute.rows} error=
{rute.error} />
    </>
  );
}

export default function Peta() {
  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Jaringan Cabang SIM-LOG</h1>
        <p className="text-muted">
          Tinggi silinder = kapasitas gudang. Oranye = rute yang sedang berjalan. Klik di mana saja pada peta:
          server menjalankan <code className="font-mono">$geoNear</code> untuk mencari cabang terdekat.
        </p>
      </div>
      <Suspense fallback={<Memuat />}><Isi /></Suspense>
    </>
  );
}