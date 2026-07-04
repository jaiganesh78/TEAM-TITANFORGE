# API Design Specifications

This document defines the REST API surface for the Business Growth Operating System (BGOS), detailing request-response payloads, status codes, and security.

---

## 🔒 Authentication Routes

### 1. Register User
* **Method & Path**: `POST /api/v1/auth/register`
* **Request Payload**:
  ```json
  {
    "email": "exec@company.com",
    "password": "strongpassword123",
    "full_name": "Jane Doe"
  }
  ```
* **Response Payload (201 Created)**:
  ```json
  {
    "id": "u17d84-...",
    "email": "exec@company.com",
    "full_name": "Jane Doe"
  }
  ```

### 2. Login User
* **Method & Path**: `POST /api/v1/auth/token`
* **Request Payload**:
  ```json
  {
    "username": "exec@company.com",
    "password": "strongpassword123"
  }
  ```
* **Response Payload (200 OK)**:
  ```json
  {
    "access_token": "jwt_token_here",
    "token_type": "bearer"
  }
  ```

---

## 🔎 Discovery & Onboarding Routes

### 1. Ingest URL (Discover)
* **Method & Path**: `POST /api/v1/discovery/ingest`
* **Headers**: `Authorization: Bearer <JWT>`
* **Request Payload**:
  ```json
  {
    "company_name": "Acme SaaS",
    "website_url": "https://acmesaas.com"
  }
  ```
* **Response Payload (202 Accepted)**:
  ```json
  {
    "task_id": "scrape_task_982",
    "status": "PROCESSING",
    "message": "URL scraping initiated."
  }
  ```

### 2. Retrieve Investigation Questions (Design)
* **Method & Path**: `GET /api/v1/discovery/questions`
* **Headers**: `Authorization: Bearer <JWT>`
* **Query Parameters**: `business_id=<UUID>`
* **Response Payload (200 OK)**:
  ```json
  {
    "questions": [
      {
        "id": "q_001",
        "dimension": "financials",
        "question_text": "What is your average Customer Acquisition Cost (CAC)?"
      }
    ]
  }
  ```

---

## 🤖 Agentic & Analytical Execution Routes

### 1. Trigger Executive Planning (Deliver)
* **Method & Path**: `POST /api/v1/analysis/execute`
* **Headers**: `Authorization: Bearer <JWT>`
* **Request Payload**:
  ```json
  {
    "business_id": "b182-...",
    "goal": "Increase monthly recurring revenue by 15% in Q3"
  }
  ```
* **Response Payload (200 OK)**:
  ```json
  {
    "strategy_id": "s998-...",
    "status": "COMPLETED",
    "summary": "Marketing expansion through organic SEO approved. Budget limits strictly enforced."
  }
  ```

---

## 📊 Dashboard & Recommendation Routes

### 1. Get Dashboard Telemetry
* **Method & Path**: `GET /api/v1/dashboard/metrics`
* **Headers**: `Authorization: Bearer <JWT>`
* **Query Parameters**: `business_id=<UUID>`
* **Response Payload (200 OK)**:
  ```json
  {
    "metrics": [
      { "name": "MRR", "value": 45000.0, "change_percentage": 5.4 },
      { "name": "CAC", "value": 120.0, "change_percentage": -2.1 }
    ]
  }
  ```

### 2. Upload Knowledge File
* **Method & Path**: `POST /api/v1/knowledge/upload`
* **Headers**: `Authorization: Bearer <JWT>`
* **Request Content**: `multipart/form-data` (keys: `file`, `access_level`, `business_id`)
* **Response Payload (201 Created)**:
  ```json
  {
    "document_id": "d774-...",
    "filename": "q2_marketing_metrics.pdf",
    "status": "INDEXED"
  }
  ```
