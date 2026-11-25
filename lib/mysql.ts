import mysql from "mysql2/promise";
const g = globalThis as unknown as { pool?: mysql.Pool };


// createPool belum membuka koneksi; koneksi dibuat saat query pertama
export const pool =
    g.pool ??
    mysql.createPool({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT ?? 4000),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true }, // TiDB wajib TLS
        connectionLimit: 5,
        decimalNumbers: true, // DECIMAL dikembalikan sebagai angka, bukan string
        dateStrings: true,
    });
if (process.env.NODE_ENV !== "production") g.pool = pool; // supaya hot-reload tidak membuka pool baru terus

export async function runSql(sql: string, params: unknown[] = []) {
    try {
        const [rows] = await pool.query(sql, params);
        return { rows: rows as Record<string, unknown>[], error: null as string | null };
    } catch (e) {
        return { rows: [] as Record<string, unknown>[], error: (e as Error).message };
    }
}
