/**
 * firebase_to_sql.mjs
 * Generates a MySQL SQL backup from firebase_data.json
 * Includes all Cloudinary URLs embedded as TEXT fields
 *
 * Usage: node firebase_to_sql.mjs
 * Output: salahuddin_library_backup_<timestamp>.sql
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Load data ────────────────────────────────────────────────────────────────
const dataPath = path.join(__dirname, 'apps', 'frontend', 'firebase_data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// ── Helpers ──────────────────────────────────────────────────────────────────
const esc = (val) => {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? '1' : '0';
  if (typeof val === 'number') return String(val);
  const str = String(val)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
  return `'${str}'`;
};

const fmtDate = (iso) => {
  if (!iso) return 'NULL';
  // Ambil hanya bagian datetime (hapus timezone offset)
  const clean = iso.replace('T', ' ').substring(0, 19);
  return `'${clean}'`;
};

// ── SQL Header ───────────────────────────────────────────────────────────────
const now = new Date().toISOString();
let sql = `-- =============================================================================
-- Salahuddin Library — SQL Backup
-- Generated  : ${now}
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

`;

// ═══════════════════════════════════════════════════════════════════════════
// TABLE: users
// ═══════════════════════════════════════════════════════════════════════════
sql += `-- -----------------------------------------------------------------------------
-- Table: users
-- Note : avatar_url & ktp_url are Cloudinary CDN URLs
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS \`users\`;
CREATE TABLE \`users\` (
  \`id\`              VARCHAR(36)   NOT NULL,
  \`email\`           VARCHAR(255)  NOT NULL,
  \`name\`            VARCHAR(255)  NOT NULL,
  \`role\`            ENUM('admin','member') NOT NULL DEFAULT 'member',
  \`avatar_url\`      TEXT          DEFAULT NULL COMMENT 'Cloudinary URL',
  \`join_date\`       DATETIME      NOT NULL,
  \`donated_books\`   INT           NOT NULL DEFAULT 0,
  \`member_status\`   ENUM('non-member','pending','approved','verified') NOT NULL DEFAULT 'non-member',
  \`ktp_url\`         TEXT          DEFAULT NULL COMMENT 'Cloudinary URL',
  \`payment_status\`  ENUM('unpaid','paid') NOT NULL DEFAULT 'unpaid',
  \`payment_date\`    DATETIME      DEFAULT NULL,
  \`has_unpaid_fine\` TINYINT(1)    NOT NULL DEFAULT 0,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_users_email\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

const users = Object.values(data.users);
if (users.length > 0) {
  const rows = users.map(u =>
    `  (${esc(u.id)}, ${esc(u.email)}, ${esc(u.name)}, ${esc(u.role)}, ` +
    `${esc(u.avatar_url)}, ${fmtDate(u.join_date)}, ${u.donated_books}, ` +
    `${esc(u.member_status)}, ${esc(u.ktp_url)}, ${esc(u.payment_status)}, ` +
    `${fmtDate(u.payment_date)}, ${u.has_unpaid_fine ? 1 : 0})`
  );
  sql += `INSERT INTO \`users\` (\`id\`,\`email\`,\`name\`,\`role\`,\`avatar_url\`,\`join_date\`,\`donated_books\`,\`member_status\`,\`ktp_url\`,\`payment_status\`,\`payment_date\`,\`has_unpaid_fine\`) VALUES\n`;
  sql += rows.join(',\n') + ';\n\n';
}

// ═══════════════════════════════════════════════════════════════════════════
// TABLE: books
// ═══════════════════════════════════════════════════════════════════════════
sql += `-- -----------------------------------------------------------------------------
-- Table: books
-- Note : cover field is a Cloudinary CDN URL
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS \`books\`;
CREATE TABLE \`books\` (
  \`id\`          INT           NOT NULL,
  \`title\`       VARCHAR(500)  NOT NULL,
  \`author\`      VARCHAR(255)  NOT NULL,
  \`category\`    VARCHAR(100)  NOT NULL,
  \`cover\`       TEXT          DEFAULT NULL COMMENT 'Cloudinary URL',
  \`stock\`       INT           NOT NULL DEFAULT 0,
  \`created_at\`  DATETIME      NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_books_category\` (\`category\`),
  KEY \`idx_books_author\` (\`author\`(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

const books = Object.values(data.books);
if (books.length > 0) {
  const rows = books.map(b =>
    `  (${b.id}, ${esc(b.title)}, ${esc(b.author)}, ${esc(b.category)}, ` +
    `${esc(b.cover)}, ${b.stock}, ${fmtDate(b.created_at)})`
  );
  sql += `INSERT INTO \`books\` (\`id\`,\`title\`,\`author\`,\`category\`,\`cover\`,\`stock\`,\`created_at\`) VALUES\n`;
  sql += rows.join(',\n') + ';\n\n';
}

// ═══════════════════════════════════════════════════════════════════════════
// TABLE: tags
// ═══════════════════════════════════════════════════════════════════════════
sql += `-- -----------------------------------------------------------------------------
-- Table: tags
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS \`tags\`;
CREATE TABLE \`tags\` (
  \`id\`          INT           NOT NULL,
  \`name\`        VARCHAR(100)  NOT NULL,
  \`color\`       VARCHAR(30)   NOT NULL,
  \`created_at\`  DATETIME      NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_tags_name\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

const tags = Object.values(data.tags);
if (tags.length > 0) {
  const rows = tags.map(t =>
    `  (${t.id}, ${esc(t.name)}, ${esc(t.color)}, ${fmtDate(t.created_at)})`
  );
  sql += `INSERT INTO \`tags\` (\`id\`,\`name\`,\`color\`,\`created_at\`) VALUES\n`;
  sql += rows.join(',\n') + ';\n\n';
}

// ═══════════════════════════════════════════════════════════════════════════
// TABLE: book_tags  (pivot)
// ═══════════════════════════════════════════════════════════════════════════
sql += `-- -----------------------------------------------------------------------------
-- Table: book_tags  (many-to-many pivot)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS \`book_tags\`;
CREATE TABLE \`book_tags\` (
  \`book_id\`  INT NOT NULL,
  \`tag_id\`   INT NOT NULL,
  PRIMARY KEY (\`book_id\`, \`tag_id\`),
  CONSTRAINT \`fk_bt_book\` FOREIGN KEY (\`book_id\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_bt_tag\`  FOREIGN KEY (\`tag_id\`)  REFERENCES \`tags\`(\`id\`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

const btRows = [];
for (const [bookId, tagMap] of Object.entries(data.book_tags || {})) {
  for (const tagId of Object.keys(tagMap)) {
    btRows.push(`  (${bookId}, ${tagId})`);
  }
}
if (btRows.length > 0) {
  sql += `INSERT INTO \`book_tags\` (\`book_id\`,\`tag_id\`) VALUES\n`;
  sql += btRows.join(',\n') + ';\n\n';
}

// ═══════════════════════════════════════════════════════════════════════════
// TABLE: loans
// ═══════════════════════════════════════════════════════════════════════════
sql += `-- -----------------------------------------------------------------------------
-- Table: loans
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS \`loans\`;
CREATE TABLE \`loans\` (
  \`id\`             VARCHAR(36)  NOT NULL,
  \`user_id\`        VARCHAR(36)  NOT NULL,
  \`book_id\`        INT          NOT NULL,
  \`borrow_date\`    DATETIME     NOT NULL,
  \`due_date\`       DATETIME     NOT NULL,
  \`return_date\`    DATETIME     DEFAULT NULL,
  \`status\`         ENUM('borrowed','returned','overdue') NOT NULL DEFAULT 'borrowed',
  \`renewal_count\`  INT          NOT NULL DEFAULT 0,
  \`created_at\`     DATETIME     NOT NULL,
  \`fine_amount\`    INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (\`id\`),
  KEY \`idx_loans_user\` (\`user_id\`),
  KEY \`idx_loans_book\` (\`book_id\`),
  KEY \`idx_loans_status\` (\`status\`),
  CONSTRAINT \`fk_loans_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_loans_book\` FOREIGN KEY (\`book_id\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

const loans = Object.values(data.loans);
if (loans.length > 0) {
  const rows = loans.map(l =>
    `  (${esc(l.id)}, ${esc(l.user_id)}, ${l.book_id}, ` +
    `${fmtDate(l.borrow_date)}, ${fmtDate(l.due_date)}, ${fmtDate(l.return_date)}, ` +
    `${esc(l.status)}, ${l.renewal_count}, ${fmtDate(l.created_at)}, ${l.fine_amount})`
  );
  sql += `INSERT INTO \`loans\` (\`id\`,\`user_id\`,\`book_id\`,\`borrow_date\`,\`due_date\`,\`return_date\`,\`status\`,\`renewal_count\`,\`created_at\`,\`fine_amount\`) VALUES\n`;
  sql += rows.join(',\n') + ';\n\n';
}

// ═══════════════════════════════════════════════════════════════════════════
// TABLE: donations
// ═══════════════════════════════════════════════════════════════════════════
sql += `-- -----------------------------------------------------------------------------
-- Table: donations
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS \`donations\`;
CREATE TABLE \`donations\` (
  \`id\`           VARCHAR(36)   NOT NULL,
  \`donor_name\`   VARCHAR(255)  NOT NULL,
  \`whatsapp\`     VARCHAR(20)   NOT NULL,
  \`book_count\`   INT           NOT NULL DEFAULT 1,
  \`book_titles\`  TEXT          NOT NULL,
  \`status\`       ENUM('pending','contacted','received','rejected') NOT NULL DEFAULT 'pending',
  \`created_at\`   DATETIME      NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_donations_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

const donations = Object.values(data.donations);
if (donations.length > 0) {
  const rows = donations.map(d =>
    `  (${esc(d.id)}, ${esc(d.donor_name)}, ${esc(d.whatsapp)}, ${d.book_count}, ` +
    `${esc(d.book_titles)}, ${esc(d.status)}, ${fmtDate(d.created_at)})`
  );
  sql += `INSERT INTO \`donations\` (\`id\`,\`donor_name\`,\`whatsapp\`,\`book_count\`,\`book_titles\`,\`status\`,\`created_at\`) VALUES\n`;
  sql += rows.join(',\n') + ';\n\n';
}

// ═══════════════════════════════════════════════════════════════════════════
// TABLE: feedback
// ═══════════════════════════════════════════════════════════════════════════
sql += `-- -----------------------------------------------------------------------------
-- Table: feedback
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS \`feedback\`;
CREATE TABLE \`feedback\` (
  \`id\`          VARCHAR(36)   NOT NULL,
  \`name\`        VARCHAR(255)  NOT NULL,
  \`email\`       VARCHAR(255)  NOT NULL,
  \`message\`     TEXT          NOT NULL,
  \`is_read\`     TINYINT(1)    NOT NULL DEFAULT 0,
  \`created_at\`  DATETIME      NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_feedback_is_read\` (\`is_read\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

const feedbacks = Object.values(data.feedback);
if (feedbacks.length > 0) {
  const rows = feedbacks.map(f =>
    `  (${esc(f.id)}, ${esc(f.name)}, ${esc(f.email)}, ${esc(f.message)}, ` +
    `${f.is_read ? 1 : 0}, ${fmtDate(f.created_at)})`
  );
  sql += `INSERT INTO \`feedback\` (\`id\`,\`name\`,\`email\`,\`message\`,\`is_read\`,\`created_at\`) VALUES\n`;
  sql += rows.join(',\n') + ';\n\n';
}

// ── Footer ───────────────────────────────────────────────────────────────────
sql += `SET FOREIGN_KEY_CHECKS = 1;\n\n-- End of backup — Salahuddin Library\n`;

// ── Write file ───────────────────────────────────────────────────────────────
const timestamp = now.replace(/[:.]/g, '-').substring(0, 19);
const outFile = path.join(__dirname, `salahuddin_library_backup_${timestamp}.sql`);
fs.writeFileSync(outFile, sql, 'utf-8');

console.log(`✅ SQL backup berhasil dibuat!`);
console.log(`📁 File: ${outFile}`);
console.log(`📊 Summary:`);
console.log(`   - users    : ${users.length} records`);
console.log(`   - books    : ${books.length} records`);
console.log(`   - tags     : ${tags.length} records`);
console.log(`   - book_tags: ${btRows.length} relations`);
console.log(`   - loans    : ${loans.length} records`);
console.log(`   - donations: ${donations.length} records`);
console.log(`   - feedback : ${feedbacks.length} records`);
