"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Line, useCursor } from "@react-three/drei";
import * as THREE from "three";
import { cariTerdekat } from "@/app/actions";
import Status from "@/components/Status";
import { GagalQuery } from "@/components/QueryCard";
import { Label, Panggung, Rubah, useGerak, W } from "./Dunia";
import { cariJalan, diTanah, keLngLat, Pulau, S, tanahY, useMedan, type Medan } from "./Pulau";
import { Kemudi, TrukBoks, type Arah, type Tombol } from "./Mobil";

export type Cabang = {
    _id: string; nama_cabang: string; kota: string; kapasitas_gudang_ton: number; id_cabang_induk?: string;
    lokasi: { coordinates: [number, number] };
};
export type Rute = { asal: string; tujuan: string; jumlah: number; status: string[] };
type Hasil = { _id: string; nama_cabang: string; kapasitas_gudang_ton: number; jarak_km: number };
type Jenis = "jalan" | "tunggu" | "selesai";

const tinggi = (ton: number) => 0.4 + ton / 350;
const jenisRute = (status: string[]): Jenis =>
    status.some((s) => s === "Dalam Perjalanan" || s === "Transit") ? "jalan" : status.includes("Menunggu Penjadwalan") ? "tunggu" : "selesai";
// di atas peta OSM yang terang, biru es dan abu muda tenggelam; dipakai versi yang lebih pekat
const WARNA_RUTE: Record<Jenis, string> = { jalan: W.fox, tunggu: "#5b5048", selesai: "#2563a8" };
const KARTU = "space-y-3 rounded-xl border border-line bg-surface p-4";
const KACA = "rounded-lg border border-line/70 bg-bg/75 backdrop-blur-md";
const TOMBOL: Record<string, Arah> = {
    w: "maju", arrowup: "maju", s: "mundur", arrowdown: "mundur", a: "kiri", arrowleft: "kiri", d: "kanan", arrowright: "kanan",
};

// Gudang cabang: bangunan kecil di permukaan tanah dan tiang cahaya setinggi kapasitasnya.
function Gudang({ c, terpilih, jarak, pusat, onPilih }: { c: Cabang; terpilih: boolean; jarak?: number; pusat: boolean; onPilih: (id: string) => void }) {
    const dekat = jarak !== undefined;
    const [hover, setHover] = useState(false);
    useCursor(hover);
    const h = tinggi(c.kapasitas_gudang_ton);
    const warna = dekat ? W.fox : pusat ? W.ink : W.ice;
    const sorot = hover || terpilih;
    return (
        <group position={diTanah(...c.lokasi.coordinates)}
            onClick={(e) => { e.stopPropagation(); onPilih(c._id); }}
            onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
            onPointerOut={() => setHover(false)}>
            <mesh position-y={0.07} castShadow receiveShadow>
                <boxGeometry args={[0.34, 0.14, 0.22]} />
                <meshStandardMaterial color="#d9d2c6" roughness={0.7} />
            </mesh>
            <mesh position-y={0.17} rotation-z={Math.PI / 4} castShadow>
                <boxGeometry args={[0.09, 0.09, 0.24]} />
                <meshStandardMaterial color="#8c4a2f" roughness={0.6} />
            </mesh>
            <mesh position-y={h / 2 + 0.1} scale={sorot ? [1.4, 1, 1.4] : 1} castShadow>
                <cylinderGeometry args={[0.045, 0.06, h, 12]} />
                <meshStandardMaterial color={warna} emissive={warna} emissiveIntensity={terpilih ? 1.4 : hover ? 1 : 0.6} toneMapped={false} />
            </mesh>
            <mesh position-y={h + 0.12}>
                <sphereGeometry args={[sorot ? 0.11 : 0.08, 16, 12]} />
                <meshStandardMaterial color={warna} emissive={warna} emissiveIntensity={2} toneMapped={false} />
            </mesh>
            {/* area klik lebih besar dari tiangnya yang ramping */}
            <mesh position-y={h / 2} visible={false}><cylinderGeometry args={[0.25, 0.25, h + 0.3, 8]} /></mesh>
            {terpilih && (
                <mesh rotation-x={-Math.PI / 2} position-y={0.02}>
                    <ringGeometry args={[0.32, 0.4, 48]} />
                    <meshBasicMaterial color={W.fox} toneMapped={false} />
                </mesh>
            )}
            <Label position={[0, h + 0.4, 0]}>
                <div className={`whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium backdrop-blur-sm ${terpilih ? "border-fox bg-bg/90 text-fox" : "border-line/70 bg-bg/70 text-ink"}`}>
                    {c.kota}
                    {dekat && <span className="ml-1.5 text-fox">{jarak.toLocaleString("id-ID")} km</span>}
                    {!dekat && sorot && <span className="ml-1.5 text-muted">{c.kapasitas_gudang_ton} t</span>}
                </div>
            </Label>
        </group>
    );
}

