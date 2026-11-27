"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as Kontrol } from "three-stdlib";
import { daratXZ, keLngLat, tanahY, tinggiXZ } from "./Pulau";
import { W } from "./Dunia";

const BAN = <meshStandardMaterial color="#141210" roughness={0.9} />;
const VELG = <meshStandardMaterial color="#c9c4bd" metalness={0.9} roughness={0.25} />;
const KACA = <meshPhysicalMaterial color="#14222b" metalness={0.6} roughness={0.05} clearcoat={1} />;

// semua mesh di dalam grup ikut menjatuhkan bayangan
function useBayangan(ref: React.RefObject<THREE.Group | null>) {
    useLayoutEffect(() => {
        ref.current?.traverse((o) => { o.castShadow = true; });
    }, [ref]);
}

// Roda menghadap sumbu x; `putar` diisi grup roda supaya bisa diputar sesuai laju.
function Roda({ x, z, r = 0.36, lebar = 0.28, putar }: { x: number; z: number; r?: number; lebar?: number; putar?: React.RefObject<THREE.Group[]> }) {
    return (
        <group position={[x, r, z]} ref={(g) => { if (g && putar && !putar.current.includes(g)) putar.current.push(g); }}>
            <mesh rotation-z={Math.PI / 2}><cylinderGeometry args={[r, r, lebar, 20]} />{BAN}</mesh>
            <mesh rotation-z={Math.PI / 2}><cylinderGeometry args={[r * 0.6, r * 0.6, lebar + 0.02, 10]} />{VELG}</mesh>
        </group>
    );
}

// Mobil SUV dalam ukuran meter (panjang 4,4 m), menghadap +z. Skala diatur pemanggil.
export function Mobil({ warna = W.fox, putar }: { warna?: string; putar?: React.RefObject<THREE.Group[]> }) {
    const ref = useRef<THREE.Group>(null);
    useBayangan(ref);
    const cat = <meshPhysicalMaterial color={warna} metalness={0.55} roughness={0.32} clearcoat={1} clearcoatRoughness={0.08} />;
    return (
        <group ref={ref}>
            <RoundedBox args={[1.84, 0.72, 4.4]} radius={0.2} smoothness={3} position={[0, 0.72, 0]}>{cat}</RoundedBox>
            <RoundedBox args={[1.62, 0.62, 2.4]} radius={0.22} smoothness={3} position={[0, 1.32, -0.25]}>{KACA}</RoundedBox>
            <RoundedBox args={[1.58, 0.1, 2]} radius={0.05} smoothness={2} position={[0, 1.66, -0.3]}>{cat}</RoundedBox>
            <mesh position={[0, 0.62, 2.21]}><boxGeometry args={[1.1, 0.22, 0.02]} /><meshStandardMaterial color="#0e0c0b" /></mesh>
            {[-0.66, 0.66].map((x) => (
                <group key={x}>
                    <mesh position={[x, 0.86, 2.19]}><boxGeometry args={[0.36, 0.12, 0.04]} />
                        <meshStandardMaterial color="#fff6dc" emissive="#fff1c8" emissiveIntensity={3} /></mesh>
                    <mesh position={[x, 0.86, -2.19]}><boxGeometry args={[0.36, 0.12, 0.04]} />
                        <meshStandardMaterial color="#ff3b30" emissive="#ff2a1a" emissiveIntensity={2} /></mesh>
                </group>
            ))}
            <mesh position={[0, 0.4, 0]}><boxGeometry args={[1.7, 0.18, 3.6]} /><meshStandardMaterial color="#1c1815" /></mesh>
            {[[-0.86, 1.4], [0.86, 1.4], [-0.86, -1.4], [0.86, -1.4]].map(([x, z]) => <Roda key={`${x}${z}`} x={x} z={z} putar={putar} />)}
        </group>
    );
}

