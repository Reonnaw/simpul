-- BAGIAN 2: data awal 13 tabel dan tabel arsip
USE simlog_db;

INSERT INTO KANTOR_CABANG
    (id_cabang, nama_cabang, alamat, kota, kode_pos, no_telepon_cabang, nama_kepala_cabang, kapasitas_gudang_ton)
VALUES
    ('CBG001', 'Cabang Surabaya',   'Jl. Rungkut Industri No. 12', 'Surabaya',      '60293', '031-8471234', 'Andi Wijaya',    500.00),
    ('CBG002', 'Cabang Semarang',   'Jl. Kaligawe Raya No. 45',    'Semarang',      '50117', '024-6591234', 'Rina Kartika',   350.00),
    ('CBG003', 'Cabang Jakarta',    'Jl. Cakung Cilincing No. 88', 'Jakarta Timur', '13910', '021-4401234', 'Hendra Gunawan', 800.00),
    ('CBG004', 'Cabang Bandung',    'Jl. Soekarno-Hatta No. 210',  'Bandung',       '40235', '022-7561234', 'Dewi Anggraini', 300.00),
    ('CBG005', 'Cabang Yogyakarta', 'Jl. Ring Road Utara No. 17',  'Sleman',        '55283', '0274-881234', 'Bayu Prasetyo',  250.00),
    ('CBG006', 'Cabang Malang',     'Jl. Raya Karanglo No. 5',     'Malang',        '65153', '0341-491234', 'Siti Rahmawati', 200.00),
    ('CBG007', 'Cabang Kediri',     'Jl. Soekarno-Hatta No. 9',    'Kediri',        '64129', '0354-681234', NULL,             150.00);

INSERT INTO PELANGGAN
    (id_pelanggan, nama_perusahaan, penanggung_jawab, email, npwp, no_telepon, alamat_lengkap, tipe_industri)
VALUES
    ('PLG001', 'PT Sinar Abadi Elektronik', 'Budi Santoso',   'budi@sinarabadi.co.id',    '01.234.567.8-609.000', '0811-2233-4455', 'Jl. Industri Raya No. 8, Surabaya',         'Elektronik'),
    ('PLG002', 'CV Maju Jaya Tekstil',      'Lina Marlina',   'lina@majujayatekstil.com', '02.345.678.9-424.000', '0812-7788-9900', 'Jl. Moh. Toha No. 77, Bandung',             'Tekstil'),
    ('PLG003', 'PT Nusantara Agro Pangan',  'Agus Setiawan',  'agus@nusagro.co.id',       '03.456.789.0-503.000', '0813-1212-3434', 'Kawasan Industri Candi Blok C-3, Semarang', 'Makanan & Minuman'),
    ('PLG004', 'PT Sentosa Kimia Industri', 'Ratna Sari',     'ratna@sentosakimia.co.id', '04.567.890.1-413.000', '0815-5656-7878', 'Jl. Raya Cikarang Km. 3, Bekasi',           'Kimia'),
    ('PLG005', 'PT Berkah Mebel Jepara',    'Fajar Nugroho',  'fajar@berkahmebel.id',     '05.678.901.2-516.000', '0817-9090-1212', 'Jl. Raya Tahunan No. 21, Jepara',           'Furnitur'),
    ('PLG006', 'UD Tani Makmur',            'Sugeng Hartono', 'admin@tanimakmur.id',      NULL,                   '0819-3434-5656', 'Jl. Raya Batu No. 40, Malang',              'Pertanian');

INSERT INTO KENDARAAN
    (id_kendaraan, id_cabang_pool, plat_nomor, jenis_kendaraan, merek_kendaraan,
     kapasitas_berat_kg, kapasitas_volume_m3, tahun_pembuatan, jadwal_servis_berikutnya)
VALUES
    ('KND001', 'CBG001', 'L 9123 UA',  'Wingbox',     'Hino 500',               15000, 45.00, 2021, '2026-11-15'),
    ('KND002', 'CBG001', 'L 8456 UB',  'Truk Tangki', 'Mitsubishi Fuso',        16000, 16.00, 2020, '2026-10-20'),
    ('KND003', 'CBG002', 'H 8812 KB',  'CDD Box',     'Isuzu Elf NMR',           5000, 20.00, 2022, '2026-12-01'),
    ('KND004', 'CBG003', 'B 9734 TXC', 'Tronton',     'Hino 500',               20000, 50.00, 2019, '2026-10-30'),
    ('KND005', 'CBG004', 'D 8521 AF',  'Engkel Box',  'Mitsubishi Colt Diesel',  2500, 12.00, 2023, '2027-01-10'),
    ('KND006', 'CBG001', 'L 9901 UC',  'CDD Box',     'Isuzu Elf NMR',           5000, 20.00, 2015, NULL);

