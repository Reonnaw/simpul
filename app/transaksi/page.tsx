import { Suspense } from "react";
import { runSql } from "@/lib/mysql";
import QueryCard from "@/components/QueryCard";
import Memuat from "@/components/Memuat";
import { BAHAYA, KATEGORI, LAYANAN, PRIORITAS, STATUS } from "@/lib/opsi";
import { hapusPengiriman, tambahPengiriman, ubahStatus } from "./actions";
const LIST_SQL = `SELECT p.id_pengiriman, pl.nama_perusahaan, a.nama_cabang AS asal, t.nama_cabang AS tujuan,
    p.status_pengiriman, p.jenis_layanan, COUNT(b.id_barang) AS jumlah_barang
FROM PENGIRIMAN p
JOIN PELANGGAN pl ON pl.id_pelanggan = p.id_pelanggan
JOIN KANTOR_CABANG a ON a.id_cabang = p.id_cabang_asal
JOIN KANTOR_CABANG t ON t.id_cabang = p.id_cabang_tujuan
LEFT JOIN DETAIL_BARANG b ON b.id_pengiriman = p.id_pengiriman
GROUP BY p.id_pengiriman, pl.nama_perusahaan, a.nama_cabang, t.nama_cabang, p.status_pengiriman,
p.jenis_layanan
ORDER BY p.id_pengiriman`;

const TX_SQL = `START TRANSACTION;
INSERT INTO PENGIRIMAN (...) VALUES (?, ?, ?, ?, NULL, CURDATE(), ?, 'Menunggu Penjadwalan', ?, ?);
INSERT INTO DETAIL_BARANG (...) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
COMMIT; -- kalau salah satu gagal: ROLLBACK
UPDATE PENGIRIMAN SET status_pengiriman = ? WHERE id_pengiriman = ?;
DELETE FROM PENGIRIMAN WHERE id_pengiriman = ?; -- DETAIL_BARANG, FAKTUR, ASURANSI: ON DELETE CASCADE`;

const s = (v: unknown) => String(v ?? "");
const inp = "w-full rounded-lg border border-line bg-bg px-2 py-1.5 text-sm";

function F({ label, children }: { label: string; children: React.ReactNode }) {
    return <label className="space-y-1 text-sm"><span className="text-muted">{label}</span>{children}</label>;
}

async function Isi({ searchParams }: { searchParams: PageProps<"/transaksi">["searchParams"] }) {
    const { msg } = await searchParams;
    const [list, pelanggan, cabang] = await Promise.all([
        runSql(LIST_SQL),
        runSql("SELECT id_pelanggan, nama_perusahaan FROM PELANGGAN WHERE status_aktif = TRUE ORDER BY nama_perusahaan"),
        runSql("SELECT id_cabang, nama_cabang FROM KANTOR_CABANG ORDER BY id_cabang"),
    ]);
    const opsiCabang = cabang.rows.map((r) => <option key={s(r.id_cabang)} value={s(r.id_cabang)}>
{s(r.nama_cabang)}</option>);

    return (
        <>
            {typeof msg === "string" && <p role="status" className="rounded-lg border border-accent/50 bg-surface p-3
text-sm">{msg}</p>}

            <form action={tambahPengiriman} className="grid gap-3 rounded-xl border border-line bg-surface p-4
sm:grid-cols-2">
                <h2 className="font-semibold sm:col-span-2">Tambah pengiriman + 1 barang (satu transaksi)</h2>
                <F label="Pelanggan">
                    <select name="id_pelanggan" className={inp} required>
                        {pelanggan.rows.map((r) => <option key={s(r.id_pelanggan)} value={s(r.id_pelanggan)}>
{s(r.nama_perusahaan)}</option>)}
                    </select>
                </F>
                <F label="Estimasi tiba"><input type="date" name="tanggal_estimasi_tiba" className={inp} required />
</F>
                <F label="Cabang asal"><select name="id_cabang_asal" className={inp}>{opsiCabang}</select></F>
                <F label="Cabang tujuan"><select name="id_cabang_tujuan" className={inp}>{opsiCabang}</select></F>
                <F label="Jenis layanan"><select name="jenis_layanan" className={inp}>{LAYANAN.map((v) => <option key=
{v}>{v}</option>)}</select></F>
                <F label="Prioritas"><select name="prioritas_kiriman" className={inp}>{PRIORITAS.map((v) => <option
key={v}>{v}</option>)}</select></F>
                <F label="Deskripsi barang"><input name="deskripsi_barang" maxLength={150} className={inp} required />
</F>
                <F label="Kategori"><select name="kategori_barang" className={inp}>{KATEGORI.map((v) => <option key=
{v}>{v}</option>)}</select></F>
                <F label="Berat (kg)"><input type="number" name="berat_kg" min="0.01" step="any" className={inp}
required /></F>
                <F label="Volume (m³)"><input type="number" name="volume_m3" min="0.01" step="any" className={inp}
required /></F>
                <F label="Nilai barang (Rp)"><input type="number" name="nilai_barang" min="1" step="1" className={inp}
required /></F>
                <F label="Tingkat bahaya"><select name="tingkat_bahaya" className={inp}>{BAHAYA.map((v) => <option key=
{v}>{v}</option>)}</select></F>
                <label className="flex items-center gap-2 text-sm sm:col-span-2">
                    <input type="checkbox" name="simulasi_gagal" /> Simulasikan error setelah INSERT pertama (untuk
membuktikan ROLLBACK)
                </label>
                <button className="rounded-lg bg-accent px-4 py-2 font-medium text-bg sm:col-span-2">Simpan
transaksi</button>
            </form>

            <QueryCard title="Daftar pengiriman" materi="DML: INSERT · UPDATE · DELETE + TRANSACTION + FK" query=
{`${LIST_SQL}\n\n-- perintah tulis yang dipakai:\n${TX_SQL}`} error={list.error}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-muted">
{["ID", "Pelanggan", "Rute", "Barang", "Status", ""].map((h) => <th key={h} className="border-b
border-line px-2 py-1 font-medium">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {list.rows.map((r) => (
                                <tr key={s(r.id_pengiriman)} className="odd:bg-bg/40">
                                    <td className="px-2 py-1 font-mono">{s(r.id_pengiriman)}</td>
                                    <td className="px-2 py-1">{s(r.nama_perusahaan)}</td>
                                    <td className="px-2 py-1">{s(r.asal)} → {s(r.tujuan)}</td>
                                    <td className="px-2 py-1">{s(r.jumlah_barang)}</td>
                                    <td className="px-2 py-1">
                                        <form action={ubahStatus} className="flex gap-1">
                                            <input type="hidden" name="id" value={s(r.id_pengiriman)} />
                                            <select name="status" defaultValue={s(r.status_pengiriman)} className="rounded border
border-line bg-bg px-1 py-0.5">
                                            {STATUS.map((v) => <option key={v}>{v}</option>)}
                                            </select>
                                            <button className="rounded border border-line px-2 hover:border-primary">Ubah</button>
                                        </form>
                                    </td>
                                    <td className="px-2 py-1">
                                        <form action={hapusPengiriman}>
                                            <input type="hidden" name="id" value={s(r.id_pengiriman)} />
                                            <button className="text-bad hover:underline">Hapus</button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </QueryCard>
        </>
    );
}
export default function Transaksi(props: PageProps<"/transaksi">) {
return (
<>
<h1 className="text-2xl font-bold">Transaksi Pengiriman (MySQL)</h1>
<Suspense fallback={<Memuat />}><Isi searchParams={props.searchParams} /></Suspense>
</>
);
}