// Truk boks pengiriman (panjang 7 m), menghadap +z. Bak berwarna status rute.
export function TrukBoks({ warna = W.fox }: { warna?: string }) {
    const ref = useRef<THREE.Group>(null);
    useBayangan(ref);
    return (
        <group ref={ref}>
            <mesh position={[0, 0.62, 0]}><boxGeometry args={[2, 0.3, 6.6]} /><meshStandardMaterial color="#1c1815" /></mesh>
            <RoundedBox args={[2.2, 2, 1.9]} radius={0.18} smoothness={3} position={[0, 1.6, 2.3]}>
                <meshPhysicalMaterial color="#f4efe8" metalness={0.3} roughness={0.35} clearcoat={0.8} />
            </RoundedBox>
            <mesh position={[0, 2, 3.22]}><boxGeometry args={[1.9, 0.8, 0.04]} />{KACA}</mesh>
            <RoundedBox args={[2.36, 2.5, 4.6]} radius={0.06} smoothness={2} position={[0, 2.05, -0.9]}>
                <meshStandardMaterial color={warna} roughness={0.55} />
            </RoundedBox>
            {[-0.7, 0.7].map((x) => (
                <mesh key={x} position={[x, 1, 3.27]}><boxGeometry args={[0.4, 0.2, 0.04]} />
                    <meshStandardMaterial color="#fff6dc" emissive="#fff1c8" emissiveIntensity={3} /></mesh>
            ))}
            {[2.3, -1.6, -2.6].flatMap((z) => [-0.98, 0.98].map((x) => <Roda key={`${x}${z}`} x={x} z={z} r={0.48} lebar={0.4} />))}
        </group>
    );
}

export type Arah = "maju" | "mundur" | "kiri" | "kanan";
export type Tombol = Set<Arah>;
const SKALA = 0.09; // mobil 4,4 m ≈ 0,4 satuan peta

// Mobil yang bisa dikemudikan: menempel di medan, miring mengikuti lereng, berhenti di bibir pantai,
// dan kamera mengikuti dari belakang. Orbit kamera dimatikan selama mode ini aktif.
export function Kemudi({ mulai, tombol, onInfo, gerak }: {
    mulai: THREE.Vector3; tombol: React.RefObject<Tombol>; onInfo: (teks: string) => void; gerak: boolean;
}) {
    const mobil = useRef<THREE.Group>(null);
    const roda = useRef<THREE.Group[]>([]);
    const st = useRef({ x: mulai.x, z: mulai.z, arah: 0, laju: 0 });
    const get = useThree((s) => s.get);

    useEffect(() => {
        const k = get().controls as unknown as Kontrol | null;
        if (!k) return;
        k.enabled = false;
        return () => { k.enabled = true; k.reset(); };
    }, [get]);

    useFrame(({ camera }, delta) => {
        const g = mobil.current;
        if (!g) return;
        const dt = Math.min(delta, 0.05), s = st.current, k = tombol.current;
        const gas = (k.has("maju") ? 1 : 0) - (k.has("mundur") ? 1 : 0);
        const setir = (k.has("kiri") ? 1 : 0) - (k.has("kanan") ? 1 : 0);
        s.laju = Math.min(Math.max((s.laju + gas * 3.2 * dt) * Math.exp(-dt * (gas ? 0.4 : 1.8)), -1.2), 3);
        s.arah += setir * dt * 1.9 * Math.min(Math.max(s.laju / 0.8, -1), 1);
        const fx = Math.sin(s.arah), fz = Math.cos(s.arah);
        const nx = s.x + fx * s.laju * dt, nz = s.z + fz * s.laju * dt;
        if (daratXZ(nx, nz) > 0.6) { s.x = nx; s.z = nz; } else s.laju = 0; // laut = batas jalan

        const y = tanahY(s.x, s.z), p = 0.18, lx = Math.cos(s.arah) * 0.08, lz = -Math.sin(s.arah) * 0.08;
        const angguk = Math.atan2(tanahY(s.x + fx * p, s.z + fz * p) - tanahY(s.x - fx * p, s.z - fz * p), p * 2);
        const guling = Math.atan2(tanahY(s.x + lx, s.z + lz) - tanahY(s.x - lx, s.z - lz), 0.16);
        g.position.set(s.x, y, s.z);
        g.rotation.set(-angguk, s.arah, guling, "YXZ");
        for (const r of roda.current) r.rotation.x += (s.laju * dt) / (0.36 * SKALA);

        const pos = new THREE.Vector3(s.x - fx * 1.5, y + 0.75, s.z - fz * 1.5);
        pos.y = Math.max(pos.y, tanahY(pos.x, pos.z) + 0.25);
        camera.position.lerp(pos, gerak ? 1 - Math.exp(-dt * 4) : 1);
        camera.lookAt(s.x + fx * 0.6, y + 0.15, s.z + fz * 0.6);

        const [lng, lat] = keLngLat(g.position);
        onInfo(`${Math.round(tinggiXZ(s.x, s.z)).toLocaleString("id-ID")} m dpl · ${Math.abs(lat).toFixed(2)}° LS ${lng.toFixed(2)}° BT`);
    });

    return <group ref={mobil} position={mulai}><group scale={SKALA}><Mobil putar={roda} /></group></group>;
}
