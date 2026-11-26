import { Suspense } from "react";
import { runSql } from "@/lib/mysql";
import QueryCard from "@/components/QueryCard";
import { cobaSql } from "@/lib/konsol";
import Memuat from "@/components/Memuat";
import Kepala from "@/components/Kepala";
import { BAHAYA, KATEGORI, LAYANAN, PRIORITAS, STATUS } from "@/lib/opsi";
import { hapusPengiriman, tambahPengiriman, ubahStatus } from "./actions";

const LIST_SQL = `SELECT p.id_pengiriman, pl.nama_perusahaan, a.nama_cabang AS asal, t.nama_cabang AS tujuan,
    p.status_pengiriman, p.jenis_layanan, COUNT(b.id_barang) AS jumlah_barang
FROM PENGIRIMAN p
JOIN PELANGGAN pl ON pl.id_pelanggan = p.id_pelanggan
JOIN KANTOR_CABANG a ON a.id_cabang = p.id_cabang_asal
JOIN KANTOR_CABANG t ON t.id_cabang = p.id_cabang_tujuan
LEFT JOIN DETAIL_BARANG b ON b.id_pengiriman = p.id_pengiriman
GROUP BY p.id_pengiriman, pl.nama_perusahaan, a.nama_cabang, t.nama_cabang, p.status_pengiriman, p.jenis_layanan
ORDER BY p.id_pengiriman`;

const TX_SQL = `START TRANSACTION;
INSERT INTO PENGIRIMAN (...) VALUES (?, ?, ?, ?, NULL, CURDATE(), ?, 'Menunggu Penjadwalan', ?, ?);
INSERT INTO DETAIL_BARANG (...) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
COMMIT; -- kalau salah satu gagal: ROLLBACK
UPDATE PENGIRIMAN SET status_pengiriman = ? WHERE id_pengiriman = ?;
DELETE FROM PENGIRIMAN WHERE id_pengiriman = ?; -- DETAIL_BARANG, FAKTUR, ASURANSI: ON DELETE CASCADE`;

const s = (v: unknown) => String(v ?? "");
const inp = "min-h-11 w-full rounded-lg border border-line bg-bg px-3 text-sm hover:border-muted";
const tombol = "min-h-11 rounded-lg bg-fox px-4 font-semibold text-bg hover:bg-fox-deep hover:text-ink";

function F({ label, children }: { label: string; children: React.ReactNode }) {
    return <label className="block space-y-1 text-sm"><span className="text-muted">{label}</span>{children}</label>;
}

function Pilihan({ name, opsi }: { name: string; opsi: string[] }) {
    return <select name={name} className={inp}>{opsi.map((v) => <option key={v}>{v}</option>)}</select>;
}

