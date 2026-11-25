import { Suspense } from "react";
import type { Document, Sort } from "mongodb";
import { getDb, plain } from "@/lib/mongo";
import QueryCard from "@/components/QueryCard";
import Memuat from "@/components/Memuat";
import { KATEGORI } from "@/lib/opsi";
import { hapusLog, tandaiDibaca } from "@/app/actions";

const URUT: Record<string, Sort> = { nilai: { nilai_barang: -1 }, berat: { berat_kg: -1 }, nama: {
deskripsi_barang: 1 } };
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const tahap = (p?: Document): string => (p ? [p.stage, tahap(p.inputStage)].filter(Boolean).join(" ← ") : "");
const rencana = (e: Document) => tahap(e.queryPlanner?.winningPlan?.queryPlan ?? e.queryPlanner?.winningPlan);
const satu = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const inp = "rounded-lg border border-line bg-bg px-2 py-1.5 text-sm";

async function Isi({ searchParams }: { searchParams: PageProps<"/mongo">["searchParams"] }) {
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
            <form className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-surface p-4 text-sm">
                <fieldset className="flex flex-wrap gap-2">
                    <legend className="mb-1 text-muted">Kategori ($in)</legend>
                    {KATEGORI.map((k) => (
                        <label key={k} className="flex items-center gap-1">
                            <input type="checkbox" name="kategori" value={k} defaultChecked={kat.includes(k)} /> {k}
                        </label>
                    ))}
                </fieldset>
                <label className="space-y-1"><span className="block text-muted">Nilai min ($gte)</span><input
name="min" type="number" defaultValue={min} className={inp} /></label>
                <label className="space-y-1"><span className="block text-muted">Nilai max ($lte)</span><input
name="max" type="number" defaultValue={max} className={inp} /></label>
                <label className="space-y-1"><span className="block text-muted">Cari teks ($regex)</span><input
name="q" maxLength={50} defaultValue={q} className={inp} /></label>
                <label className="space-y-1"><span className="block text-muted">Urutkan (sort)</span>
                    <select name="urut" defaultValue={urutKey} className={inp}>
                        <option value="nilai">Nilai terbesar</option><option value="berat">Terberat</option><option
value="nama">Nama A–Z</option>
                    </select>
                </label>
                <label className="flex items-center gap-1"><input type="checkbox" name="b3" defaultChecked={b3} />
Hanya B3 ($ne)</label>
                <label className="flex items-center gap-1"><input type="checkbox" name="catatan" defaultChecked=
{catatan} /> Punya catatan ($exists)</label>
                <button className="rounded-lg bg-accent px-4 py-2 font-medium text-bg">Cari</button>
            </form>

            <QueryCard
                title={`Hasil pencarian: ${jumlah} dokumen`}
                materi="find() · sort() · limit() · countDocuments() · distinct()"
                note={`distinct("kategori_barang") = ${kategoriUnik.join(", ")}`}
                query={`db.DETAIL_BARANG.find(${JSON.stringify(filter, null, 2)})\n
                .sort(${JSON.stringify(urut)}).limit(20)\n\ndb.DETAIL_BARANG.countDocuments(<filter yang
                sama>)\ndb.DETAIL_BARANG.distinct("kategori_barang")`}
                rows={plain(hasil)}
            />

            <QueryCard
                title="Pengaruh index terhadap rencana eksekusi"
                materi="createIndex · explain()"
                note="IXSCAN = memakai index, COLLSCAN = memindai seluruh collection."
                query={`db.KENDARAAN.find({ plat_nomor: "L 9123 UA" }).explain("queryPlanner")\ndb.KENDARAAN.find({
                merek_kendaraan: "Hino 500" }).explain("queryPlanner")\ndb.KENDARAAN.getIndexes()`}
                rows={[
                    { query: '{ plat_nomor: "L 9123 UA" }', index_tersedia: "plat_nomor_1 (unique)", rencana:
                rencana(exIndex) },
                    { query: '{ merek_kendaraan: "Hino 500" }', index_tersedia: "—", rencana: rencana(exTanpa) },
                    ...plain(indexes).map((ix) => ({ query: "getIndexes()", index_tersedia: ix.name, rencana:
                JSON.stringify(ix.key) })),
            ]}
            />

            <QueryCard
                title="Log aktivitas (ditulis otomatis setiap transaksi MySQL)"
                materi="insertOne · find · updateMany · deleteMany"
                query={`db.LOG_AKTIVITAS.insertOne({ aksi, detail, waktu: new Date(), dibaca: false }) // dari halaman Transaksi\ndb.LOG_AKTIVITAS.find().sort({ waktu: -1 }).limit(10)\ndb.LOG_AKTIVITAS.updateMany({ dibaca: false
            }, { $set: { dibaca: true } })\ndb.LOG_AKTIVITAS.deleteMany({})`}
                rows={plain(log)}
            >

                <div className="flex gap-2 text-sm">
                    <form action={tandaiDibaca}><button className="rounded-lg border border-line px-3 py-1 hover:borderprimary">Tandai dibaca (updateMany)</button></form>
                    <form action={hapusLog}><button className="rounded-lg border border-line px-3 py-1 text-bad
hover:border-bad">Hapus semua (deleteMany)</button></form>
                </div>
            </QueryCard>
        </>
    );
}

export default function Mongo(props: PageProps<"/mongo">) {
    return (
        <>
            <h1 className="text-2xl font-bold">MongoDB: Method, Filter, Operator, Index</h1>
            <Suspense fallback={<Memuat />}><Isi searchParams={props.searchParams} /></Suspense>
        </>
    );
}
