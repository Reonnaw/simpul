import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { runPipeline } from "@/lib/mongo";
import QueryCard from "@/components/QueryCard";
import { cobaMongo } from "@/lib/konsol";
import Memuat from "@/components/Memuat";
import Kepala from "@/components/Kepala";
import TreeScene, { type Simpul } from "@/components/three/TreeScene";

const KEDALAMAN: [string, string | null][] = [["Semua tingkat", null], ["maxDepth 0", "0"], ["maxDepth 1", "1"]];

async function Isi({ searchParams }: { searchParams: PageProps<"/hierarki">["searchParams"] }) {
    await connection(); // driver MongoDB memakai waktu saat ini, jadi wajib dirender per request
    const { depth } = await searchParams;
    const d = typeof depth === "string" ? Math.min(Math.max(Number(depth) || 0, 0), 5) : null;

    const bawahan = [
        { $match: { _id: "CBG003" } },
        { $graphLookup: { from: "KANTOR_CABANG", startWith: "$_id", connectFromField: "_id", connectToField: "id_cabang_induk",
            as: "bawahan", depthField: "tingkat", ...(d !== null && { maxDepth: d }) } },
        { $unwind: "$bawahan" },
        { $project: { _id: 0, kode: "$bawahan._id", cabang: "$bawahan.nama_cabang", induk: "$bawahan.id_cabang_induk", tingkat: "$bawahan.tingkat" } },
        { $sort: { tingkat: 1, kode: 1 } },
    ];
    const rantai = [
        { $graphLookup: { from: "KANTOR_CABANG", startWith: "$id_cabang_induk", connectFromField: "id_cabang_induk", connectToField: "_id",
            as: "rantai_induk", depthField: "tingkat" } },
        { $project: { nama_cabang: 1, rantai_induk: { $map: {
            input: { $sortArray: { input: "$rantai_induk", sortBy: { tingkat: 1 } } }, as: "c",
            in: { $concat: ["$$c._id", " (tingkat ", { $toString: "$$c.tingkat" }, ")"] },
        } } } },
    ];
    const jaringan = [
        { $match: { _id: "CBG002" } },
        { $graphLookup: { from: "PENGIRIMAN", startWith: "$_id", connectFromField: "id_cabang_tujuan", connectToField: "id_cabang_asal",
            as: "jalur", depthField: "langkah" } },
        { $unwind: "$jalur" },
        { $group: { _id: "$jalur.id_cabang_tujuan", langkah_minimum: { $min: "$jalur.langkah" }, jumlah_pengiriman: { $sum: 1 } } },
        { $sort: { langkah_minimum: 1, _id: 1 } },
    ];

    const [b, r, j] = await Promise.all([
        runPipeline("KANTOR_CABANG", bawahan), runPipeline("KANTOR_CABANG", rantai), runPipeline("KANTOR_CABANG", jaringan),
    ]);

    return (
        <>
            <nav aria-label="Kedalaman penelusuran" className="flex flex-wrap gap-2">
                {KEDALAMAN.map(([label, v]) => (
                    <Link key={label} href={v === null ? "/hierarki" : `/hierarki?depth=${v}`} aria-current={String(d) === String(v) ? "page" : undefined}
                        className={`flex min-h-11 items-center rounded-lg border px-3 text-sm ${String(d) === String(v) ? "border-fox bg-raised font-semibold" : "border-line hover:border-muted"}`}>
                        {label}
                    </Link>
                ))}
            </nav>
            <TreeScene nodes={b.error ? [] : (b.rows as Simpul[])} />
            <QueryCard title="Seluruh bawahan kantor pusat" materi="$graphLookup + maxDepth + $unwind" query={bawahan} coba={cobaMongo("KANTOR_CABANG", bawahan)} rows={b.rows} error={b.error} />
            <QueryCard title="Rantai atasan setiap cabang" materi="$graphLookup + $sortArray + $map" query={rantai} coba={cobaMongo("KANTOR_CABANG", rantai)} rows={r.rows} error={r.error} />
            <QueryCard title="Cabang yang terjangkau dari Semarang lewat rute pengiriman" materi="$graphLookup antarcollection" query={jaringan} coba={cobaMongo("KANTOR_CABANG", jaringan)} rows={j.rows} error={j.error} />
        </>
    );
}

export default function Hierarki(props: PageProps<"/hierarki">) {
    return (
        <>
            <Kepala sumber="MongoDB · KANTOR_CABANG · $graphLookup" judul="Siapa melapor ke siapa">
                Penelusuran rekursif dari kantor pusat Jakarta ke semua cabang di bawahnya. Batasi kedalamannya dengan maxDepth.
            </Kepala>
            <Suspense fallback={<Memuat apa="hierarki cabang" />}><Isi searchParams={props.searchParams} /></Suspense>
        </>
    );
}
