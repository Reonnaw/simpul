// Seed MongoDB simlog_db: 13 collection, 92 dokumen
// 1) Jalankan dulu baris ini SENDIRIAN di mongosh:   use simlog_db
// 2) Lalu tempel SELURUH isi file ini sekaligus
// Baris pertama sengaja memakai drop per collection, bukan db.dropDatabase(),
// karena user simpul_app (role "Read and write to any database") tidak boleh dropDatabase.
db.getCollectionNames().forEach(c => db[c].drop())

db.KANTOR_CABANG.insertMany([
  { _id: "CBG001", nama_cabang: "Cabang Surabaya", alamat: "Jl. Rungkut Industri No. 12", kota: "Surabaya",
    kode_pos: "60293", no_telepon_cabang: "031-8471234", nama_kepala_cabang: "Andi Wijaya", kapasitas_gudang_ton: 500 },
  { _id: "CBG002", nama_cabang: "Cabang Semarang", alamat: "Jl. Kaligawe Raya No. 45", kota: "Semarang",
    kode_pos: "50117", no_telepon_cabang: "024-6591234", nama_kepala_cabang: "Rina Kartika", kapasitas_gudang_ton: 350 },
  { _id: "CBG003", nama_cabang: "Cabang Jakarta", alamat: "Jl. Cakung Cilincing No. 88", kota: "Jakarta Timur",
    kode_pos: "13910", no_telepon_cabang: "021-4401234", nama_kepala_cabang: "Hendra Gunawan", kapasitas_gudang_ton: 800 },
  { _id: "CBG004", nama_cabang: "Cabang Bandung", alamat: "Jl. Soekarno-Hatta No. 210", kota: "Bandung",
    kode_pos: "40235", no_telepon_cabang: "022-7561234", nama_kepala_cabang: "Dewi Anggraini", kapasitas_gudang_ton: 300 },
  { _id: "CBG005", nama_cabang: "Cabang Yogyakarta", alamat: "Jl. Ring Road Utara No. 17", kota: "Sleman",
    kode_pos: "55283", no_telepon_cabang: "0274-881234", nama_kepala_cabang: "Bayu Prasetyo", kapasitas_gudang_ton: 250 },
  { _id: "CBG006", nama_cabang: "Cabang Malang", alamat: "Jl. Raya Karanglo No. 5", kota: "Malang",
    kode_pos: "65153", no_telepon_cabang: "0341-491234", nama_kepala_cabang: "Siti Rahmawati", kapasitas_gudang_ton: 200 },
  { _id: "CBG007", nama_cabang: "Cabang Kediri", alamat: "Jl. Soekarno-Hatta No. 9", kota: "Kediri",
    kode_pos: "64129", no_telepon_cabang: "0354-681234", kapasitas_gudang_ton: 150 }
])

db.PELANGGAN.insertMany([
  { _id: "PLG001", nama_perusahaan: "PT Sinar Abadi Elektronik", penanggung_jawab: "Budi Santoso", email: "budi@sinarabadi.co.id",
    npwp: "01.234.567.8-609.000", no_telepon: "0811-2233-4455", alamat_lengkap: "Jl. Industri Raya No. 8, Surabaya",
    tipe_industri: "Elektronik", status_aktif: true },
  { _id: "PLG002", nama_perusahaan: "CV Maju Jaya Tekstil", penanggung_jawab: "Lina Marlina", email: "lina@majujayatekstil.com",
    npwp: "02.345.678.9-424.000", no_telepon: "0812-7788-9900", alamat_lengkap: "Jl. Moh. Toha No. 77, Bandung",
    tipe_industri: "Tekstil", status_aktif: true },
  { _id: "PLG003", nama_perusahaan: "PT Nusantara Agro Pangan", penanggung_jawab: "Agus Setiawan", email: "agus@nusagro.co.id",
    npwp: "03.456.789.0-503.000", no_telepon: "0813-1212-3434", alamat_lengkap: "Kawasan Industri Candi Blok C-3, Semarang",
    tipe_industri: "Makanan & Minuman", status_aktif: true },
  { _id: "PLG004", nama_perusahaan: "PT Sentosa Kimia Industri", penanggung_jawab: "Ratna Sari", email: "ratna@sentosakimia.co.id",
    npwp: "04.567.890.1-413.000", no_telepon: "0815-5656-7878", alamat_lengkap: "Jl. Raya Cikarang Km. 3, Bekasi",
    tipe_industri: "Kimia", status_aktif: true },
  { _id: "PLG005", nama_perusahaan: "PT Berkah Mebel Jepara", penanggung_jawab: "Fajar Nugroho", email: "fajar@berkahmebel.id",
    npwp: "05.678.901.2-516.000", no_telepon: "0817-9090-1212", alamat_lengkap: "Jl. Raya Tahunan No. 21, Jepara",
    tipe_industri: "Furnitur", status_aktif: true },
  { _id: "PLG006", nama_perusahaan: "UD Tani Makmur", penanggung_jawab: "Sugeng Hartono", email: "admin@tanimakmur.id",
    no_telepon: "0819-3434-5656", alamat_lengkap: "Jl. Raya Batu No. 40, Malang", tipe_industri: "Pertanian", status_aktif: true }
])

