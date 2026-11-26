"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const GRUP: { judul: string; menu: [string, string][] }[] = [
    { judul: "Dunia 3D", menu: [["/", "Peta jaringan"], ["/hierarki", "Hierarki cabang"], ["/armada", "Armada"], ["/normalisasi", "Skema & normalisasi"]] },
    { judul: "Basis data", menu: [["/transaksi", "Transaksi"], ["/laporan-sql", "Laporan SQL"], ["/mongo", "MongoDB"], ["/analitik", "Analitik"]] },
];

export default function Nav() {
    const path = usePathname();
    return (
        <nav aria-label="Navigasi utama" className="flex gap-6 overflow-x-auto lg:flex-col lg:overflow-visible">
            {GRUP.map((g) => (
                <div key={g.judul} className="flex shrink-0 items-center gap-1 lg:flex-col lg:items-stretch">
                    <p className="hidden px-3 pb-1 text-xs font-medium text-muted lg:block">{g.judul}</p>
                    {g.menu.map(([href, label]) => {
                        const aktif = path === href;
                        return (
                            <Link key={href} href={href} aria-current={aktif ? "page" : undefined}
                                className={`flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-lg px-3 text-sm transition-colors ${
                                    aktif ? "bg-raised font-semibold text-ink" : "text-muted hover:bg-surface hover:text-ink"}`}>
                                {aktif && <span aria-hidden="true" className="mr-2 size-1.5 rotate-45 bg-fox" />}
                                {label}
                            </Link>
                        );
                    })}
                </div>
            ))}
        </nav>
    );
}
