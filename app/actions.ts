"use server";
import { refresh } from "next/cache";
import { getDb, runPipeline } from "@/lib/mongo";
import { MERGE_JUMLAH, MERGE_TAGIHAN, OUT_REKAP } from "@/lib/ringkasan";

export async function cariTerdekat(lng: number, lat: number, radiusKm: number) {
    const valid = [lng, lat, radiusKm].every(Number.isFinite) && Math.abs(lng) <= 180 && Math.abs(lat) <= 90
        && radiusKm > 0 && radiusKm <= 2000;
    if (!valid) return { query: [], rows: [], error: "Input tidak valid" };
    const query = [
        { $geoNear: {
            near: { type: "Point", coordinates: [lng, lat] }, distanceField: "jarak_km",
            distanceMultiplier: 0.001, maxDistance: radiusKm * 1000, spherical: true } },
        { $project: { nama_cabang: 1, kapasitas_gudang_ton: 1, jarak_km: { $round: ["$jarak_km", 1] } } },
    ];
    return { query, ...(await runPipeline("KANTOR_CABANG", query)) };
}

export async function bangunRingkasan() {
    const db = await getDb();
    await db.collection("DETAIL_BARANG").aggregate(OUT_REKAP).toArray();
    await db.collection("PENGIRIMAN").aggregate(MERGE_JUMLAH).toArray();
    await db.collection("FAKTUR").aggregate(MERGE_TAGIHAN).toArray();
    refresh();
}

export async function tandaiDibaca() {
    await (await getDb()).collection("LOG_AKTIVITAS").updateMany({ dibaca: false }, { $set: { dibaca: true } });
    refresh();
}

export async function hapusLog() {
    await (await getDb()).collection("LOG_AKTIVITAS").deleteMany({});
    refresh();
}