db.KENDARAAN.insertMany([
  { _id: "KND001", id_cabang_pool: "CBG001", plat_nomor: "L 9123 UA", jenis_kendaraan: "Wingbox", merek_kendaraan: "Hino 500",
    kapasitas_berat_kg: 15000, kapasitas_volume_m3: 45, tahun_pembuatan: 2021,
    jadwal_servis_berikutnya: ISODate("2026-11-15"), status_kendaraan: "Tersedia" },
  { _id: "KND002", id_cabang_pool: "CBG001", plat_nomor: "L 8456 UB", jenis_kendaraan: "Truk Tangki", merek_kendaraan: "Mitsubishi Fuso",
    kapasitas_berat_kg: 16000, kapasitas_volume_m3: 16, tahun_pembuatan: 2020,
    jadwal_servis_berikutnya: ISODate("2026-10-20"), status_kendaraan: "Tersedia" },
  { _id: "KND003", id_cabang_pool: "CBG002", plat_nomor: "H 8812 KB", jenis_kendaraan: "CDD Box", merek_kendaraan: "Isuzu Elf NMR",
    kapasitas_berat_kg: 5000, kapasitas_volume_m3: 20, tahun_pembuatan: 2022,
    jadwal_servis_berikutnya: ISODate("2026-12-01"), status_kendaraan: "Tersedia" },
  { _id: "KND004", id_cabang_pool: "CBG003", plat_nomor: "B 9734 TXC", jenis_kendaraan: "Tronton", merek_kendaraan: "Hino 500",
    kapasitas_berat_kg: 20000, kapasitas_volume_m3: 50, tahun_pembuatan: 2019,
    jadwal_servis_berikutnya: ISODate("2026-10-30"), status_kendaraan: "Tersedia" },
  { _id: "KND005", id_cabang_pool: "CBG004", plat_nomor: "D 8521 AF", jenis_kendaraan: "Engkel Box", merek_kendaraan: "Mitsubishi Colt Diesel",
    kapasitas_berat_kg: 2500, kapasitas_volume_m3: 12, tahun_pembuatan: 2023,
    jadwal_servis_berikutnya: ISODate("2027-01-10"), status_kendaraan: "Tersedia" },
  { _id: "KND006", id_cabang_pool: "CBG001", plat_nomor: "L 9901 UC", jenis_kendaraan: "CDD Box", merek_kendaraan: "Isuzu Elf NMR",
    kapasitas_berat_kg: 5000, kapasitas_volume_m3: 20, tahun_pembuatan: 2015, status_kendaraan: "Tersedia" }
])

