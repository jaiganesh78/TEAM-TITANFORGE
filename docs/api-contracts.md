# API Contracts Documentation

All requests and responses use JSON and contain a correlation ID header (`x-correlation-id`).

## Authentication Endpoints

### 1. Register Account
- **Endpoint**: `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "name": "Jai Ganesh",
    "email": "jai@titanforge.com",
    "password": "securepassword123",
    "organizationName": "TitanForge Core"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "user-uuid-123",
        "name": "Jai Ganesh",
        "email": "jai@titanforge.com",
        "role": "OWNER",
        "organizationId": "org-uuid-456",
        "createdAt": "2026-07-04T17:29:43.000Z"
      },
      "accessToken": "eyJhbGciOi..."
    },
    "correlationId": "correlation-uuid"
  }
  ```

### 2. Login Account
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "jai@titanforge.com",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK)**: Sets an HttpOnly cookie `refreshToken` and returns the access token.

---

## Organization Endpoints

### 1. Get Details
- **Endpoint**: `GET /api/organization`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**: Returns the organization properties and list of users.

### 2. Update Details
- **Endpoint**: `PUT /api/organization`
- **Role Guard**: `OWNER` or `ADMIN`
- **Request Body**:
  ```json
  {
    "name": "TitanForge Software LLC"
  }
  ```
- **Response (200 OK)**: Returns updated organization info.
