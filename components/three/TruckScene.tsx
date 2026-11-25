"use client";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";

export type Util = { _id: string; plat_nomor: string; jenis: string; utilisasi_persen: number };
const warna = (p: number) => (p > 90 ? "#E5484D" : p >= 70 ? "#E8B23A" : "#3FBF6F");

function Truk({ u, x }: { u: Util; x: number }) {
    const f = Math.max(Math.min(u.utilisasi_persen / 100, 1), 0.001);
    return (
        <group position={[x, 0, 0]}>
            <mesh position={[0, 1.1, 1.6]}><boxGeometry args={[1.2, 1.2, 0.8]} /><meshStandardMaterial
color="#2BB3A8" /></mesh>
            <mesh position={[0, 1.3, -0.4]}><boxGeometry args={[1.3, 1.6, 3]} /><meshStandardMaterial color="#8FA3B3"
wireframe /></mesh>
            <mesh position={[0, 0.5 + 0.8 * f, -0.4]}><boxGeometry args={[1.2, 1.6 * f, 2.9]} /><meshStandardMaterial
color={warna(u.utilisasi_persen)} /></mesh>
            {[[0.6, 1.6], [-0.6, 1.6], [0.6, -1.4], [-0.6, -1.4]].map(([wx, wz], i) => (
            <mesh key={i} position={[wx, 0.3, wz]} rotation-z={Math.PI / 2}>
                <cylinderGeometry args={[0.3, 0.3, 0.2, 24]} /><meshStandardMaterial color="#23394A" />
            </mesh>
            ))}
            <Html position={[0, 2.6, 0]} center className="pointer-events-none whitespace-nowrap text-center text-xs">
                {u._id} · {u.jenis}<br /><b>{u.utilisasi_persen}%</b>
            </Html>
        </group>
    );
}

export default function TruckScene({ data }: { data: Util[] }) {
    return (
        <div className="h-[380px] overflow-hidden rounded-xl border border-line">
            <Canvas camera={{ position: [0, 5, 10 + data.length], fov: 45 }}>
                <color attach="background" args={["#0B141B"]} />
                <ambientLight intensity={0.7} />
                <directionalLight position={[5, 10, 5]} />
                {data.map((u, i) => <Truk key={u._id} u={u} x={(i - (data.length - 1) / 2) * 2.4} />)}
                <OrbitControls />
            </Canvas>
        </div>
    );
}