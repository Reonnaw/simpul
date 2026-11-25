import type { Metadata } from "next";
import Link from "next/link";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "Simpul — SIM-LOG 3D",
  description: "Sistem Informasi Manajemen Logistik & Rantai Pasok dengan MySQL + MongoDB",
};

const nav: [string, string][] = [
  ["/", "Peta"], ["/hierarki", "Hierarki"], ["/armada", "Armada"], ["/transaksi", "Transaksi"],
  ["/laporan-sql", "Laporan SQL"], ["/mongo", "MongoDB"], ["/analitik", "Analitik"], ["/normalisasi",
"Normalisasi"],
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
  <html lang="id" className={`${jakarta.variable} ${mono.variable}`}>
    <body className="min-h-screen font-sans">
      <header className="border-b border-line">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link href="/" className="mr-4 font-bold">Simpul <span className="text-accent">SIM-LOG 3D</span>
</Link>
          {nav.map(([href, label]) => (
            <Link key={href} href={href} className="text-sm text-muted hover:text-ink">{label}</Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">{children}</main>
    </body>
  </html>
  );
}

