"use client";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Edges, useCursor } from "@react-three/drei";
import type * as THREE from "three";
import { Label, Panggung, useGerak, W } from "./Dunia";

export type Util = { _id: string; plat_nomor: string; jenis: string; muatan_kg: number; kapasitas_kg: number; utilisasi_persen: number };

const JARAK = 2.8; // jarak antar-bay parkir
const TINGGI_BAK = 1.52;
const warna = (p: number) => (p > 90 ? W.bad : p >= 70 ? W.warn : W.ok);
const nada = (p: number) => (p > 90 ? "text-bad" : p >= 70 ? "text-warn" : "text-ok");

function Truk({ u, x, dipilih, gerak, onPilih }: { u: Util; x: number; dipilih: boolean; gerak: boolean; onPilih: () => void }) {
    const isi = useRef<THREE.Mesh>(null);
    const [hover, setHover] = useState(false);
    useCursor(hover);
    const f = Math.min(Math.max(u.utilisasi_persen / 100, 0), 1);

    // bak terisi perlahan saat halaman dibuka, supaya perbandingan antar-truk terbaca
    useFrame((_, dt) => {
        const m = isi.current;
        if (!m) return;
        const s = gerak ? m.scale.y + (f - m.scale.y) * (1 - Math.exp(-dt * 2.5)) : f;
        m.scale.y = Math.max(s, 0.001);
        m.position.y = 0.64 + (TINGGI_BAK * m.scale.y) / 2;
    });

    const sorot = hover || dipilih;
    return (
        <group position={[x, sorot ? 0.08 : 0, 0]}
            onClick={(e) => { e.stopPropagation(); onPilih(); }}
            onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
            onPointerOut={() => setHover(false)}>
            <mesh position={[0, 0.5, 0]}><boxGeometry args={[1.3, 0.22, 4.3]} /><meshStandardMaterial color="#2a2420" /></mesh>
            <mesh position={[0, 1.17, -1.6]}><boxGeometry args={[1.3, 1.15, 1]} /><meshStandardMaterial color={W.ink} flatShading /></mesh>
            <mesh position={[0, 1.42, -1.72]}><boxGeometry args={[1.32, 0.4, 0.55]} /><meshStandardMaterial color="#1a2a33" /></mesh>
            <mesh position={[0, 1.42, 0.55]}>
                <boxGeometry args={[1.36, 1.6, 3]} />
                <meshStandardMaterial color={W.ink} transparent opacity={0.07} depthWrite={false} />
                <Edges color={sorot ? W.fox : "#8a7a6a"} />
            </mesh>
            <mesh ref={isi} position={[0, 0.64, 0.55]} scale-y={gerak ? 0.001 : f}>
                <boxGeometry args={[1.24, TINGGI_BAK, 2.9]} />
                <meshStandardMaterial color={warna(u.utilisasi_persen)} flatShading emissive={warna(u.utilisasi_persen)} emissiveIntensity={sorot ? 0.3 : 0.08} />
            </mesh>
            {[-1.55, 0.25, 1.45].flatMap((z) => [-0.62, 0.62].map((wx) => (
                <mesh key={`${z}${wx}`} position={[wx, 0.32, z]} rotation-z={Math.PI / 2}>
                    <cylinderGeometry args={[0.32, 0.32, 0.22, 10]} />
                    <meshStandardMaterial color="#1a1412" flatShading />
                </mesh>
            )))}
            <Label position={[0, 2.75, 0.55]}>
                <div className={`whitespace-nowrap rounded-md border bg-bg/90 px-2 py-0.5 text-center text-xs leading-tight ${sorot ? "border-fox" : "border-line"}`}>
                    <span className="block text-muted">{u._id}</span>
                    <b className={nada(u.utilisasi_persen)}>{u.utilisasi_persen}%</b>
                </div>
            </Label>
        </group>
    );
}

export default function TruckScene({ data }: { data: Util[] }) {
    const gerak = useGerak();
    const [pilih, setPilih] = useState<string | null>(null);
    const xOf = (i: number) => (i - (data.length - 1) / 2) * JARAK;
    const toggle = (id: string) => setPilih((p) => (p === id ? null : id));

    if (!data.length) {
        return <p className="rounded-xl border border-dashed border-line p-6 text-sm text-muted">Belum ada penugasan armada. Truk akan muncul di dok setelah PENUGASAN_ARMADA terisi.</p>;
    }

    return (
        <div className="space-y-4">
            <Panggung kamera={[5, 7.5, 12]} pusat={[0, 1, 0]} fov={35} lebar={data.length * JARAK + 3} maxPolar={Math.PI / 2.15}
                label="Dok muat 3D: setiap truk menunjukkan isi baknya" tinggi="h-[380px] sm:h-[460px]"
                petunjuk="Klik truk untuk menyorot kartunya. Seret untuk melihat dari samping.">
                <mesh rotation-x={-Math.PI / 2} onClick={() => setPilih(null)}>
                    <planeGeometry args={[80, 60]} />
                    <meshStandardMaterial color="#1a1714" />
                </mesh>
                {data.map((_, i) => [-0.5, 0.5].map((d) => (
                    <mesh key={`${i}${d}`} position={[xOf(i) + d * JARAK, 0.005, 0.2]} rotation-x={-Math.PI / 2}>
                        <planeGeometry args={[0.06, 5.2]} />
                        <meshBasicMaterial color="#4a4038" />
                    </mesh>
                )))}
                <mesh position={[0, 0.35, -2.9]}>
                    <boxGeometry args={[data.length * JARAK + 1, 0.7, 0.6]} />
                    <meshStandardMaterial color="#2e2722" flatShading />
                </mesh>
                <ContactShadows position={[0, 0.01, 0]} opacity={0.55} scale={40} blur={2.2} far={4} />
                {data.map((u, i) => <Truk key={u._id} u={u} x={xOf(i)} dipilih={pilih === u._id} gerak={gerak} onPilih={() => toggle(u._id)} />)}
            </Panggung>

            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.map((u) => (
                    <li key={u._id}>
                        <button onClick={() => toggle(u._id)} aria-pressed={pilih === u._id}
                            className={`w-full space-y-3 rounded-xl border bg-surface p-4 text-left transition-colors hover:border-muted ${pilih === u._id ? "border-fox" : "border-line"}`}>
                            <span className="flex items-start justify-between gap-2">
                                <span>
                                    <span className="block font-display text-lg font-semibold">{u.plat_nomor}</span>
                                    <span className="block text-sm text-muted">{u.jenis} · <span className="font-mono text-xs">{u._id}</span></span>
                                </span>
                                <b className={`font-display text-2xl tabular-nums ${nada(u.utilisasi_persen)}`}>{u.utilisasi_persen}%</b>
                            </span>
                            <span className="block h-2 overflow-hidden rounded-full bg-line">
                                <span className="block h-2 rounded-full" style={{ width: `${Math.min(u.utilisasi_persen, 100)}%`, background: warna(u.utilisasi_persen) }} />
                            </span>
                            <span className="block text-xs tabular-nums text-muted">
                                {u.muatan_kg.toLocaleString("id-ID")} dari {u.kapasitas_kg.toLocaleString("id-ID")} kg
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
