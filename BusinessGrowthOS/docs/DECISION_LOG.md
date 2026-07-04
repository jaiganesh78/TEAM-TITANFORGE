# Architectural Decision Log (ADR)

This document tracks the core technology selections, architectural constraints, and design pivots made during the building of the Business Growth Operating System (BGOS).

---

## 📂 ADR Registry

### ADR 001: Selection of LangGraph for Agentic Orchestration
* **Status**: Approved
* **Context**: We require a system where specialized agents (CFO, CMO, Strategy) debate strategies, resolve conflicts, and run feedback loops. This involves cyclic relationships (e.g., CFO rejects CMO's strategy, looping back to the planning state).
* **Decision**: We selected **LangGraph** over simple linear DAG frameworks (like LangChain Express) or decentralized agents (like AutoGen). LangGraph allows us to define precise state charts, transition rules, and strict schema validation between nodes.
* **Consequences**: Developers must write explicit state reduction logic, but it guarantees deterministic agent workflows.

### ADR 002: Using Google Gemini with JSON Schema Mode
* **Status**: Approved
* **Context**: The backend requires structured data formats (e.g., Pydantic JSON validation) from LLM parsing to update the database twin profiles without breaking schemas.
* **Decision**: We utilize **Google Gemini's Structured Output Mode** (passing explicit schema formats in instructions) for discovery extraction and adaptive parser modules.
* **Consequences**: Eliminates JSON parsing errors and retry token waste.

### ADR 003: SQLite Vector Store for Hackathon MVP
* **Status**: Approved
* **Context**: For the 24-hour hackathon, running cloud Pinecone instances adds latency, cost, and connection management complexity.
* **Decision**: We use an in-memory vector store (like HNSWLib or Chroma local mode) on the FastAPI container, persisting to disk. For Horizon 1, we migrate to PostgreSQL `pgvector`.
* **Consequences**: Highly responsive local runs, zero external dependencies for the judge review.
