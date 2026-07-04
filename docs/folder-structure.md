# Project Folder Structure Map

This document highlights the directory maps for the Monorepo structure.

```
/                       <- Next.js App Root
├── app/                <- Next.js App Router views
│   ├── (auth)/         <- Login/Register views
│   ├── (dashboard)/    <- Shell-wrapped views
│   │   ├── business/   <- Executive Board strategy pages
│   │   ├── settings/   <- Documents, simulation, profile pages
│   │   └── dashboard/  <- Core metrics pages
│   ├── layout.tsx
│   └── globals.css
├── components/         <- Reusable layout shells and controls
├── ai/                 <- Shared AI Engine contracts and interface providers
│   ├── contracts/      <- Recommendations, simulator, debate, memory structures
│   ├── providers/      <- Interfaces for LLM, vector index, and agents
│   └── agents/         <- Core agent runtime definition
├── backend/            <- Express TS Backend Subsystem
│   ├── prisma/         <- PostgreSQL schema file and migrations
│   └── src/            <- Express API source
│       ├── config/     <- env parser and DB client
│       ├── controllers/<- Auth and Org handlers
│       ├── middleware/ <- RBAC and validation layers
│       ├── repositories/<- Database layer handlers
│       ├── routes/     <- API paths router
│       ├── services/   <- Core Auth logic
│       ├── types/      <- Dashboard widget metrics structures
│       ├── utils/      <- Winston logger, correlation ID middleware
│       └── intelligence/<- Business Intelligence Core modules
├── docs/               <- Visual systems diagrams and markdown help
```