db.PENGEMUDI.insertMany([
  { _id: "PGM001", id_cabang: "CBG001", nama_pengemudi: "Joko Santoso", no_ktp: "3578011405900001", jenis_kelamin: "L",
    tanggal_lahir: ISODate("1990-05-14"), alamat: "Jl. Wonokromo No. 21, Surabaya", no_telepon: "0812-3344-5566",
    tanggal_bergabung: ISODate("2022-03-01"), status_ketersediaan: "Tersedia" },
  { _id: "PGM002", id_cabang: "CBG001", nama_pengemudi: "Bambang Hermawan", no_ktp: "3578022008870002", jenis_kelamin: "L",
    tanggal_lahir: ISODate("1987-08-20"), alamat: "Jl. Kenjeran No. 102, Surabaya", no_telepon: "0813-5566-7788",
    tanggal_bergabung: ISODate("2020-07-15"), status_ketersediaan: "Tersedia" },
  { _id: "PGM003", id_cabang: "CBG002", nama_pengemudi: "Eko Prasetyo", no_ktp: "3374031203920003", jenis_kelamin: "L",
    tanggal_lahir: ISODate("1992-03-12"), alamat: "Jl. Majapahit No. 9, Semarang", no_telepon: "0815-2244-6688",
    tanggal_bergabung: ISODate("2023-01-10"), status_ketersediaan: "Tersedia" },
  { _id: "PGM004", id_cabang: "CBG003", nama_pengemudi: "Rudi Hartanto", no_ktp: "3175072511850004", jenis_kelamin: "L",
    tanggal_lahir: ISODate("1985-11-25"), alamat: "Jl. Raya Bekasi Km. 18, Jakarta Timur", no_telepon: "0817-1122-3344",
    tanggal_bergabung: ISODate("2019-05-20"), status_ketersediaan: "Tersedia" },
  { _id: "PGM005", id_cabang: "CBG004", nama_pengemudi: "Sri Wahyuni", no_ktp: "3273046606940005", jenis_kelamin: "P",
    tanggal_lahir: ISODate("1994-06-26"), alamat: "Jl. Kiaracondong No. 45, Bandung", no_telepon: "0819-8877-6655",
    tanggal_bergabung: ISODate("2024-02-01"), status_ketersediaan: "Tersedia" },
  { _id: "PGM006", id_cabang: "CBG001", nama_pengemudi: "Dedi Kurniawan", no_ktp: "3578031010880006", jenis_kelamin: "L",
    tanggal_lahir: ISODate("1988-10-10"), alamat: "Jl. Ngagel No. 3, Surabaya", no_telepon: "0821-3456-7890",
    tanggal_bergabung: ISODate("2021-09-01"), status_ketersediaan: "Tersedia" }
])

db.SERTIFIKASI_PENGEMUDI.insertMany([
  { id_pengemudi: "PGM001", jenis_lisensi: "SIM B2 Umum", no_lisensi: "B2-778812", instansi_penerbit: "Polda Jawa Timur",
    tanggal_terbit: ISODate("2024-05-14"), tanggal_berlaku_hingga: ISODate("2029-05-14"), status_verifikasi: "Terverifikasi" },
  { id_pengemudi: "PGM001", jenis_lisensi: "Sertifikat B3/Hazmat", no_lisensi: "HZ-004521", instansi_penerbit: "Kemenhub RI",
    tanggal_terbit: ISODate("2024-11-30"), tanggal_berlaku_hingga: ISODate("2027-11-30"), status_verifikasi: "Terverifikasi",
    catatan: "Pelatihan angkutan B3" },
  { id_pengemudi: "PGM002", jenis_lisensi: "SIM B2 Umum", no_lisensi: "B2-661204", instansi_penerbit: "Polda Jawa Timur",
    tanggal_terbit: ISODate("2023-08-20"), tanggal_berlaku_hingga: ISODate("2028-08-20"), status_verifikasi: "Menunggu" },
  { id_pengemudi: "PGM003", jenis_lisensi: "SIM B1 Umum", no_lisensi: "B1-552871", instansi_penerbit: "Polda Jawa Tengah",
    tanggal_terbit: ISODate("2025-03-12"), tanggal_berlaku_hingga: ISODate("2030-03-12"), status_verifikasi: "Menunggu" },
  { id_pengemudi: "PGM003", jenis_lisensi: "Sertifikat B3/Hazmat", no_lisensi: "HZ-009102", instansi_penerbit: "Kemenhub RI",
    tanggal_terbit: ISODate("2026-08-01"), tanggal_berlaku_hingga: ISODate("2029-08-01"), status_verifikasi: "Ditolak",
    catatan: "Jam pelatihan belum terpenuhi" },
  { id_pengemudi: "PGM004", jenis_lisensi: "SIM B2 Umum", no_lisensi: "B2-903317", instansi_penerbit: "Polda Metro Jaya",
    tanggal_terbit: ISODate("2022-11-25"), tanggal_berlaku_hingga: ISODate("2027-11-25"), status_verifikasi: "Terverifikasi" },
  { id_pengemudi: "PGM004", jenis_lisensi: "Sertifikat B3/Hazmat", no_lisensi: "HZ-007788", instansi_penerbit: "Kemenhub RI",
    tanggal_terbit: ISODate("2025-06-01"), tanggal_berlaku_hingga: ISODate("2028-06-01"), status_verifikasi: "Menunggu" },
  { id_pengemudi: "PGM005", jenis_lisensi: "SIM B1 Umum", no_lisensi: "B1-440912", instansi_penerbit: "Polda Jawa Barat",
    tanggal_terbit: ISODate("2024-06-26"), tanggal_berlaku_hingga: ISODate("2029-06-26"), status_verifikasi: "Menunggu" },
  { id_pengemudi: "PGM006", jenis_lisensi: "SIM B1 Umum", no_lisensi: "B1-118230", instansi_penerbit: "Polda Jawa Timur",
    tanggal_terbit: ISODate("2021-10-10"), tanggal_berlaku_hingga: ISODate("2026-10-10"), status_verifikasi: "Terverifikasi" }
])

