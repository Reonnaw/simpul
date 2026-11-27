"use client";
import { useEffect, useMemo, useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { Environment, Sky } from "@react-three/drei";
import * as THREE from "three";
import { GUNUNG, JAWA, MADURA } from "./jawa";

export const S = 3; // 1 derajat = 3 satuan 3D
export const LNG0 = 109.8, LAT0 = -7.2; // tengah Pulau Jawa = titik pusat dunia
const V = 0.0003; // 1 m ketinggian = 0,0003 satuan (sekitar 11× dibesarkan supaya gunung terbaca)
export const MATAHARI: [number, number, number] = [-14, 10, -8]; // dari barat laut, cukup rendah supaya relief berbayang

export const keXZ = (lng: number, lat: number) => new THREE.Vector3((lng - LNG0) * S, 0, -(lat - LAT0) * S);
export const keLngLat = (p: THREE.Vector3) => [p.x / S + LNG0, -p.z / S + LAT0] as const;

// Grid medan 0,01° (≈1 km): titik (i, k), i dari barat ke timur, k dari utara ke selatan. Urutannya sama dengan PlaneGeometry.
const LNG_A = 104.8, LNG_B = 114.9, LAT_A = -9.1, LAT_B = -5.6, NX = 1010, NZ = 350, KOLOM = NX + 1, N = KOLOM * (NZ + 1);
const lngDi = (i: number) => LNG_A + (i / NX) * (LNG_B - LNG_A);
const latDi = (k: number) => LAT_B - (k / NZ) * (LAT_B - LAT_A);

function hash(x: number, y: number) {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
}
function noise(x: number, y: number) {
    const xi = Math.floor(x), yi = Math.floor(y), u = x - xi, v = y - yi;
    const su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv;
}
function fbm(x: number, y: number, oktaf: number) {
    let s = 0, amp = 0.5, f = 1;
    for (let i = 0; i < oktaf; i++, f *= 2.03, amp *= 0.5) s += amp * noise(x * f, y * f);
    return s;
}
const halus = (a: number, b: number, x: number) => {
    const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
    return t * t * (3 - 2 * t);
};

// Jarak ke garis pantai dalam derajat: positif di darat, negatif di laut.
function jarakPantai(lng: number, lat: number, garis: [number, number][]) {
    let min = Infinity, dalam = false;
    for (let i = 0, j = garis.length - 1; i < garis.length; j = i++) {
        const [x1, y1] = garis[j], [x2, y2] = garis[i];
        if (y2 > lat !== y1 > lat && lng < ((x1 - x2) * (lat - y2)) / (y1 - y2) + x2) dalam = !dalam;
        const dx = x2 - x1, dy = y2 - y1;
        const t = Math.min(Math.max(((lng - x1) * dx + (lat - y1) * dy) / (dx * dx + dy * dy), 0), 1);
        min = Math.min(min, Math.hypot(lng - x1 - t * dx, lat - y1 - t * dy));
    }
    return dalam ? min : -min;
}

const punggung = (x: number, y: number, oktaf: number) => 1 - Math.abs(2 * fbm(x, y, oktaf) - 1); // noise bergerigi

// Ketinggian darat (m dpl). Gunung api memakai posisi & tinggi puncak asli; perbukitan di antaranya dibangkitkan noise.
// shortcut: medan perkiraan, bukan DEM. Ganti dengan heightmap SRTM kalau butuh kontur yang akurat.
function elevasiDarat(lng: number, lat: number, d: number) {
    let gunung = 0;
    for (const [glng, glat, h, r] of GUNUNG) {
        const dx = lng - glng, dy = lat - glat, jarak = Math.hypot(dx, dy);
        if (jarak > r * 7) continue;
        // lereng cekung khas gunung api strato, puncak membulat dengan kawah kecil
        const c = r * 0.3;
        let z = h * Math.exp(-(Math.sqrt(jarak * jarak + c * c) - c) / r) - h * 0.05 * Math.exp(-((jarak / (r * 0.12)) ** 2));
        // alur erosi yang memancar dari puncak: sempit dan dalam di lereng tengah, hilang di kaki gunung
        const sudut = Math.atan2(dy, dx);
        const alur = 1 - Math.abs(2 * noise(Math.cos(sudut) * 4 + glng * 3 + (jarak / r) * 0.6, Math.sin(sudut) * 4 + glat * 3) - 1);
        z *= 1 - 0.2 * alur ** 3 * halus(0.1 * r, 0.6 * r, jarak) * (1 - halus(2.5 * r, 5 * r, jarak));
        gunung = Math.max(gunung, z);
    }
    gunung *= halus(-0.04, 0.12, d);
    // dataran tinggi regional dengan punggungan dan lembah, bukan gumpalan bulat
    const pedalaman = halus(0.05, 0.4, d), naik = fbm(lng * 1.6 + 7, lat * 1.6, 4);
    const bukit = (naik * naik * 750 + punggung(lng * 5 + 3, lat * 5 - 2, 4) ** 3 * 650 * naik) * pedalaman;
    const kasar = (fbm(lng * 18, lat * 18, 3) - 0.5) * 120 * halus(150, 900, gunung + bukit);
    // gunung berdiri di atas dataran tinggi, tapi tidak ditumpuk penuh supaya puncaknya tetap dekat tinggi aslinya
    const dataran = halus(0, 0.2, Math.max(d, 0)) * (15 + bukit);
    return Math.max(gunung, dataran) + 0.3 * Math.min(gunung, dataran) + kasar;
}

// Bagian yang tidak bergantung pada peta OSM dihitung sekali saja. Jarak pantai (49 segmen per titik, paling mahal)
// dihitung di grid 4× lebih jarang lalu diinterpolasi; perbedaannya jauh di bawah satu piksel peta.
let dasar: { h: Float32Array; pantai: Float32Array } | null = null;
function hitungDasar() {
    if (dasar) return dasar;
    const J = 4, cx = Math.ceil(NX / J) + 2, cz = Math.ceil(NZ / J) + 2, jarang = new Float32Array(cx * cz);
    for (let k = 0; k < cz; k++) for (let i = 0; i < cx; i++)
        jarang[k * cx + i] = Math.max(jarakPantai(lngDi(i * J), latDi(k * J), JAWA), jarakPantai(lngDi(i * J), latDi(k * J), MADURA));
    const h = new Float32Array(N), pantai = new Float32Array(N);
    for (let k = 0; k <= NZ; k++) for (let i = 0; i <= NX; i++) {
        const lng = lngDi(i), lat = latDi(k), n = k * KOLOM + i;
        const ci = Math.floor(i / J), ck = Math.floor(k / J), u = i / J - ci, v = k / J - ck, m = ck * cx + ci;
        const d = (jarang[m] * (1 - u) + jarang[m + 1] * u) * (1 - v) + (jarang[m + cx] * (1 - u) + jarang[m + cx + 1] * u) * v;
        pantai[n] = d + (fbm(lng * 4, lat * 4, 3) - 0.5) * 0.1;
        h[n] = elevasiDarat(lng, lat, pantai[n]);
    }
    return (dasar = { h, pantai });
}

function kabur(a: Float32Array) {
    const b = new Float32Array(N), c = new Float32Array(N), r = 3;
    for (let k = 0; k <= NZ; k++) for (let i = 0; i <= NX; i++) {
        let s = 0, m = 0;
        for (let d = -r; d <= r; d++) if (i + d >= 0 && i + d <= NX) { s += a[k * KOLOM + i + d]; m++; }
        b[k * KOLOM + i] = s / m;
    }
    for (let k = 0; k <= NZ; k++) for (let i = 0; i <= NX; i++) {
        let s = 0, m = 0;
        for (let d = -r; d <= r; d++) if (k + d >= 0 && k + d <= NZ) { s += b[(k + d) * KOLOM + i]; m++; }
        c[k * KOLOM + i] = s / m;
    }
    return c;
}

export type Medan = { h: Float32Array; darat: Float32Array; uv: Float32Array | null; peta: THREE.CanvasTexture | null };

// `air(i, k)` = piksel peta OSM di titik itu berwarna laut. Tanpa peta, garis pantai poligon yang dipakai.
// Danau, sungai, dan teks di laut diabaikan: hanya pita dekat pantai yang membaca warna peta.
function bangun(air: ((i: number, k: number) => boolean) | null, uv: Float32Array | null, peta: THREE.CanvasTexture | null): Medan {
    const { h: hDarat, pantai } = hitungDasar();
    const mentah = new Float32Array(N);
    for (let k = 0; k <= NZ; k++) for (let i = 0; i <= NX; i++) {
        const n = k * KOLOM + i, d = pantai[n];
        mentah[n] = d > 0.2 ? 1 : d < -0.3 ? 0 : air ? (air(i, k) ? 0 : 1) : d > 0 ? 1 : 0;
    }
    const darat = kabur(kabur(mentah));
    const h = new Float32Array(N);
    for (let n = 0; n < N; n++) h[n] = hDarat[n] * halus(0.45, 0.9, darat[n]);
    return { h, darat, uv, peta };
}

const medan: { kini: Medan | null } = { kini: null };
const kini = () => medan.kini ?? (medan.kini = bangun(null, null, null));

function ambil(a: Float32Array, x: number, z: number) {
    const fi = ((x / S + LNG0 - LNG_A) / (LNG_B - LNG_A)) * NX, fk = ((LAT_B - (-z / S + LAT0)) / (LAT_B - LAT_A)) * NZ;
    if (!(fi >= 0 && fk >= 0 && fi < NX && fk < NZ)) return 0;
    const i = Math.floor(fi), k = Math.floor(fk), u = fi - i, v = fk - k, n = k * KOLOM + i;
    return (a[n] * (1 - u) + a[n + 1] * u) * (1 - v) + (a[n + KOLOM] * (1 - u) + a[n + KOLOM + 1] * u) * v;
}

export const tinggiXZ = (x: number, z: number, m = kini()) => ambil(m.h, x, z); // m dpl
export const daratXZ = (x: number, z: number, m = kini()) => ambil(m.darat, x, z); // 1 = darat, 0 = laut
export const tanahY = (x: number, z: number, m = kini()) => tinggiXZ(x, z, m) * V;
export const diTanah = (lng: number, lat: number, m = kini()) => {
    const p = keXZ(lng, lat);
    return p.setY(tanahY(p.x, p.z, m));
};

// Peta OSM zoom 8 (32 ubin) dibentangkan di atas medan. Ubin memakai proyeksi Mercator, jadi UV dihitung per titik.
const Z = 8;
const ubinX = (lng: number) => ((lng + 180) / 360) * 2 ** Z;
const ubinY = (lat: number) => ((1 - Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) / Math.PI) / 2) * 2 ** Z;
let muat: Promise<boolean> | null = null;
function muatOsm() {
    return (muat ??= (async () => {
        const x0 = Math.floor(ubinX(LNG_A)), x1 = Math.floor(ubinX(LNG_B)), y0 = Math.floor(ubinY(LAT_B)), y1 = Math.floor(ubinY(LAT_A));
        const kanvas = document.createElement("canvas");
        const w = (kanvas.width = (x1 - x0 + 1) * 256), t = (kanvas.height = (y1 - y0 + 1) * 256);
        const ctx = kanvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return false;
        const ubin: [number, number][] = [];
        for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) ubin.push([x, y]);
        try {
            await Promise.all(ubin.map(([x, y]) => new Promise<void>((ok, gagal) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => { ctx.drawImage(img, (x - x0) * 256, (y - y0) * 256); ok(); };
                img.onerror = gagal;
                img.src = `https://tile.openstreetmap.org/${Z}/${x}/${y}.png`;
            })));
            const px = ctx.getImageData(0, 0, w, t).data;
            const tx = (i: number) => (ubinX(lngDi(i)) - x0) * 256, ty = (k: number) => (ubinY(latDi(k)) - y0) * 256;
            const uv = new Float32Array(N * 2);
            for (let k = 0; k <= NZ; k++) for (let i = 0; i <= NX; i++) {
                uv[(k * KOLOM + i) * 2] = tx(i) / w;
                uv[(k * KOLOM + i) * 2 + 1] = 1 - ty(k) / t;
            }
            const air = (i: number, k: number) => {
                const p = (Math.floor(ty(k)) * w + Math.floor(tx(i))) * 4;
                return Math.abs(px[p] - 170) + Math.abs(px[p + 1] - 211) + Math.abs(px[p + 2] - 223) < 36; // laut OSM #aad3df
            };
            const peta = new THREE.CanvasTexture(kanvas);
            peta.colorSpace = THREE.SRGBColorSpace;
            peta.anisotropy = 8;
            medan.kini = bangun(air, uv, peta);
            return true;
        } catch {
            muat = null; // ubin gagal dimuat: tetap pakai medan poligon, coba lagi di kunjungan berikutnya
            return false;
        }
    })());
}

