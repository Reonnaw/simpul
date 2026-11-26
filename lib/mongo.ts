import { MongoClient, type Document } from "mongodb";

const g = globalThis as unknown as { mongo?: Promise<MongoClient> };

// koneksi dibuat saat pertama dipakai (bukan saat import), dan dicoba ulang kalau gagal
export async function getDb() {
    if (!g.mongo) {
        g.mongo = new MongoClient(process.env.MONGODB_URI!).connect();
        g.mongo.catch(() => { g.mongo = undefined; });
    }
    return (await g.mongo).db(process.env.MONGODB_DB ?? "simlog_db");
}

// Date & ObjectId diubah ke string agar aman dikirim ke komponen client
export function plain<T>(x: T): T {
    return JSON.parse(JSON.stringify(x));
}

export async function runPipeline(collection: string, pipeline: Document[]): Promise<{ rows: Document[]; error: string | null }> {
    try {
        const rows = await (await getDb()).collection(collection).aggregate(pipeline).toArray();
        return { rows: plain(rows), error: null };
    } catch (e) {
        return { rows: [], error: (e as Error).message };
    }
}