db.JADWAL_CUTI_PENGEMUDI.insertMany([
  { id_pengemudi: "PGM002", tanggal_mulai_cuti: ISODate("2026-08-03"), tanggal_selesai_cuti: ISODate("2026-08-05"),
    jenis_cuti: "Cuti Tahunan", alasan_cuti: "Mudik keluarga", tanggal_pengajuan: ISODate("2026-07-20"),
    disetujui_oleh: "Andi Wijaya", status_persetujuan: "Disetujui" },
  { id_pengemudi: "PGM002", tanggal_mulai_cuti: ISODate("2026-10-12"), tanggal_selesai_cuti: ISODate("2026-10-16"),
    jenis_cuti: "Cuti Tahunan", alasan_cuti: "Acara keluarga", tanggal_pengajuan: ISODate("2026-09-28"),
    status_persetujuan: "Diajukan" },
  { id_pengemudi: "PGM001", tanggal_mulai_cuti: ISODate("2026-10-05"), tanggal_selesai_cuti: ISODate("2026-10-06"),
    jenis_cuti: "Cuti Khusus", alasan_cuti: "Pernikahan saudara", tanggal_pengajuan: ISODate("2026-09-20"),
    disetujui_oleh: "Andi Wijaya", status_persetujuan: "Ditolak" },
  { id_pengemudi: "PGM003", tanggal_mulai_cuti: ISODate("2026-10-26"), tanggal_selesai_cuti: ISODate("2026-10-27"),
    jenis_cuti: "Cuti Sakit", alasan_cuti: "Kontrol pascaoperasi", tanggal_pengajuan: ISODate("2026-10-01"),
    status_persetujuan: "Diajukan" },
  { id_pengemudi: "PGM005", tanggal_mulai_cuti: ISODate("2026-12-22"), tanggal_selesai_cuti: ISODate("2026-12-31"),
    jenis_cuti: "Cuti Tahunan", alasan_cuti: "Libur akhir tahun", tanggal_pengajuan: ISODate("2026-09-30"),
    status_persetujuan: "Diajukan" }
])

db.OTORISASI_OPERASIONAL.insertMany([
  { id_pengemudi: "PGM001", id_kendaraan: "KND001", id_cabang: "CBG001", tanggal_otorisasi: ISODate("2026-01-05"),
    tanggal_kedaluwarsa: ISODate("2027-01-05"), disetujui_oleh: "Andi Wijaya", status_otorisasi: "Aktif" },
  { id_pengemudi: "PGM001", id_kendaraan: "KND002", id_cabang: "CBG001", tanggal_otorisasi: ISODate("2026-01-05"),
    tanggal_kedaluwarsa: ISODate("2027-01-05"), disetujui_oleh: "Andi Wijaya", catatan: "Muatan B3", status_otorisasi: "Aktif" },
  { id_pengemudi: "PGM002", id_kendaraan: "KND001", id_cabang: "CBG001", tanggal_otorisasi: ISODate("2025-09-01"),
    tanggal_kedaluwarsa: ISODate("2026-09-01"), disetujui_oleh: "Andi Wijaya", status_otorisasi: "Aktif" },
  { id_pengemudi: "PGM003", id_kendaraan: "KND003", id_cabang: "CBG002", tanggal_otorisasi: ISODate("2026-02-10"),
    tanggal_kedaluwarsa: ISODate("2027-02-10"), disetujui_oleh: "Rina Kartika", status_otorisasi: "Aktif" },
  { id_pengemudi: "PGM004", id_kendaraan: "KND004", id_cabang: "CBG003", tanggal_otorisasi: ISODate("2026-03-01"),
    tanggal_kedaluwarsa: ISODate("2027-03-01"), disetujui_oleh: "Hendra Gunawan", status_otorisasi: "Aktif" },
  { id_pengemudi: "PGM004", id_kendaraan: "KND004", id_cabang: "CBG002", tanggal_otorisasi: ISODate("2026-03-01"),
    tanggal_kedaluwarsa: ISODate("2027-03-01"), disetujui_oleh: "Hendra Gunawan", catatan: "Rute Jateng", status_otorisasi: "Aktif" },
  { id_pengemudi: "PGM005", id_kendaraan: "KND005", id_cabang: "CBG004", tanggal_otorisasi: ISODate("2026-04-15"),
    tanggal_kedaluwarsa: ISODate("2027-04-15"), disetujui_oleh: "Dewi Anggraini", status_otorisasi: "Aktif" },
  { id_pengemudi: "PGM006", id_kendaraan: "KND006", id_cabang: "CBG001", tanggal_otorisasi: ISODate("2025-06-01"),
    tanggal_kedaluwarsa: ISODate("2027-06-01"), disetujui_oleh: "Andi Wijaya", catatan: "Unit nonaktif", status_otorisasi: "Ditangguhkan" }
])

