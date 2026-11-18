
-- ============================================
-- J26: CONTENT MANAGEMENT SYSTEM (CMS)
-- Database: MySQL
-- Part 1: User Management and Access Control
-- ============================================

USE cms_db;

-- 1. ROLES
CREATE TABLE IF NOT EXISTS roles (
    role_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(15),
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(role_id),

    CONSTRAINT chk_user_status
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),

    INDEX idx_users_role (role_id),
    INDEX idx_users_name (full_name)
) ENGINE=InnoDB;


-- 3. PERMISSIONS
CREATE TABLE IF NOT EXISTS permissions (
    permission_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    permission_key VARCHAR(100) NOT NULL UNIQUE,
    module_name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_permissions_module (module_name)
) ENGINE=InnoDB;


-- 4. ROLE_PERMISSIONS
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (role_id, permission_id),

    CONSTRAINT fk_role_permissions_role
        FOREIGN KEY (role_id)
        REFERENCES roles(role_id),

    CONSTRAINT fk_role_permissions_permission
        FOREIGN KEY (permission_id)
        REFERENCES permissions(permission_id),

    INDEX idx_role_permissions_permission (permission_id)
) ENGINE=InnoDB;



-- ============================================
-- PART 2: ASSET MANAGEMENT
-- ============================================

-- 5. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- 6. ASSETS
CREATE TABLE IF NOT EXISTS assets (
    asset_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT,
    created_by BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    asset_type VARCHAR(20) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100),
    file_size_bytes BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_assets_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id),

    CONSTRAINT fk_assets_creator
        FOREIGN KEY (created_by)
        REFERENCES users(user_id),

    CONSTRAINT chk_asset_type
        CHECK (asset_type IN ('IMAGE', 'VIDEO', 'AUDIO')),

    CONSTRAINT chk_asset_status
        CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),

    CONSTRAINT chk_asset_size
        CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),

    INDEX idx_assets_category (category_id),
    INDEX idx_assets_creator (created_by),
    INDEX idx_assets_title (title),
    INDEX idx_assets_type (asset_type),
    INDEX idx_assets_status (status),
    INDEX idx_assets_created (created_at)
) ENGINE=InnoDB;


-- 7. TAGS
CREATE TABLE IF NOT EXISTS tags (
    tag_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tag_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- 8. ASSET_TAGS
CREATE TABLE IF NOT EXISTS asset_tags (
    asset_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,

    PRIMARY KEY (asset_id, tag_id),

    CONSTRAINT fk_asset_tags_asset
        FOREIGN KEY (asset_id)
        REFERENCES assets(asset_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_asset_tags_tag
        FOREIGN KEY (tag_id)
        REFERENCES tags(tag_id)
        ON DELETE CASCADE,

    INDEX idx_asset_tags_tag (tag_id)
) ENGINE=InnoDB;


-- 9. ASSET_VERSIONS
CREATE TABLE IF NOT EXISTS asset_versions (
    version_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id BIGINT NOT NULL,
    version_number INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT,
    change_notes VARCHAR(500),
    uploaded_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_versions_asset
        FOREIGN KEY (asset_id)
        REFERENCES assets(asset_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_versions_user
        FOREIGN KEY (uploaded_by)
        REFERENCES users(user_id),

    CONSTRAINT uq_asset_version
        UNIQUE (asset_id, version_number),

    CONSTRAINT chk_version_number
        CHECK (version_number > 0),

    INDEX idx_versions_asset (asset_id),
    INDEX idx_versions_user (uploaded_by)
) ENGINE=InnoDB;


-- 10. ACTIVITY_LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
    activity_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    asset_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_activity_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_activity_asset
        FOREIGN KEY (asset_id)
        REFERENCES assets(asset_id)
        ON DELETE SET NULL,

    INDEX idx_activity_user (user_id),
    INDEX idx_activity_asset (asset_id),
    INDEX idx_activity_action (action),
    INDEX idx_activity_created (created_at)
) ENGINE=InnoDB;


-- 11. ASSET_PERMISSIONS
CREATE TABLE IF NOT EXISTS asset_permissions (
    asset_permission_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    granted_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_asset_perm_asset
        FOREIGN KEY (asset_id)
        REFERENCES assets(asset_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_asset_perm_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_asset_perm_permission
        FOREIGN KEY (permission_id)
        REFERENCES permissions(permission_id),

    CONSTRAINT fk_asset_perm_granter
        FOREIGN KEY (granted_by)
        REFERENCES users(user_id),

    CONSTRAINT uq_asset_user_permission
        UNIQUE (asset_id, user_id, permission_id),

    INDEX idx_asset_perm_user (user_id),
    INDEX idx_asset_perm_permission (permission_id)
) ENGINE=InnoDB;

