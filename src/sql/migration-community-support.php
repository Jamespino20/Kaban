<?php
declare(strict_types=1);

define('_AGAPAY', true);
defined('BASE_PATH') or define('BASE_PATH', dirname(__DIR__));

require_once __DIR__ . '/../includes/lib/Database.php';
require_once __DIR__ . '/../includes/lib/helpers.php';

$config = require __DIR__ . '/../includes/config/config.php';
Database::init($config['db']);

echo "Migrating Community & Support tables...\n";

try {
    // ── conversations ──
    Database::execute("CREATE TABLE IF NOT EXISTS conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT NOT NULL,
        type ENUM('direct', 'operator_room', 'group_chat') DEFAULT 'direct',
        name VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "  ✓ conversations\n";

    // ── conversation_participants ──
    Database::execute("CREATE TABLE IF NOT EXISTS conversation_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        conversation_id INT NOT NULL,
        user_id INT NOT NULL,
        last_read_at TIMESTAMP NULL,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "  ✓ conversation_participants\n";

    // ── messages ──
    Database::execute("CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        conversation_id INT NOT NULL,
        sender_id INT NOT NULL,
        content TEXT NULL,
        reply_to_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "  ✓ messages\n";

    // Add index for messages
    Database::raw("ALTER TABLE messages ADD INDEX idx_conversation_created (conversation_id, created_at DESC)");
    echo "  ✓ messages index\n";

    // ── message_reactions ──
    Database::execute("CREATE TABLE IF NOT EXISTS message_reactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        message_id INT NOT NULL,
        user_id INT NOT NULL,
        emoji VARCHAR(50) NOT NULL,
        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "  ✓ message_reactions\n";

    // ── message_attachments ──
    Database::execute("CREATE TABLE IF NOT EXISTS message_attachments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        message_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(100) NOT NULL,
        file_data LONGBLOB NULL,
        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "  ✓ message_attachments\n";

    // ── support_tickets ──
    Database::execute("CREATE TABLE IF NOT EXISTS support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT NOT NULL,
        user_id INT NOT NULL,
        category VARCHAR(100) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL,
        FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "  ✓ support_tickets\n";

    // ── ticket_replies ──
    Database::execute("CREATE TABLE IF NOT EXISTS ticket_replies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "  ✓ ticket_replies\n";

    // ── feedback_entries ──
    Database::execute("CREATE TABLE IF NOT EXISTS feedback_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT NOT NULL,
        user_id INT NOT NULL,
        category VARCHAR(100) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('pending', 'reviewed', 'acknowledged') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "  ✓ feedback_entries\n";

    // ── notifications ──
    Database::execute("CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        tenant_id INT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        body TEXT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "  ✓ notifications\n";

    // ── notification_preferences ──
    Database::execute("CREATE TABLE IF NOT EXISTS notification_preferences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        tenant_id INT NULL,
        preference_key VARCHAR(100) NOT NULL,
        enabled TINYINT(1) DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "  ✓ notification_preferences\n";

    echo "\n✓ All Community & Support tables are ready.\n";

} catch (\Throwable $e) {
    echo "ERROR: {$e->getMessage()}\n{$e->getFile()}:{$e->getLine()}\n";
    exit(1);
}