db.PENUGASAN_ARMADA.insertMany([
  { _id: "TGS001", id_kendaraan: "KND001", id_pengemudi: "PGM001", waktu_berangkat: ISODate("2026-09-21T06:00:00"),
    waktu_tiba_estimasi: ISODate("2026-09-22T08:00:00"), status_penugasan: "Selesai", konsumsi_bbm_liter: 210.5, uang_jalan: 1500000 },
  { _id: "TGS002", id_kendaraan: "KND003", id_pengemudi: "PGM003", waktu_berangkat: ISODate("2026-09-28T07:00:00"),
    waktu_tiba_estimasi: ISODate("2026-09-28T15:00:00"), status_penugasan: "Selesai", konsumsi_bbm_liter: 85, uang_jalan: 600000 },
  { _id: "TGS003", id_kendaraan: "KND004", id_pengemudi: "PGM004", waktu_berangkat: ISODate("2026-10-06T05:00:00"),
    waktu_tiba_estimasi: ISODate("2026-10-07T20:00:00"), status_penugasan: "Berjalan", uang_jalan: 1750000 },
  { _id: "TGS004", id_kendaraan: "KND002", id_pengemudi: "PGM001", waktu_berangkat: ISODate("2026-10-08T06:00:00"),
    waktu_tiba_estimasi: ISODate("2026-10-08T14:00:00"), status_penugasan: "Dijadwalkan", uang_jalan: 900000 },
  { _id: "TGS005", id_kendaraan: "KND005", id_pengemudi: "PGM005", waktu_berangkat: ISODate("2026-10-09T08:00:00"),
    waktu_tiba_estimasi: ISODate("2026-10-09T18:00:00"), status_penugasan: "Dijadwalkan", uang_jalan: 650000 }
])
db.PENGIRIMAN.insertMany([
  { _id: "KRM001", id_pelanggan: "PLG001", id_cabang_asal: "CBG001", id_cabang_tujuan: "CBG003", id_penugasan: "TGS001",
    tanggal_pesan: ISODate("2026-09-18"), tanggal_estimasi_tiba: ISODate("2026-09-22"),
    status_pengiriman: "Terkirim", jenis_layanan: "Reguler", prioritas_kiriman: "Sedang" },
  { _id: "KRM002", id_pelanggan: "PLG002", id_cabang_asal: "CBG001", id_cabang_tujuan: "CBG003", id_penugasan: "TGS001",
    tanggal_pesan: ISODate("2026-09-19"), tanggal_estimasi_tiba: ISODate("2026-09-22"),
    status_pengiriman: "Terkirim", jenis_layanan: "Reguler", prioritas_kiriman: "Rendah" },
  { _id: "KRM003", id_pelanggan: "PLG005", id_cabang_asal: "CBG002", id_cabang_tujuan: "CBG005", id_penugasan: "TGS002",
    tanggal_pesan: ISODate("2026-09-25"), tanggal_estimasi_tiba: ISODate("2026-09-28"),
    status_pengiriman: "Terkirim", jenis_layanan: "Express", prioritas_kiriman: "Tinggi" },
  { _id: "KRM004", id_pelanggan: "PLG003", id_cabang_asal: "CBG003", id_cabang_tujuan: "CBG001", id_penugasan: "TGS003",
    tanggal_pesan: ISODate("2026-10-03"), tanggal_estimasi_tiba: ISODate("2026-10-07"),
    status_pengiriman: "Dalam Perjalanan", jenis_layanan: "Reguler", prioritas_kiriman: "Sedang" },
  { _id: "KRM005", id_pelanggan: "PLG001", id_cabang_asal: "CBG003", id_cabang_tujuan: "CBG001", id_penugasan: "TGS003",
    tanggal_pesan: ISODate("2026-10-04"), tanggal_estimasi_tiba: ISODate("2026-10-07"),
    status_pengiriman: "Dalam Perjalanan", jenis_layanan: "Reguler", prioritas_kiriman: "Tinggi" },
  { _id: "KRM006", id_pelanggan: "PLG004", id_cabang_asal: "CBG001", id_cabang_tujuan: "CBG006", id_penugasan: "TGS004",
    tanggal_pesan: ISODate("2026-10-05"), tanggal_estimasi_tiba: ISODate("2026-10-08"),
    status_pengiriman: "Menunggu Penjadwalan", jenis_layanan: "Khusus B3", prioritas_kiriman: "Tinggi" },
  { _id: "KRM007", id_pelanggan: "PLG002", id_cabang_asal: "CBG004", id_cabang_tujuan: "CBG003", id_penugasan: "TGS005",
    tanggal_pesan: ISODate("2026-10-06"), tanggal_estimasi_tiba: ISODate("2026-10-09"),
    status_pengiriman: "Menunggu Penjadwalan", jenis_layanan: "Reguler", prioritas_kiriman: "Rendah" },
  { _id: "KRM008", id_pelanggan: "PLG003", id_cabang_asal: "CBG002", id_cabang_tujuan: "CBG004",
    tanggal_pesan: ISODate("2026-10-06"), tanggal_estimasi_tiba: ISODate("2026-10-10"),
    status_pengiriman: "Menunggu Penjadwalan", jenis_layanan: "Reguler", prioritas_kiriman: "Sedang" }
])