function Truk({ kurva, mulai, gerak, warna }: { kurva: THREE.CatmullRomCurve3; mulai: number; gerak: boolean; warna: string }) {
    const ref = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        const t = gerak ? (clock.elapsedTime * 0.04 + mulai) % 1 : 0.5;
        const g = ref.current;
        if (!g) return;
        g.position.copy(kurva.getPointAt(t)).y -= 0.025;
        g.lookAt(g.position.clone().add(kurva.getTangentAt(t)));
    });
    return <group ref={ref}><group scale={0.07}><TrukBoks warna={warna} /></group></group>;
}

// Rute mengikuti jalur darat hasil A* (lihat cariJalan), menempel di permukaan medan seperti jalan raya.
function Jalan({ r, a, b, mulai, gerak, medan }: { r: Rute; a: THREE.Vector3; b: THREE.Vector3; mulai: number; gerak: boolean; medan: Medan }) {
    const jenis = jenisRute(r.status);
    const { kurva, garis } = useMemo(() => {
        const dasar = new THREE.CatmullRomCurve3(cariJalan(a, b, medan), false, "centripetal");
        const n = Math.max(24, Math.ceil(dasar.getLength() / 0.04));
        const geser = r.asal < r.tujuan ? 0.03 : -0.03; // A→B dan B→A di lajur berbeda
        const titik = dasar.getSpacedPoints(n).map((p, i) => {
            const t = dasar.getTangentAt(i / n).setY(0).normalize();
            p.x -= t.z * geser;
            p.z += t.x * geser;
            return p.setY(tanahY(p.x, p.z, medan) + 0.03);
        });
        return { kurva: new THREE.CatmullRomCurve3(titik), garis: titik };
    }, [a, b, r.asal, r.tujuan, medan]); // jalur dicari ulang setelah garis pantai OSM terpasang
    return (
        <>
            <Line points={garis} color={WARNA_RUTE[jenis]} lineWidth={jenis === "jalan" ? 3.5 : 2.5} dashed={jenis === "tunggu"} dashSize={0.15} gapSize={0.12}
                transparent opacity={jenis === "selesai" ? 0.8 : 1} />
            {jenis === "jalan" && <Truk kurva={kurva} mulai={mulai} gerak={gerak} warna={W.fox} />}
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
        p.y = tanahY(p.x, p.z) + (gerak && sisa > 0.05 ? Math.abs(Math.sin(clock.elapsedTime * 12)) * 0.2 : 0);
    });
    return <group ref={ref} position={tujuan}><Rubah skala={0.4} /></group>;
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
    const medan = useMedan();
    const [radius, setRadius] = useState(300);
    const [titik, setTitik] = useState<THREE.Vector3 | null>(null);
    const [hasil, setHasil] = useState<{ rows: Hasil[]; error: string | null } | null>(null);
    const [memuat, setMemuat] = useState(false);
    const [pilih, setPilih] = useState<string | null>(null);
    const [kemudi, setKemudi] = useState(false);
    const tombol = useRef<Tombol>(new Set());
    const info = useRef<HTMLParagraphElement>(null);

    const byId = useMemo(() => new Map(cabang.map((c) => [c._id, c])), [cabang]);
    const pos = useMemo(() => new Map(cabang.map((c) => [c._id, diTanah(...c.lokasi.coordinates, medan)])), [cabang, medan]);
    const pusat = cabang.find((c) => !c.id_cabang_induk) ?? cabang[0];
    const jarak = new Map(hasil?.rows.map((r) => [r._id, r.jarak_km]));
    const terpilih = pilih ? byId.get(pilih) : undefined;
    const posRubah = useMemo(() => {
        const p = pos.get(pilih ?? pusat?._id ?? "");
        return p ? p.clone().add(new THREE.Vector3(0.45, 0, 0.3)) : new THREE.Vector3();
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

    // W/A/S/D atau panah mengemudikan mobil; Esc keluar. Panah tidak ikut menggulir halaman.
    useEffect(() => {
        if (!kemudi) return;
        const set = tombol.current;
        const tekan = (e: KeyboardEvent) => {
            if (e.key === "Escape") return setKemudi(false);
            const arah = TOMBOL[e.key.toLowerCase()];
            if (!arah) return;
            e.preventDefault();
            if (e.type === "keydown") set.add(arah); else set.delete(arah);
        };
        window.addEventListener("keydown", tekan);
        window.addEventListener("keyup", tekan);
        return () => { window.removeEventListener("keydown", tekan); window.removeEventListener("keyup", tekan); set.clear(); };
    }, [kemudi]);

    function klikPeta(e: ThreeEvent<MouseEvent>) {
        e.stopPropagation();
        if (e.delta > 4) return; // pointer bergeser = sedang memutar kamera, bukan klik
        setTitik(e.point.clone().setY(Math.max(e.point.y, 0)));
    }

    function hapusTitik() {
        setTitik(null);
        setHasil(null);
    }

    const r3d = (radius / 111) * S; // 1 derajat lintang ≈ 111 km
    const [lng, lat] = titik ? keLngLat(titik) : [0, 0];
    const maxTon = Math.max(...cabang.map((c) => c.kapasitas_gudang_ton), 1);
    const ruteCabang = (id: string) => rute.filter((r) => r.asal === id || r.tujuan === id);

    const mulaiMobil = (pos.get(pusat?._id ?? "") ?? new THREE.Vector3()).clone().add(new THREE.Vector3(0, 0, 0.25));
    const pad = (arah: Arah, label: string, isi: string) => (
        <button aria-label={label} className={`pointer-events-auto grid size-12 place-items-center text-lg ${KACA} active:border-fox active:text-fox`}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); tombol.current.add(arah); }}
            onPointerUp={() => tombol.current.delete(arah)} onPointerCancel={() => tombol.current.delete(arah)}
            onContextMenu={(e) => e.preventDefault()}>{isi}</button>
    );

    const hud = (
        <>
            <div className={`pointer-events-none absolute left-3 top-3 z-20 hidden space-y-1.5 p-3 text-xs text-muted sm:block ${KACA}`}>
                <p className="font-medium text-ink">Rute pengiriman</p>
                <p className="flex items-center gap-2"><Garis warna={W.fox} />Dalam perjalanan / transit</p>
                <p className="flex items-center gap-2"><Garis warna={WARNA_RUTE.selesai} />Sudah terkirim</p>
                <p className="flex items-center gap-2"><Garis warna={WARNA_RUTE.tunggu} putus />Menunggu penjadwalan</p>
                <p className="pt-1">Tinggi tiang cahaya = kapasitas gudang</p>
            </div>
            <div className="absolute right-3 top-3 z-20 flex flex-col items-end gap-2">
                <button onClick={() => setKemudi((k) => !k)} aria-pressed={kemudi}
                    className={`min-h-11 rounded-lg px-3 text-sm font-medium ${kemudi ? "bg-fox text-bg" : `${KACA} text-ink hover:border-fox`}`}>
                    {kemudi ? "Keluar dari mobil" : "Kemudikan mobil"}
                </button>
                {kemudi && <p ref={info} aria-live="off" className={`px-2 py-1 font-mono text-xs tabular-nums text-ink ${KACA}`}>—</p>}
            </div>
            {medan.peta && (
                <p className={`absolute bottom-16 right-3 z-20 px-2 py-0.5 text-[11px] text-muted ${KACA}`}>
                    © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-ink">kontributor OpenStreetMap</a>
                </p>
            )}
            {kemudi && (
                <div className="pointer-events-none absolute inset-x-0 bottom-28 sm:bottom-16 z-20 flex flex-col items-center gap-2">
                    <p className={`hidden px-2 py-1 text-xs text-muted sm:block ${KACA}`}>W A S D atau tombol panah · Esc untuk keluar</p>
                    <div className="grid grid-cols-3 gap-1.5 select-none">
                        <span />{pad("maju", "Maju", "▲")}<span />
                        {pad("kiri", "Belok kiri", "◀")}{pad("mundur", "Mundur", "▼")}{pad("kanan", "Belok kanan", "▶")}
                    </div>
                </div>
            )}
        </>
    );

    return (
        <div className="space-y-4">
            <Panggung kamera={[0, 17, 15]} fov={32} lebar={30} label="Peta 3D jaringan cabang di Pulau Jawa"
                tinggi="h-[440px] sm:h-[540px] lg:h-[620px]" cahaya={false} bayangan kabut={["#dce8ee", 50, 120]} hud={hud}
                petunjuk={kemudi ? "Mobil berhenti di bibir pantai. Klik peta tetap mencari cabang terdekat."
                    : "Klik tiang cahaya untuk detail cabang. Klik daratan atau laut untuk mencari cabang terdekat."}>
                <Pulau medan={medan} onKlik={klikPeta} />
                {cabang.map((c) => (
                    <Gudang key={c._id} c={c} terpilih={pilih === c._id} jarak={jarak.get(c._id)} pusat={c._id === pusat?._id}
                        onPilih={(id) => setPilih((p) => (p === id ? null : id))} />
                ))}
                {rute.map((r, i) => {
                    const a = pos.get(r.asal), b = pos.get(r.tujuan);
                    return a && b ? <Jalan key={`${r.asal}-${r.tujuan}`} r={r} a={a} b={b} mulai={i / rute.length} gerak={gerak} medan={medan} /> : null;
                })}
                {pusat && <RubahPemandu tujuan={posRubah} gerak={gerak} />}
                {kemudi && <Kemudi mulai={mulaiMobil} tombol={tombol} gerak={gerak} onInfo={(t) => { if (info.current) info.current.textContent = t; }} />}
                {titik && (
                    <group position={titik}>
                        <mesh position-y={0.32} rotation-x={Math.PI} castShadow>
                            <coneGeometry args={[0.1, 0.32, 16]} />
                            <meshStandardMaterial color={W.ice} emissive={W.ice} emissiveIntensity={1.2} toneMapped={false} />
                        </mesh>
                        {/* pagar radius: dinding tembus pandang supaya jangkauan terbaca walau tertutup gunung */}
                        <mesh position-y={0.6 - titik.y}>
                            <cylinderGeometry args={[r3d, r3d, 1.2, 128, 1, true]} />
                            <meshBasicMaterial color={W.ice} transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
                        </mesh>
                        <mesh rotation-x={-Math.PI / 2} position-y={0.02 - titik.y} renderOrder={2}>
                            <ringGeometry args={[r3d - 0.05, r3d, 128]} />
                            <meshBasicMaterial color={W.ice} transparent opacity={0.9} depthTest={false} />
                        </mesh>
                    </group>
                )}
                {titik && hasil?.rows.map((h) => {
                    const p = pos.get(h._id);
                    return p && <Line key={h._id} points={[titik.clone().setY(titik.y + 0.4), p.clone().setY(p.y + 0.4)]} color={W.fox} lineWidth={1.5} dashed dashSize={0.2} gapSize={0.15} />;
                })}
            </Panggung>

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
