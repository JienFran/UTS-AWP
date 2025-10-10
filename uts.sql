-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 05, 2025 at 06:19 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `uts`
--

-- --------------------------------------------------------

--
-- Table structure for table `account`
--

CREATE TABLE `account` (
  `ID` int(11) NOT NULL,
  `Username` varchar(100) NOT NULL,
  `Password` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `account`
--


-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `ID` int(11) NOT NULL,
  `Username_Admin` varchar(50) NOT NULL,
  `Password_Admin` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

CREATE TABLE campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) DEFAULT 0.00,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO `admin` (`ID`, `Username_Admin`, `Password_Admin`) VALUES
(1, 'admin', 'admin');


INSERT INTO campaigns (title, description, target_amount, current_amount, status, end_date) VALUES
('Bantu Sekolah di Pelosok NTT', 'Penggalangan dana untuk membangun kembali gedung sekolah dasar di desa terpencil Nusa Tenggara Timur yang rusak akibat badai.', 50000000, 25500000, 'active', '2025-12-31'),
('Air Bersih untuk Warga Desa Sukamaju', 'Menyediakan sumur bor dan sistem filtrasi air untuk warga Desa Sukamaju yang kesulitan mendapatkan akses air bersih setiap hari.', 35000000, 35000000, 'completed', '2025-09-01'),
('Sembako untuk Panti Jompo Sejahtera', 'Berbagi kebahagiaan dengan menyediakan paket sembako bulanan untuk para lansia di Panti Jompo Sejahtera.', 15000000, 7800000, 'active', '2025-11-30'),
('Operasi Katarak Gratis untuk Dhuafa', 'Membantu 50 pasien dhuafa untuk mendapatkan operasi katarak gratis agar mereka bisa melihat dunia kembali dengan jelas.', 75000000, 61250000, 'active', '2026-01-15'),
('Beasiswa Pendidikan Anak Yatim', 'Program beasiswa selama satu tahun untuk mendukung biaya sekolah dan perlengkapan 20 anak yatim berprestasi.', 40000000, 41500000, 'completed', '2025-08-20'),
('Bantuan Medis Korban Bencana', 'Dana darurat untuk menyediakan obat-obatan, perawatan medis, dan kebutuhan pokok bagi korban bencana alam.', 100000000, 0, 'cancelled', '2025-10-10');
--
--
-- Indexes for dumped tables
--

--
-- Indexes for table `account`
--
ALTER TABLE `account`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account`
--
ALTER TABLE `account`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
