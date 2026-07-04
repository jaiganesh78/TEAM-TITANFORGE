# Development Guidelines

This document details environment setup, local execution commands, testing scripts, and git workflows for the Business Growth Operating System (BGOS).

---

## ⚙️ Environment Setup

### Prerequisites
- **Python**: Version 3.11 or higher
- **Node.js**: Version 18.x or higher
- **PostgreSQL**: Version 15 or higher
- **Docker**: For running ChromaDB and databases locally (optional but recommended)

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy environment template:
   ```bash
   cp .env.template .env
   ```
   Add your database credentials and `GEMINI_API_KEY` to the `.env` file.

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Copy environment template:
   ```bash
   cp .env.template .env.local
   ```

---

## 🚀 Running the System Locally

### Start Databases (Docker Compose)
If utilizing Docker for local databases:
```bash
docker-compose up -d
```
This starts PostgreSQL on port `5432` and ChromaDB on port `8000`.

### Start Backend Server
From the `backend` directory with the virtual environment active:
```bash
uvicorn main:app --reload --port 8000
```
API Documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### Start Frontend Server
From the `frontend` directory:
```bash
npm run dev
```
The client dashboard will be available at: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Verification Commands

### Run Python Tests
From the `backend` directory:
```bash
pytest
```

### Run Frontend Linter & Tests
From the `frontend` directory:
```bash
npm run lint
npm run test
```
