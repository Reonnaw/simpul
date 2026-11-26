"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Edges, Line, QuadraticBezierLine, useCursor } from "@react-three/drei";
import * as THREE from "three";
import { cariTerdekat } from "@/app/actions";
import Status from "@/components/Status";
import { GagalQuery } from "@/components/QueryCard";
import { Label, Panggung, Rubah, useGerak, W } from "./Dunia";
import { GUNUNG, JAWA, MADURA } from "./jawa";

export type Cabang = {
    _id: string; nama_cabang: string; kota: string; kapasitas_gudang_ton: number; id_cabang_induk?: string;
    lokasi: { coordinates: [number, number] };
};
export type Rute = { asal: string; tujuan: string; jumlah: number; status: string[] };
type Hasil = { _id: string; nama_cabang: string; kapasitas_gudang_ton: number; jarak_km: number };
type Jenis = "jalan" | "tunggu" | "selesai";

const S = 3; // 1 derajat = 3 satuan 3D
const LNG0 = 109.8, LAT0 = -7.2; // tengah Pulau Jawa = titik pusat dunia
const keXZ = (lng: number, lat: number) => new THREE.Vector3((lng - LNG0) * S, 0, -(lat - LAT0) * S);
const keLngLat = (p: THREE.Vector3) => [p.x / S + LNG0, -p.z / S + LAT0] as const;
const tinggi = (ton: number) => 0.4 + ton / 350;
const jenisRute = (status: string[]): Jenis =>
    status.some((s) => s === "Dalam Perjalanan" || s === "Transit") ? "jalan" : status.includes("Menunggu Penjadwalan") ? "tunggu" : "selesai";
const WARNA_RUTE: Record<Jenis, string> = { jalan: W.fox, tunggu: W.muted, selesai: W.ice };
const KARTU = "space-y-3 rounded-xl border border-line bg-surface p-4";

function Daratan({ garis, onKlik }: { garis: [number, number][]; onKlik: (e: ThreeEvent<MouseEvent>) => void }) {
    const geo = useMemo(() => {
        const bentuk = new THREE.Shape(garis.map(([lng, lat]) => new THREE.Vector2((lng - LNG0) * S, (lat - LAT0) * S)));
        return new THREE.ExtrudeGeometry(bentuk, { depth: 0.3, bevelEnabled: false });
    }, [garis]);
    return (
        <mesh geometry={geo} rotation-x={-Math.PI / 2} position-y={-0.3} onClick={onKlik}>
            <meshStandardMaterial color="#4a3b30" flatShading />
            <Edges threshold={20} color="#6b5747" />
        </mesh>
    );
}

function Menara({ c, terpilih, jarak, pusat, onPilih }: { c: Cabang; terpilih: boolean; jarak?: number; pusat: boolean; onPilih: (id: string) => void }) {
    const dekat = jarak !== undefined;
    const [hover, setHover] = useState(false);
    useCursor(hover);
    const h = tinggi(c.kapasitas_gudang_ton);
    const warna = dekat ? W.fox : pusat ? W.ink : W.ice;
    return (
        <group position={keXZ(...c.lokasi.coordinates)}>
            <mesh position-y={h / 2} scale={hover || terpilih ? 1.15 : 1}
                onClick={(e) => { e.stopPropagation(); onPilih(c._id); }}
                onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
                onPointerOut={() => setHover(false)}>
                <cylinderGeometry args={[0.36, 0.44, h, 6]} />
                <meshStandardMaterial color={warna} flatShading emissive={warna} emissiveIntensity={terpilih ? 0.35 : hover ? 0.2 : 0} />
            </mesh>
            {terpilih && (
                <mesh rotation-x={-Math.PI / 2} position-y={0.03}>
                    <ringGeometry args={[0.62, 0.74, 6]} />
                    <meshBasicMaterial color={W.fox} />
                </mesh>
            )}
            <Label position={[0, h + 0.35, 0]}>
                <div className={`whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium ${terpilih ? "border-fox bg-bg text-fox" : "border-line bg-bg/85 text-ink"}`}>
                    {c.kota}
                    {dekat && <span className="ml-1.5 text-fox">{jarak.toLocaleString("id-ID")} km</span>}
                    {!dekat && (hover || terpilih) && <span className="ml-1.5 text-muted">{c.kapasitas_gudang_ton} t</span>}
                </div>
            </Label>
        </group>
    );
}

