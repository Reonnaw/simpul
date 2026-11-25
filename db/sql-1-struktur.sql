-- BAGIAN 1: database, 13 tabel, index, dan ALTER TABLE
DROP DATABASE IF EXISTS simlog_db;
CREATE DATABASE simlog_db;
USE simlog_db;

CREATE TABLE KANTOR_CABANG (
    id_cabang            CHAR(6) PRIMARY KEY,
    nama_cabang          VARCHAR(50)  NOT NULL,
    alamat               VARCHAR(255) NOT NULL,
    kota                 VARCHAR(50)  NOT NULL,
    kode_pos             VARCHAR(10),
    no_telepon_cabang    VARCHAR(20),
    nama_kepala_cabang   VARCHAR(100),
    kapasitas_gudang_ton DECIMAL(10,2) DEFAULT 0
);

CREATE TABLE PELANGGAN (
    id_pelanggan     CHAR(6) PRIMARY KEY,
    nama_perusahaan  VARCHAR(100) NOT NULL,
    penanggung_jawab VARCHAR(100) NOT NULL,
    email            VARCHAR(100) UNIQUE,
    no_telepon       VARCHAR(20),
    alamat_lengkap   VARCHAR(255),
    tipe_industri    VARCHAR(50),
    status_aktif     BOOLEAN DEFAULT TRUE
);

