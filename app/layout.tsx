import type { Metadata } from "next";
import Link from "next/link";
import { Bricolage_Grotesque, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import Logo from "@/components/Logo";
import Nav from "@/components/Nav";
import RubahIntip from "@/components/RubahIntip";
import "./globals.css";

// Bricolage: judul berkarakter yang cocok dengan rubah; Jakarta Sans: teks isi, dirancang untuk identitas Jakarta.
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
    title: { default: "Simpul · SIM-LOG 3D", template: "%s · Simpul" },
    description: "Sistem informasi manajemen logistik dan rantai pasok dalam dunia 3D, di atas MySQL dan MongoDB.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="id" className={`${bricolage.variable} ${jakarta.variable} ${mono.variable}`}>
            <body className="min-h-screen font-sans antialiased lg:flex">
                <a href="#isi" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-fox focus:px-3 focus:py-2 focus:text-bg">
                    Langsung ke isi
                </a>
                <header className="border-b border-line bg-bg lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
                    <div className="flex flex-col gap-3 px-4 py-3 lg:h-full lg:gap-8 lg:py-6">
                        <Link href="/" className="flex items-center gap-3 rounded-lg">
                            <Logo className="size-10" />
                            <span className="leading-tight">
                                <span className="block font-display text-xl font-bold">Simpul</span>
                                <span className="block text-xs text-muted">Logistik Jawa dalam 3D</span>
                            </span>
                        </Link>
                        <Nav />
                        <p className="mt-auto hidden px-3 text-xs leading-relaxed text-muted lg:block">
                            Data dibaca langsung dari MySQL (TiDB) dan MongoDB Atlas setiap kali halaman dibuka.
                        </p>
                    </div>
                </header>
                <main id="isi" className="mx-auto w-full max-w-6xl min-w-0 space-y-6 px-4 py-6 lg:px-8 lg:py-10">{children}</main>
                <RubahIntip />
            </body>
        </html>
    );
}
