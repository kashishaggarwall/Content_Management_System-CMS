
-- ============================================
-- J26: CONTENT MANAGEMENT SYSTEM
-- Database: cms_db
-- SEED DATA - PART 1: MASTER DATA
-- ============================================

USE cms_db;

-- 1. ROLES
INSERT IGNORE INTO roles (role_id, role_name, description) VALUES
(1, 'ADMIN', 'System administrator with full access'),
(2, 'PRODUCER', 'Creates and manages media assets'),
(3, 'CONTENT_MANAGER', 'Reviews and manages media content');


-- 2. USERS
-- SHA2 values are temporary hashed demo credentials.
-- Replace with BCrypt hashes before Spring Security login.

INSERT IGNORE INTO users
(user_id, role_id, full_name, email, phone, password_hash, status)
VALUES
(1, 1, 'Aarav Sharma', 'admin@cms.com', '9000000001',
 SHA2('CMS_DEMO_PASSWORD', 256), 'ACTIVE'),

(2, 2, 'Priya Verma', 'priya@cms.com', '9000000002',
 SHA2('CMS_DEMO_PASSWORD', 256), 'ACTIVE'),

(3, 3, 'Rohan Mehta', 'rohan@cms.com', '9000000003',
 SHA2('CMS_DEMO_PASSWORD', 256), 'ACTIVE'),

(4, 2, 'Ananya Gupta', 'ananya@cms.com', '9000000004',
 SHA2('CMS_DEMO_PASSWORD', 256), 'ACTIVE'),

(5, 3, 'Karan Malhotra', 'karan@cms.com', '9000000005',
 SHA2('CMS_DEMO_PASSWORD', 256), 'ACTIVE'),

(6, 2, 'Sneha Kapoor', 'sneha@cms.com', '9000000006',
 SHA2('CMS_DEMO_PASSWORD', 256), 'ACTIVE'),

(7, 3, 'Ishita Jain', 'ishita@cms.com', '9000000007',
 SHA2('CMS_DEMO_PASSWORD', 256), 'ACTIVE'),

(8, 2, 'Rahul Singh', 'rahul@cms.com', '9000000008',
 SHA2('CMS_DEMO_PASSWORD', 256), 'ACTIVE'),

(9, 3, 'Neha Agarwal', 'neha@cms.com', '9000000009',
 SHA2('CMS_DEMO_PASSWORD', 256), 'ACTIVE'),

(10, 2, 'Aditya Mishra', 'aditya@cms.com', '9000000010',
 SHA2('CMS_DEMO_PASSWORD', 256), 'INACTIVE');


-- 3. PERMISSIONS
INSERT IGNORE INTO permissions
(permission_id, permission_key, module_name, description)
VALUES
(1, 'USER_MANAGE', 'USER_MANAGEMENT', 'Manage system users'),
(2, 'ROLE_MANAGE', 'USER_MANAGEMENT', 'Manage user roles'),
(3, 'ASSET_CREATE', 'ASSET_MANAGEMENT', 'Create media assets'),
(4, 'ASSET_VIEW', 'ASSET_MANAGEMENT', 'View media assets'),
(5, 'ASSET_UPDATE', 'ASSET_MANAGEMENT', 'Update media assets'),
(6, 'ASSET_DELETE', 'ASSET_MANAGEMENT', 'Delete media assets'),
(7, 'ASSET_SEARCH', 'SEARCH', 'Search and filter assets'),
(8, 'ASSET_PUBLISH', 'ASSET_MANAGEMENT', 'Publish media assets'),
(9, 'VERSION_VIEW', 'VERSIONING', 'View asset versions'),
(10, 'VERSION_CREATE', 'VERSIONING', 'Create new asset versions'),
(11, 'PERMISSION_MANAGE', 'ACCESS_CONTROL', 'Manage asset permissions'),
(12, 'ACTIVITY_VIEW', 'ACTIVITY_LOG', 'View activity history');


-- 4. ROLE_PERMISSIONS
-- ADMIN receives all permissions.
-- PRODUCER receives asset creation and management permissions.
-- CONTENT_MANAGER receives review and retrieval permissions.

INSERT IGNORE INTO role_permissions
(role_id, permission_id)
VALUES
-- ADMIN
(1,1),(1,2),(1,3),(1,4),(1,5),(1,6),
(1,7),(1,8),(1,9),(1,10),(1,11),(1,12),

-- PRODUCER
(2,3),(2,4),(2,5),(2,7),(2,10),(2,9),

-- CONTENT MANAGER
(3,4),(3,5),(3,7),(3,8),(3,9),(3,12);


-- 5. CATEGORIES
INSERT IGNORE INTO categories
(category_id, category_name, description)
VALUES
(1, 'Advertisements', 'Commercial advertisements and campaigns'),
(2, 'Movies', 'Feature films and short films'),
(3, 'Music', 'Music tracks and audio recordings'),
(4, 'Promotional Videos', 'Marketing and promotional videos'),
(5, 'Photography', 'Photographs and photo collections'),
(6, 'Documentaries', 'Documentary media content'),
(7, 'News', 'News reports and media coverage'),
(8, 'Social Media', 'Content created for social platforms'),
(9, 'Educational', 'Educational videos and resources'),
(10, 'Events', 'Event recordings and event photographs');


-- 6. TAGS
INSERT IGNORE INTO tags
(tag_id, tag_name)
VALUES
(1, 'Trending'),
(2, 'Featured'),
(3, 'Marketing'),
(4, 'Entertainment'),
(5, 'Music'),
(6, 'Photography'),
(7, 'HD'),
(8, '4K'),
(9, 'Documentary'),
(10, 'Social Media'),
(11, 'Corporate'),
(12, 'Education'),
(13, 'Campaign'),
(14, 'Lifestyle'),
(15, 'Archived');