INSERT INTO PENGEMUDI
    (id_pengemudi, id_cabang, nama_pengemudi, no_ktp, jenis_kelamin, tanggal_lahir, alamat, no_telepon, tanggal_bergabung)
VALUES
    ('PGM001', 'CBG001', 'Joko Santoso',     '3578011405900001', 'L', '1990-05-14', 'Jl. Wonokromo No. 21, Surabaya',        '0812-3344-5566', '2022-03-01'),
    ('PGM002', 'CBG001', 'Bambang Hermawan', '3578022008870002', 'L', '1987-08-20', 'Jl. Kenjeran No. 102, Surabaya',        '0813-5566-7788', '2020-07-15'),
    ('PGM003', 'CBG002', 'Eko Prasetyo',     '3374031203920003', 'L', '1992-03-12', 'Jl. Majapahit No. 9, Semarang',         '0815-2244-6688', '2023-01-10'),
    ('PGM004', 'CBG003', 'Rudi Hartanto',    '3175072511850004', 'L', '1985-11-25', 'Jl. Raya Bekasi Km. 18, Jakarta Timur', '0817-1122-3344', '2019-05-20'),
    ('PGM005', 'CBG004', 'Sri Wahyuni',      '3273046606940005', 'P', '1994-06-26', 'Jl. Kiaracondong No. 45, Bandung',      '0819-8877-6655', '2024-02-01'),
    ('PGM006', 'CBG001', 'Dedi Kurniawan',   '3578031010880006', 'L', '1988-10-10', 'Jl. Ngagel No. 3, Surabaya',            '0821-3456-7890', '2021-09-01');

INSERT INTO SERTIFIKASI_PENGEMUDI
    (id_pengemudi, jenis_lisensi, no_lisensi, instansi_penerbit, tanggal_terbit, tanggal_berlaku_hingga, status_verifikasi, catatan)
VALUES
    ('PGM001', 'SIM B2 Umum',          'B2-778812', 'Polda Jawa Timur',  '2024-05-14', '2029-05-14', 'Terverifikasi', NULL),
    ('PGM001', 'Sertifikat B3/Hazmat', 'HZ-004521', 'Kemenhub RI',       '2024-11-30', '2027-11-30', 'Terverifikasi', 'Pelatihan angkutan B3'),
    ('PGM002', 'SIM B2 Umum',          'B2-661204', 'Polda Jawa Timur',  '2023-08-20', '2028-08-20', DEFAULT,     NULL),
    ('PGM003', 'SIM B1 Umum',          'B1-552871', 'Polda Jawa Tengah', '2025-03-12', '2030-03-12', DEFAULT,     NULL),
    ('PGM003', 'Sertifikat B3/Hazmat', 'HZ-009102', 'Kemenhub RI',       '2026-08-01', '2029-08-01', 'Ditolak',   'Jam pelatihan belum terpenuhi'),
    ('PGM004', 'SIM B2 Umum',          'B2-903317', 'Polda Metro Jaya',  '2022-11-25', '2027-11-25', 'Terverifikasi', NULL),
    ('PGM004', 'Sertifikat B3/Hazmat', 'HZ-007788', 'Kemenhub RI',       '2025-06-01', '2028-06-01', DEFAULT,     NULL),
    ('PGM005', 'SIM B1 Umum',          'B1-440912', 'Polda Jawa Barat',  '2024-06-26', '2029-06-26', DEFAULT,     NULL),
    ('PGM006', 'SIM B1 Umum',          'B1-118230', 'Polda Jawa Timur',  '2021-10-10', '2026-10-10', 'Terverifikasi', NULL);

INSERT INTO JADWAL_CUTI_PENGEMUDI
    (id_pengemudi, tanggal_mulai_cuti, tanggal_selesai_cuti, jenis_cuti, alasan_cuti, tanggal_pengajuan, disetujui_oleh, status_persetujuan)
