# Database Schema & Relations

This document details the PostgreSQL models generated via Prisma ORM for User management, tenant Organization allocation, Active sessions, and Audit logs.

## Model Schema Relationships

```mermaid
erDiagram
  ORGANIZATION ||--o{ USER : contains
  USER ||--o{ SESSION : owns
  USER ||--o{ AUDIT_LOG : triggers
  ORGANIZATION ||--o{ AUDIT_LOG : tracks

  ORGANIZATION {
    string id PK
    string name
    datetime createdAt
    datetime updatedAt
  }

  USER {
    string id PK
    string email UK
    string passwordHash
    string name
    Role role
    string organizationId FK
    datetime createdAt
    datetime updatedAt
  }

  SESSION {
    string id PK
    string userId FK
    string token UK
    datetime expiresAt
    boolean revoked
    datetime createdAt
    datetime updatedAt
  }

  AUDIT_LOG {
    string id PK
    string userId FK
    string organizationId FK
    string action
    string details
    string ipAddress
    string correlationId
    datetime createdAt
  }
```

## Enum Definitions
- **`Role`**:
  - `OWNER`: Workspace root/billing admin.
  - `ADMIN`: User management and settings manager.
  - `MANAGER`: Operations manager, simulation reviewer.
  - `MEMBER`: Read-only viewer, document uploader.