-- ============================================
-- PART 2: TRANSACTION DATA
-- 12. ASSETS (50 RECORDS)
-- ============================================

USE cms_db;

INSERT INTO assets
(category_id, created_by, title, description,
 asset_type, file_name, file_path, mime_type,
 file_size_bytes, status, created_at)
WITH RECURSIVE numbers AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM numbers WHERE n < 50
)
SELECT
    MOD(n - 1, 10) + 1,
    MOD(n - 1, 9) + 2,
    CONCAT(
        CASE MOD(n - 1, 10)
            WHEN 0 THEN 'Digital Marketing Campaign'
            WHEN 1 THEN 'Indian Music Festival'
            WHEN 2 THEN 'Corporate Promotion'
            WHEN 3 THEN 'Travel Documentary'
            WHEN 4 THEN 'Product Photography'
            WHEN 5 THEN 'Educational Webinar'
            WHEN 6 THEN 'News Coverage'
            WHEN 7 THEN 'Lifestyle Collection'
            WHEN 8 THEN 'Movie Promotion'
            ELSE 'Annual Event Highlights'
        END,
        ' - ', n
    ),
    CONCAT('Sample CMS media asset number ', n,
           ' for testing and demonstration.'),
    CASE MOD(n - 1, 3)
        WHEN 0 THEN 'IMAGE'
        WHEN 1 THEN 'VIDEO'
        ELSE 'AUDIO'
    END,
    CONCAT('cms_asset_', n,
        CASE MOD(n - 1, 3)
            WHEN 0 THEN '.jpg'
            WHEN 1 THEN '.mp4'
            ELSE '.mp3'
        END),
    CONCAT('/uploads/assets/cms_asset_', n),
    CASE MOD(n - 1, 3)
        WHEN 0 THEN 'image/jpeg'
        WHEN 1 THEN 'video/mp4'
        ELSE 'audio/mpeg'
    END,
    1024000 + (n * 250000),
    CASE MOD(n - 1, 3)
        WHEN 0 THEN 'PUBLISHED'
        WHEN 1 THEN 'DRAFT'
        ELSE 'ARCHIVED'
    END,
    DATE_ADD('2024-01-01', INTERVAL (n - 1) * 15 DAY)
FROM numbers;


-- 13. ASSET_TAGS

INSERT IGNORE INTO asset_tags (asset_id, tag_id)
WITH RECURSIVE numbers AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM numbers WHERE n < 50
)
SELECT n, MOD(n - 1, 15) + 1
FROM numbers

UNION ALL

SELECT n, MOD(n + 4, 15) + 1
FROM numbers;


-- 14. ASSET_VERSIONS

INSERT IGNORE INTO asset_versions
(asset_id, version_number, file_path, file_size_bytes,
 change_notes, uploaded_by, created_at)
SELECT
    asset_id,
    1,
    CONCAT('/uploads/versions/asset_', asset_id, '/v1'),
    file_size_bytes,
    'Initial version uploaded',
    created_by,
    created_at
FROM assets;


-- 15. ACTIVITY_LOGS

INSERT INTO activity_logs
(user_id, asset_id, action, entity_type, details, created_at)
SELECT
    MOD(n - 1, 10) + 1,
    n,
    CASE MOD(n - 1, 5)
        WHEN 0 THEN 'CREATE'
        WHEN 1 THEN 'UPDATE'
        WHEN 2 THEN 'VIEW'
        WHEN 3 THEN 'PUBLISH'
        ELSE 'VERSION_UPLOAD'
    END,
    'ASSET',
    CONCAT('Demo activity performed for asset ', n),
    DATE_ADD('2024-02-01', INTERVAL (n - 1) * 14 DAY)
FROM (
    SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3
    UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
    UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
    UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
    UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
    UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18
    UNION ALL SELECT 19 UNION ALL SELECT 20 UNION ALL SELECT 21
    UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24
    UNION ALL SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27
    UNION ALL SELECT 28 UNION ALL SELECT 29 UNION ALL SELECT 30
    UNION ALL SELECT 31 UNION ALL SELECT 32 UNION ALL SELECT 33
    UNION ALL SELECT 34 UNION ALL SELECT 35 UNION ALL SELECT 36
    UNION ALL SELECT 37 UNION ALL SELECT 38 UNION ALL SELECT 39
    UNION ALL SELECT 40 UNION ALL SELECT 41 UNION ALL SELECT 42
    UNION ALL SELECT 43 UNION ALL SELECT 44 UNION ALL SELECT 45
    UNION ALL SELECT 46 UNION ALL SELECT 47 UNION ALL SELECT 48
    UNION ALL SELECT 49 UNION ALL SELECT 50
) AS numbers;


-- 16. ASSET_PERMISSIONS

INSERT IGNORE INTO asset_permissions
(asset_id, user_id, permission_id, granted_by)
SELECT
    n,
    MOD(n - 1, 9) + 2,
    CASE MOD(n - 1, 3)
        WHEN 0 THEN 4
        WHEN 1 THEN 5
        ELSE 7
    END,
    1
FROM (
    SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3
    UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
    UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
    UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
    UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15
    UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18
    UNION ALL SELECT 19 UNION ALL SELECT 20 UNION ALL SELECT 21
    UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24
    UNION ALL SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27
    UNION ALL SELECT 28 UNION ALL SELECT 29 UNION ALL SELECT 30
) AS numbers;