VALUES
    ('PGM002', '2026-08-03', '2026-08-05', 'Cuti Tahunan', 'Mudik keluarga',       '2026-07-20', 'Andi Wijaya', 'Disetujui'),
    ('PGM002', '2026-10-12', '2026-10-16', 'Cuti Tahunan', 'Acara keluarga',       '2026-09-28', NULL,          DEFAULT),
    ('PGM001', '2026-10-05', '2026-10-06', 'Cuti Khusus',  'Pernikahan saudara',   '2026-09-20', 'Andi Wijaya', 'Ditolak'),
    ('PGM003', '2026-10-26', '2026-10-27', 'Cuti Sakit',   'Kontrol pascaoperasi', '2026-10-01', NULL,          DEFAULT),
    ('PGM005', '2026-12-22', '2026-12-31', 'Cuti Tahunan', 'Libur akhir tahun',    '2026-09-30', NULL,          DEFAULT);

INSERT INTO OTORISASI_OPERASIONAL
    (id_pengemudi, id_kendaraan, id_cabang, tanggal_otorisasi, tanggal_kedaluwarsa, disetujui_oleh, catatan, status_otorisasi)
VALUES
    ('PGM001', 'KND001', 'CBG001', '2026-01-05', '2027-01-05', 'Andi Wijaya',    NULL,            DEFAULT),
    ('PGM001', 'KND002', 'CBG001', '2026-01-05', '2027-01-05', 'Andi Wijaya',    'Muatan B3',     DEFAULT),
    ('PGM002', 'KND001', 'CBG001', '2025-09-01', '2026-09-01', 'Andi Wijaya',    NULL,            DEFAULT),
    ('PGM003', 'KND003', 'CBG002', '2026-02-10', '2027-02-10', 'Rina Kartika',   NULL,            DEFAULT),
    ('PGM004', 'KND004', 'CBG003', '2026-03-01', '2027-03-01', 'Hendra Gunawan', NULL,            DEFAULT),
    ('PGM004', 'KND004', 'CBG002', '2026-03-01', '2027-03-01', 'Hendra Gunawan', 'Rute Jateng',   DEFAULT),
    ('PGM005', 'KND005', 'CBG004', '2026-04-15', '2027-04-15', 'Dewi Anggraini', NULL,            DEFAULT),
    ('PGM006', 'KND006', 'CBG001', '2025-06-01', '2027-06-01', 'Andi Wijaya',    'Unit nonaktif', 'Ditangguhkan');

INSERT INTO PENUGASAN_ARMADA
    (id_penugasan, id_kendaraan, id_pengemudi, waktu_berangkat, waktu_tiba_estimasi, status_penugasan, konsumsi_bbm_liter, uang_jalan)
VALUES
    ('TGS001', 'KND001', 'PGM001', '2026-09-21 06:00:00', '2026-09-22 08:00:00', 'Selesai',  210.50, 1500000),
    ('TGS002', 'KND003', 'PGM003', '2026-09-28 07:00:00', '2026-09-28 15:00:00', 'Selesai',   85.00,  600000),
    ('TGS003', 'KND004', 'PGM004', '2026-10-06 05:00:00', '2026-10-07 20:00:00', 'Berjalan',  NULL,  1750000),
    ('TGS004', 'KND002', 'PGM001', '2026-10-08 06:00:00', '2026-10-08 14:00:00', DEFAULT,     NULL,   900000),
    ('TGS005', 'KND005', 'PGM005', '2026-10-09 08:00:00', '2026-10-09 18:00:00', DEFAULT,     NULL,   650000);

INSERT INTO PENGIRIMAN
    (id_pengiriman, id_pelanggan, id_cabang_asal, id_cabang_tujuan, id_penugasan, tanggal_pesan,
     tanggal_estimasi_tiba, status_pengiriman, jenis_layanan, prioritas_kiriman)
