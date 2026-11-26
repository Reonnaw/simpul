// Kepala rubah low-poly: segi-segi datar yang sama dengan gaya flat-shading dunia 3D.
// Gambar yang sama ada di app/icon.svg untuk favicon.
const SEGI: [string, string][] = [
    ["10,6 26,20 9,30", "#c9531a"],
    ["54,6 38,20 55,30", "#b5481a"],
    ["13,12 21,19 13,23", "#3a1e10"],
    ["51,12 43,19 51,23", "#3a1e10"],
    ["26,20 38,20 32,34", "#ff7a2f"],
    ["26,20 32,34 9,30", "#ff8f4d"],
    ["38,20 55,30 32,34", "#f26a1f"],
    ["9,30 32,34 19,44", "#f2e8da"],
    ["55,30 45,44 32,34", "#d8cab7"],
    ["32,34 19,44 32,58", "#e9dcc8"],
    ["32,34 45,44 32,58", "#cdbda8"],
    ["22,29 28,30 25,33", "#1a1412"],
    ["42,29 36,30 39,33", "#1a1412"],
    ["28,53 36,53 32,58", "#1a1412"],
];

export default function Logo({ className = "size-9" }: { className?: string }) {
    return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
            {SEGI.map(([titik, warna]) => <polygon key={titik} points={titik} fill={warna} />)}
        </svg>
    );
}
