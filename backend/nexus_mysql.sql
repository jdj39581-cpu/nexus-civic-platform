-- NEXUS Database Schema & Seed Data for MySQL
-- Compatible with MySQL 8.0+

CREATE DATABASE IF NOT EXISTS `nexus_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `nexus_db`;

-- 1. Roles
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'citizen', 'Resident, student or community reporter'),
(2, 'admin', 'City or campus administrator with full oversight'),
(3, 'resolver', 'Field technician or department engineer');

-- 2. Departments
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `contact_email` VARCHAR(120),
  `active_resolvers_count` INT DEFAULT 0,
  `icon` VARCHAR(50) DEFAULT 'Building',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO `departments` (`id`, `code`, `name`, `description`, `contact_email`, `active_resolvers_count`, `icon`) VALUES
(1, 'PWD_ROADS', 'Public Works & Roads', 'Road resurfacing, pothole repairs, bridges, footpath maintenance', 'pwd.roads@nexus.demo', 12, 'Construction'),
(2, 'SWM_SANITATION', 'Solid Waste Management & Sanitation', 'Garbage collection, blackspot clearance, street sweeping, dump sites', 'sanitation@nexus.demo', 18, 'Trash2'),
(3, 'BWSSB_WATER', 'Water Supply & Sewerage Board', 'Drinking water pipelines, leakage control, manholes, drainage', 'water.supply@nexus.demo', 9, 'Droplets'),
(4, 'BESCOM_POWER', 'Electricity & Public Illumination', 'Streetlights, overhead live cables, transformers, power grid safety', 'electrical@nexus.demo', 14, 'Zap'),
(5, 'BMTC_TRANSPORT', 'City Transport & Mobility', 'Bus stops, shelters, traffic signal timing, pedestrian zebra crossings', 'transport@nexus.demo', 7, 'Bus');

-- 3. Users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30),
  `role` VARCHAR(30) NOT NULL DEFAULT 'citizen',
  `department_id` INT NULL,
  `avatar_url` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Default password is 'nexus123' ($2b$10$mVUN36KSpwx6tFbv9q/b9e89lt7jXJynk/nIOopD2IX48Tad4FPlK)
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `phone`, `role`, `department_id`) VALUES
(1, 'Aarav Sharma', 'citizen@nexus.demo', '$2b$10$mVUN36KSpwx6tFbv9q/b9e89lt7jXJynk/nIOopD2IX48Tad4FPlK', '+91 98450 11223', 'citizen', NULL),
(2, 'Dr. Rajesh Kumar', 'admin@nexus.demo', '$2b$10$mVUN36KSpwx6tFbv9q/b9e89lt7jXJynk/nIOopD2IX48Tad4FPlK', '+91 98801 44556', 'admin', NULL),
(3, 'Er. Ramesh Patil', 'roads@nexus.demo', '$2b$10$mVUN36KSpwx6tFbv9q/b9e89lt7jXJynk/nIOopD2IX48Tad4FPlK', '+91 97412 88990', 'resolver', 1),
(4, 'Priya Sundaram', 'sanitation@nexus.demo', '$2b$10$mVUN36KSpwx6tFbv9q/b9e89lt7jXJynk/nIOopD2IX48Tad4FPlK', '+91 99002 33441', 'resolver', 2),
(5, 'Anand Murthy', 'water@nexus.demo', '$2b$10$mVUN36KSpwx6tFbv9q/b9e89lt7jXJynk/nIOopD2IX48Tad4FPlK', '+91 94480 66778', 'resolver', 3),
(6, 'Vikram Rao', 'electrical@nexus.demo', '$2b$10$mVUN36KSpwx6tFbv9q/b9e89lt7jXJynk/nIOopD2IX48Tad4FPlK', '+91 96113 55667', 'resolver', 4),
(7, 'Sneha Reddy', 'sneha.r@gmail.com', '$2b$10$mVUN36KSpwx6tFbv9q/b9e89lt7jXJynk/nIOopD2IX48Tad4FPlK', '+91 98455 77889', 'citizen', NULL),
(8, 'Rohan Verma', 'rohan.v@student.ac.in', '$2b$10$mVUN36KSpwx6tFbv9q/b9e89lt7jXJynk/nIOopD2IX48Tad4FPlK', '+91 99160 22334', 'citizen', NULL),
(9, 'Kavita Nair', 'kavita.n@gmail.com', '$2b$10$mVUN36KSpwx6tFbv9q/b9e89lt7jXJynk/nIOopD2IX48Tad4FPlK', '+91 98862 33110', 'citizen', NULL);

-- 4. Categories
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `default_department_id` INT NULL,
  `default_severity` VARCHAR(20) DEFAULT 'Medium',
  `icon` VARCHAR(50) DEFAULT 'AlertCircle',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`default_department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO `categories` (`id`, `code`, `name`, `description`, `default_department_id`, `default_severity`, `icon`) VALUES
