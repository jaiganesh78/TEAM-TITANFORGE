# Executive Dashboard Design Specifications

The **Executive Dashboard** is the command center of the Business Growth Operating System (BGOS). Unlike traditional dashboards that display passive metrics, every component of the BGOS interface is designed to answer the core executive question: **"What should I do next?"**

---

## 🎨 Interface Topology & Wireframe Layout

```text
+------------------------------------------------------------------------------------+
| BGOS [Logo]                 Workspace: Acme Corp [v]                 [User Profile]|
+------------------------------------------------------------------------------------+
| [Dashboard]  [Digital Twin]  [Agent Board]  [Knowledge Hub]  [Execution Board]     |
+------------------------------------------------------------------------------------+
|  GROWTH TELEMETRY MATRIX                                                           |
|  +--------------------+  +--------------------+  +--------------------+            |
|  | MRR                |  | CAC                |  | Runway             |            |
|  | $45,000  (+5.4%)   |  | $120.00  (-2.1%)   |  | 9.4 Months         |            |
|  +--------------------+  +--------------------+  +--------------------+            |
|                                                                                    |
|  EXECUTIVE ACTION FEED (What should I do next?)                                    |
|  +------------------------------------------------------------------------------+  |
|  | [!] RECOMMENDATION: Expand Organic Content (Confidence: HIGH)               |  |
|  |     Attribution: Strategy & CMO Agent agreement                              |  |
|  |     [ Review Strategy & Options ]     [ Delegate to Execution Board ]        |  |
|  +------------------------------------------------------------------------------+  |
|  | [!] WARNING: Meta CPA exceeding target limits (Variance: +24%)                |  |
|  |     Attribution: Data Analyst Agent & CFO Veto warning                       |  |
|  |     [ Adjust Budget Allocation ]      [ Pause Campaign ]                     |  |
|  +------------------------------------------------------------------------------+  |
+------------------------------------------------------------------------------------+
```

---

## 🛠️ Key UI/UX Principles

### 1. Active vs. Passive Elements
- **Passive Elements**: Standard line and bar charts (built with Tremor / Chart.js) representing metrics.
- **Active Elements**: The **Executive Action Feed**. This component parses recommendations, alerts, and agent decisions, displaying them as priority cards with explicit call-to-action buttons.

### 2. Explainability Interface (The Debate Window)
Users can expand any recommendation to see the **Agent Debate Log**. This renders a Slack-like transcript showing:
* **The Proposal**: CMO proposing to spend budget on Meta.
* **The Challenge**: CFO flagging burn rate limits.
* **The Resolution**: CEO directing budget to organic growth channels.
This feature builds user trust and makes the AI's logic clear.
