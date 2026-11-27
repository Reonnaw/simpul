import { Suspense } from "react";
import { connection } from "next/server";
import type { Document, Sort } from "mongodb";
import { getDb, plain } from "@/lib/mongo";
import QueryCard from "@/components/QueryCard";
import { cobaMongo } from "@/lib/konsol";
import Memuat from "@/components/Memuat";
import Kepala from "@/components/Kepala";
import { KATEGORI } from "@/lib/opsi";
import { hapusLog, tandaiDibaca } from "@/app/actions";

const URUT: Record<string, Sort> = { nilai: { nilai_barang: -1 }, berat: { berat_kg: -1 }, nama: { deskripsi_barang: 1 } };
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const tahap = (p?: Document): string => (p ? [p.stage, tahap(p.inputStage)].filter(Boolean).join(" ← ") : "");
const rencana = (e: Document) => tahap(e.queryPlanner?.winningPlan?.queryPlan ?? e.queryPlanner?.winningPlan);
const satu = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const inp = "min-h-11 w-full rounded-lg border border-line bg-bg px-3 text-sm hover:border-muted";
const sekunder = "min-h-11 rounded-lg border border-line px-3 text-sm";

async function Isi({ searchParams }: { searchParams: PageProps<"/mongo">["searchParams"] }) {
    await connection(); // driver MongoDB memakai waktu saat ini, jadi wajib dirender per request
    const sp = await searchParams;
    const kat = [sp.kategori ?? []].flat().filter((k) => KATEGORI.includes(k));
    const min = satu(sp.min), max = satu(sp.max), q = satu(sp.q), urutKey = satu(sp.urut) ?? "nilai";
    const b3 = Boolean(satu(sp.b3)), catatan = Boolean(satu(sp.catatan));

    // filter dibangun dari input yang sudah divalidasi (whitelist kategori, angka, regex di-escape)
    const filter: Document = {};
    if (kat.length) filter.kategori_barang = { $in: kat };
    if (min && Number.isFinite(Number(min))) filter.nilai_barang = { ...filter.nilai_barang, $gte: Number(min) };
    if (max && Number.isFinite(Number(max))) filter.nilai_barang = { ...filter.nilai_barang, $lte: Number(max) };
    if (q) filter.deskripsi_barang = { $regex: escapeRegex(q.slice(0, 50)), $options: "i" };
    if (b3) filter.tingkat_bahaya = { $ne: "Non-B3" };
    if (catatan) filter.catatan_penanganan = { $exists: true };
    const urut = URUT[urutKey] ?? URUT.nilai;

    const db = await getDb();
    const barang = db.collection("DETAIL_BARANG");
    const kendaraan = db.collection("KENDARAAN");
    const [hasil, jumlah, kategoriUnik, exIndex, exTanpa, indexes, log] = await Promise.all([
        barang.find(filter, { projection: { deskripsi_barang: 1, kategori_barang: 1, berat_kg: 1, nilai_barang: 1, tingkat_bahaya: 1 } })
            .sort(urut).limit(20).toArray(),
        barang.countDocuments(filter),
        barang.distinct("kategori_barang"),
        kendaraan.find({ plat_nomor: "L 9123 UA" }).explain("queryPlanner"),
        kendaraan.find({ merek_kendaraan: "Hino 500" }).explain("queryPlanner"),
        kendaraan.indexes(),
        db.collection("LOG_AKTIVITAS").find().sort({ waktu: -1 }).limit(10).toArray(),
    ]);

    return (
        <>
            <form className="space-y-4 rounded-xl border border-line bg-surface p-4 sm:p-5">
                <fieldset className="flex flex-wrap gap-x-4 gap-y-1">
                    <legend className="mb-1 text-sm text-muted">Kategori <code className="font-mono text-xs text-ice">$in</code></legend>
                    {KATEGORI.map((k) => (
                        <label key={k} className="flex min-h-11 items-center gap-2 text-sm">
                            <input type="checkbox" name="kategori" value={k} defaultChecked={kat.includes(k)} className="size-4" /> {k}
                        </label>
                    ))}
                </fieldset>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="space-y-1 text-sm"><span className="block text-muted">Nilai min <code className="font-mono text-xs text-ice">$gte</code></span>
                        <input name="min" type="number" defaultValue={min} className={inp} /></label>
                    <label className="space-y-1 text-sm"><span className="block text-muted">Nilai max <code className="font-mono text-xs text-ice">$lte</code></span>
                        <input name="max" type="number" defaultValue={max} className={inp} /></label>
                    <label className="space-y-1 text-sm"><span className="block text-muted">Cari deskripsi <code className="font-mono text-xs text-ice">$regex</code></span>
                        <input name="q" maxLength={50} defaultValue={q} className={inp} placeholder="misal: laptop" /></label>
                    <label className="space-y-1 text-sm"><span className="block text-muted">Urutkan <code className="font-mono text-xs text-ice">sort()</code></span>
                        <select name="urut" defaultValue={urutKey} className={inp}>
                            <option value="nilai">Nilai terbesar</option>
                            <option value="berat">Terberat</option>
                            <option value="nama">Nama A–Z</option>
                        </select>
                    </label>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <div className="flex flex-wrap gap-x-5">
                        <label className="flex min-h-11 items-center gap-2 text-sm">
                            <input type="checkbox" name="b3" defaultChecked={b3} className="size-4" /> Hanya barang B3 <code className="font-mono text-xs text-ice">$ne</code>
                        </label>
                        <label className="flex min-h-11 items-center gap-2 text-sm">
                            <input type="checkbox" name="catatan" defaultChecked={catatan} className="size-4" /> Punya catatan <code className="font-mono text-xs text-ice">$exists</code>
                        </label>
                    </div>
                    <button className="min-h-11 rounded-lg bg-fox px-5 font-semibold text-bg hover:bg-fox-deep">Cari barang</button>
                </div>
            </form>

            <QueryCard
                title={`${jumlah} barang cocok`}
                materi="find · sort · limit · countDocuments · distinct"
                coba={cobaMongo("DETAIL_BARANG", [{ $match: filter }, { $sort: urut }, { $limit: 20 }])}
                note={`Kategori yang ada (distinct): ${kategoriUnik.join(", ")}. Tabel menampilkan maksimal 20 dokumen.`}
                query={`db.DETAIL_BARANG.find(${JSON.stringify(filter, null, 2)})\n  .sort(${JSON.stringify(urut)}).limit(20)\n\ndb.DETAIL_BARANG.countDocuments(<filter yang sama>)\ndb.DETAIL_BARANG.distinct("kategori_barang")`}
                rows={plain(hasil)}
            />

            <QueryCard
                title="Pengaruh index terhadap rencana eksekusi"
                materi="createIndex · explain()"
                note="IXSCAN berarti memakai index, COLLSCAN berarti memindai seluruh collection."
                query={`db.KENDARAAN.find({ plat_nomor: "L 9123 UA" }).explain("queryPlanner")\ndb.KENDARAAN.find({ merek_kendaraan: "Hino 500" }).explain("queryPlanner")\ndb.KENDARAAN.getIndexes()`}
                rows={[
                    { query: '{ plat_nomor: "L 9123 UA" }', index_tersedia: "plat_nomor_1 (unique)", rencana: rencana(exIndex) },
                    { query: '{ merek_kendaraan: "Hino 500" }', index_tersedia: "tidak ada", rencana: rencana(exTanpa) },
                    ...plain(indexes).map((ix) => ({ query: "getIndexes()", index_tersedia: ix.name, rencana: JSON.stringify(ix.key) })),
                ]}
            />

            <QueryCard
                title="Log aktivitas"
                materi="insertOne · find · updateMany · deleteMany"
                note="Ditulis otomatis setiap ada transaksi di halaman Transaksi (MySQL)."
                query={`db.LOG_AKTIVITAS.insertOne({ aksi, detail, waktu: new Date(), dibaca: false }) // dari halaman Transaksi\ndb.LOG_AKTIVITAS.find().sort({ waktu: -1 }).limit(10)\ndb.LOG_AKTIVITAS.updateMany({ dibaca: false }, { $set: { dibaca: true } })\ndb.LOG_AKTIVITAS.deleteMany({})`}
                rows={plain(log)}
            >
                <div className="flex flex-wrap gap-2">
                    <form action={tandaiDibaca}><button className={`${sekunder} hover:border-fox`}>Tandai semua dibaca</button></form>
                    <form action={hapusLog}><button className={`${sekunder} text-bad hover:border-bad`}>Hapus semua log</button></form>
                </div>
            </QueryCard>
        </>
    );
}

export default function Mongo(props: PageProps<"/mongo">) {
    return (
        <>
            <Kepala sumber="MongoDB · DETAIL_BARANG, KENDARAAN, LOG_AKTIVITAS" judul="Cari barang, baca index, kelola log">
                Setiap kolom formulir memetakan ke satu operator query. Hasil, rencana eksekusi, dan perintah tulisnya tampil di bawah.
            </Kepala>
            <Suspense fallback={<Memuat apa="dokumen MongoDB" />}><Isi searchParams={props.searchParams} /></Suspense>
        </>
    );
}
