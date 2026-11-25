-- BAGIAN 4: tambahan untuk aplikasi (kolom induk cabang dan VIEW)
USE simlog_db;

-- kolom induk cabang untuk query WITH RECURSIVE di halaman Laporan SQL
ALTER TABLE KANTOR_CABANG ADD COLUMN id_cabang_induk CHAR(6) NULL;
ALTER TABLE KANTOR_CABANG ADD CONSTRAINT fk_cabang_induk
    FOREIGN KEY (id_cabang_induk) REFERENCES KANTOR_CABANG(id_cabang) ON DELETE SET NULL;

UPDATE KANTOR_CABANG SET id_cabang_induk = 'CBG003' WHERE id_cabang IN ('CBG001','CBG002','CBG004');
UPDATE KANTOR_CABANG SET id_cabang_induk = 'CBG002' WHERE id_cabang = 'CBG005';
UPDATE KANTOR_CABANG SET id_cabang_induk = 'CBG001' WHERE id_cabang = 'CBG006';

-- VIEW untuk halaman Laporan SQL
CREATE VIEW v_pengiriman_belum_ditagih AS
SELECT p.id_pengiriman, pl.nama_perusahaan, p.status_pengiriman
FROM PENGIRIMAN p
JOIN PELANGGAN pl ON pl.id_pelanggan = p.id_pelanggan
LEFT JOIN FAKTUR f ON f.id_pengiriman = p.id_pengiriman
WHERE f.id_faktur IS NULL;
