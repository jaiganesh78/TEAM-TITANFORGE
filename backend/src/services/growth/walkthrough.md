# TitanForge AI Business Growth Operating System Walkthrough

## Sprint 5 — Knowledge Layer & RAG Foundation ✅

### Database — `backend/prisma/schema.prisma`
| Model | Purpose |
|---|---|
| `KnowledgeChunk` | Core RAG unit. Holds content, version, status, and full immutable lineage. |
| `KnowledgeMetadata` | Key-value tag store attached to each chunk. |
| `EmbeddingReference` | Reference-only link to ChromaDB (no vectors in PostgreSQL). |
| `KnowledgeCollection` | Named collection grouping chunks by source type. |
| `KnowledgeStatistics` | Per-business health counters. |
| `KnowledgeVersion` | Immutable hash snapshot for incremental indexing. |
| `ContextSnapshot` | Persists structured AI context packages for full history. |
| `ChunkStatus` enum | `ACTIVE`, `STALE`, `ARCHIVED` for invalidation without deletion. |

### Services — `backend/src/services/knowledge/`
| File | Responsibility |
|---|---|
| `VectorDBProvider.ts` | Interface contract. No service calls Chroma directly. |
| `ChromaProvider.ts` | Implements VectorDBProvider with in-memory cosine-similarity fallback. |
| `ChunkingService.ts` | Paragraph, section, table, website, and document splitters. |
| `MetadataService.ts` | Category, domain, confidence, and tagging metadata generation. |
| `EmbeddingQueueService.ts` | 384-dim deterministic pseudo-vectors from SHA-256. |
| `KnowledgeIngestionService.ts` | Incremental indexing with version hashes, STALE invalidation, diff logging. |
| `RetrievalService.ts` | Keyword → Vector → Merge → Deduplicate → Rank → Explain pipeline. |
| `BusinessContextService.ts` | Assembles ContextPackages and persists immutable ContextSnapshots. |
| `KnowledgeHealthService.ts` | Freshness, coverage, diversity, version, and review health scores. |

### API Routes — `/api/knowledge/*`
| Route | Description |
|---|---|
| `GET /search/:id?q=` | Hybrid keyword + vector RAG search with explainability |
| `GET /health/:id` | Health HUD metrics |
| `GET /chunks/:id` | Full indexed chunk list with metadata |
| `POST /refresh/:id` | Manual incremental re-index trigger |
| `GET /context/:id?topic=` | Live ContextPackage assembly for AI agents |
| `POST /snapshot/:id` | Create and persist immutable ContextSnapshot |
| `GET /snapshots/:id` | Historical ContextSnapshot log |

### Frontend — `/settings/knowledge`
- **Health HUD** — 5 animated score bars (Freshness, Coverage, Diversity, Version Health, Review Rate)
- **RAG Query Sandbox** — Live search with partition filter and confidence threshold slider
- **Snapshot Builder** — Persists immutable context snapshots with topic + version scope
- **Chunk Explorer** — Scrollable chunk list with ACTIVE/STALE badges
- **Chunk Inspector** — Explainability block (scores, reason text), metadata key-value grid, version diff log

### Test Results
```
✔ Test 1: Lineage Integrity — chunks traced to UploadedDocument
✔ Test 2: Chunk Invalidation & Diffing — V1 STALE, V2 ACTIVE with previousChunkId
✔ Test 3: Hybrid Retrieval & Explainability — scores, ranking, and reasons verified
✔ Test 4: Context Snapshots — persisted and retrieved correctly
✔ Test 5: Health Reports — freshness drops correctly from stale count

🎉 ALL 5 TESTS PASSED — Backend + Frontend builds clean
```

---

## Sprint 6 — Growth Digital Twin Architecture ✅

Transform the Business Digital Twin into a layered Growth Digital Twin to support multi-engine reasoning and readiness tracking.

### 1. Layered Database Architecture
- Created enums: `GrowthDomain`, `BusinessStage`, `BusinessModelType`.
- Added models to `schema.prisma`:
  - `GrowthDomainState`: Stores current & desired states, gaps, and confidence scores for 17 domains.
  - `GrowthDomainHistory`: Immutable append-only audit trail for domain state changes.
  - `GrowthTwinSummary`: Tracks overall twin progress, high gap areas, and confidence.
  - `AIOperatingContext`: Holds Strategic Goals, Engine Outputs, priorities, and decisions, isolating AI outputs from facts.
  - `SectorConfig`: Holds sector configurations.
- Schema pushed to PostgreSQL database and clients generated.

### 2. Config & Taxonomy Layer
- **KPI Registry** (`backend/src/config/kpis/index.ts`): Tracks 15 target KPIs (e.g., CAC, LTV, win rate, churn) with unit, formula, health ranges, and owning engine.
- **Engine Contracts** (`backend/src/engines/contracts.ts`): Defines strict input/output schemas, required KPIs, and confidence thresholds for 6 growth engines (Strategy, Marketing, Lead Gen, Sales, Analytics, CS).
- **Sector Configurations** (`backend/src/config/sectors/`): Tailored setups (SaaS, eCommerce, Professional Services, Retail, Marketplace) featuring business terminology, lifecycle stages, funnel benchmarks, pain points, and prompt templates.

### 3. Backend Services
- `GrowthTwinService.ts`: Manages domain updates, calculates gap severities, tracks history, and summarizes metrics. Maps BDT properties to growth domain states.
- `AIReadinessService.ts`: Evaluates whether engines have enough indexed chunks, domain confidence, and KPI data to execute, returning clear recommendations.
- `DiscoveryFlowEngine.ts` Extension: Implements `ExplainedQuestion` to detail why discovery items matter, their target engine, KPI impact, and expected confidence lift.

### 4. Interactive Frontends & API
- Mounted `/api/growth/*` routes covering Twin, Domain History, Sector Configs, KPIs, engine readiness, and Explained Discovery questions.
- Built **6 Engine Readiness Dashboards** showcasing readiness score gauges, KPI checkmarks, domain dependencies, and execution logs.
- Updated `LayoutShell.tsx` navigation sidebar with a new **Growth Engines** category linking to all 6 dashboards.

### Test Results
```
🚀 Sprint 6 — Config Layer Tests (No DB)
============================================================
Test 1: Sector Configuration
  ✔ 5 sectors loaded (need 5+)
  ✔ SaaS sector found by slug
  ✔ SaaS has 8 marketing channels
  ✔ SaaS has 4+ AI prompt templates
  ✔ SaaS has lifecycle stages
  ...
Test 2: KPI Registry
  ✔ 15 KPIs defined
  ✔ Health status checks passing
  ...
Test 3: Engine Contracts
  ✔ 6 engine contracts defined
  ✔ All engines have failure conditions
  ...
Test 4: Question Library — Backward Compatibility
  ✔ 15 questions in library
  ✔ 15 questions have growthDomain
  ...
Test 5: Discovery Explainer
  ✔ explained questions returned with context
  ✔ Answered questions are excluded

============================================================
Results: 91 passed, 0 failed
🎉 ALL CONFIG TESTS PASSED
============================================================
```
