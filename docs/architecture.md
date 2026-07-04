# System Architecture: AI Business Growth Operating System

This document outlines the visual structure, subsystems, and execution flows within the Operating System.

## Visual Subsystems Model

```mermaid
graph TD
  User((Company Board)) -->|Web Client| NextJS[Next.js App Router UI]
  NextJS -->|Authentication / API| ExpressAPI[Express.js TS Backend]
  ExpressAPI -->|Read/Write Operations| PrismaClient[Prisma ORM Client]
  PrismaClient -->|PostgreSQL Schema| PostgreSQL[(PostgreSQL Database)]

  subgraph Express Backend
    ExpressAPI --> Repositories[Repository Layer]
    ExpressAPI --> Services[Service Layer]
    Services --> BICore[Business Intelligence Core]
  end

  subgraph Business Intelligence Core
    BICore --> Discovery[Discovery Engine]
    BICore --> Twin[Business Digital Twin Model]
    BICore --> Simulator[Decision Simulator]
    BICore --> Explain[Explainability Engine]
  end

  subgraph AI Abstraction Layer
    BICore -.->|Interfaces & Contracts| AIContracts[Shared AI Module]
    AIContracts --> LLM[LLMProvider Interface]
    AIContracts --> Memory[MemoryProvider Interface]
  end
```

## Core Architectural Layers

1. **Presentation Layer (Frontend)**: Next.js latest App Router, React, Tailwind CSS, and Lucide icons.
2. **Business API Layer (Backend)**: Express.js TypeScript server exposing clean REST endpoints, validated using Zod, logged with Winston, and tracked via Request Correlation IDs.
3. **Database Repository Layer**: Prisma ORM client abstracting raw queries to a PostgreSQL instance.
4. **AI Abstraction Layer**: Pure TypeScript contracts (`/ai`) providing standard data models for Agents, debate rounds, predictions, memory stores, and LLM communication.