VALUES
    ('KRM001', 'PLG001', 'CBG001', 'CBG003', 'TGS001', '2026-09-18', '2026-09-22', 'Terkirim',         'Reguler',   'Sedang'),
    ('KRM002', 'PLG002', 'CBG001', 'CBG003', 'TGS001', '2026-09-19', '2026-09-22', 'Terkirim',         'Reguler',   'Rendah'),
    ('KRM003', 'PLG005', 'CBG002', 'CBG005', 'TGS002', '2026-09-25', '2026-09-28', 'Terkirim',         'Express',   'Tinggi'),
    ('KRM004', 'PLG003', 'CBG003', 'CBG001', 'TGS003', '2026-10-03', '2026-10-07', 'Dalam Perjalanan', 'Reguler',   'Sedang'),
    ('KRM005', 'PLG001', 'CBG003', 'CBG001', 'TGS003', '2026-10-04', '2026-10-07', 'Dalam Perjalanan', 'Reguler',   'Tinggi'),
    ('KRM006', 'PLG004', 'CBG001', 'CBG006', 'TGS004', '2026-10-05', '2026-10-08', DEFAULT,            'Khusus B3', 'Tinggi'),
    ('KRM007', 'PLG002', 'CBG004', 'CBG003', 'TGS005', '2026-10-06', '2026-10-09', DEFAULT,            DEFAULT,   'Rendah'),
    ('KRM008', 'PLG003', 'CBG002', 'CBG004', NULL,     '2026-10-06', '2026-10-10', DEFAULT,            DEFAULT,   DEFAULT);

INSERT INTO DETAIL_BARANG
    (id_barang, id_pengiriman, deskripsi_barang, kategori_barang, berat_kg, volume_m3, nilai_barang, tingkat_bahaya, catatan_penanganan)
VALUES
    ('BRG001', 'KRM001', 'Televisi LED 43 inci (120 unit)',    'Elektronik',    1800, 14.40, 240000000, DEFAULT,      'Maksimal tumpuk 4 lapis'),
    ('BRG002', 'KRM001', 'Kulkas 2 pintu (40 unit)',           'Elektronik',    2600, 18.00, 180000000, DEFAULT,      NULL),
    ('BRG003', 'KRM002', 'Kain katun gulungan (300 roll)',     'Tekstil',       4500, 22.00, 135000000, DEFAULT,      NULL),
    ('BRG004', 'KRM003', 'Meja makan jati (25 set)',           'Furnitur',      3750, 30.00, 312500000, DEFAULT,      'Lapisi bubble wrap'),
    ('BRG005', 'KRM004', 'Beras premium 25 kg (400 karung)',   'Bahan Pangan', 10000, 16.00, 140000000, DEFAULT,      'Hindari lembap'),
    ('BRG006', 'KRM004', 'Minyak goreng 2 L (600 karton)',     'Bahan Pangan',  7200, 10.00, 108000000, DEFAULT,      NULL),
    ('BRG007', 'KRM005', 'Mesin cuci front loading (30 unit)', 'Elektronik',    2100,  9.50, 165000000, DEFAULT,      NULL),
    ('BRG008', 'KRM006', 'Asam sulfat teknis curah 98%',       'Bahan Kimia',  14700,  8.00,  73500000, 'B3 Kelas 8', 'Wajib plakat B3 dan APD'),
    ('BRG009', 'KRM007', 'Benang polyester (150 karton)',      'Tekstil',       1500,  9.00,  52500000, DEFAULT,      NULL),
    ('BRG010', 'KRM007', 'Kancing dan aksesori (20 karton)',   'Tekstil',        200,  1.20,   8000000, DEFAULT,      NULL),
    ('BRG011', 'KRM008', 'Gula pasir 50 kg (100 karung)',      'Bahan Pangan',  5000,  7.50,  85000000, DEFAULT,      NULL),
    ('BRG012', 'KRM008', 'Tepung terigu 25 kg (120 karung)',   'Bahan Pangan',  3000,  5.00,  30000000, DEFAULT,      NULL);

INSERT INTO RUTE_TRANSIT
    (id_transit, id_penugasan, id_cabang, urutan_transit, waktu_estimasi_tiba, waktu_aktual_tiba, kondisi_segel, nama_pemeriksa)
VALUES
    ('TRS001', 'TGS001', 'CBG002', 1, '2026-09-21 13:00:00', '2026-09-21 13:25:00', 'Utuh',  'Rina Kartika'),
    ('TRS002', 'TGS001', 'CBG003', 2, '2026-09-22 08:00:00', '2026-09-22 07:40:00', 'Utuh',  'Hendra Gunawan'),
    ('TRS003', 'TGS002', 'CBG005', 1, '2026-09-28 15:00:00', '2026-09-28 15:30:00', 'Utuh',  'Bayu Prasetyo'),
    ('TRS004', 'TGS002', 'CBG002', 2, '2026-09-28 18:00:00', NULL,                  DEFAULT, NULL),
    ('TRS005', 'TGS003', 'CBG002', 1, '2026-10-06 16:00:00', NULL,                  DEFAULT, NULL),
    ('TRS006', 'TGS003', 'CBG001', 2, '2026-10-07 20:00:00', NULL,                  DEFAULT, NULL),
    ('TRS007', 'TGS004', 'CBG006', 1, '2026-10-08 14:00:00', NULL,                  DEFAULT, NULL),
    ('TRS008', 'TGS005', 'CBG003', 1, '2026-10-09 18:00:00', NULL,                  DEFAULT, NULL);

