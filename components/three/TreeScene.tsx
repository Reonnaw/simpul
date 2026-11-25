"use client";
import { Canvas } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";

export type Simpul = { kode: string; cabang: string; induk: string; tingkat: number };

export default function TreeScene({ nodes }: { nodes: Simpul[] }) {
    const pos: Record<string, [number, number, number]> = { CBG003: [0, 4, 0] };
    const nama: Record<string, string> = { CBG003: "Cabang Jakarta (pusat)" };
    for (const n of nodes) { // nodes sudah urut per tingkat, jadi induk selalu diproses lebih dulu
        const saudara = nodes.filter((m) => m.induk === n.induk);
        const [px, py] = pos[n.induk] ?? [0, 4];
        pos[n.kode] = [px + (saudara.indexOf(n) - (saudara.length - 1) / 2) * (3 / (n.tingkat + 1)), py - 2.5, 0];
        nama[n.kode] = n.cabang;
    }

    return (
        <div className="h-[420px] overflow-hidden rounded-xl border border-line">
            <Canvas camera={{ position: [0, 1, 10] }}>
                <color attach="background" args={["#0B141B"]} />
                <ambientLight intensity={0.7} />
                <pointLight position={[5, 5, 5]} />
                {Object.entries(pos).map(([kode, p]) => (
                    <group key={kode} position={p}>
                        <mesh>
                            <sphereGeometry args={[0.35, 32, 32]} />
                            <meshStandardMaterial color={kode === "CBG003" ? "#F2711C" : "#2BB3A8"} />
                        </mesh>
                        <Html position={[0, -0.7, 0]} center className="pointer-events-none whitespace-nowrap text-xs">
{nama[kode]}</Html>
                    </group>
                ))}
                {nodes.map((n) => pos[n.induk] && <Line key={n.kode} points={[pos[n.kode], pos[n.induk]]}
color="#8FA3B3" lineWidth={2} />)}
                <OrbitControls />
            </Canvas>
        </div>
    );
}
