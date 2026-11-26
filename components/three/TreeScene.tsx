"use client";
import { useState } from "react";
import { Line, useCursor } from "@react-three/drei";
import { Label, Panggung, Rubah, W } from "./Dunia";

export type Simpul = { kode: string; cabang: string; induk: string; tingkat: number };
type V3 = [number, number, number];
const AKAR = "CBG003";

function Node({ kode, nama, p, akar, aktif, onPilih }: { kode: string; nama: string; p: V3; akar: boolean; aktif: boolean; onPilih: () => void }) {
    const [hover, setHover] = useState(false);
    useCursor(hover);
    const warna = aktif ? W.fox : akar ? W.ink : W.ice;
    return (
        <group position={p}>
            <mesh scale={hover ? 1.12 : 1}
                onClick={(e) => { e.stopPropagation(); onPilih(); }}
                onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
                onPointerOut={() => setHover(false)}>
                <cylinderGeometry args={[0.55, 0.6, 0.35, 6]} />
                <meshStandardMaterial color={warna} flatShading emissive={warna} emissiveIntensity={aktif ? 0.3 : 0} />
            </mesh>
            {akar && <group position={[0, 0.17, 0]} rotation-y={-Math.PI / 2}><Rubah skala={1} /></group>}
            <Label position={[0, -0.6, 0]}>
                <div className={`whitespace-nowrap rounded-md border bg-bg/90 px-2 py-0.5 text-xs ${aktif ? "border-fox text-fox" : "border-line"}`}>
                    {nama} <span className="font-mono text-muted">{kode}</span>
                </div>
            </Label>
        </group>
    );
}

export default function TreeScene({ nodes }: { nodes: Simpul[] }) {
    const [pilih, setPilih] = useState<string | null>(null);
    const pos: Record<string, V3> = { [AKAR]: [0, 3, 0] };
    const nama: Record<string, string> = { [AKAR]: "Jakarta (pusat)" };
    const induk: Record<string, string> = {};
    for (const n of nodes) { // nodes sudah urut per tingkat, jadi induk selalu diproses lebih dulu
        const saudara = nodes.filter((m) => m.induk === n.induk);
        const [px, py] = pos[n.induk] ?? pos[AKAR];
        pos[n.kode] = [px + (saudara.indexOf(n) - (saudara.length - 1) / 2) * (4.2 / (n.tingkat + 1)), py - 2.6, 0];
        nama[n.kode] = n.cabang.replace("Cabang ", "");
        induk[n.kode] = n.induk;
    }

    // jalur dari node terpilih naik ke pusat = hasil $graphLookup "rantai atasan"
    const jalur = new Set<string>();
    for (let k = pilih; k; k = induk[k]) jalur.add(k);
    const xs = Object.values(pos).map(([x]) => x);

    return (
        <Panggung kamera={[0, 2, 15.5]} pusat={[0, 0.9, 0]} fov={35} lebar={Math.max(...xs) - Math.min(...xs) + 5} maxPolar={Math.PI / 1.8}
            label="Pohon hierarki cabang 3D" tinggi="h-[420px] sm:h-[500px]"
            petunjuk="Klik cabang untuk menyorot rantai atasannya sampai kantor pusat.">
            {nodes.map((n) => pos[n.induk] && (
                <Line key={n.kode} points={[pos[n.kode], pos[n.induk]]}
                    color={jalur.has(n.kode) ? W.fox : W.line} lineWidth={jalur.has(n.kode) ? 3 : 2} />
            ))}
            {Object.entries(pos).map(([kode, p]) => (
                <Node key={kode} kode={kode} nama={nama[kode]} p={p} akar={kode === AKAR} aktif={jalur.has(kode)}
                    onPilih={() => setPilih((x) => (x === kode ? null : kode))} />
            ))}
        </Panggung>
    );
}