INSERT INTO FAKTUR
    (id_faktur, id_pengiriman, tanggal_terbit, jatuh_tempo, total_biaya_dasar, biaya_tambahan, pajak, status_pembayaran, metode_pembayaran)
VALUES
    ('FKT001', 'KRM001', '2026-09-23', '2026-10-07', 18500000,  750000, 2117500, 'Lunas',    'Transfer Bank'),
    ('FKT002', 'KRM002', '2026-09-23', '2026-10-07', 12000000,       0, 1320000, DEFAULT,    NULL),
    ('FKT003', 'KRM003', '2026-09-29', '2026-10-06',  9500000, 1500000, 1210000, 'Sebagian', 'Transfer Bank'),
    ('FKT004', 'KRM008', '2026-10-06', '2026-10-20',  7000000,       0,  770000, DEFAULT,    NULL);

INSERT INTO ASURANSI
    (id_asuransi, id_pengiriman, nama_penyedia, nomor_polis, jenis_tanggungan, nilai_premi, nilai_pertanggungan, tanggal_berlaku)
VALUES
    ('ASR001', 'KRM001', 'PT Asuransi Cakrawala Proteksi',  'POL-CK-2609-0001', 'All Risk',        1260000, 420000000, '2026-09-21'),
    ('ASR002', 'KRM002', 'PT Asuransi Bumi Nusantara Raya', 'POL-BN-2609-0098', 'Total Loss Only',  202500, 135000000, '2026-09-21'),
    ('ASR003', 'KRM003', 'PT Asuransi Bumi Nusantara Raya', 'POL-BN-2609-0117', 'Total Loss Only',  468750, 312500000, '2026-09-28'),
    ('ASR004', 'KRM004', 'PT Asuransi Cakrawala Proteksi',  'POL-CK-2610-0021', 'All Risk',         744000, 248000000, '2026-10-06'),
    ('ASR005', 'KRM005', 'PT Asuransi Cakrawala Proteksi',  'POL-CK-2610-0022', 'All Risk',         495000, 165000000, '2026-10-06'),
    ('ASR006', 'KRM006', 'PT Asuransi Cakrawala Proteksi',  'POL-CK-2610-0034', 'All Risk',         367500,  73500000, '2026-10-08'),
    ('ASR007', 'KRM007', 'PT Asuransi Bumi Nusantara Raya', 'POL-BN-2610-0149', 'Total Loss Only',   90750,  60500000, '2026-10-09'),
    ('ASR008', 'KRM008', 'PT Asuransi Bumi Nusantara Raya', 'POL-BN-2610-0152', 'Total Loss Only',  172500, 115000000, '2026-10-10');

-- INSERT ... SELECT ke tabel arsip
CREATE TABLE ARSIP_PENGIRIMAN (
    id_pengiriman  CHAR(6) PRIMARY KEY,
    nama_pelanggan VARCHAR(100),
    kota_asal      VARCHAR(50),
    kota_tujuan    VARCHAR(50),
    tanggal_pesan  DATE,
    total_tagihan  DECIMAL(14,2)
);
INSERT INTO ARSIP_PENGIRIMAN
    (id_pengiriman, nama_pelanggan, kota_asal, kota_tujuan, tanggal_pesan, total_tagihan)
SELECT p.id_pengiriman, pl.nama_perusahaan, ca.kota, ct.kota, p.tanggal_pesan,
       f.total_biaya_dasar + f.biaya_tambahan + f.pajak
FROM PENGIRIMAN p
JOIN PELANGGAN pl     ON p.id_pelanggan     = pl.id_pelanggan
JOIN KANTOR_CABANG ca ON p.id_cabang_asal   = ca.id_cabang
JOIN KANTOR_CABANG ct ON p.id_cabang_tujuan = ct.id_cabang
JOIN FAKTUR f         ON p.id_pengiriman    = f.id_pengiriman
WHERE p.status_pengiriman = 'Terkirim';
