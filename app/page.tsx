import { Suspense } from "react";
import { connection } from "next/server";
import { getDb, plain, runPipeline } from "@/lib/mongo";
import QueryCard from "@/components/QueryCard";
import Memuat from "@/components/Memuat";
import Kepala from "@/components/Kepala";
import Status from "@/components/Status";
import MapScene, { type Cabang, type Rute } from "@/components/three/MapScene";

const RUTE = [
    { $group: { _id: { asal: "$id_cabang_asal", tujuan: "$id_cabang_tujuan" }, jumlah: { $sum: 1 }, status: { $addToSet: "$status_pengiriman" } } },
    { $project: { _id: 0, asal: "$_id.asal", tujuan: "$_id.tujuan", jumlah: 1, status: 1 } },
    { $sort: { jumlah: -1, asal: 1 } },
];

async function Isi() {
    await connection(); // data dibaca dari database setiap request
    const db = await getDb();
    const cabang = plain(await db.collection<Cabang>("KANTOR_CABANG")
        .find({}, { projection: { nama_cabang: 1, kota: 1, kapasitas_gudang_ton: 1, lokasi: 1, id_cabang_induk: 1 } }).toArray());
    const rute = await runPipeline("PENGIRIMAN", RUTE);
    const rows = rute.rows as Rute[];
    const kota = new Map(cabang.map((c) => [c._id, c.kota]));
    const totalTon = cabang.reduce((n, c) => n + c.kapasitas_gudang_ton, 0);
    const totalKirim = rows.reduce((n, r) => n + r.jumlah, 0);
    const jalan = rows.filter((r) => r.status.some((s) => s === "Dalam Perjalanan" || s === "Transit")).length;

    return (
        <>
            <p className="text-muted">
                {cabang.length} cabang, {totalTon.toLocaleString("id-ID")} ton kapasitas gudang, {totalKirim} pengiriman
                di {rows.length} rute. <span className="text-fox">{jalan} rute</span> sedang dilalui truk saat ini.
            </p>
            <MapScene cabang={cabang} rute={rows} />
            <QueryCard title="Rute antarcabang" materi="$group + $addToSet" query={RUTE} error={rute.error}
                note="Pengiriman dikelompokkan per pasangan asal dan tujuan. Status unik tiap rute dikumpulkan dengan $addToSet.">
                {!rute.error && (
                    <ul className="divide-y divide-line rounded-lg border border-line">
                        {rows.length === 0 && <li className="p-4 text-sm text-muted">Belum ada pengiriman. Tambahkan dari halaman Transaksi.</li>}
                        {rows.map((r) => (
                            <li key={`${r.asal}-${r.tujuan}`} className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-6">
                                <div>
                                    <p className="font-medium">{kota.get(r.asal) ?? r.asal} <span className="text-muted">→</span> {kota.get(r.tujuan) ?? r.tujuan}</p>
                                    <p className="font-mono text-xs text-muted">{r.asal} → {r.tujuan}</p>
                                </div>
                                <p className="text-sm tabular-nums text-muted">{r.jumlah} pengiriman</p>
                                <div className="flex flex-wrap gap-1 sm:justify-end">{r.status.map((s) => <Status key={s} s={s} />)}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </QueryCard>
        </>
    );
}

export default function Peta() {
    return (
        <>
            <Kepala sumber="MongoDB · KANTOR_CABANG, PENGIRIMAN" judul="Jaringan cabang di Pulau Jawa">
                Setiap menara adalah gudang cabang, setiap busur adalah rute pengiriman. Ikuti rubah ke cabang yang kamu pilih,
                atau klik sembarang titik di peta untuk menjalankan <code className="font-mono text-sm text-ice">$geoNear</code> dan
                menemukan cabang terdekat.
            </Kepala>
            <Suspense fallback={<Memuat apa="peta jaringan" />}><Isi /></Suspense>
        </>
    );
}
