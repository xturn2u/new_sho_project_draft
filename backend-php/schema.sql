-- AIshopr MySQL/MariaDB schema blueprint
-- Charset: utf8mb4

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(190) DEFAULT '',
  role ENUM('admin','user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(80) PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  icon VARCHAR(32) DEFAULT '📦',
  sort_order INT DEFAULT 0,
  status ENUM('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(120) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  hook VARCHAR(255) DEFAULT '',
  cat VARCHAR(80) NOT NULL,
  price VARCHAR(80) DEFAULT '',
  price_value DECIMAL(10,2) DEFAULT 0,
  fit INT DEFAULT 70,
  image_url TEXT,
  affiliate_url TEXT,
  merchant_name VARCHAR(190) DEFAULT '',
  problem TEXT,
  solution TEXT,
  pros JSON NULL,
  cons JSON NULL,
  notfor JSON NULL,
  watch JSON NULL,
  sponsored TINYINT(1) DEFAULT 0,
  status ENUM('active','inactive') DEFAULT 'active',
  priority INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_cat (cat),
  INDEX idx_products_status (status),
  INDEX idx_products_sponsored (sponsored)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(120) PRIMARY KEY,
  setting_value JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(120) NOT NULL,
  url TEXT,
  merchant_name VARCHAR(190) DEFAULT '',
  user_id BIGINT UNSIGNED NULL,
  session_id VARCHAR(190) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_clicks_product (product_id),
  INDEX idx_clicks_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS swipe_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(120) NOT NULL,
  action ENUM('yes','no','save','notInterested','buy') NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  session_id VARCHAR(190) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_swipes_product (product_id),
  INDEX idx_swipes_action (action),
  INDEX idx_swipes_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
