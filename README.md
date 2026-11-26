# Simpul

Sistem informasi manajemen logistik (SIM-LOG) untuk jaringan cabang di Pulau Jawa, ditampilkan sebagai dunia 3D.
Data dibaca langsung dari MySQL (TiDB) dan MongoDB Atlas.

| Halaman | Isi |
| --- | --- |
| `/` | Peta 3D cabang dan rute, pencarian cabang terdekat dengan `$geoNear` |
| `/hierarki` | Pohon cabang 3D dari `$graphLookup` |
| `/armada` | Utilisasi bak truk dari `$lookup` empat collection |
| `/normalisasi` | Langkah UNF sampai 3NF dan diagram relasi 3D dari `INFORMATION_SCHEMA` |
| `/transaksi` | INSERT, UPDATE, DELETE dalam transaksi MySQL |
| `/laporan-sql` | JOIN, subquery, operasi himpunan, CTE, window function |
| `/mongo` | Operator query, `explain()`, dan log aktivitas |
| `/analitik` | Aggregation pipeline, `$out`, dan `$merge` |

## Menjalankan

Buat `.env.local`:

```
MONGODB_URI=...
MONGODB_DB=simlog_db
MYSQL_HOST=...
MYSQL_PORT=4000
MYSQL_USER=...
MYSQL_PASSWORD=...
MYSQL_DATABASE=...
```

Isi database dengan skrip di `db/` (urut sesuai nomor), lalu:

```bash
npm install
npm run dev
```