function Truk({ kurva, mulai, gerak }: { kurva: THREE.QuadraticBezierCurve3; mulai: number; gerak: boolean }) {
    const ref = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        const t = gerak ? (clock.elapsedTime * 0.07 + mulai) % 1 : 0.5;
        const m = ref.current;
        if (!m) return;
        m.position.copy(kurva.getPoint(t));
        m.lookAt(m.position.clone().add(kurva.getTangent(t)));
    });
    return (
        <mesh ref={ref}>
            <boxGeometry args={[0.24, 0.22, 0.5]} />
            <meshStandardMaterial color={W.fox} emissive={W.fox} emissiveIntensity={0.4} />
        </mesh>
    );
}

function Busur({ r, a, b, mulai, gerak }: { r: Rute; a: THREE.Vector3; b: THREE.Vector3; mulai: number; gerak: boolean }) {
    const jenis = jenisRute(r.status);
    const kurva = useMemo(() => {
        // rute bolak-balik (A→B dan B→A) digeser ke sisi berlawanan supaya tidak bertumpuk
        const samping = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(r.asal < r.tujuan ? 0.6 : -0.6);
        const mid = a.clone().add(b).multiplyScalar(0.5).add(samping).setY(a.distanceTo(b) * 0.2 + 0.8);
        return new THREE.QuadraticBezierCurve3(a.clone().setY(0.05), mid, b.clone().setY(0.05));
    }, [a, b, r.asal, r.tujuan]);
    return (
        <>
            <QuadraticBezierLine start={kurva.v0} mid={kurva.v1} end={kurva.v2} color={WARNA_RUTE[jenis]}
                lineWidth={jenis === "jalan" ? 3 : 1.5} dashed={jenis === "tunggu"} dashSize={0.3} gapSize={0.25}
                transparent opacity={jenis === "selesai" ? 0.55 : 1} />
            {jenis === "jalan" && <Truk kurva={kurva} mulai={mulai} gerak={gerak} />}
        </>
    );
}

// Rubah melompat ke cabang yang dipilih, jadi mata ikut ke tempat yang sedang dibahas.
function RubahPemandu({ tujuan, gerak }: { tujuan: THREE.Vector3; gerak: boolean }) {
    const ref = useRef<THREE.Group>(null);
    useFrame(({ clock }, dt) => {
        const g = ref.current;
        if (!g) return;
        const p = g.position;
        const k = gerak ? 1 - Math.exp(-dt * 3) : 1;
        const dx = tujuan.x - p.x, dz = tujuan.z - p.z;
        const sisa = Math.hypot(dx, dz);
        if (sisa > 0.05) g.rotation.y = Math.atan2(-dz, dx);
        p.x += dx * k;
        p.z += dz * k;
        p.y = gerak && sisa > 0.05 ? Math.abs(Math.sin(clock.elapsedTime * 12)) * 0.35 : 0;
    });
    return <group ref={ref} position={tujuan}><Rubah skala={0.9} /></group>;
}

function Garis({ warna, putus }: { warna: string; putus?: boolean }) {
    return (
        <svg width="28" height="8" aria-hidden="true">
            <line x1="1" y1="4" x2="27" y2="4" stroke={warna} strokeWidth="3" strokeDasharray={putus ? "5 4" : undefined} />
        </svg>
    );
}

