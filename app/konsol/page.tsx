import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { runSql } from "@/lib/mysql";
import { getDb } from "@/lib/mongo";
import Memuat from "@/components/Memuat";
import Kepala from "@/components/Kepala";
import Konsol from "@/components/Konsol";

export const metadata: Metadata = { title: "Konsol query" };

const satu = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const rapikan = (json: string) => { try { return JSON.stringify(JSON.parse(json), null, 2); } catch { return json; } };

async function daftarKoleksi() {
    try {
        const c = await (await getDb()).listCollections({}, { nameOnly: true }).toArray();
        return c.map((x) => x.name).filter((n) => !n.startsWith("system.")).sort();
    } catch {
        return [];
    }
}

async function Isi({ searchParams }: { searchParams: PageProps<"/konsol">["searchParams"] }) {
    await connection();
    const sp = await searchParams;
    const [tabel, koleksi] = await Promise.all([runSql("SHOW TABLES"), daftarKoleksi()]);
    const pipeline = satu(sp.pipeline);
    return (
        <Konsol
            tabel={tabel.rows.map((r) => String(Object.values(r)[0]))}
            koleksi={koleksi}
            awal={{
                mode: pipeline ? "mongo" : "sql",
                sql: satu(sp.sql) ?? "SELECT * FROM KANTOR_CABANG\nORDER BY id_cabang\nLIMIT 10",
                koleksi: satu(sp.koleksi) ?? "KANTOR_CABANG",
                pipeline: pipeline ? rapikan(pipeline) : '[\n  { "$match": { "kota": "Surabaya" } },\n  { "$limit": 10 }\n]',
            }}
        />
    );
}

export default function HalamanKonsol(props: PageProps<"/konsol">) {
    return (
        <>
            <Kepala sumber="MySQL (TiDB) · MongoDB Atlas" judul="Konsol query">
                Tulis query sendiri dan jalankan langsung ke database. INSERT, UPDATE, dan DELETE boleh dicoba: semua perintah berjalan dalam
                satu transaksi yang selalu di-ROLLBACK, jadi data asli tidak berubah. Pisahkan beberapa perintah dengan titik koma untuk
                melihat efek perubahan sebelum dibatalkan.
            </Kepala>
            <Suspense fallback={<Memuat apa="daftar tabel" />}><Isi searchParams={props.searchParams} /></Suspense>
        </>
    );
}
