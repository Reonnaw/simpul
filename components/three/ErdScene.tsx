"use client";
import { Canvas } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";

export type Tbl = { tabel: string; jumlah_kolom: number };
export type Rel = { dari: string; kolom: string; ke: string };
export default function ErdScene({ tabel, relasi }: { tabel: Tbl[]; relasi: Rel[] }) {
    const pos: Record<string, [number, number, number]> = {};
    tabel.forEach((t, i) => {
        const a = (i / tabel.length) * Math.PI * 2;
        pos[t.tabel.toUpperCase()] = [Math.cos(a) * 7, (i % 3) - 1, Math.sin(a) * 7];
    });
    return (
        <div className="h-[480px] overflow-hidden rounded-xl border border-line">
            <Canvas camera={{ position: [0, 8, 14] }}>
                <color attach="background" args={["#0B141B"]} />
                <ambientLight intensity={0.7} />
                <directionalLight position={[5, 10, 5]} />
                {tabel.map((t) => (
                    <group key={t.tabel} position={pos[t.tabel.toUpperCase()]}>
                        <mesh>
                            <boxGeometry args={[1.6, 0.3 + t.jumlah_kolom * 0.12, 0.6]} />
                            <meshStandardMaterial color="#2BB3A8" />
                        </mesh>
                        <Html center position={[0, 1.3, 0]} className="pointer-events-none whitespace-nowrap text-[10px]">
                            {t.tabel} ({t.jumlah_kolom})
                        </Html>
                    </group>
                ))}
                {relasi.map((r, i) => {
                    const a = pos[r.dari.toUpperCase()], b = pos[r.ke.toUpperCase()];
                    if (!a || !b) return null;
                    const titik: [number, number, number][] = a === b ? [a, [a[0], a[1] + 2, a[2]], a] : [a, b]; // relasi ke diri sendiri
                    return <Line key={i} points={titik} color="#F2711C" lineWidth={1.5} />;
                })}
                <OrbitControls />
            </Canvas>
        </div>
    );
}