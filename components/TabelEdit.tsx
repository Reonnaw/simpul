"use client";
import { useState } from "react";
import { kolomSql as k, nilaiSql as v } from "@/lib/konsol";
import { Sel, judulKolom } from "./DataTable";

type Baris = Record<string, unknown>;
type Props = { rows: Baris[]; tabel: string; pk: string[]; memuat: boolean; onUbah: (perintah: string) => void };

const tombol = "min-h-9 min-w-9 rounded-md border border-line px-2 text-xs text-muted hover:border-muted hover:text-ink disabled:opacity-50";
const teksAwal = (x: unknown) => (x == null ? "" : typeof x === "object" ? JSON.stringify(x) : String(x));

// Tombol di sini hanya menulis INSERT/UPDATE/DELETE; Konsol menyisipkannya ke query lalu menjalankan (tetap di-ROLLBACK).
export default function TabelEdit({ rows, tabel, pk, memuat, onUbah }: Props) {
    const [edit, setEdit] = useState<number | "baru" | null>(null);
    const [draf, setDraf] = useState<Record<string, string>>({});
    const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
    const angka = new Set(cols.filter((c) => !pk.includes(c) && rows.every((r) => r[c] == null || typeof r[c] === "number")));
    const t = k(tabel);
    const where = (r: Baris) => pk.map((c) => `${k(c)} = ${v(r[c])}`).join(" AND ");
    const nama = (r: Baris) => pk.map((c) => `${c} ${teksAwal(r[c])}`).join(", ");

    function mulai(i: number | "baru") {
        setDraf(i === "baru" ? {} : Object.fromEntries(cols.map((c) => [c, teksAwal(rows[i][c])])));
        setEdit(i);
    }

    function simpan() {
        let perintah = "";
        if (edit === "baru") {
            const isi = cols.filter((c) => draf[c]?.trim());
            if (isi.length) perintah = `INSERT INTO ${t} (${isi.map(k).join(", ")}) VALUES (${isi.map((c) => v(draf[c])).join(", ")})`;
        } else if (edit !== null) {
            const r = rows[edit];
            const ubah = cols.filter((c) => draf[c] !== teksAwal(r[c]));
            if (ubah.length) perintah = `UPDATE ${t} SET ${ubah.map((c) => `${k(c)} = ${v(draf[c] === "" ? null : draf[c])}`).join(", ")} WHERE ${where(r)}`;
        }
        setEdit(null);
        if (perintah) onUbah(perintah);
    }

    const input = (c: string) => (
        <input aria-label={judulKolom(c)} value={draf[c] ?? ""} spellCheck={false}
            onChange={(e) => setDraf({ ...draf, [c]: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") simpan(); if (e.key === "Escape") setEdit(null); }}
            className="min-h-9 w-full min-w-24 rounded-md border border-line bg-bg px-2 font-mono text-xs hover:border-muted" />
    );
    const aksiEdit = (
        <span className="flex gap-1">
            <button className={tombol} disabled={memuat} onClick={simpan}>Simpan</button>
            <button className={tombol} onClick={() => setEdit(null)}>Batal</button>
        </span>
    );

    return (
        <div className="space-y-2">
            <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full text-sm">
                    <caption className="sr-only">{rows.length} baris dari tabel {tabel}, bisa diedit</caption>
                    <thead className="bg-raised">
                        <tr>
                            {cols.map((c) => (
                                <th key={c} scope="col" className={`whitespace-nowrap px-3 py-2 font-medium text-muted ${angka.has(c) ? "text-right" : "text-left"}`}>
                                    {judulKolom(c)}
                                </th>
                            ))}
                            <th scope="col" className="px-3 py-2 text-left font-medium text-muted"><span className="sr-only">Aksi</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {rows.map((r, i) => (
                            <tr key={i} className="hover:bg-raised/60">
                                {cols.map((c) => (
                                    <td key={c} className={`px-3 py-2 align-top ${angka.has(c) ? "text-right tabular-nums" : ""}`}>
                                        {edit === i ? input(c) : angka.has(c) && r[c] != null ? (
                                            <span className="inline-flex items-center gap-1">
                                                <button className={tombol} disabled={memuat} aria-label={`Kurangi 1 ${judulKolom(c)}, baris ${nama(r)}`}
                                                    onClick={() => onUbah(`UPDATE ${t} SET ${k(c)} = ${k(c)} - 1 WHERE ${where(r)}`)}>▼</button>
                                                <span className="min-w-10"><Sel v={r[c]} /></span>
                                                <button className={tombol} disabled={memuat} aria-label={`Tambah 1 ${judulKolom(c)}, baris ${nama(r)}`}
                                                    onClick={() => onUbah(`UPDATE ${t} SET ${k(c)} = ${k(c)} + 1 WHERE ${where(r)}`)}>▲</button>
                                            </span>
                                        ) : <Sel v={r[c]} />}
                                    </td>
                                ))}
                                <td className="px-3 py-2 align-top">
                                    {edit === i ? aksiEdit : (
                                        <span className="flex gap-1">
                                            <button className={tombol} disabled={memuat} title="Edit" aria-label={`Edit baris ${nama(r)}`} onClick={() => mulai(i)}>✎</button>
                                            <button className={tombol} disabled={memuat} title="Hapus" aria-label={`Hapus baris ${nama(r)}`}
                                                onClick={() => onUbah(`DELETE FROM ${t} WHERE ${where(r)}`)}>🗑</button>
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {edit === "baru" && (
                            <tr className="bg-raised/40">
                                {cols.map((c) => <td key={c} className="px-3 py-2 align-top">{input(c)}</td>)}
                                <td className="px-3 py-2 align-top">{aksiEdit}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {edit !== "baru" && (
                <button className="min-h-11 rounded-lg border border-line px-3 text-sm text-muted hover:border-muted hover:text-ink disabled:opacity-50"
                    disabled={memuat} onClick={() => mulai("baru")}>
                    + Tambah baris
                </button>
            )}
            <p className="text-xs text-muted">Tombol menulis perintah SQL ke editor di atas lalu menjalankannya. Kolom kosong saat menambah baris memakai nilai default.</p>
        </div>
    );
}