// Medan poligon dulu, lalu diganti medan OSM setelah ubinnya termuat. Komponen yang membaca tinggi tanah
// memakai objek ini sebagai dependensi supaya posisi dan jalur dihitung ulang.
export function useMedan() {
    const [m, setM] = useState(kini);
    useEffect(() => {
        let aktif = true;
        muatOsm().then((ok) => { if (ok && aktif) setM(kini()); });
        return () => { aktif = false; };
    }, []);
    return m;
}

// Jalur truk dicari dengan A* di grid medan. Laut hampir tidak bisa dilalui dan dataran rendah lebih murah
// dari pegunungan, jadi rute menyusuri pantai dan lembah seperti jalan raya, bukan memotong laut.
const LANGKAH = 3; // A* di grid sepertiga resolusi supaya cepat
const TETANGGA = [-1, 0, 1].flatMap((a) => [-1, 0, 1].filter((b) => a || b).map((b) => [a * LANGKAH, b * LANGKAH, Math.hypot(a, b) * LANGKAH]));
export function cariJalan(a: THREE.Vector3, b: THREE.Vector3, { h, darat }: Medan) {
    const keNode = (p: THREE.Vector3) => {
        const [lng, lat] = keLngLat(p);
        const i = Math.round(((lng - LNG_A) / (LNG_B - LNG_A)) * (NX / LANGKAH)) * LANGKAH;
        const k = Math.round(((LAT_B - lat) / (LAT_B - LAT_A)) * (NZ / LANGKAH)) * LANGKAH;
        return Math.min(Math.max(k, 0), NZ) * KOLOM + Math.min(Math.max(i, 0), NX);
    };
    const awal = keNode(a), akhir = keNode(b), ti = akhir % KOLOM, tk = Math.floor(akhir / KOLOM);
    const g = new Float32Array(N).fill(Infinity), asal = new Int32Array(N).fill(-1), tutup = new Uint8Array(N);
    const tebak = (n: number) => {
        const di = Math.abs((n % KOLOM) - ti), dk = Math.abs(Math.floor(n / KOLOM) - tk);
        return (Math.max(di, dk) + 0.414 * Math.min(di, dk)) * 1.2; // sedikit rakus: jauh lebih cepat, jalur hampir optimal
    };
    // antrean prioritas biner: simpul dan nilai f disimpan berdampingan
    const qn: number[] = [], qf: number[] = [];
    const masuk = (n: number, f: number) => {
        let i = qn.push(n) - 1;
        qf.push(f);
        while (i > 0) {
            const p = (i - 1) >> 1;
            if (qf[p] <= f) break;
            qn[i] = qn[p]; qf[i] = qf[p]; i = p;
        }
        qn[i] = n; qf[i] = f;
    };
    const keluar = () => {
        const top = qn[0], n = qn.pop()!, f = qf.pop()!;
        if (qn.length) {
            let i = 0;
            for (;;) {
                let c = 2 * i + 1;
                if (c >= qn.length) break;
                if (c + 1 < qn.length && qf[c + 1] < qf[c]) c++;
                if (qf[c] >= f) break;
                qn[i] = qn[c]; qf[i] = qf[c]; i = c;
            }
            qn[i] = n; qf[i] = f;
        }
        return top;
    };

    g[awal] = 0;
    masuk(awal, tebak(awal));
    while (qn.length) {
        const u = keluar();
        if (u === akhir) break;
        if (tutup[u]) continue;
        tutup[u] = 1;
        const ui = u % KOLOM, uk = Math.floor(u / KOLOM);
        for (const [di, dk, l] of TETANGGA) {
            const vi = ui + di, vk = uk + dk;
            if (vi < 0 || vk < 0 || vi > NX || vk > NZ) continue;
            const v = vk * KOLOM + vi;
            const c = g[u] + (darat[v] < 0.9 ? l * 60 : l * (1 + h[v] / 700) + Math.abs(h[v] - h[u]) / 30);
            if (c < g[v]) { g[v] = c; asal[v] = u; masuk(v, c + tebak(v)); }
        }
    }

    const simpul: number[] = [];
    for (let n = asal[akhir]; n !== -1 && n !== awal; n = asal[n]) simpul.push(n);
    const tengah = simpul.reverse().filter((_, j) => j % 2 === 1).map((n) => keXZ(lngDi(n % KOLOM), latDi(Math.floor(n / KOLOM))));
    return [a.clone().setY(0), ...tengah, b.clone().setY(0)];
}

