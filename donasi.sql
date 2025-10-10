CREATE TABLE donasi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_donatur VARCHAR(100),
  nominal INT,
  pesan TEXT,
  tanggal DATETIME DEFAULT NOW(),
  user_id INT
);