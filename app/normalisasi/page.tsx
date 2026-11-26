import { Suspense } from "react";
import { connection } from "next/server";
import { runSql } from "@/lib/mysql";
import QueryCard, { GagalQuery } from "@/components/QueryCard";
import { cobaSql } from "@/lib/konsol";
import Memuat from "@/components/Memuat";
import Kepala from "@/components/Kepala";
import ErdScene, { type Rel, type Tbl } from "@/components/three/ErdScene";
import NormalisasiStepper from "@/components/NormalisasiStepper";

const TABEL = `SELECT c.TABLE_NAME AS tabel, COUNT(*) AS jumlah_kolom
FROM INFORMATION_SCHEMA.COLUMNS c
JOIN INFORMATION_SCHEMA.TABLES t ON t.TABLE_SCHEMA = c.TABLE_SCHEMA AND t.TABLE_NAME = c.TABLE_NAME
WHERE c.TABLE_SCHEMA = DATABASE() AND t.TABLE_TYPE = 'BASE TABLE'
GROUP BY c.TABLE_NAME ORDER BY c.TABLE_NAME`;

const RELASI = `SELECT TABLE_NAME AS dari, COLUMN_NAME AS kolom, REFERENCED_TABLE_NAME AS ke
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY dari`;

async function Isi() {
    await connection();
    const [t, r] = await Promise.all([runSql(TABEL), runSql(RELASI)]);
    return (
        <>
            {t.error ? <GagalQuery error={t.error} /> : <ErdScene tabel={t.rows as Tbl[]} relasi={r.rows as Rel[]} />}
            <QueryCard title="Daftar tabel (data dictionary)" materi="INFORMATION_SCHEMA" query={TABEL} coba={cobaSql(TABEL)} rows={t.rows} error={t.error} />
            <QueryCard title="Seluruh FOREIGN KEY" materi="INFORMATION_SCHEMA.KEY_COLUMN_USAGE" query={RELASI} coba={cobaSql(RELASI)} rows={r.rows} error={r.error} />
        </>
    );
}

export default function Normalisasi() {
    return (
        <>
            <Kepala sumber="MySQL · INFORMATION_SCHEMA" judul="Dari nota berantakan ke skema 3NF">
                Ikuti langkah normalisasi nota pengiriman, lalu lihat hasil akhirnya sebagai skema relasional yang dibaca langsung dari database.
            </Kepala>
            <NormalisasiStepper />
            <Suspense fallback={<Memuat apa="skema database" />}><Isi /></Suspense>
        </>
    );
}