async function Isi({ searchParams }: { searchParams: PageProps<"/transaksi">["searchParams"] }) {
    const { msg } = await searchParams;
    const [list, pelanggan, cabang] = await Promise.all([
        runSql(LIST_SQL),
        runSql("SELECT id_pelanggan, nama_perusahaan FROM PELANGGAN WHERE status_aktif = TRUE ORDER BY nama_perusahaan"),
        runSql("SELECT id_cabang, nama_cabang FROM KANTOR_CABANG ORDER BY id_cabang"),
    ]);
    const opsiCabang = cabang.rows.map((r) => <option key={s(r.id_cabang)} value={s(r.id_cabang)}>{s(r.nama_cabang)}</option>);

    return (
        <>
            {typeof msg === "string" && <p role="status" className="rounded-lg border border-ice/50 bg-ice/10 p-3 text-sm">{msg}</p>}

            <form action={tambahPengiriman} className="space-y-5 rounded-xl border border-line bg-surface p-4 sm:p-5">
                <div className="space-y-1">
                    <h2 className="font-display text-lg font-semibold">Pengiriman baru</h2>
                    <p className="text-sm text-muted">Satu pengiriman dan satu barang disimpan dalam satu transaksi. Kalau salah satu INSERT gagal, keduanya dibatalkan.</p>
                </div>
                <fieldset className="grid gap-3 sm:grid-cols-2">
                    <legend className="mb-2 text-sm font-medium">Rute & layanan</legend>
                    <F label="Pelanggan">
                        <select name="id_pelanggan" className={inp} required>
                            {pelanggan.rows.map((r) => <option key={s(r.id_pelanggan)} value={s(r.id_pelanggan)}>{s(r.nama_perusahaan)}</option>)}
                        </select>
                    </F>
                    <F label="Estimasi tiba"><input type="date" name="tanggal_estimasi_tiba" className={inp} required /></F>
                    <F label="Cabang asal"><select name="id_cabang_asal" className={inp}>{opsiCabang}</select></F>
                    <F label="Cabang tujuan"><select name="id_cabang_tujuan" className={inp}>{opsiCabang}</select></F>
                    <F label="Jenis layanan"><Pilihan name="jenis_layanan" opsi={LAYANAN} /></F>
                    <F label="Prioritas"><Pilihan name="prioritas_kiriman" opsi={PRIORITAS} /></F>
                </fieldset>
                <fieldset className="grid gap-3 sm:grid-cols-2">
                    <legend className="mb-2 text-sm font-medium">Barang</legend>
                    <F label="Deskripsi barang"><input name="deskripsi_barang" maxLength={150} className={inp} required /></F>
                    <F label="Kategori"><Pilihan name="kategori_barang" opsi={KATEGORI} /></F>
                    <F label="Berat (kg)"><input type="number" name="berat_kg" min="0.01" step="any" className={inp} required /></F>
                    <F label="Volume (m³)"><input type="number" name="volume_m3" min="0.01" step="any" className={inp} required /></F>
                    <F label="Nilai barang (Rp)"><input type="number" name="nilai_barang" min="1" step="1" className={inp} required /></F>
                    <F label="Tingkat bahaya"><Pilihan name="tingkat_bahaya" opsi={BAHAYA} /></F>
                </fieldset>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <label className="flex min-h-11 items-center gap-2 text-sm">
                        <input type="checkbox" name="simulasi_gagal" className="size-4" />
                        Paksa error setelah INSERT pertama (untuk membuktikan ROLLBACK)
                    </label>
                    <button className={tombol}>Simpan transaksi</button>
                </div>
            </form>

            <QueryCard title="Daftar pengiriman" materi="INSERT · UPDATE · DELETE + TRANSACTION + FK" coba={cobaSql(LIST_SQL)}
                query={`${LIST_SQL}\n\n-- perintah tulis yang dipakai:\n${TX_SQL}`} error={list.error}>
                {!list.error && (
                    <div className="overflow-x-auto rounded-lg border border-line">
                        <table className="w-full text-sm">
                            <thead className="bg-raised text-left text-muted">
                                <tr>
                                    {["ID", "Pelanggan", "Rute", "Barang", "Status", "Aksi"].map((h) => (
                                        <th key={h} scope="col" className="whitespace-nowrap px-3 py-2 font-medium">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {list.rows.length === 0 && (
                                    <tr><td colSpan={6} className="p-4 text-muted">Belum ada pengiriman. Isi formulir di atas untuk membuat yang pertama.</td></tr>
                                )}
                                {list.rows.map((r) => (
                                    <tr key={s(r.id_pengiriman)} className="hover:bg-raised/60">
                                        <td className="px-3 py-2 font-mono text-xs">{s(r.id_pengiriman)}</td>
                                        <td className="px-3 py-2">{s(r.nama_perusahaan)}</td>
                                        <td className="whitespace-nowrap px-3 py-2">{s(r.asal).replace("Cabang ", "")} → {s(r.tujuan).replace("Cabang ", "")}</td>
                                        <td className="px-3 py-2 tabular-nums">{s(r.jumlah_barang)}</td>
                                        <td className="px-3 py-2">
                                            <form action={ubahStatus} className="flex gap-1">
                                                <input type="hidden" name="id" value={s(r.id_pengiriman)} />
                                                <select name="status" defaultValue={s(r.status_pengiriman)} aria-label={`Status ${s(r.id_pengiriman)}`}
                                                    className="min-h-11 rounded-lg border border-line bg-bg px-2">
                                                    {STATUS.map((v) => <option key={v}>{v}</option>)}
                                                </select>
                                                <button className="min-h-11 rounded-lg border border-line px-3 hover:border-fox">Ubah</button>
                                            </form>
                                        </td>
                                        <td className="px-3 py-2">
                                            <form action={hapusPengiriman}>
                                                <input type="hidden" name="id" value={s(r.id_pengiriman)} />
                                                <button className="min-h-11 rounded-lg px-2 text-bad hover:underline" aria-label={`Hapus ${s(r.id_pengiriman)}`}>Hapus</button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </QueryCard>
        </>
    );
}

export default function Transaksi(props: PageProps<"/transaksi">) {
    return (
        <>
            <Kepala sumber="MySQL (TiDB) · PENGIRIMAN, DETAIL_BARANG" judul="Transaksi pengiriman">
                Tambah, ubah status, atau hapus pengiriman. Setiap perubahan juga dicatat ke log aktivitas di MongoDB.
            </Kepala>
            <Suspense fallback={<Memuat apa="daftar pengiriman" />}><Isi searchParams={props.searchParams} /></Suspense>
        </>
    );
}
