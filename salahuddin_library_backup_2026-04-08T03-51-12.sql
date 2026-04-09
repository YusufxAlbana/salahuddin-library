-- =============================================================================
-- Salahuddin Library — SQL Backup
-- Generated  : 2026-04-08T03:51:12.771Z
-- Source     : Firebase Realtime Database + Cloudinary (URLs embedded as TEXT)
-- Encoding   : UTF-8 / utf8mb4
-- Engine     : InnoDB
-- Compatible : MySQL 5.7+ / MariaDB 10.3+
-- =============================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- -----------------------------------------------------------------------------
-- Table: users
-- Note : avatar_url & ktp_url are Cloudinary CDN URLs
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id`              VARCHAR(36)   NOT NULL,
  `email`           VARCHAR(255)  NOT NULL,
  `name`            VARCHAR(255)  NOT NULL,
  `role`            ENUM('admin','member') NOT NULL DEFAULT 'member',
  `avatar_url`      TEXT          DEFAULT NULL COMMENT 'Cloudinary URL',
  `join_date`       DATETIME      NOT NULL,
  `donated_books`   INT           NOT NULL DEFAULT 0,
  `member_status`   ENUM('non-member','pending','approved','verified') NOT NULL DEFAULT 'non-member',
  `ktp_url`         TEXT          DEFAULT NULL COMMENT 'Cloudinary URL',
  `payment_status`  ENUM('unpaid','paid') NOT NULL DEFAULT 'unpaid',
  `payment_date`    DATETIME      DEFAULT NULL,
  `has_unpaid_fine` TINYINT(1)    NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`,`email`,`name`,`role`,`avatar_url`,`join_date`,`donated_books`,`member_status`,`ktp_url`,`payment_status`,`payment_date`,`has_unpaid_fine`) VALUES
  ('9a6d0a5c-7597-4166-af73-88ef14040cc0', 'nana@gmail.com', 'nana', 'admin', NULL, '2025-12-22 13:24:50', 0, 'non-member', NULL, 'unpaid', NULL, 0),
  ('592ae0a0-6104-464e-aa59-958b713c4678', 'maman@gmail.com', 'maman', 'member', NULL, '2025-12-24 03:30:40', 0, 'pending', 'https://res.cloudinary.com/dyr6flyz3/image/upload/w_1024,c_limit,q_auto,f_auto/v1775011023/hq0tat0bedfeeeyx1x7d.png', 'unpaid', NULL, 0),
  ('cdc1b3eb-ca73-41b1-beb5-80fcd026730e', 'manan@gmail.com', 'manan', 'member', NULL, '2025-12-22 15:26:46', 0, 'verified', 'https://res.cloudinary.com/dyr6flyz3/image/upload/w_1024,c_limit,q_auto,f_auto/v1775011024/qgzlbpacaepyhoyelrrz.png', 'paid', '2025-12-23 06:13:57', 0),
  ('f17b0c77-fb6c-4165-9dc9-313cac2ddfef', 'say@gmail.com', 'say', 'member', NULL, '2026-01-21 01:19:34', 0, 'non-member', NULL, 'unpaid', NULL, 0),
  ('9c58a7d9-6bda-4f3a-813d-6460f10edb2b', 'cihuy@gmail.com', 'cihuy', 'member', NULL, '2026-01-21 01:22:43', 0, 'non-member', NULL, 'unpaid', NULL, 0),
  ('7aa3e070-e7fb-4795-a464-30fbe26eef05', 'yusufnawafalbana2009@gmail.com', 'yusuf albana', 'member', NULL, '2026-02-25 00:43:31', 0, 'verified', 'https://res.cloudinary.com/dyr6flyz3/image/upload/w_1024,c_limit,q_auto,f_auto/v1775011025/yyucj8knvaswt31pk0o4.png', 'unpaid', NULL, 0),
  ('a4ef3145-f61b-4160-9c67-5cd2d6a183aa', 'ham@io.oke', 'BramMahm', 'member', NULL, '2026-03-11 16:43:56', 0, 'approved', 'https://res.cloudinary.com/dyr6flyz3/image/upload/w_1024,c_limit,q_auto,f_auto/v1775011026/c3hajhmuplc56bkgsbcd.png', 'unpaid', NULL, 0);

