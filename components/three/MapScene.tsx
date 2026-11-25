"use client";
import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, Html, OrbitControls, QuadraticBezierLine } from "@react-three/drei";
import * as THREE from "three";
import { cariTerdekat } from "@/app/actions";
import DataTable from "@/components/DataTable";

export type Cabang = { _id: string; nama_cabang: string; kota: string; kapasitas_gudang_ton: number; lokasi: {
coordinates: [number, number] } };
export type Rute = { asal: string; tujuan: string; jumlah: number; status: string[] };
const S = 3; // 1 derajat = 3 satuan 3D
const keXZ = ([lng, lat]: [number, number]) => new THREE.Vector3((lng - 110) * S, 0, -(lat + 7) * S);
const keLngLat = (p: THREE.Vector3) => [p.x / S + 110, -p.z / S - 7] as const;
const puncak = (a: THREE.Vector3, b: THREE.Vector3) =>
a.clone().add(b).multiplyScalar(0.5).setY(a.distanceTo(b) * 0.25 + 0.5);

function Truk(p: { a: THREE.Vector3; b: THREE.Vector3; mid: THREE.Vector3; mulai: number; warna: string; gerak:
boolean }) {
    const ref = useRef<THREE.Mesh>(null);
    const kurva = useMemo(() => new THREE.QuadraticBezierCurve3(p.a, p.mid, p.b), [p.a, p.b, p.mid]);
    useFrame(({ clock }) => {
        const t = p.gerak ? (clock.elapsedTime * 0.08 + p.mulai) % 1 : p.mulai;
        ref.current?.position.copy(kurva.getPoint(t));
    });
    return (
        <mesh ref={ref}>
            <boxGeometry args={[0.4, 0.22, 0.22]} />
            <meshStandardMaterial color={p.warna} />
        </mesh>
    );
}

export default function MapScene({ cabang, rute }: { cabang: Cabang[]; rute: Rute[] }) {
    const [radius, setRadius] = useState(300);
    const [hasil, setHasil] = useState<{ rows: Record<string, unknown>[]; error: string | null; titik:
THREE.Vector3 | null }>(
        { rows: [], error: null, titik: null });
    // animasi dimatikan untuk pengguna yang memilih "kurangi gerakan" di sistem operasinya
    const [gerak] = useState(() => typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const pos = useMemo(() => Object.fromEntries(cabang.map((c) => [c._id, keXZ(c.lokasi.coordinates)])),
[cabang]);
    const terdekat = new Set(hasil.rows.map((r) => String(r._id)));

async function klik(p: THREE.Vector3) {
    const [lng, lat] = keLngLat(p);
    const res = await cariTerdekat(lng, lat, radius);
    setHasil({ rows: res.rows, error: res.error, titik: p.clone() });
}

return (
    <div className="space-y-3">
        <label className="flex flex-wrap items-center gap-3 text-sm">
            Radius pencarian: <b>{radius} km</b>
            <input type="range" min={50} max={1000} step={50} value={radius} onChange={(e) =>
setRadius(Number(e.target.value))} />
        </label>
        <div className="h-[460px] overflow-hidden rounded-xl border border-line">
        <Canvas camera={{ position: [0, 14, 16], fov: 45 }}>
            <color attach="background" args={["#0B141B"]} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} />
            <mesh rotation-x={-Math.PI / 2} onClick={(e) => { e.stopPropagation(); klik(e.point); }}>
                <planeGeometry args={[40, 20]} />
                <meshStandardMaterial color="#13222D" />
            </mesh>
            <Grid args={[40, 20]} position={[0, 0.01, 0]} cellColor="#23394A" sectionColor="#23394A" />
            {cabang.map((c) => {
                const h = c.kapasitas_gudang_ton / 200;
                return (
                    <group key={c._id} position={pos[c._id]}>
                        <mesh position={[0, h / 2, 0]}>
                            <cylinderGeometry args={[0.25, 0.25, h]} />
                            <meshStandardMaterial color={terdekat.has(c._id) ? "#F2711C" : "#2BB3A8"} />
                        </mesh>
                        <Html position={[0, h + 0.4, 0]} center className="pointer-events-none whitespace-nowrap text-xs">{c.kota}</Html>
                    </group>
                );
            })}
            {rute.map((r, i) => {
                const a = pos[r.asal], b = pos[r.tujuan];
                if (!a || !b) return null;
                const mid = puncak(a, b);
                const jalan = r.status.includes("Dalam Perjalanan");
                return (
                    <group key={i}>
                    <QuadraticBezierLine start={a} end={b} mid={mid} color={jalan ? "#F2711C" : "#2BB3A8"}
lineWidth={1.5} />
                    <Truk a={a} b={b} mid={mid} mulai={i / rute.length} warna={jalan ? "#F2711C" : "#8FA3B3"}
gerak={gerak} />
                    </group>
                );
            })}
            {hasil.titik && (
                <mesh position={hasil.titik}>
                    <sphereGeometry args={[0.2]} />
                    <meshStandardMaterial color="#E8B23A" />
                </mesh>
            )}
            <OrbitControls maxPolarAngle={Math.PI / 2.2} />
                </Canvas>
            </div>
    {hasil.error ? <p className="text-sm text-bad">{hasil.error}</p> : hasil.rows.length > 0 && <DataTable
rows={hasil.rows} />}
    </div>
    );
}