db.DETAIL_BARANG.insertMany([
  { _id: "BRG001", id_pengiriman: "KRM001", deskripsi_barang: "Televisi LED 43 inci (120 unit)", kategori_barang: "Elektronik",
    berat_kg: 1800, volume_m3: 14.4, nilai_barang: 240000000, tingkat_bahaya: "Non-B3", catatan_penanganan: "Maksimal tumpuk 4 lapis" },
  { _id: "BRG002", id_pengiriman: "KRM001", deskripsi_barang: "Kulkas 2 pintu (40 unit)", kategori_barang: "Elektronik",
    berat_kg: 2600, volume_m3: 18, nilai_barang: 180000000, tingkat_bahaya: "Non-B3" },
  { _id: "BRG003", id_pengiriman: "KRM002", deskripsi_barang: "Kain katun gulungan (300 roll)", kategori_barang: "Tekstil",
    berat_kg: 4500, volume_m3: 22, nilai_barang: 135000000, tingkat_bahaya: "Non-B3" },
  { _id: "BRG004", id_pengiriman: "KRM003", deskripsi_barang: "Meja makan jati (25 set)", kategori_barang: "Furnitur",
    berat_kg: 3750, volume_m3: 30, nilai_barang: 312500000, tingkat_bahaya: "Non-B3", catatan_penanganan: "Lapisi bubble wrap" },
  { _id: "BRG005", id_pengiriman: "KRM004", deskripsi_barang: "Beras premium 25 kg (400 karung)", kategori_barang: "Bahan Pangan",
    berat_kg: 10000, volume_m3: 16, nilai_barang: 140000000, tingkat_bahaya: "Non-B3", catatan_penanganan: "Hindari lembap" },
  { _id: "BRG006", id_pengiriman: "KRM004", deskripsi_barang: "Minyak goreng 2 L (600 karton)", kategori_barang: "Bahan Pangan",
    berat_kg: 7200, volume_m3: 10, nilai_barang: 108000000, tingkat_bahaya: "Non-B3" },
  { _id: "BRG007", id_pengiriman: "KRM005", deskripsi_barang: "Mesin cuci front loading (30 unit)", kategori_barang: "Elektronik",
    berat_kg: 2100, volume_m3: 9.5, nilai_barang: 165000000, tingkat_bahaya: "Non-B3" },
  { _id: "BRG008", id_pengiriman: "KRM006", deskripsi_barang: "Asam sulfat teknis curah 98%", kategori_barang: "Bahan Kimia",
    berat_kg: 14700, volume_m3: 8, nilai_barang: 73500000, tingkat_bahaya: "B3 Kelas 8", catatan_penanganan: "Wajib plakat B3 dan APD" },
  { _id: "BRG009", id_pengiriman: "KRM007", deskripsi_barang: "Benang polyester (150 karton)", kategori_barang: "Tekstil",
    berat_kg: 1500, volume_m3: 9, nilai_barang: 52500000, tingkat_bahaya: "Non-B3" },
  { _id: "BRG010", id_pengiriman: "KRM007", deskripsi_barang: "Kancing dan aksesori (20 karton)", kategori_barang: "Tekstil",
    berat_kg: 200, volume_m3: 1.2, nilai_barang: 8000000, tingkat_bahaya: "Non-B3" },
  { _id: "BRG011", id_pengiriman: "KRM008", deskripsi_barang: "Gula pasir 50 kg (100 karung)", kategori_barang: "Bahan Pangan",
    berat_kg: 5000, volume_m3: 7.5, nilai_barang: 85000000, tingkat_bahaya: "Non-B3" },
  { _id: "BRG012", id_pengiriman: "KRM008", deskripsi_barang: "Tepung terigu 25 kg (120 karung)", kategori_barang: "Bahan Pangan",
    berat_kg: 3000, volume_m3: 5, nilai_barang: 30000000, tingkat_bahaya: "Non-B3" }
])