CREATE TABLE KENDARAAN (
    id_kendaraan             CHAR(6) PRIMARY KEY,
    id_cabang_pool           CHAR(6) NOT NULL,
    plat_nomor               VARCHAR(15) NOT NULL UNIQUE,
    jenis_kendaraan          VARCHAR(30) NOT NULL,
    kapasitas_berat_kg       DECIMAL(10,2) NOT NULL,
    kapasitas_volume_m3      DECIMAL(10,2) NOT NULL,
    tahun_pembuatan          SMALLINT,
    status_kendaraan         VARCHAR(20) DEFAULT 'Tersedia'
        CHECK (status_kendaraan IN ('Tersedia','Dalam Perjalanan','Perawatan','Nonaktif')),
    jadwal_servis_berikutnya DATE,
    CONSTRAINT fk_kendaraan_cabang FOREIGN KEY (id_cabang_pool)
        REFERENCES KANTOR_CABANG(id_cabang)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE PENGEMUDI (
    id_pengemudi        CHAR(6) PRIMARY KEY,
    id_cabang           CHAR(6) NOT NULL,
    nama_pengemudi      VARCHAR(100) NOT NULL,
    no_ktp              VARCHAR(20) NOT NULL UNIQUE,
    jenis_kelamin       CHAR(1) NOT NULL CHECK (jenis_kelamin IN ('L','P')),
    tanggal_lahir       DATE NOT NULL,
    alamat              VARCHAR(255),
    no_telepon          VARCHAR(20),
    tanggal_bergabung   DATE NOT NULL,
    status_ketersediaan VARCHAR(20) DEFAULT 'Tersedia'
        CHECK (status_ketersediaan IN ('Tersedia','Bertugas','Cuti','Nonaktif')),
    CONSTRAINT fk_pengemudi_cabang FOREIGN KEY (id_cabang)
        REFERENCES KANTOR_CABANG(id_cabang)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE SERTIFIKASI_PENGEMUDI (
    id_pengemudi           CHAR(6) NOT NULL,
    jenis_lisensi          VARCHAR(50) NOT NULL,
    no_lisensi             VARCHAR(30) NOT NULL,
    instansi_penerbit      VARCHAR(100),
    tanggal_terbit         DATE,
    tanggal_berlaku_hingga DATE,
    status_verifikasi      VARCHAR(20) DEFAULT 'Menunggu'
        CHECK (status_verifikasi IN ('Menunggu','Terverifikasi','Ditolak')),
    catatan                VARCHAR(255),
    PRIMARY KEY (id_pengemudi, jenis_lisensi),
    CONSTRAINT fk_sertifikasi_pengemudi FOREIGN KEY (id_pengemudi)
        REFERENCES PENGEMUDI(id_pengemudi)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE JADWAL_CUTI_PENGEMUDI (
    id_pengemudi         CHAR(6) NOT NULL,
    tanggal_mulai_cuti   DATE NOT NULL,
    tanggal_selesai_cuti DATE NOT NULL,
    jenis_cuti           VARCHAR(30),
    alasan_cuti          VARCHAR(255),
    tanggal_pengajuan    DATE NOT NULL,
    disetujui_oleh       VARCHAR(100),
    status_persetujuan   VARCHAR(20) DEFAULT 'Diajukan'
        CHECK (status_persetujuan IN ('Diajukan','Disetujui','Ditolak')),
    PRIMARY KEY (id_pengemudi, tanggal_mulai_cuti),
    CONSTRAINT fk_cuti_pengemudi FOREIGN KEY (id_pengemudi)
        REFERENCES PENGEMUDI(id_pengemudi)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE OTORISASI_OPERASIONAL (
    id_pengemudi        CHAR(6) NOT NULL,
    id_kendaraan        CHAR(6) NOT NULL,
    id_cabang           CHAR(6) NOT NULL,
    tanggal_otorisasi   DATE NOT NULL,
    tanggal_kedaluwarsa DATE,
    disetujui_oleh      VARCHAR(100),
    catatan             VARCHAR(255),
    status_otorisasi    VARCHAR(20) DEFAULT 'Aktif'
        CHECK (status_otorisasi IN ('Aktif','Ditangguhkan','Kedaluwarsa')),
    PRIMARY KEY (id_pengemudi, id_kendaraan, id_cabang),
    CONSTRAINT fk_otorisasi_pengemudi FOREIGN KEY (id_pengemudi)
        REFERENCES PENGEMUDI(id_pengemudi) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_otorisasi_kendaraan FOREIGN KEY (id_kendaraan)
        REFERENCES KENDARAAN(id_kendaraan) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_otorisasi_cabang FOREIGN KEY (id_cabang)
        REFERENCES KANTOR_CABANG(id_cabang) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE PENUGASAN_ARMADA (
    id_penugasan        CHAR(6) PRIMARY KEY,
    id_kendaraan        CHAR(6) NOT NULL,
    id_pengemudi        CHAR(6) NOT NULL,
    waktu_berangkat     DATETIME NOT NULL,
    waktu_tiba_estimasi DATETIME,
    status_penugasan    VARCHAR(20) DEFAULT 'Dijadwalkan'
        CHECK (status_penugasan IN ('Dijadwalkan','Berjalan','Selesai','Dibatalkan')),
    konsumsi_bbm_liter  DECIMAL(8,2),
    uang_jalan          DECIMAL(12,2),
    CONSTRAINT fk_penugasan_kendaraan FOREIGN KEY (id_kendaraan)
        REFERENCES KENDARAAN(id_kendaraan) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_penugasan_pengemudi FOREIGN KEY (id_pengemudi)
        REFERENCES PENGEMUDI(id_pengemudi) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- asal & tujuan ON UPDATE RESTRICT: kolomnya dipakai CHECK chk_cabang_berbeda
CREATE TABLE PENGIRIMAN (
    id_pengiriman         CHAR(6) PRIMARY KEY,
    id_pelanggan          CHAR(6) NOT NULL,
    id_cabang_asal        CHAR(6) NOT NULL,
    id_cabang_tujuan      CHAR(6) NOT NULL,
    id_penugasan          CHAR(6),
    tanggal_pesan         DATE NOT NULL,
    tanggal_estimasi_tiba DATE,
    status_pengiriman     VARCHAR(20) DEFAULT 'Menunggu Penjadwalan'
        CHECK (status_pengiriman IN ('Menunggu Penjadwalan','Dalam Perjalanan',
                                     'Transit','Terkirim','Dibatalkan')),
    jenis_layanan         VARCHAR(30) DEFAULT 'Reguler',
    prioritas_kiriman     VARCHAR(10) DEFAULT 'Sedang'
        CHECK (prioritas_kiriman IN ('Rendah','Sedang','Tinggi')),
    CONSTRAINT fk_pengiriman_pelanggan FOREIGN KEY (id_pelanggan)
        REFERENCES PELANGGAN(id_pelanggan) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pengiriman_asal FOREIGN KEY (id_cabang_asal)
        REFERENCES KANTOR_CABANG(id_cabang) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_pengiriman_tujuan FOREIGN KEY (id_cabang_tujuan)
        REFERENCES KANTOR_CABANG(id_cabang) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_pengiriman_penugasan FOREIGN KEY (id_penugasan)
        REFERENCES PENUGASAN_ARMADA(id_penugasan) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_cabang_berbeda CHECK (id_cabang_asal <> id_cabang_tujuan)
);

CREATE TABLE DETAIL_BARANG (
    id_barang        CHAR(6) PRIMARY KEY,
    id_pengiriman    CHAR(6) NOT NULL,
    deskripsi_barang VARCHAR(150) NOT NULL,
    kategori_barang  VARCHAR(50),
    berat_kg         DECIMAL(10,2) NOT NULL,
    volume_m3        DECIMAL(10,2),
    nilai_barang     DECIMAL(14,2),
    tingkat_bahaya   VARCHAR(20) DEFAULT 'Non-B3',
    instruksi_khusus VARCHAR(255),
    CONSTRAINT fk_barang_pengiriman FOREIGN KEY (id_pengiriman)
        REFERENCES PENGIRIMAN(id_pengiriman) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE RUTE_TRANSIT (
    id_transit          CHAR(6) PRIMARY KEY,
    id_penugasan        CHAR(6) NOT NULL,
    id_cabang           CHAR(6) NOT NULL,
    urutan_transit      INT NOT NULL,
    waktu_estimasi_tiba DATETIME,
    waktu_aktual_tiba   DATETIME,
    kondisi_segel       VARCHAR(20) DEFAULT 'Utuh'
        CHECK (kondisi_segel IN ('Utuh','Rusak','Diperiksa Ulang')),
    nama_pemeriksa      VARCHAR(100),
    CONSTRAINT fk_transit_penugasan FOREIGN KEY (id_penugasan)
        REFERENCES PENUGASAN_ARMADA(id_penugasan) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_transit_cabang FOREIGN KEY (id_cabang)
        REFERENCES KANTOR_CABANG(id_cabang) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uq_transit_urutan UNIQUE (id_penugasan, urutan_transit)
);

CREATE TABLE FAKTUR (
    id_faktur         CHAR(6) PRIMARY KEY,
    id_pengiriman     CHAR(6) NOT NULL UNIQUE,
    tanggal_terbit    DATE NOT NULL,
    jatuh_tempo       DATE,
    total_biaya_dasar DECIMAL(14,2) NOT NULL,
    biaya_tambahan    DECIMAL(14,2) DEFAULT 0,
    pajak             DECIMAL(14,2) DEFAULT 0,
    status_pembayaran VARCHAR(20) DEFAULT 'Belum Lunas'
        CHECK (status_pembayaran IN ('Belum Lunas','Lunas','Sebagian','Terlambat')),
    metode_pembayaran VARCHAR(30),
    CONSTRAINT fk_faktur_pengiriman FOREIGN KEY (id_pengiriman)
        REFERENCES PENGIRIMAN(id_pengiriman) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE ASURANSI (
    id_asuransi         CHAR(6) PRIMARY KEY,
    id_pengiriman       CHAR(6) NOT NULL UNIQUE,
    nama_penyedia       VARCHAR(100) NOT NULL,
    nomor_polis         VARCHAR(50) NOT NULL UNIQUE,
    jenis_tanggungan    VARCHAR(50),
    nilai_premi         DECIMAL(14,2),
    nilai_pertanggungan DECIMAL(14,2),
    status_klaim        VARCHAR(20) DEFAULT 'Tidak Ada Klaim'
        CHECK (status_klaim IN ('Tidak Ada Klaim','Diajukan','Disetujui','Ditolak')),
    tanggal_berlaku     DATE,
    CONSTRAINT fk_asuransi_pengiriman FOREIGN KEY (id_pengiriman)
        REFERENCES PENGIRIMAN(id_pengiriman) ON DELETE CASCADE ON UPDATE CASCADE
);

-- enam index tambahan
CREATE INDEX idx_pengiriman_tanggal ON PENGIRIMAN(tanggal_pesan);
CREATE INDEX idx_pengiriman_status  ON PENGIRIMAN(status_pengiriman);
CREATE INDEX idx_penugasan_waktu    ON PENUGASAN_ARMADA(waktu_berangkat);
CREATE INDEX idx_pelanggan_nama     ON PELANGGAN(nama_perusahaan);
CREATE INDEX idx_faktur_status      ON FAKTUR(status_pembayaran);
CREATE INDEX idx_kendaraan_status   ON KENDARAAN(status_kendaraan);
-- ALTER TABLE; UNIQUE npwp dipisah karena TiDB menolak ADD COLUMN ... UNIQUE
ALTER TABLE PELANGGAN ADD COLUMN npwp VARCHAR(25) AFTER email;
ALTER TABLE PELANGGAN ADD UNIQUE (npwp);
ALTER TABLE PELANGGAN ADD COLUMN no_fax VARCHAR(20) AFTER no_telepon;
ALTER TABLE KENDARAAN ADD COLUMN merek_kendaraan VARCHAR(50) AFTER jenis_kendaraan;
ALTER TABLE KANTOR_CABANG MODIFY nama_cabang VARCHAR(100) NOT NULL;
ALTER TABLE KANTOR_CABANG MODIFY kapasitas_gudang_ton DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE DETAIL_BARANG CHANGE instruksi_khusus catatan_penanganan VARCHAR(300);
ALTER TABLE DETAIL_BARANG ADD CONSTRAINT chk_berat_positif CHECK (berat_kg > 0);
ALTER TABLE PELANGGAN DROP COLUMN no_fax;
