import { Suspense } from "react";
import Link from "next/link";
import { runPipeline } from "@/lib/mongo";
import QueryCard from "@/components/QueryCard";
import Memuat from "@/components/Memuat";
import TreeScene, { type Simpul } from "@/components/three/TreeScene";

async function Isi({ searchParams }: { searchParams: PageProps<"/hierarki">["searchParams"] }) {
    const { depth } = await searchParams; // membaca URL = otomatis dirender per request
    const d = typeof depth === "string" ? Math.min(Math.max(Number(depth) || 0, 0), 5) : null;
    
    const bawahan = [
        { $match: { _id: "CBG003" } },
        { $graphLookup: { from: "KANTOR_CABANG", startWith: "$_id", connectFromField: "_id",
            connectToField: "id_cabang_induk", as: "bawahan", depthField: "tingkat", ...(d !== null && { maxDepth:
d }) } },
        { $unwind: "$bawahan" },
        { $project: { _id: 0, kode: "$bawahan._id", cabang: "$bawahan.nama_cabang", induk:
"$bawahan.id_cabang_induk", tingkat: "$bawahan.tingkat" } },
        { $sort: { tingkat: 1, kode: 1 } },
    ];

    const rantai = [
        { $graphLookup: { from: "KANTOR_CABANG", startWith: "$id_cabang_induk", connectFromField:
"id_cabang_induk",
            connectToField: "_id", as: "rantai_induk", depthField: "tingkat" } },
        { $project: { nama_cabang: 1, rantai_induk: { $map: {
            input: { $sortArray: { input: "$rantai_induk", sortBy: { tingkat: 1 } } }, as: "c",
            in: { $concat: ["$$c._id", " (tingkat ", { $toString: "$$c.tingkat" }, ")"] } } } } },
    ];

    const jaringan = [
        { $match: { _id: "CBG002" } },
        { $graphLookup: { from: "PENGIRIMAN", startWith: "$_id", connectFromField: "id_cabang_tujuan",
            connectToField: "id_cabang_asal", as: "jalur", depthField: "langkah" } },
        { $unwind: "$jalur" },
        { $group: { _id: "$jalur.id_cabang_tujuan", langkah_minimum: { $min: "$jalur.langkah" }, jumlah_pengiriman:
{ $sum: 1 } } },
        { $sort: { langkah_minimum: 1, _id: 1 } },
    ];

    const [b, r, j] = await Promise.all([
        runPipeline("KANTOR_CABANG", bawahan), runPipeline("KANTOR_CABANG", rantai), runPipeline("KANTOR_CABANG",
jaringan),
    ]);

    return (
        <>
            <TreeScene nodes={b.rows as Simpul[]} />
            <QueryCard title="Seluruh bawahan kantor pusat" materi="$graphLookup + maxDepth + $unwind" query=
{bawahan} rows={b.rows} error={b.error} />
            <QueryCard title="Rantai atasan setiap cabang" materi="$graphLookup + $sortArray + $map" query={rantai}
rows={r.rows} error={r.error} />
            <QueryCard title="Cabang terjangkau dari Semarang lewat rute pengiriman" materi="$graphLookup antarcollection" query={jaringan} rows={j.rows} error={j.error} />
        </>
    );
}

export default function Hierarki(props: PageProps<"/hierarki">) {
    return (
        <>
            <h1 className="text-2xl font-bold">Hierarki Cabang (penelusuran rekursif)</h1>
            <div className="flex flex-wrap gap-2 text-sm">
                <span className="text-muted">maxDepth:</span>
                {[["semua", "/hierarki"], ["0", "/hierarki?depth=0"], ["1", "/hierarki?depth=1"]].map(([label, href]) => (
                    <Link key={label} href={href} className="rounded-lg border border-line px-2 py-0.5 hover:border-accent">{label}</Link>
                ))}
                </div>
                <Suspense fallback={<Memuat />}><Isi searchParams={props.searchParams} /></Suspense>
        </>
    );
}