db.RUTE_TRANSIT.insertMany([
  { _id: "TRS001", id_penugasan: "TGS001", id_cabang: "CBG002", urutan_transit: 1, waktu_estimasi_tiba: ISODate("2026-09-21T13:00:00"),
    waktu_aktual_tiba: ISODate("2026-09-21T13:25:00"), kondisi_segel: "Utuh", nama_pemeriksa: "Rina Kartika" },
  { _id: "TRS002", id_penugasan: "TGS001", id_cabang: "CBG003", urutan_transit: 2, waktu_estimasi_tiba: ISODate("2026-09-22T08:00:00"),
    waktu_aktual_tiba: ISODate("2026-09-22T07:40:00"), kondisi_segel: "Utuh", nama_pemeriksa: "Hendra Gunawan" },
  { _id: "TRS003", id_penugasan: "TGS002", id_cabang: "CBG005", urutan_transit: 1, waktu_estimasi_tiba: ISODate("2026-09-28T15:00:00"),
    waktu_aktual_tiba: ISODate("2026-09-28T15:30:00"), kondisi_segel: "Utuh", nama_pemeriksa: "Bayu Prasetyo" },
  { _id: "TRS004", id_penugasan: "TGS002", id_cabang: "CBG002", urutan_transit: 2, waktu_estimasi_tiba: ISODate("2026-09-28T18:00:00"),
    kondisi_segel: "Utuh" },
  { _id: "TRS005", id_penugasan: "TGS003", id_cabang: "CBG002", urutan_transit: 1, waktu_estimasi_tiba: ISODate("2026-10-06T16:00:00"),
    kondisi_segel: "Utuh" },
  { _id: "TRS006", id_penugasan: "TGS003", id_cabang: "CBG001", urutan_transit: 2, waktu_estimasi_tiba: ISODate("2026-10-07T20:00:00"),
    kondisi_segel: "Utuh" },
  { _id: "TRS007", id_penugasan: "TGS004", id_cabang: "CBG006", urutan_transit: 1, waktu_estimasi_tiba: ISODate("2026-10-08T14:00:00"),
    kondisi_segel: "Utuh" },
  { _id: "TRS008", id_penugasan: "TGS005", id_cabang: "CBG003", urutan_transit: 1, waktu_estimasi_tiba: ISODate("2026-10-09T18:00:00"),
    kondisi_segel: "Utuh" }
])

