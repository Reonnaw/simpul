// Penjaga konsol query publik. Tanpa import supaya bisa dites langsung: node scripts/cek-konsol.mjs

const BOLEH = new Set(["SELECT", "WITH", "EXPLAIN", "SHOW", "DESC", "DESCRIBE", "INSERT", "UPDATE", "DELETE"]);
const TERLARANG_SQL: [RegExp, string][] = [
    [/\binto\s+(outfile|dumpfile)\b/i, "INTO OUTFILE/DUMPFILE tidak diizinkan"],
    [/\b(load_file|sleep|benchmark)\s*\(/i, "Fungsi LOAD_FILE, SLEEP, dan BENCHMARK tidak diizinkan"],
    [/`?\b(mysql|performance_schema|metrics_schema)\b`?\s*\./i, "Skema sistem (mysql, performance_schema) tidak boleh dibaca"],
];
const TERLARANG_MONGO = new Set(["$out", "$merge", "$function", "$accumulator", "$where"]);

export const MAKS_PERINTAH = 5;
export const MAKS_BARIS = 200;

// Pecah di ";" yang bukan bagian string; komentar dibuang (diganti spasi) sehingga /*! ... */ tidak ikut dikirim.
export function pecahSql(teks: string): string[] {
    const hasil: string[] = [];
    let cur = "";
    for (let i = 0; i < teks.length; i++) {
        const c = teks[i], n = teks[i + 1];
        if (c === "'" || c === '"' || c === "`") {
            let j = i + 1;
            while (j < teks.length && teks[j] !== c) j += teks[j] === "\\" && c !== "`" ? 2 : 1;
            cur += teks.slice(i, j + 1);
            i = j;
        } else if (c === "#" || (c === "-" && n === "-" && /\s/.test(teks[i + 2] ?? " "))) {
            while (i < teks.length && teks[i] !== "\n") i++;
            cur += " ";
        } else if (c === "/" && n === "*") {
            const tutup = teks.indexOf("*/", i + 2);
            i = tutup < 0 ? teks.length : tutup + 1;
            cur += " ";
        } else if (c === ";") {
            hasil.push(cur);
            cur = "";
        } else cur += c;
    }
    hasil.push(cur);
    return hasil.map((s) => s.trim()).filter(Boolean);
}

export function cekSql(perintah: string): string | null {
    const kata = /^\(*\s*([a-z]+)/i.exec(perintah)?.[1]?.toUpperCase() ?? "";
    if (!BOLEH.has(kata)) return `Perintah ${kata || "ini"} tidak diizinkan. Yang boleh: ${[...BOLEH].join(", ")}`;
    return TERLARANG_SQL.find(([re]) => re.test(perintah))?.[1] ?? null;
}

function cariTerlarang(x: unknown): string | null {
    if (Array.isArray(x)) {
        for (const v of x) { const e = cariTerlarang(v); if (e) return e; }
    } else if (x && typeof x === "object") {
        for (const [k, v] of Object.entries(x)) {
            if (TERLARANG_MONGO.has(k)) return `Operator ${k} tidak diizinkan di konsol`;
            const e = cariTerlarang(v);
            if (e) return e;
        }
    }
    return null;
}

export function cekPipeline(p: unknown): string | null {
    if (!Array.isArray(p) || p.length === 0) return "Pipeline harus berupa array berisi minimal satu stage, misal [{\"$match\": {}}]";
    if (p.length > 20) return "Maksimal 20 stage";
    if (p.some((s) => !s || typeof s !== "object" || Array.isArray(s))) return "Setiap stage harus berupa objek";
    return cariTerlarang(p);
}

// Dipakai tombol tabel edit di konsol untuk menulis INSERT/UPDATE/DELETE.
export const kolomSql = (n: string) => `\`${n.replace(/`/g, "``")}\``;
export const nilaiSql = (v: unknown) =>
    v == null ? "NULL" : typeof v === "number" ? String(v) : `'${String(v).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;

export const cobaSql = (sql: string) => `/konsol?${new URLSearchParams({ sql })}`;
export const cobaMongo = (koleksi: string, pipeline: unknown[]) =>
    `/konsol?${new URLSearchParams({ koleksi, pipeline: JSON.stringify(pipeline) })}`;
