"use server";
import { redirect } from "next/navigation";
import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/mysql";
import { getDb } from "@/lib/mongo";
import { BAHAYA, KATEGORI, LAYANAN, PRIORITAS, STATUS } from "@/lib/opsi";

// dokumen Mongo di proyek ini memakai _id berupa kode teks (KRM001), bukan ObjectId
type Dok = { _id: string; [kolom: string]: unknown };

// --- validasi input (batas kepercayaan: semua data form dicek di server) ---
function ambil(f: FormData, k: string, max = 150) {
    const v = String(f.get(k) ?? "").trim();
    if (!v || v.length > max) throw new Error(`Kolom ${k} wajib diisi (maks ${max} karakter)`);
    return v;
}
function pilih(f: FormData, k: string, opsi: string[]) {
    const v = ambil(f, k);
    if (!opsi.includes(v)) throw new Error(`Nilai ${k} tidak valid`);
    return v;
}
function kode(f: FormData, k: string, awalan: string) {
    const v = ambil(f, k, 6);
    if (!new RegExp(`^${awalan}\\d{3}$`).test(v)) throw new Error(`Kode ${k} tidak valid`);
    return v;
}
function angka(f: FormData, k: string) {
    const v = Number(f.get(k));
    if (!Number.isFinite(v) || v <= 0) throw new Error(`${k} harus angka lebih dari 0`);
    return v;
}

// shortcut: ID berikutnya = MAX + 1 dari MySQL dan MongoDB; dua user bersamaan bisa bentrok PK (transaksi gagal, aman). Ganti dengan sequence kalau multi-user.
async function idBerikut(conn: PoolConnection, tabel: string, kolom: string, awalan: string) {
    const [rows] = await conn.query<RowDataPacket[]>(`SELECT MAX(${kolom}) AS m FROM ${tabel}`);
    const [doc] = await (await getDb()).collection<Dok>(tabel)
        .find({}, { projection: { _id: 1 } }).sort({ _id: -1 }).limit(1).toArray();
    const angkaId = [rows[0].m, doc?._id].filter(Boolean).map((v) => Number(String(v).slice(3)));
    return awalan + String(Math.max(0, ...angkaId) + 1).padStart(3, "0");
}

async function catat(aksi: string, detail: object) {
    await (await getDb()).collection("LOG_AKTIVITAS").insertOne({ aksi, detail, waktu: new Date(), dibaca: false
});
}

const kembali = (pesan: string) => redirect(`/transaksi?msg=${encodeURIComponent(pesan)}`);

