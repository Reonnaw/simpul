"use server";
import type { ResultSetHeader } from "mysql2";
import { BSON } from "mongodb";
import { pool } from "@/lib/mysql";
import { getDb, plain } from "@/lib/mongo";
import { MAKS_BARIS, MAKS_PERINTAH, cekPipeline, cekSql, pecahSql } from "@/lib/konsol";

export type HasilSql = { sql: string; rows?: Record<string, unknown>[]; total?: number; affectedRows?: number; error?: string };

// Semua perintah dijalankan dalam satu transaksi yang selalu di-ROLLBACK, jadi data asli tidak pernah berubah.
export async function jalankanSql(teks: string): Promise<{ hasil: HasilSql[]; error?: string }> {
    if (typeof teks !== "string" || teks.length > 10_000) return { hasil: [], error: "Query terlalu panjang (maksimal 10.000 karakter)" };
    const perintah = pecahSql(teks);
    if (!perintah.length) return { hasil: [], error: "Tulis query terlebih dahulu" };
    if (perintah.length > MAKS_PERINTAH) return { hasil: [], error: `Maksimal ${MAKS_PERINTAH} perintah sekali jalan` };
    for (const p of perintah) {
        const e = cekSql(p);
        if (e) return { hasil: [], error: `${e}\n→ ${p.slice(0, 120)}` };
    }

    const hasil: HasilSql[] = [];
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query("SET SESSION max_execution_time = 5000, innodb_lock_wait_timeout = 5");
        await conn.beginTransaction();
        for (const sql of perintah) {
            try {
                const [res] = await conn.query(sql);
                // shortcut: semua baris dibaca lalu dipotong; tambahkan LIMIT otomatis kalau tabelnya sudah ribuan baris
                if (Array.isArray(res)) {
                    const rows = res as Record<string, unknown>[];
                    hasil.push({ sql, rows: plain(rows.slice(0, MAKS_BARIS)), total: rows.length });
                } else hasil.push({ sql, affectedRows: (res as ResultSetHeader).affectedRows });
            } catch (e) {
                hasil.push({ sql, error: (e as Error).message });
                break; // perintah berikutnya bergantung pada yang gagal
            }
        }
    } catch (e) {
        return { hasil, error: (e as Error).message };
    } finally {
        await conn?.rollback().catch(() => {});
        conn?.destroy(); // jangan kembalikan ke pool: pengaturan SESSION di atas tidak boleh terbawa ke halaman lain
    }
    return { hasil };
}

export async function jalankanMongo(koleksi: string, teks: string): Promise<{ rows: Record<string, unknown>[]; total: number; error?: string }> {
    const gagal = (error: string) => ({ rows: [], total: 0, error });
    if (typeof teks !== "string" || teks.length > 10_000) return gagal("Pipeline terlalu panjang (maksimal 10.000 karakter)");
    let pipeline: unknown;
    try {
        pipeline = BSON.EJSON.parse(teks, { relaxed: true });
    } catch (e) {
        return gagal(`Bukan JSON yang valid: ${(e as Error).message}. Kunci harus diberi tanda kutip, misal {"$match": {"kota": "Surabaya"}}`);
    }
    const e = cekPipeline(pipeline);
    if (e) return gagal(e);
    try {
        const db = await getDb();
        const ada = await db.listCollections({ name: koleksi }, { nameOnly: true }).hasNext();
        if (!ada || koleksi.startsWith("system.")) return gagal(`Collection ${koleksi} tidak ada`);
        const rows = await db.collection(koleksi)
            .aggregate([...(pipeline as BSON.Document[]), { $limit: MAKS_BARIS + 1 }], { maxTimeMS: 5000 }).toArray();
        return { rows: plain(rows.slice(0, MAKS_BARIS)), total: rows.length };
    } catch (err) {
        return gagal((err as Error).message);
    }
}
