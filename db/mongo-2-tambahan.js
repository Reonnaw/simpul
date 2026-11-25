// Tambahan untuk aplikasi: lokasi GeoJSON + induk cabang, lalu index.
// Jalankan di mongosh SETELAH mongo-1-seed.js
db = db.getSiblingDB("simlog_db") // sama dengan "use simlog_db"

db.KANTOR_CABANG.bulkWrite([
  { updateOne: { filter: { _id: "CBG001" }, update: { $set: { lokasi: { type: "Point", coordinates: [112.7663, -7.3305] }, id_cabang_induk: "CBG003" } } } },
  { updateOne: { filter: { _id: "CBG002" }, update: { $set: { lokasi: { type: "Point", coordinates: [110.4609, -6.9551] }, id_cabang_induk: "CBG003" } } } },
  { updateOne: { filter: { _id: "CBG003" }, update: { $set: { lokasi: { type: "Point", coordinates: [106.9406, -6.1715] } } } } },
  { updateOne: { filter: { _id: "CBG004" }, update: { $set: { lokasi: { type: "Point", coordinates: [107.6309, -6.9416] }, id_cabang_induk: "CBG003" } } } },
  { updateOne: { filter: { _id: "CBG005" }, update: { $set: { lokasi: { type: "Point", coordinates: [110.4087, -7.7601] }, id_cabang_induk: "CBG002" } } } },
  { updateOne: { filter: { _id: "CBG006" }, update: { $set: { lokasi: { type: "Point", coordinates: [112.6427, -7.9086] }, id_cabang_induk: "CBG001" } } } },
  { updateOne: { filter: { _id: "CBG007" }, update: { $set: { lokasi: { type: "Point", coordinates: [112.0161, -7.8166] }, id_cabang_induk: "CBG001" } } } }
])

db.KANTOR_CABANG.createIndex({ lokasi: "2dsphere" })
db.LOG_AKTIVITAS.createIndex({ waktu: -1 })

// Cek: 14 collection (LOG_AKTIVITAS = 0), total 92 dokumen
db.getCollectionNames().sort().forEach(c => print(c.padEnd(24), db[c].countDocuments()))