export default function MapScene({ cabang, rute }: { cabang: Cabang[]; rute: Rute[] }) {
    const gerak = useGerak();
    const [radius, setRadius] = useState(300);
    const [titik, setTitik] = useState<THREE.Vector3 | null>(null);
    const [hasil, setHasil] = useState<{ rows: Hasil[]; error: string | null } | null>(null);
    const [memuat, setMemuat] = useState(false);
    const [pilih, setPilih] = useState<string | null>(null);

    const byId = useMemo(() => new Map(cabang.map((c) => [c._id, c])), [cabang]);
    const pos = useMemo(() => new Map(cabang.map((c) => [c._id, keXZ(...c.lokasi.coordinates)])), [cabang]);
    const pusat = cabang.find((c) => !c.id_cabang_induk) ?? cabang[0];
    const jarak = new Map(hasil?.rows.map((r) => [r._id, r.jarak_km]));
    const terpilih = pilih ? byId.get(pilih) : undefined;
    const posRubah = useMemo(() => {
        const p = pos.get(pilih ?? pusat?._id ?? "");
        return p ? p.clone().add(new THREE.Vector3(1, 0, 0.6)) : new THREE.Vector3();
    }, [pos, pilih, pusat]);

    // $geoNear dijalankan ulang saat titik atau radius berubah (radius ditunda 250 ms selama slider digeser)
    useEffect(() => {
        if (!titik) return;
        let batal = false;
        const t = setTimeout(async () => {
            setMemuat(true);
            const [lng, lat] = keLngLat(titik);
            try {
                const res = await cariTerdekat(lng, lat, radius);
                if (!batal) setHasil({ rows: res.rows as Hasil[], error: res.error });
            } catch (e) {
                if (!batal) setHasil({ rows: [], error: (e as Error).message });
            }
            if (!batal) setMemuat(false);
        }, 250);
        return () => { batal = true; clearTimeout(t); };
    }, [titik, radius]);

    function klikPeta(e: ThreeEvent<MouseEvent>) {
        e.stopPropagation();
        if (e.delta > 4) return; // pointer bergeser = sedang memutar kamera, bukan klik
        setTitik(e.point.clone().setY(0));
    }

    function hapusTitik() {
        setTitik(null);
        setHasil(null);
    }

    const r3d = (radius / 111) * S; // 1 derajat lintang ≈ 111 km
    const [lng, lat] = titik ? keLngLat(titik) : [0, 0];
    const maxTon = Math.max(...cabang.map((c) => c.kapasitas_gudang_ton), 1);
    const ruteCabang = (id: string) => rute.filter((r) => r.asal === id || r.tujuan === id);

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <Panggung kamera={[0, 20, 16]} fov={32} lebar={32} label="Peta 3D jaringan cabang di Pulau Jawa"
                    tinggi="h-[300px] sm:h-[480px] lg:h-[540px]"
                    petunjuk="Klik menara untuk detail cabang. Klik daratan atau laut untuk mencari cabang terdekat.">
                    <mesh rotation-x={-Math.PI / 2} position-y={-0.2} onClick={klikPeta}>
                        <planeGeometry args={[140, 90]} />
                        <meshStandardMaterial color="#142027" />
                    </mesh>
                    <Daratan garis={JAWA} onKlik={klikPeta} />
                    <Daratan garis={MADURA} onKlik={klikPeta} />
                    {GUNUNG.map(([glng, glat, h]) => (
                        <mesh key={glng} position={keXZ(glng, glat).setY(h / 2)} onClick={klikPeta}>
                            <coneGeometry args={[0.4, h, 5]} />
                            <meshStandardMaterial color="#6b5747" flatShading />
                        </mesh>
                    ))}
                    {cabang.map((c) => (
                        <Menara key={c._id} c={c} terpilih={pilih === c._id} jarak={jarak.get(c._id)} pusat={c._id === pusat?._id}
                            onPilih={(id) => setPilih((p) => (p === id ? null : id))} />
                    ))}
                    {rute.map((r, i) => {
                        const a = pos.get(r.asal), b = pos.get(r.tujuan);
                        return a && b ? <Busur key={`${r.asal}-${r.tujuan}`} r={r} a={a} b={b} mulai={i / rute.length} gerak={gerak} /> : null;
                    })}
                    {pusat && <RubahPemandu tujuan={posRubah} gerak={gerak} />}
                    {titik && (
                        <group position={titik}>
                            <mesh position-y={0.45} rotation-x={Math.PI}>
                                <coneGeometry args={[0.18, 0.5, 4]} />
                                <meshStandardMaterial color={W.ice} emissive={W.ice} emissiveIntensity={0.4} />
                            </mesh>
                            <mesh rotation-x={-Math.PI / 2} position-y={0.06}>
                                <ringGeometry args={[r3d - 0.07, r3d, 96]} />
                                <meshBasicMaterial color={W.ice} transparent opacity={0.8} />
                            </mesh>
                            <mesh rotation-x={-Math.PI / 2} position-y={0.05}>
                                <circleGeometry args={[r3d, 96]} />
                                <meshBasicMaterial color={W.ice} transparent opacity={0.07} depthWrite={false} />
                            </mesh>
                        </group>
                    )}
                    {titik && hasil?.rows.map((h) => {
                        const p = pos.get(h._id);
                        return p && <Line key={h._id} points={[titik.clone().setY(0.1), p.clone().setY(0.1)]} color={W.fox} lineWidth={1.5} dashed dashSize={0.2} gapSize={0.15} />;
                    })}
                </Panggung>
                <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
                    <li className="flex items-center gap-2"><Garis warna={W.fox} />Dalam perjalanan / transit (truk bergerak)</li>
                    <li className="flex items-center gap-2"><Garis warna={W.ice} />Sudah terkirim</li>
                    <li className="flex items-center gap-2"><Garis warna={W.muted} putus />Menunggu penjadwalan</li>
                    <li>Tinggi menara = kapasitas gudang</li>
                </ul>
            </div>

            <div className="grid items-start gap-4 lg:grid-cols-3">
                <section className={KARTU}>
                    <label className="block space-y-2">
                        <span className="flex items-baseline justify-between text-sm">
                            <span>Radius pencarian <code className="font-mono text-xs text-ice">$geoNear</code></span>
                            <b className="tabular-nums">{radius} km</b>
                        </span>
                        <input type="range" min={50} max={1000} step={50} value={radius} onChange={(e) => setRadius(Number(e.target.value))}
                            className="h-11 w-full cursor-pointer" />
                    </label>

                    {!titik && <p className="text-sm text-muted">Klik daratan atau laut di peta. Lingkaran biru es menunjukkan jangkauan radius.</p>}
                    {titik && (
                        <div aria-live="polite" className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="font-display font-semibold">Cabang terdekat</h3>
                                <button onClick={hapusTitik} className="-mr-1 -mt-1 min-h-11 rounded-lg px-2 text-xs text-muted hover:text-ink">Hapus titik</button>
                            </div>
                            <p className="text-xs text-muted">dari {Math.abs(lat).toFixed(2)}° LS, {lng.toFixed(2)}° BT</p>
                            {memuat && !hasil && <p className="text-sm text-muted">Menjalankan $geoNear di MongoDB…</p>}
                            {hasil?.error && <GagalQuery error={hasil.error} />}
                            {hasil && !hasil.error && hasil.rows.length === 0 && (
                                <p className="text-sm text-muted">Tidak ada cabang dalam {radius} km. Geser radius lebih besar atau klik lebih dekat ke menara.</p>
                            )}
                            <ol className={`space-y-1 ${memuat ? "opacity-60" : ""}`}>
                                {hasil?.rows.map((h) => (
                                    <li key={h._id}>
                                        <button onClick={() => setPilih(h._id)} className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-2 text-left text-sm hover:bg-raised">
                                            <span>{byId.get(h._id)?.kota ?? h.nama_cabang}</span>
                                            <span className="tabular-nums text-fox">{h.jarak_km.toLocaleString("id-ID")} km</span>
                                        </button>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                </section>

                <section className={`${KARTU} ${terpilih ? "border-fox/50" : ""}`}>
                    {!terpilih && (
                        <div className="space-y-1">
                            <h3 className="font-display font-semibold">Detail cabang</h3>
                            <p className="text-sm text-muted">Pilih menara di peta atau nama cabang di daftar. Rubah akan melompat ke sana.</p>
                        </div>
                    )}
                    {terpilih && (
                        <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h3 className="font-display text-lg font-semibold">{terpilih.nama_cabang}</h3>
                                    <p className="text-xs text-muted"><span className="font-mono">{terpilih._id}</span> · {terpilih.kota}</p>
                                </div>
                                <button onClick={() => setPilih(null)} className="-mr-1 -mt-1 min-h-11 rounded-lg px-2 text-xs text-muted hover:text-ink">Tutup</button>
                            </div>
                            <dl className="grid grid-cols-2 gap-2 text-sm">
                                <div><dt className="text-xs text-muted">Kapasitas gudang</dt><dd className="font-semibold">{terpilih.kapasitas_gudang_ton.toLocaleString("id-ID")} ton</dd></div>
                                <div><dt className="text-xs text-muted">Induk</dt><dd className="font-semibold">{byId.get(terpilih.id_cabang_induk ?? "")?.kota ?? "Kantor pusat"}</dd></div>
                            </dl>
                            <div className="space-y-1.5">
                                <p className="text-xs text-muted">Rute yang melewati cabang ini</p>
                                {ruteCabang(terpilih._id).length === 0 && <p className="text-sm text-muted">Belum ada pengiriman dari atau ke cabang ini.</p>}
                                {ruteCabang(terpilih._id).map((r) => (
                                    <div key={`${r.asal}-${r.tujuan}`} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                                        <span>{byId.get(r.asal)?.kota} → {byId.get(r.tujuan)?.kota}</span>
                                        <span className="flex flex-wrap gap-1">{r.status.map((s) => <Status key={s} s={s} />)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                <section className={KARTU}>
                    <h3 className="text-xs font-medium text-muted">Semua cabang</h3>
                    {[...cabang].sort((a, b) => b.kapasitas_gudang_ton - a.kapasitas_gudang_ton).map((c) => (
                        <button key={c._id} onClick={() => setPilih((p) => (p === c._id ? null : c._id))} aria-pressed={pilih === c._id}
                            className={`block min-h-11 w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-raised ${pilih === c._id ? "bg-raised" : ""}`}>
                            <span className="flex justify-between gap-2">
                                <span className={pilih === c._id ? "font-semibold text-fox" : ""}>{c.kota}</span>
                                <span className="tabular-nums text-muted">{c.kapasitas_gudang_ton} t</span>
                            </span>
                            <span className="mt-1 block h-1 rounded-full bg-line">
                                <span className="block h-1 rounded-full bg-ice" style={{ width: `${(c.kapasitas_gudang_ton / maxTon) * 100}%` }} />
                            </span>
                        </button>
                    ))}
                </section>
            </div>
        </div>
    );
}
