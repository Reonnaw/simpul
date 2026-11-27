"use client";
import { useEffect, useState } from "react";
import Logo from "./Logo";

const SAPAAN = [
    "Halo! Aku rubah penjaga gudang Simpul.",
    "Psst… di peta, coba tombol Kemudikan mobil.",
    "Semeru tingginya 3.676 m. Di peta sudah kubesarkan 11×.",
    "Truk tidak bisa berenang, jadi rutenya lewat darat.",
    "Normalisasi itu seperti merapikan sarang: satu fakta, satu tempat.",
    "$geoNear mencari cabang terdekat. Aku mencari ayam terdekat.",
    "Query di Konsol selalu di-rollback. Coba saja, aman.",
    "Klik sembarang titik di peta, nanti kucarikan cabang terdekat.",
];
const PUSING = 8; // klik sebanyak ini berturut-turut membuat rubah pusing

// Easter egg: rubah mengintip dari tepi kanan layar. Arahkan kursor untuk memancingnya keluar, klik untuk menyapa.
export default function RubahIntip() {
    const [klik, setKlik] = useState(0);
    const [pesan, setPesan] = useState<string | null>(null);
    const pusing = klik >= PUSING;

    useEffect(() => {
        if (!pesan) return;
        const t = setTimeout(() => { setPesan(null); setKlik((k) => (k >= PUSING ? 0 : k)); }, pusing ? 4000 : 3500);
        return () => clearTimeout(t);
    }, [pesan, pusing]);

    function sapa() {
        const k = klik + 1;
        setKlik(k);
        setPesan(k >= PUSING ? "Aduh, pusing! Istirahat dulu sebentar ya…" : SAPAAN[(k - 1) % SAPAAN.length]);
    }

    return (
        <div className="pointer-events-none fixed bottom-4 right-0 z-40 flex items-end print:hidden">
            <p aria-live="polite" className={`mb-10 max-w-56 rounded-xl rounded-br-sm border border-line bg-surface px-3 py-2 text-sm shadow-lg transition-opacity duration-200 ${pesan ? "opacity-100" : "opacity-0"}`}>
                {pesan}
            </p>
            <button onClick={sapa} aria-label="Rubah Simpul, klik untuk menyapa"
                className={`group pointer-events-auto -mr-1 grid size-16 place-items-center rounded-l-full transition-transform duration-300 ease-out motion-reduce:transition-none ${
                    pesan ? "translate-x-0" : "translate-x-[55%] -rotate-12 hover:translate-x-[15%] hover:rotate-0 focus-visible:translate-x-0 focus-visible:rotate-0"}`}>
                {/* key berganti tiap klik supaya animasi lompat diputar ulang */}
                <span key={klik} className={`block drop-shadow-md ${pusing ? "motion-safe:animate-pusing" : klik ? "motion-safe:animate-lompat" : ""}`}>
                    <Logo className="size-14" />
                </span>
            </button>
        </div>
    );
}
