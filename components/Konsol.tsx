"use client";
import { useState } from "react";
import { jalankanMongo, jalankanSql, type HasilSql } from "@/app/konsol/actions";
import DataTable from "./DataTable";
import { GagalQuery } from "./QueryCard";

type Mode = "sql" | "mongo";
type Props = { tabel: string[]; koleksi: string[]; awal: { mode: Mode; sql: string; koleksi: string; pipeline: string } };
type Hasil =
    | { mode: "sql"; hasil: HasilSql[]; error?: string }
    | { mode: "mongo"; rows: Record<string, unknown>[]; total: number; error?: string };

const KARTU = "rounded-xl border border-line bg-surface p-4 sm:p-5";
const inp = "min-h-11 rounded-lg border border-line bg-bg px-3 text-sm hover:border-muted";

function Terpotong({ total }: { total: number }) {
    return total > 200 ? <p className="text-xs text-muted">Hasil dipotong: hanya 200 baris pertama yang ditampilkan.</p> : null;
}

export default function Konsol({ tabel, koleksi, awal }: Props) {
    const [mode, setMode] = useState<Mode>(awal.mode);
    const [sql, setSql] = useState(awal.sql);
    const [pipeline, setPipeline] = useState(awal.pipeline);
    const [coll, setColl] = useState(awal.koleksi);
    const [hasil, setHasil] = useState<Hasil | null>(null);
    const [memuat, setMemuat] = useState(false);

    async function jalankan() {
        if (memuat) return;
        setMemuat(true);
        try {
            setHasil(mode === "sql"
                ? { mode, ...(await jalankanSql(sql)) }
                : { mode, ...(await jalankanMongo(coll, pipeline)) });
        } catch (e) {
            setHasil(mode === "sql" ? { mode, hasil: [], error: (e as Error).message } : { mode, rows: [], total: 0, error: (e as Error).message });
        }
        setMemuat(false);
    }

    const teks = mode === "sql" ? sql : pipeline;
    const daftar = mode === "sql" ? tabel : koleksi;

    return (
        <div className="space-y-4">
            <div className="grid items-start gap-4 lg:grid-cols-[1fr_14rem]">
                <section className={`${KARTU} space-y-3`}>
                    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Pilih database">
                        {([["sql", "SQL · MySQL"], ["mongo", "MongoDB · aggregate"]] as const).map(([m, label]) => (
                            <button key={m} aria-pressed={mode === m} onClick={() => { setMode(m); setHasil(null); }}
                                className={`min-h-11 rounded-lg border px-3 text-sm ${mode === m ? "border-fox bg-raised font-semibold" : "border-line text-muted hover:text-ink"}`}>
                                {label}
                            </button>
                        ))}
                        {mode === "mongo" && (
                            <label className="ml-auto flex items-center gap-2 text-sm text-muted">
                                Collection
                                <select value={coll} onChange={(e) => setColl(e.target.value)} className={inp}>
                                    {!koleksi.includes(coll) && <option>{coll}</option>}
                                    {koleksi.map((k) => <option key={k}>{k}</option>)}
                                </select>
                            </label>
                        )}
                    </div>

                    <label className="block">
                        <span className="sr-only">{mode === "sql" ? "Query SQL" : "Pipeline MongoDB (JSON)"}</span>
                        <textarea
                            value={teks}
                            onChange={(e) => (mode === "sql" ? setSql : setPipeline)(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); jalankan(); } }}
                            spellCheck={false}
                            rows={12}
                            className="w-full resize-y rounded-lg border border-line bg-bg p-4 font-mono text-sm leading-relaxed hover:border-muted"
                        />
                    </label>

                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={jalankan} disabled={memuat}
                            className="min-h-11 rounded-lg bg-fox px-4 font-semibold text-bg hover:bg-fox-deep hover:text-ink disabled:opacity-60">
                            {memuat ? "Menjalankan…" : "Jalankan"}
                        </button>
                        <span className="text-xs text-muted">Ctrl + Enter</span>
                        <span className="text-xs text-muted sm:ml-auto">
                            {mode === "sql"
                                ? "Boleh: SELECT, WITH, EXPLAIN, SHOW, DESC, INSERT, UPDATE, DELETE. Maksimal 5 perintah."
                                : "Format JSON (kunci diberi tanda kutip). $out, $merge, dan operator JavaScript diblokir."}
                        </span>
                    </div>
                </section>

                <aside className={`${KARTU} space-y-2`}>
                    <h2 className="font-display font-semibold">{mode === "sql" ? "Tabel" : "Collection"}</h2>
                    {daftar.length === 0 && <p className="text-sm text-muted">Daftar tidak bisa dimuat.</p>}
                    <ul className="flex flex-wrap gap-1 lg:flex-col">
                        {daftar.map((t) => (
                            <li key={t}>
                                <button className="min-h-9 w-full rounded-md px-2 text-left font-mono text-xs text-muted hover:bg-raised hover:text-ink"
                                    title={mode === "sql" ? `SELECT * FROM ${t}` : `Pilih ${t}`}
                                    onClick={() => (mode === "sql" ? setSql(`SELECT * FROM ${t}\nLIMIT 20`) : setColl(t))}>
                                    {t}
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>
            </div>

            <div aria-live="polite" className="space-y-4">
                {hasil?.error && <GagalQuery error={hasil.error} />}
                {hasil?.mode === "sql" && hasil.hasil.map((h, i) => (
                    <section key={i} className={`${KARTU} space-y-3`}>
                        <pre className="max-h-32 overflow-auto font-mono text-xs text-ice">{h.sql}</pre>
                        {h.error ? <GagalQuery error={h.error} />
                            : h.rows ? <><DataTable rows={h.rows} /><Terpotong total={h.total ?? 0} /></>
                            : <p className="text-sm">{h.affectedRows} baris terpengaruh.</p>}
                    </section>
                ))}
                {hasil?.mode === "sql" && hasil.hasil.some((h) => h.affectedRows !== undefined) && (
                    <p className="rounded-lg border border-ice/40 bg-ice/10 p-3 text-sm">
                        Semua perintah di atas sudah di-<b>ROLLBACK</b>. Data asli tidak berubah, coba jalankan SELECT lagi untuk memastikan.
                    </p>
                )}
                {hasil?.mode === "mongo" && !hasil.error && (
                    <section className={`${KARTU} space-y-3`}>
                        <DataTable rows={hasil.rows} />
                        <Terpotong total={hasil.total} />
                    </section>
                )}
            </div>
        </div>
    );
}
