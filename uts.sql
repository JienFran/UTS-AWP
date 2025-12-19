-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: uts
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `account` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Username` varchar(100) NOT NULL,
  `Password` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO account (ID, Username, Password) 
VALUES (6, 'system_user', '123');
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Username_Admin` varchar(50) NOT NULL,
  `Password_Admin` varchar(50) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (1,'admin','admin');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campaigns`
--

DROP TABLE IF EXISTS `campaigns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `campaigns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `target_amount` decimal(15,2) NOT NULL,
  `current_amount` decimal(15,2) DEFAULT 0.00,
  `status` enum('pending','active','completed','cancelled') DEFAULT 'active',
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `image_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaigns`
--

LOCK TABLES `campaigns` WRITE;
/*!40000 ALTER TABLE `campaigns` DISABLE KEYS */;
INSERT INTO `campaigns` VALUES (1,'Bantu Sekolah di Pelosok NTT','Penggalangan dana untuk membangun kembali gedung sekolah dasar di desa terpencil Nusa Tenggara Timur yang rusak akibat badai.',50000000.00,0.00,'active','2025-12-31','2025-10-18 06:19:13','https://images.unsplash.com/photo-1593113598332-cd288d649433'),(2,'Air Bersih untuk Warga Desa Sukamaju','Menyediakan sumur bor dan sistem filtrasi air untuk warga Desa Sukamaju yang kesulitan mendapatkan akses air bersih setiap hari.',35000000.00,0.00,'completed','2025-09-01','2025-10-18 06:19:13','https://images.unsplash.com/photo-1593113598332-cd288d649433'),(3,'Sembako untuk Panti Jompo Sejahtera','Berbagi kebahagiaan dengan menyediakan paket sembako bulanan untuk para lansia di Panti Jompo Sejahtera.',15000000.00,0.00,'active','2025-11-30','2025-10-18 06:19:13','https://images.unsplash.com/photo-1593113598332-cd288d649433'),(4,'Operasi Katarak Gratis untuk Dhuafa','Membantu 50 pasien dhuafa untuk mendapatkan operasi katarak gratis agar mereka bisa melihat dunia kembali dengan jelas.',75000000.00,0.00,'active','2026-01-15','2025-10-18 06:19:13','https://images.unsplash.com/photo-1593113598332-cd288d649433'),(5,'Beasiswa Pendidikan Anak Yatim','Program beasiswa selama satu tahun untuk mendukung biaya sekolah dan perlengkapan 20 anak yatim berprestasi.',40000000.00,0.00,'completed','2025-08-20','2025-10-18 06:19:13','https://images.unsplash.com/photo-1593113598332-cd288d649433'),(6,'Bantuan Medis Korban Bencana','Dana darurat untuk menyediakan obat-obatan, perawatan medis, dan kebutuhan pokok bagi korban bencana alam.',100000000.00,0.00,'cancelled','2025-10-10','2025-10-18 06:19:13','https://images.unsplash.com/photo-1593113598332-cd288d649433');
/*!40000 ALTER TABLE `campaigns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donasi`
--

DROP TABLE IF EXISTS `donasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `donasi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `campaign_id` int(11) NOT NULL,
  `nama_donatur` varchar(255) NOT NULL,
  `nominal` decimal(15,2) NOT NULL,
  `pesan` text DEFAULT NULL,
  `tanggal` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `campaign_id` (`campaign_id`),
  CONSTRAINT `donasi_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `account` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `donasi_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donasi`
--

LOCK TABLES `donasi` WRITE;
/*!40000 ALTER TABLE `donasi` DISABLE KEYS */;
/*!40000 ALTER TABLE `donasi` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-18 15:59:29
