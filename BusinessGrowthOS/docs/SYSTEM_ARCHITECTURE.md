# System Architecture: Platform Topology

This document details the modular layout of the Business Growth Operating System (BGOS), defining the structural relationships between frontend, backend, agent, and database layers.

---

## 🗺️ System Topology Diagram

```mermaid
graph TB
    subgraph Client Layer [Next.js Web Interface]
        UI[Executive Dashboard / Wizard UI]
        State[React State / Context]
    end

    subgraph Service Layer [FastAPI Gatekeeper]
        API[REST Route Controllers]
        Auth[JWT / Session Auth]
        Ingest[Ingestion Parser]
    end

    subgraph Memory & Vector Space
        VSS[(ChromaDB Vector Store)]
        DB[(PostgreSQL Relational DB)]
    end

    subgraph Core AI Operating System
        Discovery[Business Discovery Engine]
        Twin[Business Digital Twin Model]
        Orch[LangGraph Orchestrator]
        
        subgraph Agents Board
            CEO[CEO Agent]
            CMO[Marketing Agent]
            CFO[Finance Agent]
            Strategy[Strategy Agent]
        end
        
        Conflict[Conflict Resolution Engine]
        Decision[Decision Engine]
        Planner[Execution Engine]
    end

    UI <-->|HTTPS / JSON| API
    API <--> Auth
    API --> Ingest
    Ingest --> VSS
    
    Discovery --> Twin
    Twin --> DB
    Twin --> VSS
    
    API <--> Orch
    Orch <--> Agents Board
    Agents Board --> Conflict
    Conflict --> Decision
    Decision --> Planner
    Planner --> DB
```

---

## 🏢 Platform Layers

### 1. Client Layer (Next.js & TailwindCSS)
- Provides the interface for the baseline scraper and the multi-turn adaptive interview.
- Renders the executive dashboard showing strategic metrics alongside the "What should I do next?" dynamic action feed.
- Visualizes agent debate transcript streams to provide explainability.

### 2. Service Layer (FastAPI)
- Handles authentication and user workspace permissions.
- Ingests raw inputs (URLs, PDF documents, CSV spreadsheets) and manages the parsing pipeline.
- Coordinates calls to the LangGraph core orchestrator.

### 3. Storage & Context Layer (PostgreSQL & ChromaDB)
- **PostgreSQL**: Stores structured metadata, workspace states, task boards, and version history of the Business Digital Twin.
- **ChromaDB**: Indexes chunked business files, competitor benchmark metrics, and operational playbooks to serve as context for the agentic RAG system.

### 4. Logic & Agentic Layer (LangGraph & Google Gemini)
- Defines the conditional states, loops, and validation gates governing agent collaboration.
- Runs the conflict resolution rules ensuring financial and operational constraints are respected before generating recommendations.