db.FAKTUR.insertMany([
  { _id: "FKT001", id_pengiriman: "KRM001", tanggal_terbit: ISODate("2026-09-23"), jatuh_tempo: ISODate("2026-10-07"),
    total_biaya_dasar: 18500000, biaya_tambahan: 750000, pajak: 2117500, status_pembayaran: "Lunas", metode_pembayaran: "Transfer Bank" },
  { _id: "FKT002", id_pengiriman: "KRM002", tanggal_terbit: ISODate("2026-09-23"), jatuh_tempo: ISODate("2026-10-07"),
    total_biaya_dasar: 12000000, biaya_tambahan: 0, pajak: 1320000, status_pembayaran: "Belum Lunas" },
  { _id: "FKT003", id_pengiriman: "KRM003", tanggal_terbit: ISODate("2026-09-29"), jatuh_tempo: ISODate("2026-10-06"),
    total_biaya_dasar: 9500000, biaya_tambahan: 1500000, pajak: 1210000, status_pembayaran: "Sebagian", metode_pembayaran: "Transfer Bank" },
  { _id: "FKT004", id_pengiriman: "KRM008", tanggal_terbit: ISODate("2026-10-06"), jatuh_tempo: ISODate("2026-10-20"),
    total_biaya_dasar: 7000000, biaya_tambahan: 0, pajak: 770000, status_pembayaran: "Belum Lunas" }
])

db.ASURANSI.insertMany([
  { _id: "ASR001", id_pengiriman: "KRM001", nama_penyedia: "PT Asuransi Cakrawala Proteksi", nomor_polis: "POL-CK-2609-0001",
    jenis_tanggungan: "All Risk", nilai_premi: 1260000, nilai_pertanggungan: 420000000, tanggal_berlaku: ISODate("2026-09-21"),
    status_klaim: "Tidak Ada Klaim" },
  { _id: "ASR002", id_pengiriman: "KRM002", nama_penyedia: "PT Asuransi Bumi Nusantara Raya", nomor_polis: "POL-BN-2609-0098",
    jenis_tanggungan: "Total Loss Only", nilai_premi: 202500, nilai_pertanggungan: 135000000, tanggal_berlaku: ISODate("2026-09-21"),
    status_klaim: "Tidak Ada Klaim" },
  { _id: "ASR003", id_pengiriman: "KRM003", nama_penyedia: "PT Asuransi Bumi Nusantara Raya", nomor_polis: "POL-BN-2609-0117",
    jenis_tanggungan: "Total Loss Only", nilai_premi: 468750, nilai_pertanggungan: 312500000, tanggal_berlaku: ISODate("2026-09-28"),
    status_klaim: "Tidak Ada Klaim" },
  { _id: "ASR004", id_pengiriman: "KRM004", nama_penyedia: "PT Asuransi Cakrawala Proteksi", nomor_polis: "POL-CK-2610-0021",
    jenis_tanggungan: "All Risk", nilai_premi: 744000, nilai_pertanggungan: 248000000, tanggal_berlaku: ISODate("2026-10-06"),
    status_klaim: "Tidak Ada Klaim" },
  { _id: "ASR005", id_pengiriman: "KRM005", nama_penyedia: "PT Asuransi Cakrawala Proteksi", nomor_polis: "POL-CK-2610-0022",
    jenis_tanggungan: "All Risk", nilai_premi: 495000, nilai_pertanggungan: 165000000, tanggal_berlaku: ISODate("2026-10-06"),
    status_klaim: "Tidak Ada Klaim" },
  { _id: "ASR006", id_pengiriman: "KRM006", nama_penyedia: "PT Asuransi Cakrawala Proteksi", nomor_polis: "POL-CK-2610-0034",
    jenis_tanggungan: "All Risk", nilai_premi: 367500, nilai_pertanggungan: 73500000, tanggal_berlaku: ISODate("2026-10-08"),
    status_klaim: "Tidak Ada Klaim" },
  { _id: "ASR007", id_pengiriman: "KRM007", nama_penyedia: "PT Asuransi Bumi Nusantara Raya", nomor_polis: "POL-BN-2610-0149",
    jenis_tanggungan: "Total Loss Only", nilai_premi: 90750, nilai_pertanggungan: 60500000, tanggal_berlaku: ISODate("2026-10-09"),
    status_klaim: "Tidak Ada Klaim" },
  { _id: "ASR008", id_pengiriman: "KRM008", nama_penyedia: "PT Asuransi Bumi Nusantara Raya", nomor_polis: "POL-BN-2610-0152",
    jenis_tanggungan: "Total Loss Only", nilai_premi: 172500, nilai_pertanggungan: 115000000, tanggal_berlaku: ISODate("2026-10-10"),
    status_klaim: "Tidak Ada Klaim" }
])

db.KENDARAAN.createIndex({ plat_nomor: 1 }, { unique: true })
