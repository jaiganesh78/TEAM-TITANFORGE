# TitanForge AI Business Growth Operating System

TitanForge is a premium, production-grade AI-powered business growth governance and operations suite. It serves as an autonomous **AI Executive Board**, orchestrating growth loops, analyzing business performance, resolving multi-agent conflicts, and guiding corporate decision-making.

---

## Key Architectural Modules (Sprints 1–13)

### 1. Executive AI Board & Governance
- **Autonomous Debates**: Coordinates all growth engines into structured debates to reach consensus.
- **CEO morning briefings**: Auto-generates high-fidelity summaries highlighting health, growth, and risks.
- **Decision Simulator**: Projects the financial and operational impact of hypothetical business actions.
- **Drill-down KPI Tree**: Evaluates organizational health hierarchically (e.g., Growth Performance, Customer Success metrics).

### 2. Growth & Evolution Engines
- **Strategy Engine**: Identifies market positioning, SWOT matrices, competitor threats, and pricing plans.
- **Marketing Engine**: Computes target audiences, channel rankings, and content campaigns.
- **Lead Intelligence Engine**: Scores acquisition lists and defines lead scoring parameters.
- **Sales Engine**: Measures deal health, constructs negotiation playbooks, and forecasts pipelines.
- **Analytics & Evolution Engine**: Captures immutable performance snapshots and manages the historical intelligence timeline.
- **Customer Success & Value Realization**: Tracks Renewal confidence, Churn risks, Goal outcomes, and ROI Delivery metrics.

### 3. Discovery & Knowledge Layers
- **Coverage & Missing Information Engine**: Identifies gaps in company information and guides target surveys.
- **Vector Ingestion (RAG)**: Integrates ChromaDB provider to build vector-embedded knowledge stores for semantic querying.

---

## Technology Stack

- **Frontend**: Next.js 16 (Turbopack, Tailwind CSS, Lucide icons, Recharts UI components)
- **Backend**: Node.js, Express, TypeScript, LangGraph-style StateGraphs
- **Database & ORM**: PostgreSQL, Prisma ORM
- **AI Core**: Gemini API via Google Vertex SDK / Gemini Provider

---

## Repository Structure

```text
├── app/                  # Next.js App Router (Client Dashboard & Workspaces)
├── components/           # Reusable UI widgets, layout wrappers & charts
├── backend/              # Node.js + Express backend service
│   ├── src/
│   │   ├── controllers/  # API route request handlers
│   │   ├── database/     # Prisma client provider
│   │   ├── engines/      # Pluggable Executive representatives
│   │   ├── middleware/   # Express Auth & error handlers
│   │   ├── routes/       # Express route mounts
│   │   └── services/     # StateGraph engines & workflows (sprints 1-13)
│   └── prisma/           # Database schemas and migration files
├── ai/                   # AI Provider integrations & response schema parser
└── shared/               # Shared type definitions
```

---

## Installation & Local Setup

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **PostgreSQL** database instance

### 2. Backend Configuration & Startup
Navigate to the `backend` directory and setup environment variables:
```bash
cd backend
cp .env.example .env   # configure PORT, DATABASE_URL, and Gemini keys
```

Run migrations and start the Express dev server:
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```
The backend server runs on `http://localhost:5000`.

### 3. Frontend Configuration & Startup
Navigate to the project root directory and start the Next.js Turbopack dev server:
```bash
npm install
npm run dev
```
The Next.js client workspace runs on `http://localhost:3000`. Port `3000` has preconfigured rewrites to automatically proxy `/api/*` traffic to the Express backend on port `5000`.

---

## Running Integration Tests

TitanForge includes dedicated validation tests for all agent workflows.

To run the full Executive Board integration test suite:
```bash
cd backend
npx ts-node src/services/growth/executive-board.test.ts
```

To run individual engine tests (Customer Success, Strategy, etc.):
```bash
npx ts-node src/services/growth/customer-success.test.ts
npx ts-node src/services/growth/strategy.test.ts
```
