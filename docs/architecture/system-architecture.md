# Architecture: System Component Interactions

## Component Interaction Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Job Seeker
    participant Browser as Chrome Tab (Job Site)
    participant CS as Content Script (Scraper)
    participant Ext as Resume & Thread Extension
    participant Server as Mastra Local Server (127.0.0.1:4141)
    participant Engine as Gemma 2 / Deterministic Adapter
    participant Disk as Local Storage

    User->>Browser: Navigates to Job Posting (LinkedIn/Greenhouse/Lever)
    User->>Ext: Clicks Resume & Thread Extension Icon
    Ext->>CS: Trigger Scrape Event
    CS->>Browser: Extracts & Sanitizes Job Title, Company, Description
    CS-->>Ext: Returns Normalized JobSpec Object
    Ext->>Disk: Loads Local Master Resume
    Disk-->>Ext: Returns MasterResume JSON
    Ext->>Server: POST /api/tailor (JobSpec + MasterResume)
    Server->>Server: Mastra Step 1: Validate Schemas (Zod)
    Server->>Server: Mastra Step 2: Extract Keyword Taxonomies
    Server->>Engine: Stream Tailoring Prompt (Target Keywords + Experience)
    Engine-->>Server: Returns Tailored Bullets (JSON)
    Server->>Server: Mastra Step 4: Validate Factual Grounding
    Server->>Server: Mastra Step 5: Calculate ATS Match Score
    Server->>Server: Mastra Step 6: Render Clean ATS PDF & Markdown
    Server-->>Ext: Returns Response (Score, Diff, PDF Data URI)
    Ext-->>User: Displays Match Score Gauge, Diff Viewer, & Download CTA
```

## Architectural Decoupling Benefits

1. **Independent Portability**: The Chrome extension can be updated without reinstalling the local server, and vice versa.
2. **Pluggable Model Backends**: The Mastra server interacts through standard local interfaces, allowing seamless switching between Ollama, llama.cpp, or the embedded deterministic engine.
3. **Resilient Failure Modes**: If the local model runner is offline, the extension cleanly utilizes the embedded deterministic adapter without user disruption.
