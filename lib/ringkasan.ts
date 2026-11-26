import type { Document } from "mongodb";

export const OUT_REKAP: Document[] = [
    { $group: { _id: "$kategori_barang", jumlah_barang: { $sum: 1 }, total_nilai: { $sum: "$nilai_barang" } } },
    { $sort: { total_nilai: -1 } },
    { $out: "REKAP_KATEGORI_BARANG" },
];

export const MERGE_JUMLAH: Document[] = [
    { $group: { _id: "$id_pelanggan", jumlah_pengiriman: { $sum: 1 } } },
    { $merge: { into: "RINGKASAN_PELANGGAN", on: "_id", whenMatched: "merge", whenNotMatched: "insert" } },
];

export const MERGE_TAGIHAN: Document[] = [
    { $lookup: { from: "PENGIRIMAN", localField: "id_pengiriman", foreignField: "_id", as: "kirim" } },
    { $unwind: "$kirim" },
    { $group: { _id: "$kirim.id_pelanggan", total_tagihan: { $sum: { $add: ["$total_biaya_dasar", "$biaya_tambahan", "$pajak"] } } } },
    { $merge: { into: "RINGKASAN_PELANGGAN", on: "_id", whenMatched: "merge", whenNotMatched: "discard" } },
];