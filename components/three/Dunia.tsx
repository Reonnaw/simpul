"use client";
import { createContext, useContext, useLayoutEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as Kontrol } from "three-stdlib";

// three.js tidak bisa membaca variabel CSS, jadi palet dari globals.css disalin di sini.
export const W = {
    bg: "#14110f", surface: "#1d1916", raised: "#27221e", line: "#3a322c", ink: "#f2e8da", muted: "#b3a595",
    fox: "#ff7a2f", foxDeep: "#c9531a", ice: "#8cc8e6", ok: "#8fd18a", warn: "#f2c14e", bad: "#ff6b6b",
};

// animasi dimatikan untuk pengguna yang memilih "kurangi gerakan" di sistem operasinya
export function useGerak() {
    const [gerak] = useState(() => typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    return gerak;
}

// Jarak kamera disesuaikan dengan rasio layar supaya dunia selebar `lebar` masuk ke bingkai.
// Di layar sempit mundurnya dibatasi 1,6×, sisanya bisa digeser atau dicubit.
function Bingkai({ lebar, pusat, kontrol }: { lebar: number; pusat: THREE.Vector3; kontrol: React.RefObject<Kontrol | null> }) {
    const { camera, size } = useThree();
    const arah = useRef(camera.position.clone().sub(pusat));
    useLayoutEffect(() => {
        const fov = "fov" in camera ? (camera.fov as number) : 40;
        const perlu = lebar / 2 / (Math.tan((fov * Math.PI) / 360) * (size.width / size.height));
        const awal = arah.current.length();
        camera.position.copy(arah.current).setLength(Math.min(Math.max(awal, perlu), awal * 1.6)).add(pusat);
        kontrol.current?.update();
        kontrol.current?.saveState();
    }, [camera, size.width, size.height, lebar, pusat, kontrol]);
    return null;
}

// drei <Html> memilih wadahnya dari `events.connected || gl.domElement.parentNode`, dan nilai itu berganti
// saat R3F menyambungkan event. Label yang sudah terpasang lalu kehilangan isinya (dulu: label Surabaya hilang).
// Dengan `portal` ke div milik Panggung, wadahnya tetap sejak render pertama.
const Wadah = createContext<React.RefObject<HTMLDivElement | null> | null>(null);

export function Label({ children, ...props }: React.ComponentProps<typeof Html>) {
    const wadah = useContext(Wadah) as React.RefObject<HTMLElement> | null;
    return <Html portal={wadah ?? undefined} center zIndexRange={[10, 0]} className="pointer-events-none" {...props}>{children}</Html>;
}

type Props = {
    kamera: [number, number, number];
    fov?: number;
    lebar: number;
    tinggi?: string;
    maxPolar?: number;
    pusat?: [number, number, number];
    petunjuk?: string;
    label: string;
    kabut?: [string, number, number];
    cahaya?: boolean; // false = scene memasang lampunya sendiri
    bayangan?: boolean;
    hud?: React.ReactNode; // lapisan HTML di atas kanvas
    children: React.ReactNode;
};

export function Panggung({ kamera, fov = 35, lebar, tinggi = "h-[420px] sm:h-[520px]", maxPolar = Math.PI / 2.3, pusat = [0, 0, 0], petunjuk, label,
    kabut = [W.bg, 40, 90], cahaya = true, bayangan = false, hud, children }: Props) {
    const kontrol = useRef<Kontrol>(null);
    const wadah = useRef<HTMLDivElement>(null);
    const [target] = useState(() => new THREE.Vector3(...pusat));
    return (
        <div ref={wadah} className={`relative overflow-hidden rounded-xl border border-line bg-bg ${tinggi}`}>
            <Canvas camera={{ position: kamera, fov }} dpr={[1, 2]} shadows={bayangan} aria-label={label}>
                <color attach="background" args={[W.bg]} />
                <fog attach="fog" args={kabut} />
                {cahaya && <hemisphereLight args={["#ffe6cc", "#1a2a33", 0.9]} />}
                {cahaya && <directionalLight position={[8, 14, 6]} intensity={1.6} color="#fff1e0" />}
                <Bingkai lebar={lebar} pusat={target} kontrol={kontrol} />
                <Wadah value={wadah}>{children}</Wadah>
                <OrbitControls ref={kontrol} makeDefault enableDamping target={target} maxPolarAngle={maxPolar} minDistance={4} maxDistance={70} />
            </Canvas>
            {hud}
            <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex items-end justify-end gap-2 sm:justify-between">
                <p className="hidden rounded-md bg-bg/80 px-2 py-1 text-xs text-muted sm:block">{petunjuk ?? "Seret untuk memutar, gulir atau cubit untuk zoom"}</p>
                <button onClick={() => kontrol.current?.reset()}
                    className="pointer-events-auto min-h-11 rounded-lg border border-line bg-surface px-3 text-xs font-medium hover:border-fox">
                    Reset kamera
                </button>
            </div>
        </div>
    );
}

// Maskot rubah low-poly, menghadap +x. flatShading supaya segi-seginya sama dengan logo.
export function Rubah({ skala = 1 }: { skala?: number }) {
    const oranye = <meshStandardMaterial color={W.fox} flatShading />;
    const krem = <meshStandardMaterial color={W.ink} flatShading />;
    const gelap = <meshStandardMaterial color="#2a1a12" flatShading />;
    return (
        <group scale={skala}>
            <mesh position={[0, 0.55, 0]} scale={[0.75, 0.5, 0.42]}><icosahedronGeometry args={[0.6, 0]} />{oranye}</mesh>
            <mesh position={[0.5, 0.95, 0]}><icosahedronGeometry args={[0.3, 0]} />{oranye}</mesh>
            <mesh position={[0.82, 0.88, 0]} rotation-z={-Math.PI / 2}><coneGeometry args={[0.14, 0.36, 4]} />{krem}</mesh>
            <mesh position={[0.99, 0.88, 0]} rotation-z={-Math.PI / 2}><coneGeometry args={[0.05, 0.06, 4]} />{gelap}</mesh>
            {[-0.13, 0.13].map((z) => (
                <mesh key={z} position={[0.45, 1.27, z]}><coneGeometry args={[0.09, 0.26, 4]} />{gelap}</mesh>
            ))}
            <mesh position={[-0.62, 0.7, 0]} rotation-z={Math.PI / 2.6}><coneGeometry args={[0.22, 0.8, 5]} />{oranye}</mesh>
            <mesh position={[-1.02, 0.86, 0]} rotation-z={Math.PI / 2.6}><coneGeometry args={[0.1, 0.22, 5]} />{krem}</mesh>
            {[[0.25, 0.14], [0.25, -0.14], [-0.25, 0.14], [-0.25, -0.14]].map(([x, z]) => (
                <mesh key={`${x}${z}`} position={[x, 0.18, z]}><boxGeometry args={[0.1, 0.36, 0.1]} />{gelap}</mesh>
            ))}
        </group>
    );
}
