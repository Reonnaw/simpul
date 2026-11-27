"use client";
import { useState } from "react";
import { QuadraticBezierLine, useCursor } from "@react-three/drei";
import { Label, Panggung, W } from "./Dunia";

export type Tbl = { tabel: string; jumlah_kolom: number };
export type Rel = { dari: string; kolom: string; ke: string };
type V3 = [number, number, number];

function Blok({ t, p, nada, onPilih }: { t: Tbl; p: V3; nada: "pilih" | "terkait" | "redup" | "biasa"; onPilih: () => void }) {
    const [hover, setHover] = useState(false);
    useCursor(hover);
    const h = 0.3 + t.jumlah_kolom * 0.14;
    const warna = nada === "pilih" ? W.fox : nada === "redup" ? "#cfc5b8" : W.ice;
    return (
        <group position={p}>
            <mesh position-y={h / 2} scale={hover ? 1.08 : 1}
                onClick={(e) => { e.stopPropagation(); onPilih(); }}
                onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
                onPointerOut={() => setHover(false)}>
                <boxGeometry args={[1.6, h, 0.9]} />
                <meshStandardMaterial color={warna} flatShading emissive={warna} emissiveIntensity={nada === "pilih" ? 0.3 : 0} />
            </mesh>
            <Label position={[0, h + 0.4, 0]}>
                <div className={`whitespace-nowrap rounded-md border bg-bg/90 px-2 py-0.5 font-mono text-[11px] ${
                    nada === "pilih" ? "border-fox text-fox" : nada === "redup" ? "border-line text-muted" : "border-line"}`}>
                    {t.tabel} <span className="text-muted">{t.jumlah_kolom}</span>
                </div>
            </Label>
        </group>
    );
}

export default function ErdScene({ tabel, relasi }: { tabel: Tbl[]; relasi: Rel[] }) {
    const [pilih, setPilih] = useState<string | null>(null);
    const pos: Record<string, V3> = {};
    tabel.forEach((t, i) => {
        const a = (i / tabel.length) * Math.PI * 2;
        pos[t.tabel.toUpperCase()] = [Math.cos(a) * 8.5, 0, Math.sin(a) * 8.5];
    });
    const terkait = new Set(relasi.filter((r) => pilih && (r.dari.toUpperCase() === pilih || r.ke.toUpperCase() === pilih))
        .flatMap((r) => [r.dari.toUpperCase(), r.ke.toUpperCase()]));
    const nadaOf = (k: string) => (!pilih ? "biasa" : k === pilih ? "pilih" : terkait.has(k) ? "terkait" : "redup");

    return (
        <Panggung kamera={[0, 19, 18]} fov={35} lebar={27} pusat={[0, 0, 0.5]} label="Diagram relasi tabel MySQL dalam 3D"
            petunjuk="Klik tabel untuk menyorot FOREIGN KEY yang terhubung. Tinggi balok = jumlah kolom.">
            <mesh rotation-x={-Math.PI / 2} position-y={-0.01} onClick={() => setPilih(null)}>
                <circleGeometry args={[11.5, 6]} />
                <meshStandardMaterial color="#e9e3da" flatShading />
            </mesh>
            {tabel.map((t) => {
                const k = t.tabel.toUpperCase();
                return <Blok key={k} t={t} p={pos[k]} nada={nadaOf(k)} onPilih={() => setPilih((x) => (x === k ? null : k))} />;
            })}
            {relasi.map((r, i) => {
                const a = pos[r.dari.toUpperCase()], b = pos[r.ke.toUpperCase()];
                if (!a || !b) return null;
                const aktif = pilih && (r.dari.toUpperCase() === pilih || r.ke.toUpperCase() === pilih);
                const mid: V3 = a === b ? [a[0] * 1.3, 3, a[2] * 1.3] : [(a[0] + b[0]) / 2, 2.2, (a[2] + b[2]) / 2]; // relasi ke diri sendiri melengkung keluar
                return <QuadraticBezierLine key={i} start={a} end={b} mid={mid} color={aktif ? W.fox : pilih ? W.line : W.muted}
                    lineWidth={aktif ? 3 : 1.2} transparent opacity={pilih && !aktif ? 0.4 : 0.9} />;
            })}
        </Panggung>
    );
}