(1, 'ROADS', 'Roads & Pavements', 'Potholes, cracked asphalt, missing speed breakers, damaged dividers', 1, 'High', 'Footprints'),
(2, 'WASTE', 'Garbage & Waste', 'Overflowing community bins, illegal garbage dumps, foul odor', 2, 'Medium', 'Trash2'),
(3, 'WATER', 'Water Leakage & Supply', 'Broken water pipes, low pressure, murky drinking water supply', 3, 'High', 'Droplets'),
(4, 'ELECTRICITY', 'Electricity & Power Grid', 'Dangling live cables, sparking transformers, power failures', 4, 'Critical', 'Zap'),
(5, 'STREETLIGHT', 'Streetlights', 'Non-functional street lamps, flickering illumination, dark streets', 4, 'Medium', 'Sun'),
(6, 'DRAINAGE', 'Drainage & Sewers', 'Clogged stormwater drains, overflowing sewage, open manholes', 3, 'High', 'Waves'),
(7, 'TRANSPORT', 'Public Transport', 'Broken bus shelter glass, lack of zebra crossing, bus delays', 5, 'Low', 'Bus'),
(8, 'INFRASTRUCTURE', 'Public Infrastructure', 'Damaged park fencing, cracked footbridge, vandalized benches', 1, 'Medium', 'Landmark'),
(9, 'EDUCATION', 'College & Facility Defect', 'Broken auditorium seats, hostel water defect, lab circuit issue', 1, 'Medium', 'GraduationCap'),
(10, 'OTHER', 'Other Civic Concerns', 'General civic defects not covered under specific modules', 1, 'Low', 'HelpCircle');

-- 5. Locations
DROP TABLE IF EXISTS `locations`;
CREATE TABLE `locations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `address` TEXT NOT NULL,
  `landmark` VARCHAR(255),
  `latitude` DECIMAL(10, 7) NOT NULL,
  `longitude` DECIMAL(10, 7) NOT NULL,
  `ward` VARCHAR(100),
  `city` VARCHAR(100) DEFAULT 'Bangalore',
  `postal_code` VARCHAR(20),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 6. Issues (Aggregated Community Issues)
DROP TABLE IF EXISTS `issues`;
CREATE TABLE `issues` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `issue_code` VARCHAR(50) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category_id` INT NOT NULL,
  `department_id` INT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Reported',
  `priority_score` INT DEFAULT 50,
  `priority_level` VARCHAR(20) DEFAULT 'Medium',
  `location_id` INT NULL,
  `latitude` DECIMAL(10, 7),
  `longitude` DECIMAL(10, 7),
  `address` TEXT,
  `landmark` VARCHAR(255),
  `affected_reports_count` INT DEFAULT 1,
  `assigned_to_user_id` INT NULL,
  `resolution_notes` TEXT,
  `resolution_proof_url` TEXT,
  `resolved_at` DATETIME NULL,
  `verified_by_citizen` TINYINT(1) DEFAULT 0,
  `verification_status` VARCHAR(50) DEFAULT 'Pending',
  `verification_notes` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`),
  FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`assigned_to_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. Reports (Raw Citizen Reports)
DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `report_code` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT NOT NULL,
  `issue_id` INT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `category_id` INT NOT NULL,
  `location_id` INT NULL,
  `latitude` DECIMAL(10, 7) NOT NULL,
  `longitude` DECIMAL(10, 7) NOT NULL,
  `address` TEXT NOT NULL,
  `landmark` VARCHAR(255),
  `status` VARCHAR(50) NOT NULL DEFAULT 'Reported',
  `photo_url` TEXT,
  `is_duplicate` TINYINT(1) DEFAULT 0,
  `duplicate_of_report_id` INT NULL,
  `priority_score` INT DEFAULT 50,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`)
) ENGINE=InnoDB;

-- 8. Issue Reports Mapping
DROP TABLE IF EXISTS `issue_reports`;
CREATE TABLE `issue_reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `issue_id` INT NOT NULL,
  `report_id` INT NOT NULL,
  `similarity_score` DECIMAL(4, 2) DEFAULT 1.00,
  `merged_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uniq_issue_report` (`issue_id`, `report_id`)
) ENGINE=InnoDB;

-- 9. AI Analysis
DROP TABLE IF EXISTS `ai_analysis`;
CREATE TABLE `ai_analysis` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `report_id` INT NULL,
  `issue_id` INT NULL,
  `category_detected` VARCHAR(100),
  `issue_type` VARCHAR(150),
  `severity` VARCHAR(50),
  `confidence` INT DEFAULT 85,
  `keywords` TEXT,
  `location_references` TEXT,
  `safety_risk_score` INT DEFAULT 0,
  `priority_score` INT DEFAULT 50,
  `priority_reasons` TEXT,
  `recommended_department_id` INT NULL,
  `similar_reports_count` INT DEFAULT 0,
  `is_potential_duplicate` TINYINT(1) DEFAULT 0,
  `raw_analysis_json` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Status History
DROP TABLE IF EXISTS `status_history`;
CREATE TABLE `status_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `issue_id` INT NULL,
  `report_id` INT NULL,
  `from_status` VARCHAR(50),
  `to_status` VARCHAR(50) NOT NULL,
  `changed_by_user_id` INT NULL,
  `notes` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. Progress Updates
DROP TABLE IF EXISTS `progress_updates`;
CREATE TABLE `progress_updates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `issue_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `message` TEXT NOT NULL,
  `evidence_url` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB;

-- 12. Notifications
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50) DEFAULT 'info',
  `link_url` VARCHAR(255),
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 13. Feedback & Citizen Verification
DROP TABLE IF EXISTS `feedback`;
CREATE TABLE `feedback` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `issue_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `is_resolved_confirmed` TINYINT(1) NOT NULL,
  `comments` TEXT,
  `evidence_url` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB;
