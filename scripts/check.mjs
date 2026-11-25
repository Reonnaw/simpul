// Cek angka kunci di kedua database. Jalankan: node --env-file=.env.local scripts/check.mjs
import assert from "node:assert/strict";
import { MongoClient } from "mongodb";
import mysql from "mysql2/promise";

const mongo = await new MongoClient(process.env.MONGODB_URI).connect();
const db = mongo.db(process.env.MONGODB_DB);
const sql = await mysql.createConnection({
  host: process.env.MYSQL_HOST, port: Number(process.env.MYSQL_PORT), user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD, database: process.env.MYSQL_DATABASE,
  ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
});

try {
  // $geoNear dari Kampus Unesa Ketintang -> Surabaya 4,8 km
  const [dekat] = await db.collection("KANTOR_CABANG").aggregate([
    { $geoNear: { near: { type: "Point", coordinates: [112.7266, -7.3133] }, distanceField: "km", distanceMultiplier: 0.001, spherical: true } },
    { $limit: 1 }]).toArray();
  assert.equal(dekat._id, "CBG001");
  assert.equal(Math.round(dekat.km * 10) / 10, 4.8);

  // muatan TGS003 = 19.300 kg -> 96,5% dari 20.000 kg
  const [muatan] = await db.collection("DETAIL_BARANG").aggregate([
    { $match: { id_pengiriman: { $in: ["KRM004", "KRM005"] } } }, { $group: { _id: null, kg: { $sum: "$berat_kg" } } }]).toArray();
  assert.equal(muatan.kg / 200, 96.5);

  // INTERSECT di MySQL (kondisi akhir Tugas DDL/DML) -> Surabaya & Jakarta, sama dengan Tugas 5
  const [irisan] = await sql.query("SELECT id_cabang_asal AS c FROM PENGIRIMAN INTERSECT SELECT id_cabang_tujuan FROM PENGIRIMAN ORDER BY c");
  assert.deepEqual(irisan.map((r) => r.c), ["CBG001", "CBG003"]);

  // total tagihan: MySQL 3 faktur (FKT004 dihapus di Tugas DML), MongoDB 4 faktur
  const [[{ total }]] = await sql.query("SELECT SUM(total_biaya_dasar + biaya_tambahan + pajak) AS total FROM FAKTUR");
  assert.equal(Number(total), 46897500);
  const [m] = await db.collection("FAKTUR").aggregate([
    { $group: { _id: null, t: { $sum: { $add: ["$total_biaya_dasar", "$biaya_tambahan", "$pajak"] } } } }]).toArray();
  assert.equal(m.t, 54667500);

  console.log("Semua cek lulus ✔");
} finally {
  await mongo.close();
  await sql.end();
}
