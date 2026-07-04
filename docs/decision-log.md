# Architecture Decision Log (ADR)

This document tracks decisions made regarding technology selection, design systems, and programming patterns.

## ADR 1: Repository Pattern for Database Management
- **Status**: Accepted
- **Context**: Express backend needs direct database queries using Prisma. Coupling router/controllers with raw Prisma calls makes unit testing and future mocking hard.
- **Decision**: Put all DB operations in a `/repositories` directory. Controllers call Services, which leverage Repositories to load models.
- **Consequence**: Decoupled, unit-testable database layer. Easy to swap or mock database calls in intelligence service layers.

## ADR 2: Split Route Groups in Next.js App Router
- **Status**: Accepted
- **Context**: The application layout contains a complex, interactive Sidebar navigation. Showing this sidebar on Auth screens (login, register) or marketing landing pages looks messy.
- **Decision**: Leverage Route Groups in Next.js App Router:
  - `(auth)` group: holds `/login` and `/register` with no sidebar shell.
  - `(dashboard)` group: uses `LayoutShell` to render the navigation menu for all app subpages.
- **Consequence**: Clean, focused layouts for each stage of the user experience.

## ADR 3: Pure Interface Declarations for AI Abstraction
- **Status**: Accepted
- **Context**: AI, agent debate mechanisms, and vector databases (ChromaDB) are not part of this sprint. However, other backend systems need to refer to AI models.
- **Decision**: Define pure TypeScript interfaces inside a top-level `/ai` directory. The services refer to these interfaces without implementing backend AI bindings yet.
- **Consequence**: Extensible contracts that can be implemented in future sprints without changing backend routes or schema configurations.