export async function tambahPengiriman(form: FormData) {
    let pesan = "";
    let committed = false;
    const conn = await pool.getConnection();
    try {
        const pelanggan = kode(form, "id_pelanggan", "PLG");
        const asal = kode(form, "id_cabang_asal", "CBG");
        const tujuan = kode(form, "id_cabang_tujuan", "CBG");
        if (asal === tujuan) throw new Error("Cabang asal dan tujuan harus berbeda");
        const estimasi = ambil(form, "tanggal_estimasi_tiba", 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(estimasi)) throw new Error("Tanggal tidak valid");
        const layanan = pilih(form, "jenis_layanan", LAYANAN);
        const prioritas = pilih(form, "prioritas_kiriman", PRIORITAS);
        const barang = {
            deskripsi_barang: ambil(form, "deskripsi_barang"),
            kategori_barang: pilih(form, "kategori_barang", KATEGORI),
            berat_kg: angka(form, "berat_kg"),
            volume_m3: angka(form, "volume_m3"),
            nilai_barang: angka(form, "nilai_barang"),
            tingkat_bahaya: pilih(form, "tingkat_bahaya", BAHAYA),
        };

        await conn.beginTransaction();
        const idKirim = await idBerikut(conn, "PENGIRIMAN", "id_pengiriman", "KRM");
        const idBarang = await idBerikut(conn, "DETAIL_BARANG", "id_barang", "BRG");
        await conn.execute(
            `INSERT INTO PENGIRIMAN (id_pengiriman, id_pelanggan, id_cabang_asal, id_cabang_tujuan, id_penugasan,
                tanggal_pesan, tanggal_estimasi_tiba, status_pengiriman, jenis_layanan, prioritas_kiriman)
            VALUES (?, ?, ?, ?, NULL, CURDATE(), ?, 'Menunggu Penjadwalan', ?, ?)`,
         [idKirim, pelanggan, asal, tujuan, estimasi, layanan, prioritas]);
        if (form.get("simulasi_gagal")) throw new Error("Simulasi gagal setelah INSERT pertama, jadi INSERT PENGIRIMAN ikut dibatalkan");
        await conn.execute(
            `INSERT INTO DETAIL_BARANG (id_barang, id_pengiriman, deskripsi_barang, kategori_barang, berat_kg,
volume_m3, nilai_barang, tingkat_bahaya)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [idBarang, idKirim, barang.deskripsi_barang, barang.kategori_barang, barang.berat_kg, barang.volume_m3,
barang.nilai_barang, barang.tingkat_bahaya]);
        await conn.commit();
        committed = true;
            
        // shortcut: dual-write tanpa transaksi lintas database; kalau MongoDB gagal, data MySQL tetap tersimpan
        const db = await getDb();
        await db.collection<Dok>("PENGIRIMAN").insertOne({
            _id: idKirim, id_pelanggan: pelanggan, id_cabang_asal: asal, id_cabang_tujuan: tujuan,
            tanggal_pesan: new Date(), tanggal_estimasi_tiba: new Date(estimasi),
            status_pengiriman: "Menunggu Penjadwalan", jenis_layanan: layanan, prioritas_kiriman: prioritas });
        await db.collection<Dok>("DETAIL_BARANG").insertOne({ _id: idBarang, id_pengiriman: idKirim, ...barang });
        await catat("INSERT", { id_pengiriman: idKirim, id_barang: idBarang });
        pesan = `Berhasil: ${idKirim} dan ${idBarang} tersimpan (COMMIT) lalu disalin ke MongoDB`;
} catch (e) {
        if (!committed) await conn.rollback().catch(() => {});
        pesan = (committed ? "Tersimpan di MySQL, tapi gagal sinkron ke MongoDB: " : "Gagal, transaksi di-ROLLBACK: ") + (e as Error).message;
    } finally {
        conn.release();
    }
    kembali(pesan);
}

export async function ubahStatus(form: FormData) {
    let pesan = "";
    try {
        const id = kode(form, "id", "KRM");
        const status = pilih(form, "status", STATUS);
        const [res] = await pool.execute<ResultSetHeader>(
            "UPDATE PENGIRIMAN SET status_pengiriman = ? WHERE id_pengiriman = ?", [status, id]);
        await (await getDb()).collection<Dok>("PENGIRIMAN").updateOne({ _id: id }, { $set: { status_pengiriman:
status } });
        await catat("UPDATE", { id_pengiriman: id, status });
        pesan = `UPDATE ${id}: ${res.affectedRows} baris berubah`;
    } catch (e) {
        pesan = "Gagal: " + (e as Error).message;
    }
    kembali(pesan);
}

export async function hapusPengiriman(form: FormData) {
    let pesan = "";
    try {
        const id = kode(form, "id", "KRM");
        const [res] = await pool.execute<ResultSetHeader>("DELETE FROM PENGIRIMAN WHERE id_pengiriman = ?", [id]);
        const db = await getDb();
        await db.collection<Dok>("PENGIRIMAN").deleteOne({ _id: id });
        for (const c of ["DETAIL_BARANG", "FAKTUR", "ASURANSI"]) await db.collection(c).deleteMany({ id_pengiriman:
id });
        await catat("DELETE", { id_pengiriman: id });
        pesan = `DELETE ${id}: ${res.affectedRows} baris dihapus; DETAIL_BARANG, FAKTUR, ASURANSI ikut terhapus (ON
DELETE CASCADE)`;
    } catch (e) {
        const err = e as { errno?: number; message: string };
        pesan = err.errno === 1451 ? "Ditolak FOREIGN KEY (ON DELETE RESTRICT): " + err.message : "Gagal: " +
err.message;
    }
    kembali(pesan);
}