-- -----------------------------------------------------------------------------
-- Table: books
-- Note : cover field is a Cloudinary CDN URL
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `books`;
CREATE TABLE `books` (
  `id`          INT           NOT NULL,
  `title`       VARCHAR(500)  NOT NULL,
  `author`      VARCHAR(255)  NOT NULL,
  `category`    VARCHAR(100)  NOT NULL,
  `cover`       TEXT          DEFAULT NULL COMMENT 'Cloudinary URL',
  `stock`       INT           NOT NULL DEFAULT 0,
  `created_at`  DATETIME      NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_books_category` (`category`),
  KEY `idx_books_author` (`author`(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `books` (`id`,`title`,`author`,`category`,`cover`,`stock`,`created_at`) VALUES
  (1, 'Laskar Pelangi', 'Andrea Hirata', 'novel', 'https://res.cloudinary.com/dyr6flyz3/image/upload/w_1024,c_limit,q_auto,f_auto/v1775011032/pgggtfr4j8gui5u8o4fz.jpg', 3, '2025-12-22 13:31:28'),
  (2, 'Bumi Manusia', 'Pramoedya Ananta Toer', 'novel', 'https://res.cloudinary.com/dyr6flyz3/image/upload/w_1024,c_limit,q_auto,f_auto/v1775011028/d6dn3dcafg4znx8iyph0.jpg', 1, '2025-12-22 13:31:28'),
  (3, 'Filosofi Teras', 'Henry Manampiring', 'motivation', 'https://res.cloudinary.com/dyr6flyz3/image/upload/w_1024,c_limit,q_auto,f_auto/v1775011028/fcjg2onsklgegxaalwl5.jpg', 3, '2025-12-22 13:31:28'),
  (4, 'Atomic Habits', 'James Clear', 'motivation', 'https://res.cloudinary.com/dyr6flyz3/image/upload/w_1024,c_limit,q_auto,f_auto/v1775011029/kua5ujrarurbjvirymby.jpg', 2, '2025-12-22 13:31:28'),
  (5, 'Muhammad Al-Fatih', 'Felix Siauw', 'islamic-history', 'https://res.cloudinary.com/dyr6flyz3/image/upload/w_1024,c_limit,q_auto,f_auto/v1775011040/ishhgcrphktucqpzofaa.jpg', 2, '2025-12-22 13:31:28'),
  (6, 'iziin', 'Muhammad jannah', 'novel', 'https://res.cloudinary.com/dyr6flyz3/image/upload/w_1024,c_limit,q_auto,f_auto/v1775011030/zac2azffs9dpp8jpvign.svg', 1, '2025-12-23 01:45:04'),
  (7, 'makan', 'makan', 'why?', 'https://res.cloudinary.com/dyr6flyz3/image/upload/w_1024,c_limit,q_auto,f_auto/v1775011041/lqyy9osusrhoishso3vx.png', 0, '2025-12-23 07:23:42'),
  (13, 'Start With Why', 'Simon Sinek', 'why', 'https://res.cloudinary.com/dyr6flyz3/image/upload/w_1024,c_limit,q_auto,f_auto/v1775011033/u6oskyfwvpxqemiysfah.jpg', 3, '2025-12-23 07:29:49'),
  (14, 'Thinking Fast and Slow', 'Daniel Kahneman', 'why', 'https://res.cloudinary.com/dyr6flyz3/image/upload/w_1024,c_limit,q_auto,f_auto/v1775011034/dhc4kempbk7k3njdb49g.jpg', 2, '2025-12-23 07:29:49'),
  (15, 'Sapiens', 'Yuval Noah Harari', 'why', 'https://res.cloudinary.com/dyr6flyz3/image/upload/w_1024,c_limit,q_auto,f_auto/v1775011035/ozn4bj2xz2eneddjj2ss.jpg', 4, '2025-12-23 07:29:49'),
  (19, 'Atomic Habits', 'James Clear', 'self-motivation', 'https://res.cloudinary.com/dyr6flyz3/image/upload/w_1024,c_limit,q_auto,f_auto/v1775011036/n5owltqtqytyenzag1ov.jpg', 6, '2025-12-23 07:29:49'),
  (20, 'The 7 Habits of Highly Effective People', 'Stephen Covey', 'self-motivation', 'https://res.cloudinary.com/dyr6flyz3/image/upload/w_1024,c_limit,q_auto,f_auto/v1775011037/qeiyndsaz5wsbcbfw3pf.jpg', 4, '2025-12-23 07:29:49'),
  (21, 'Mindset', 'Carol Dweck', 'self-motivation', 'https://res.cloudinary.com/dyr6flyz3/image/upload/w_1024,c_limit,q_auto,f_auto/v1775011042/bn58h5cjqxsh2jsq6aj3.jpg', 2, '2025-12-23 07:29:49'),
  (22, 'Rich Dad Poor Dad', 'Robert Kiyosaki', 'self-motivation', 'https://res.cloudinary.com/dyr6flyz3/image/upload/w_1024,c_limit,q_auto,f_auto/v1775011037/shbdxh2a4zmzmys8ghpn.jpg', 5, '2025-12-23 07:29:49'),
  (37, 'Sebuah Seni untuk Bersikap Bodo Amat', 'Mark Manson', 'konsep-hidup', 'https://res.cloudinary.com/dyr6flyz3/image/upload/w_1024,c_limit,q_auto,f_auto/v1775011038/zemdxdonbgiboisku17p.jpg', 3, '2025-12-23 07:29:49'),
  (39, 'Man Search for Meaning', 'Viktor Frankl', 'konsep-hidup', 'https://res.cloudinary.com/dyr6flyz3/image/upload/w_1024,c_limit,q_auto,f_auto/v1775011039/duywqikijrpwskbbqy01.jpg', 3, '2025-12-23 07:29:49');

-- -----------------------------------------------------------------------------
-- Table: tags
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags` (
  `id`          INT           NOT NULL,
  `name`        VARCHAR(100)  NOT NULL,
  `color`       VARCHAR(30)   NOT NULL,
  `created_at`  DATETIME      NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_tags_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tags` (`id`,`name`,`color`,`created_at`) VALUES
  (1, 'Novel', '#ef4444', '2025-12-23 06:45:25'),
  (2, 'History', '#f59e0b', '2025-12-23 06:45:25'),
  (3, 'Motivation', '#3b82f6', '2025-12-23 06:45:25'),
  (4, 'Islamic History', '#10b981', '2025-12-23 06:45:25'),
  (5, 'Science', '#8b5cf6', '2025-12-23 06:45:25'),
  (6, 'Biography', '#ec4899', '2025-12-23 06:45:25'),
  (8, 'Why?', '#8b5cf6', '2025-12-23 06:56:46'),
  (9, 'Konsep Pendidikan', '#3b82f6', '2025-12-23 06:56:46'),
  (10, 'Self Motivation', '#f59e0b', '2025-12-23 06:56:46'),
  (11, 'Islamic Book', '#10b981', '2025-12-23 06:56:46'),
  (13, 'Sejarah', '#d97706', '2025-12-23 06:56:46'),
  (14, 'Buku Belajar Bahasa', '#ec4899', '2025-12-23 06:56:46'),
  (15, 'Buku Konsep Hidup', '#6366f1', '2025-12-23 06:56:46');

-- -----------------------------------------------------------------------------
-- Table: book_tags  (many-to-many pivot)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `book_tags`;
CREATE TABLE `book_tags` (
  `book_id`  INT NOT NULL,
  `tag_id`   INT NOT NULL,
  PRIMARY KEY (`book_id`, `tag_id`),
  CONSTRAINT `fk_bt_book` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bt_tag`  FOREIGN KEY (`tag_id`)  REFERENCES `tags`(`id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `book_tags` (`book_id`,`tag_id`) VALUES
  (1, 1),
  (2, 1),
  (5, 4),
  (6, 1),
  (13, 8),
  (14, 8),
  (15, 8),
  (19, 10),
  (20, 10),
  (21, 10),
  (22, 10),
  (37, 15),
  (39, 2),
  (39, 8),
  (39, 15);

-- -----------------------------------------------------------------------------
-- Table: loans
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `loans`;
CREATE TABLE `loans` (
  `id`             VARCHAR(36)  NOT NULL,
  `user_id`        VARCHAR(36)  NOT NULL,
  `book_id`        INT          NOT NULL,
  `borrow_date`    DATETIME     NOT NULL,
  `due_date`       DATETIME     NOT NULL,
  `return_date`    DATETIME     DEFAULT NULL,
  `status`         ENUM('borrowed','returned','overdue') NOT NULL DEFAULT 'borrowed',
  `renewal_count`  INT          NOT NULL DEFAULT 0,
  `created_at`     DATETIME     NOT NULL,
  `fine_amount`    INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_loans_user` (`user_id`),
  KEY `idx_loans_book` (`book_id`),
  KEY `idx_loans_status` (`status`),
  CONSTRAINT `fk_loans_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_loans_book` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `loans` (`id`,`user_id`,`book_id`,`borrow_date`,`due_date`,`return_date`,`status`,`renewal_count`,`created_at`,`fine_amount`) VALUES
  ('7808ca52-f1ee-429d-b9fc-65097f90cffc', 'cdc1b3eb-ca73-41b1-beb5-80fcd026730e', 1, '2025-12-22 15:31:25', '2025-12-27 15:31:25', '2026-01-13 01:53:10', 'returned', 0, '2025-12-22 15:31:25', 0),
  ('24dd62b2-bc25-42bb-820b-e27455a88cca', 'cdc1b3eb-ca73-41b1-beb5-80fcd026730e', 2, '2025-12-23 02:35:46', '2025-12-28 02:35:46', '2026-01-13 01:53:12', 'returned', 0, '2025-12-23 02:35:46', 0),
  ('82955697-da0c-43e3-965f-4e9fb76d3691', 'cdc1b3eb-ca73-41b1-beb5-80fcd026730e', 6, '2025-12-23 07:22:32', '2025-12-28 07:22:32', '2026-01-13 01:53:13', 'returned', 0, '2025-12-23 07:22:32', 0),
  ('a0d2cebb-558e-4783-b3ed-f10b009577fa', 'cdc1b3eb-ca73-41b1-beb5-80fcd026730e', 5, '2026-01-19 03:43:09', '2026-02-13 03:43:09', '2026-01-23 01:35:17', 'returned', 4, '2026-01-19 03:43:09', 0),
  ('955f9a89-4c6b-43a7-80b4-b2f1474e3272', '7aa3e070-e7fb-4795-a464-30fbe26eef05', 2, '2026-02-25 02:14:41', '2026-03-02 02:14:41', NULL, 'borrowed', 0, '2026-02-25 02:14:41', 0),
  ('7b19065a-8a6f-43c9-827b-778a0a1ca7ba', '7aa3e070-e7fb-4795-a464-30fbe26eef05', 3, '2026-02-25 02:15:21', '2026-03-02 02:15:21', NULL, 'borrowed', 0, '2026-02-25 02:15:21', 0),
  ('d122cd72-d6b0-48f7-9a0e-36359b74bd9b', '7aa3e070-e7fb-4795-a464-30fbe26eef05', 7, '2026-02-25 02:15:58', '2026-03-02 02:15:58', NULL, 'borrowed', 0, '2026-02-25 02:15:58', 0),
  ('3d8c24bf-0a04-4d03-b1de-9ecfdf56625f', '7aa3e070-e7fb-4795-a464-30fbe26eef05', 21, '2026-02-25 02:16:24', '2026-03-02 02:16:24', NULL, 'borrowed', 0, '2026-02-25 02:16:24', 0);

-- -----------------------------------------------------------------------------
-- Table: donations
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `donations`;
CREATE TABLE `donations` (
  `id`           VARCHAR(36)   NOT NULL,
  `donor_name`   VARCHAR(255)  NOT NULL,
  `whatsapp`     VARCHAR(20)   NOT NULL,
  `book_count`   INT           NOT NULL DEFAULT 1,
  `book_titles`  TEXT          NOT NULL,
  `status`       ENUM('pending','contacted','received','rejected') NOT NULL DEFAULT 'pending',
  `created_at`   DATETIME      NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_donations_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `donations` (`id`,`donor_name`,`whatsapp`,`book_count`,`book_titles`,`status`,`created_at`) VALUES
  ('fa6e164e-a595-43b6-983a-cc4e0b6b34cf', 'iziin', '083456543234', 2, '1.maan\n2. iziin', 'contacted', '2025-12-23 12:41:36'),
  ('38f84f4f-b5c2-4889-b382-8208b3c20944', 'Jamal Skibidi', '0817273647383', 1, 'Sunset bersama Ijim', 'pending', '2026-01-19 03:52:12'),
  ('9751e68b-ee9e-4c70-a549-fb17cc1a395b', 'MAMAN', '08224567809', 3, '1. MANAN\n2. IKAN (2)', 'pending', '2026-01-21 02:17:56');

-- -----------------------------------------------------------------------------
-- Table: feedback
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `feedback`;
CREATE TABLE `feedback` (
  `id`          VARCHAR(36)   NOT NULL,
  `name`        VARCHAR(255)  NOT NULL,
  `email`       VARCHAR(255)  NOT NULL,
  `message`     TEXT          NOT NULL,
  `is_read`     TINYINT(1)    NOT NULL DEFAULT 0,
  `created_at`  DATETIME      NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_feedback_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `feedback` (`id`,`name`,`email`,`message`,`is_read`,`created_at`) VALUES
  ('a44eef08-c76e-4a09-8989-221fd5adb229', 'iziim', 'manan@gmail.com', 'tes aja', 0, '2026-01-13 02:35:15'),
  ('266986d8-fa9b-4241-b5a0-ff037dbc4bcf', 'manan', 'manan@gmail.com', 'ASIK', 0, '2026-01-13 02:44:08'),
  ('9b89cdf9-938b-4d55-9b7a-dcc5500cedea', 'manan', 'manan@gmail.com', 'Nggak Ada Yg Kurang , Perfect', 1, '2026-01-19 03:53:26');

SET FOREIGN_KEY_CHECKS = 1;

-- End of backup — Salahuddin Library
