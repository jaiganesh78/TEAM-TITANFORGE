# Coding Standards & Quality Matrix

This document outlines the strict style guides, architecture rules, and validation structures enforced across the Business Growth Operating System codebase.

---

## 🎨 Python Coding Standards (Backend & Agents)

We adhere to **PEP 8** specifications with additional architectural restrictions:

### 1. Naming Conventions
* **Modules/Packages**: Lowercase letters, underscores permitted (`business_twin`, `agent_orchestrator`).
* **Classes**: PascalCase (`DiscoveryController`, `DecisionEngine`).
* **Functions & Methods**: snake_case (`resolve_conflict`, `generate_dynamic_question`).
* **Variables & Constants**: snake_case for local variables, UPPERCASE for constants (`MAX_ONBOARDING_QUESTIONS`).

### 2. Type Hints
All function signatures **MUST** contain explicit type hints for both inputs and return parameters.
* **Bad**:
  ```python
  def get_twin(business_id):
      return db.query(business_id)
  ```
* **Good**:
  ```python
  from typing import Dict, Any
  
  def get_twin(business_id: str) -> Dict[str, Any]:
      return db.query(business_id)
  ```

### 3. Pydantic for Validation
All API boundaries and LLM structured outputs must pass through Pydantic classes to guarantee type safety:
```python
from pydantic import BaseModel, Field

class IndustryProfile(BaseModel):
    vertical: str = Field(..., description="Target sector vertical classification")
    cogs_percentage: float = Field(..., ge=0.0, le=100.0)
```

---

## 💻 TypeScript/React Coding Standards (Frontend)

### 1. Functional Components
All components must be functional components utilizing React hooks. Use explicit type declarations for `props`:
```typescript
interface MetricCardProps {
  title: string;
  value: number | string;
  changePercent: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, changePercent }) => {
  // Implementation
};
```

### 2. Tailwinds & Layout CSS
- Maintain layout classes in logical groups: layout $\rightarrow$ spacing $\rightarrow$ border $\rightarrow$ background $\rightarrow$ text.
- Do not mix inline styles with TailwindCSS utilities unless dynamic CSS calculation is strictly required.

---

## 🛡️ Error Handling Policy

- Never return raw database errors or stack traces to the client. Wrap all operational errors in custom system exceptions that output clean API response objects.
- All LLM network failures should implement an exponential backoff retry loop (maximum 3 retries).
