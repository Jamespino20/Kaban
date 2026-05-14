-- Platform Configuration Table
-- Stores global platform-level settings (trust weights, risk thresholds, loan defaults, AI config)

CREATE TABLE IF NOT EXISTS `platform_config` (
    `id` INT(11) NOT NULL DEFAULT 1,
    `config_json` LONGTEXT NOT NULL,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `updated_by` INT(11) DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default config row if not exists
INSERT IGNORE INTO `platform_config` (`id`, `config_json`, `updated_at`, `updated_by`)
VALUES (1, '{}', NOW(), NULL);
