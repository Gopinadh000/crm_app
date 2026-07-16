<migration-script id="000_create_migration_history">
CREATE TABLE IF NOT EXISTS migration_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  migration_id VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
</migration-script>

<migration-script id="001_create_users_table">
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
  company_name VARCHAR(100) NULL,
  refresh_token TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role)
) AUTO_INCREMENT = 1000;
</migration-script>

<migration-script id="002_create_contacts_table">
CREATE TABLE IF NOT EXISTS contacts (
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NULL,
  phone VARCHAR(30) NULL,
  company_name VARCHAR(100) NULL,
  job_title VARCHAR(100) NULL,
  status ENUM('Lead', 'Prospect', 'Customer') NOT NULL DEFAULT 'Lead',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_contacts_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  INDEX idx_contacts_user_id (user_id),
  INDEX idx_contacts_email (email),
  INDEX idx_contacts_status (status)
) AUTO_INCREMENT = 1000;
</migration-script>

<migration-script id="003_create_userimages_table">
CREATE TABLE IF NOT EXISTS userimages (
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  contact_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  image_blob LONGBLOB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_userimages_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_userimages_contact
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_userimages_contact_id (contact_id),
  INDEX idx_userimages_user_id (user_id)
) AUTO_INCREMENT = 1000;
</migration-script>

<migration-script id="004_create_activity_logs_table">
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INT NULL,
  description VARCHAR(500) NOT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_logs_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  INDEX idx_activity_logs_user_id (user_id),
  INDEX idx_activity_logs_created_at (created_at),
  INDEX idx_activity_logs_action (action)
) AUTO_INCREMENT = 1000;
</migration-script>

<migration-script id="005_users_add_role_if_missing">
-- No-op when role already exists (e.g. created by 001_create_users_table).
-- migrate.js skips / ignores ER_DUP_FIELDNAME for this migration id.
ALTER TABLE users
  ADD COLUMN role ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER' AFTER password;
</migration-script>
