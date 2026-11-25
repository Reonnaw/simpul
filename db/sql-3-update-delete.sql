-- BAGIAN 3: UPDATE dan DELETE, tanpa perintah yang sengaja error
USE simlog_db;

-- ===== UPDATE =====
UPDATE KANTOR_CABANG
SET kapasitas_gudang_ton = kapasitas_gudang_ton + 150, nama_kepala_cabang = 'Yusuf Maulana'
WHERE kota = 'Semarang';

UPDATE PELANGGAN
SET tipe_industri = 'Manufaktur Elektronik', no_telepon = '0811-2233-9999'
WHERE nama_perusahaan LIKE '%Elektronik%';
UPDATE PELANGGAN SET status_aktif = FALSE WHERE id_pelanggan = 'PLG006';

UPDATE KENDARAAN SET status_kendaraan = 'Dalam Perjalanan'
WHERE id_kendaraan IN (SELECT id_kendaraan FROM PENUGASAN_ARMADA WHERE status_penugasan = 'Berjalan');
UPDATE KENDARAAN SET status_kendaraan = 'Nonaktif' WHERE tahun_pembuatan < 2016;
UPDATE PENGEMUDI SET status_ketersediaan = 'Bertugas'
WHERE id_pengemudi IN (SELECT id_pengemudi FROM PENUGASAN_ARMADA WHERE status_penugasan = 'Berjalan');
UPDATE PENGEMUDI SET no_telepon = '0812-3344-0000', alamat = 'Jl. Jemursari No. 15, Surabaya'
WHERE no_ktp = '3578011405900001';

UPDATE SERTIFIKASI_PENGEMUDI
SET status_verifikasi = 'Terverifikasi', catatan = 'Diverifikasi via data Satpas'
WHERE status_verifikasi = 'Menunggu' AND instansi_penerbit LIKE 'Polda%';

UPDATE JADWAL_CUTI_PENGEMUDI SET status_persetujuan = 'Disetujui', disetujui_oleh = 'Andi Wijaya'
WHERE id_pengemudi = 'PGM002' AND tanggal_mulai_cuti = '2026-10-12';

UPDATE OTORISASI_OPERASIONAL SET status_otorisasi = 'Kedaluwarsa'
WHERE tanggal_kedaluwarsa < '2026-10-07' AND status_otorisasi = 'Aktif';
UPDATE OTORISASI_OPERASIONAL
SET tanggal_kedaluwarsa = DATE_ADD(tanggal_kedaluwarsa, INTERVAL 1 YEAR)
WHERE id_pengemudi = 'PGM003' AND id_kendaraan = 'KND003' AND id_cabang = 'CBG002';

UPDATE PENUGASAN_ARMADA SET status_penugasan = 'Dibatalkan' WHERE id_penugasan = 'TGS005';
UPDATE PENUGASAN_ARMADA SET uang_jalan = uang_jalan * 1.10 WHERE status_penugasan = 'Dijadwalkan';

UPDATE PENGIRIMAN SET status_pengiriman = 'Dibatalkan' WHERE id_pengiriman = 'KRM008';
UPDATE PENGIRIMAN p
JOIN PENUGASAN_ARMADA pa ON p.id_penugasan = pa.id_penugasan
SET p.status_pengiriman = 'Transit'
WHERE pa.status_penugasan = 'Berjalan';

UPDATE DETAIL_BARANG SET catatan_penanganan = 'Posisi tegak, hindari guncangan'
WHERE deskripsi_barang LIKE '%Kulkas%' OR deskripsi_barang LIKE '%Mesin cuci%';
UPDATE DETAIL_BARANG SET nilai_barang = 172500000 WHERE id_barang = 'BRG007';

UPDATE RUTE_TRANSIT
SET waktu_aktual_tiba = '2026-10-06 16:45:00', kondisi_segel = 'Utuh', nama_pemeriksa = 'Rina Kartika'
WHERE id_penugasan = 'TGS003' AND urutan_transit = 1;

UPDATE FAKTUR SET status_pembayaran = 'Lunas', metode_pembayaran = 'Virtual Account'
WHERE id_pengiriman = 'KRM002';
UPDATE FAKTUR SET status_pembayaran = 'Terlambat'
WHERE status_pembayaran = 'Sebagian' AND jatuh_tempo < '2026-10-07';

UPDATE ASURANSI SET status_klaim = 'Diajukan' WHERE nomor_polis = 'POL-BN-2609-0117';

-- ===== DELETE =====
DELETE FROM ASURANSI WHERE nomor_polis = 'POL-CK-2610-0034';
INSERT INTO ASURANSI
    (id_asuransi, id_pengiriman, nama_penyedia, nomor_polis, jenis_tanggungan, nilai_premi, nilai_pertanggungan, tanggal_berlaku)
VALUES
    ('ASR009', 'KRM006', 'PT Asuransi Cakrawala Proteksi', 'POL-CK-2610-0035', 'All Risk + Polusi B3', 588000, 73500000, '2026-10-08');

DELETE FROM FAKTUR WHERE id_pengiriman = 'KRM008';
DELETE FROM RUTE_TRANSIT WHERE id_penugasan = 'TGS002' AND urutan_transit = 2;
DELETE FROM DETAIL_BARANG WHERE id_pengiriman = 'KRM007' AND deskripsi_barang LIKE 'Kancing%';
DELETE FROM PENGIRIMAN WHERE status_pengiriman = 'Dibatalkan';         -- CASCADE ke barang & asuransi
DELETE FROM PENUGASAN_ARMADA WHERE status_penugasan = 'Dibatalkan';   -- SET NULL + CASCADE
DELETE FROM OTORISASI_OPERASIONAL WHERE status_otorisasi = 'Kedaluwarsa';
DELETE FROM JADWAL_CUTI_PENGEMUDI WHERE status_persetujuan = 'Ditolak';
DELETE FROM SERTIFIKASI_PENGEMUDI WHERE status_verifikasi = 'Ditolak';
DELETE FROM PENGEMUDI WHERE nama_pengemudi = 'Dedi Kurniawan';
DELETE FROM KENDARAAN WHERE status_kendaraan = 'Nonaktif';
DELETE FROM PELANGGAN WHERE status_aktif = FALSE;
DELETE FROM KANTOR_CABANG WHERE nama_kepala_cabang IS NULL;
