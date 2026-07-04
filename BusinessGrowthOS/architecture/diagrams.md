# Platform Architecture Diagrams

This repository acts as the central hub for all Mermaid diagram sources mapping the platform topologies and operations of the Business Growth Operating System (BGOS).

---

## 🗺️ Master Platform Architecture

```mermaid
graph TD
    User([Business Executive]) --> Discovery[Business Discovery Engine]
    Discovery --> Investigation[Adaptive Investigation Engine]
    Investigation --> Twin[(Business Digital Twin)]
    Twin --> RAG[(Knowledge Layer / RAG)]
    RAG --> AgentBoard[Agent Collaboration Layer]
    
    subgraph AgentBoard [Multi-Agent Executive Board]
        CEO[CEO Agent] <--> Strategy[Strategy Agent]
        CEO <--> CMO[Marketing Agent]
        CEO <--> CFO[Finance Agent]
        CEO <--> Sales[Sales Agent]
    end
    
    AgentBoard --> Conflict[Conflict Resolution Engine]
    Conflict --> Decision[Decision Engine]
    Decision --> Planner[Execution Planner]
    Planner --> BI[BI & Dashboard Layer]
    BI --> Feedback[Continuous Learning Engine]
    Feedback --> Twin
```

---

## 🔄 Business Flow lifecycle

```mermaid
stateDiagram-v2
    [*] --> Discover: URL Ingestion & Scraping
    Discover --> Design: Adaptive Investigation & Twin Setup
    Design --> Deliver: Strategic Recommendations & Debate
    Deliver --> Develop: Task Generation & Agent Execution
    Develop --> Dominate: Telemetry Analysis & Continuous Learning
    Dominate --> Discover: Parameter Recalibration
```

---

## 💬 Agent Communication & Debate Flow

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