// Warna dasar bergaya OSM kalau ubin peta tidak bisa dimuat (luring); dengan ubin, dasarnya putih (ubin apa adanya).
const LAUT = new THREE.Color("#aad3df"), TANAH = new THREE.Color("#f2efe9"), PUTIH = new THREE.Color("#ffffff");
// Warna vertex dikalikan dengan ubin: lereng menghijau seperti hutan, puncak menjadi batu dan abu vulkanik.
const HUTAN = new THREE.Color(0.58, 0.76, 0.5), BATU = new THREE.Color(0.66, 0.6, 0.53), ABU = new THREE.Color(0.8, 0.78, 0.75);

function Relief({ m, onKlik }: { m: Medan; onKlik: (e: ThreeEvent<MouseEvent>) => void }) {
    const { geo, peta } = useMemo(() => {
        const g = new THREE.PlaneGeometry((LNG_B - LNG_A) * S, (LAT_B - LAT_A) * S, NX, NZ);
        g.rotateX(-Math.PI / 2);
        g.translate(((LNG_A + LNG_B) / 2 - LNG0) * S, 0, -((LAT_A + LAT_B) / 2 - LAT0) * S);
        const pos = g.attributes.position as THREE.BufferAttribute;
        for (let n = 0; n < N; n++) pos.setY(n, m.h[n] * V);
        g.computeVertexNormals();
        if (m.uv) g.setAttribute("uv", new THREE.BufferAttribute(m.uv, 2));
        const nor = g.attributes.normal as THREE.BufferAttribute;
        const warna = new Float32Array(N * 3), c = new THREE.Color(), dasar = new THREE.Color();
        for (let n = 0; n < N; n++) {
            const h = m.h[n], curam = h > 50 ? halus(0.9, 0.6, nor.getY(n)) : 0;
            c.copy(PUTIH).lerp(HUTAN, halus(250, 1000, h)).lerp(BATU, Math.max(halus(1900, 2700, h), curam * 0.6)).lerp(ABU, halus(2900, 3500, h));
            if (!m.uv) c.multiply(dasar.copy(TANAH).lerp(LAUT, 1 - halus(0.4, 0.6, m.darat[n])));
            c.toArray(warna, n * 3);
        }
        g.setAttribute("color", new THREE.BufferAttribute(warna, 3));
        return { geo: g, peta: m.peta };
    }, [m]);
    return (
        <mesh geometry={geo} onClick={onKlik} castShadow receiveShadow>
            <meshStandardMaterial key={peta ? "osm" : "poligon"} map={peta} vertexColors roughness={1} toneMapped={false} />
        </mesh>
    );
}

