# Contributing to Business Growth Operating System (BGOS)

Thank you for choosing to contribute to our AI Executive Operating System! We welcome all software engineers, enterprise architects, and product designers to help build the future of autonomous business growth.

---

## 🛠️ Development Setup & Standards

We maintain a strict code quality bar. Before submitting any changes, make sure your workspace matches our standards:

1. **Frontend**: Next.js App Router (React, TailwindCSS).
2. **Backend**: FastAPI (Python 3.11+, Pydantic v2).
3. **Database**: PostgreSQL and ChromaDB for vector operations.
4. **Formatting & Linting**:
   - Python: `black` for formatting, `ruff` for linting, and `mypy` for static type checking.
   - JavaScript/TypeScript: `prettier` and `eslint`.

Refer to [CODING_STANDARDS.md](CODING_STANDARDS.md) for naming conventions and pattern requirements.

---

## 🌿 Branching Strategy

Our git flow consists of:

* `main`: Protected production branch. Represents the stable released builds.
* `staging`: Protected integration testing branch. Pre-production validation.
* `develop`: Active integration branch. All feature branches merge here first.
* `feature/issue-<ID>-<name>`: Descriptive branches for specific features or bugs.

### Code Submission Process

1. **Create a Feature Branch**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/issue-123-discovery-scraper
   ```
2. **Commit with Conventional Commits**:
   - `feat(discovery): add web scraping page parsing`
   - `fix(agent): repair LangGraph cycle loop lock`
   - `docs(api): document multi-agent execution endpoint`
3. **Run Tests Locally**:
   Ensure all Python and JS tests pass before pushing.
4. **Submit a Pull Request (PR)**:
   - Target `develop`.
   - Complete the PR Template, linking the related GitHub Issue.
   - Require at least one approved code review from a Principal Engineer.
   - All CI checks (linting, building, tests) must pass.

---

## 🧪 Testing Guidelines

Every pull request must contain appropriate test suites:
- **Backend**: Python `pytest` tests verifying APIs and models.
- **Frontend**: Playwright/Vitest assertions verifying UI elements.
- **Agents**: Mock LLM responses checking graph transitions in LangGraph.

Review the [TESTING_STRATEGY.md](docs/TESTING_STRATEGY.md) file for more information.
