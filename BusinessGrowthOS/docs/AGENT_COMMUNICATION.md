# Agent Communication Protocols: Message & State Passing

Specialized agents in the Business Growth Operating System (BGOS) communicate via structured, schema-validated message networks utilizing LangGraph state channels.

---

## ⚙️ Communication Topology

```mermaid
sequenceDiagram
    autonumber
    participant State as LangGraph Shared State
    participant CEO as CEO Agent
    participant Strategy as Strategy Agent
    participant CFO as Finance Agent
    
    CEO->>State: Write Goal: "Increase MRR by 10%"
    State->>Strategy: Trigger (Reads Goal)
    Strategy->>State: Write Strategy: "Increase ad spend on Meta"
    State->>CFO: Trigger (Reads Strategy & Twin)
    Note over CFO: Verify COGS & Runway
    alt Budget Exceeds Cash Limits
        CFO->>State: Write Veto: "Marketing budget exceeds cash limit"
        State->>CEO: Trigger (Reads Veto)
        CEO->>State: Write Adjust Directive: "Optimize organic channels instead"
    else Budget Approved
        CFO->>State: Write Approval
    end
```

---

## 🛠️ Communication Implementation Specifications

### 1. LangGraph Shared State Channels
The LangGraph workflow maintains a central, mutable state dictionary (schema-validated by Pydantic) that nodes read from and write to:
```python
from typing import TypedDict, List, Dict, Any

class BoardState(TypedDict):
    company_id: str
    target_goal: str
    proposals: List[Dict[str, Any]]
    feedback_logs: List[str]
    vetoes: List[str]
    approved_plan: Dict[str, Any]
```

### 2. Message Formats
Agents exchange structured objects containing:
- `sender`: Agent name (`cfo`, `cmo`).
- `intent`: Action class (`PROPOSAL`, `FEEDBACK`, `VETO`, `APPROVAL`).
- `content`: Unstructured explanation.
- `data`: Structured payload metrics (e.g., proposed budget, projected CPA).
- `confidence`: Confidence score indicator ($0-1.0$).
- `evidence`: Citations to vector store chunks or twin parameters.