// Pulau Jawa lengkap: langit, matahari berbayang, laut datar, dan medan berelief berlapis peta OSM.
export function Pulau({ medan: m, onKlik }: { medan: Medan; onKlik: (e: ThreeEvent<MouseEvent>) => void }) {
    return (
        <>
            <Sky distance={400} sunPosition={MATAHARI} turbidity={4} rayleigh={1.2} mieCoefficient={0.004} mieDirectionalG={0.8} />
            <Environment resolution={128} frames={1} environmentIntensity={0.4}>
                <Sky distance={50} sunPosition={MATAHARI} turbidity={4} rayleigh={1.2} />
            </Environment>
            {/* intensitas dipilih supaya dataran datar tampil mendekati warna asli ubin OSM (toneMapped mati) */}
            <hemisphereLight args={["#ffffff", "#d8d4cc", 1.5]} />
            <directionalLight position={MATAHARI} intensity={2.4} color="#fffaf0" castShadow
                shadow-mapSize={[4096, 4096]} shadow-bias={-0.0004} shadow-normalBias={0.03}
                shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20}
                shadow-camera-near={1} shadow-camera-far={60} />
            <Relief m={m} onKlik={onKlik} />
            <mesh rotation-x={-Math.PI / 2} position-y={-0.002} onClick={onKlik}>
                <planeGeometry args={[160, 110]} />
                <meshStandardMaterial color="#aad3df" roughness={1} toneMapped={false} />
            </mesh>
        </>
    );
}
