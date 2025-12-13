-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 04, 2025 at 07:06 PM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `notes_app`
--

-- --------------------------------------------------------

--
-- Table structure for table `notes`
--

CREATE TABLE `notes` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `lat` varchar(50) DEFAULT NULL,
  `lng` varchar(50) DEFAULT NULL,
  `location_name` varchar(255) DEFAULT NULL,
  `status` enum('active','archived','trashed') NOT NULL DEFAULT 'active',
  `color` varchar(20) DEFAULT NULL,
  `archived_at` datetime DEFAULT NULL,
  `trashed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `notes`
--

INSERT INTO `notes` (`id`, `user_id`, `title`, `body`, `created_at`, `lat`, `lng`, `location_name`, `status`, `color`, `archived_at`, `trashed_at`) VALUES
(1, 4, 'Fabrikasi Data', 'Apa dampak tindakan ini terhadap integritas ilmiah?\r\n\r\n1. Fabrikasi data sangat merusak integritas ilmiah karena:\r\n2. Menghasilkan pengetahuan palsu yang tidak sesuai kenyataan.\r\n3. Menyesatkan peneliti lain yang mungkin menggunakan data itu sebagai dasar penelitian.\r\n4. Merusak proses ilmiah karena data adalah fondasi dari kebenaran ilmiah.\r\n5. Menciderai nilai dasar etika: kejujuran, akuntabilitas, dan objektivitas.\r\n\r\nIntegritas ilmiah rusak karena peneliti secara sadar memalsukan informasi untuk keuntungan pribadi atau tekanan publikasi.', '2025-12-04 18:51:14', NULL, NULL, NULL, 'archived', 'green', '2025-12-05 01:54:16', NULL),
(2, 4, 'Penelitian Berbasis Dana Industri', 'Bagaimana otonomi akademik diuji dalam kasus ini?\r\n\r\n1. Otonomi akademik diuji karena:\r\n2. Peneliti mendapat tekanan dari pihak pendana (perusahaan farmasi) untuk tidak mempublikasikan hasil negatif.\r\n3. Kebebasan peneliti dalam melaporkan kebenaran ilmiah dibatasi.\r\n4. Ada konflik antara kepentingan industri vs kebenaran ilmiah.\r\n\r\nPeneliti menghadapi dilema etis: mengikuti pendana atau mematuhi etika akademik. Otonomi akademik menuntut peneliti tetap bebas menyampaikan hasil ilmiah apa adanya, tanpa tekanan ekonomi atau politik.', '2025-12-04 18:52:18', '-7.5754887', '110.8243272', NULL, 'active', 'purple', NULL, NULL),
(3, 4, 'Business Intelligence Analyst?', 'Business Intelligence Analyst (BI Analyst) adalah profesional yang bertugas mengumpulkan, menganalisis, dan menginterpretasi data perusahaan untuk membantu manajemen mengambil keputusan strategis.\r\nBI Analyst mengubah data mentah menjadi informasi bermakna yang mudah dipahami melalui dashboard, laporan, grafik, dan insight.\r\n\r\nSecara sederhana:\r\nBI Analyst = Data + Analisis + Visualisasi → Keputusan Bisnis yang Lebih Baik', '2025-12-04 18:53:38', '-7.5754887', '110.8243272', NULL, 'active', 'pink', NULL, NULL),
(4, 4, 'TES UNTUK HAPUS CATATAN', 'TES\r\nTES\r\nTES\r\nHAPUS', '2025-12-04 18:54:12', NULL, NULL, NULL, 'trashed', 'green', NULL, '2025-12-05 01:54:20');

-- --------------------------------------------------------

--
-- Table structure for table `tokens`
--

CREATE TABLE `tokens` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `token` varchar(128) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tokens`
--

INSERT INTO `tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES
(1, 1, 'bdd965ebfac065cb42031a538572db35bcf1b9f397f031f031c76e53975112d7', '2025-12-11 18:41:27', '2025-12-04 18:41:27'),
(2, 4, '9eed16dc7bcf4bcf6766ee839fc9355e18c182077dd7a2f749e69794274b3e11', '2025-12-11 18:47:12', '2025-12-04 18:47:12'),
(3, 3, '5cc5c767ac0f99b72d46a8bb1c49a770b6f2012fc1f3e293eb6d11c69bdd65f7', '2025-12-11 18:55:03', '2025-12-04 18:55:03'),
(4, 1, '3fdd88e89ae7c2d15e59bf9e4542787f7e0cf168194e4175d88bc403ac99286e', '2025-12-11 19:00:46', '2025-12-04 19:00:46'),
(6, 2, '425b47512f17560bd633dcdc5d3c0b8012b2b46ea57b01449250020699f256f6', '2025-12-11 19:02:41', '2025-12-04 19:02:41');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `photo` varchar(255) DEFAULT 'default.jpg',
  `role` enum('user','admin') DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `created_at`, `photo`, `role`) VALUES
(1, 'admin01', 'admin01@gmail.com', '$2y$10$IEcesmZK17UcyswoLF5d.eZqPsgCbURO8t2uO3UBBFIMUkz1kKYGq', '2025-12-04 18:44:53', 'default.jpg', 'admin'),
(2, 'admin02', 'admin02@gmail.com', '$2y$10$tDdySZzWHjpMZ6Gffz7mdeNzBkl7TKJ4G04vEuRqCXNSMbCrTZNt6', '2025-12-04 18:45:18', 'default.jpg', 'admin'),
(3, 'admin03', 'admin03@gmail.com', '$2y$10$YFA6javN2u/bhEDBTYA.iOwg04RTnHnzPtLPjsWPbuE9G2n4LR4i6', '2025-12-04 18:45:43', 'default.jpg', 'admin'),
(4, 'mahasiswa01', 'm01@gmail.com', '$2y$10$5NwlNZN9SbfF5Z1Lcd2fpOM6blPlYyWcibLeQQxmzrEcKVBM7x95y', '2025-12-04 18:46:50', 'user4_1764874189.png', 'user');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `notes`
--
ALTER TABLE `notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `tokens`
--
ALTER TABLE `tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `notes`
--
ALTER TABLE `notes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tokens`
--
ALTER TABLE `tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `notes`
--
ALTER TABLE `notes`
  ADD CONSTRAINT `notes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tokens`
--
ALTER TABLE `tokens`
  ADD CONSTRAINT `tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
