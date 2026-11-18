# CMS Database Design

## 1. Database Overview

Database Name: cms_db
Database System: MySQL

The database is designed to support the Content Management System (CMS), including asset metadata management, advanced search and retrieval, access control and permissions, and asset versioning and history.

## 2. Database Tables

| Table             | Purpose                             |
| ----------------- | ----------------------------------- |
| roles             | Stores system roles                 |
| users             | Stores user account details         |
| permissions       | Stores available permissions        |
| role_permissions  | Maps roles to permissions           |
| categories        | Stores asset categories             |
| assets            | Stores media asset metadata         |
| tags              | Stores searchable tags              |
| asset_tags        | Maps assets to tags                 |
| asset_versions    | Maintains asset version history     |
| activity_logs     | Records user activities             |
| asset_permissions | Stores individual asset permissions |

## 3. Relationships

- One role can have multiple users.
- One role can have multiple permissions through role_permissions.
- One category can contain multiple assets.
- One user can create multiple assets.
- One asset can have multiple tags, and one tag can belong to multiple assets.
- One asset can have multiple versions.
- One user can perform multiple activities.
- One asset can have multiple activity records.
- One asset can have multiple individual permissions.

## 4. Database Constraints

- Primary keys uniquely identify records.
- Foreign keys maintain referential integrity.
- Unique constraints prevent duplicate emails, role names and tag names.
- NOT NULL constraints enforce mandatory fields.
- Indexes improve lookup and search performance.

## 5. Sample Data

The database contains sample records for:

- 3 roles
- 10 users
- 12 permissions
- 10 categories
- 15 tags
- 50 assets
- 100 asset-tag associations
- 50 asset versions
- 50 activity records
- 30 asset permissions

## 6. Technology

MySQL is used as the relational database.
Spring Boot with Spring Data JPA will provide backend database connectivity.
React will consume backend REST APIs.
