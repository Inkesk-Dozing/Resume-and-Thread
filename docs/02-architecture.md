# Resume & Thread: Technical Architecture & System Specification

## 1. System Topology Overview

Resume & Thread is structured around a two-tier decoupled local architecture:
1. **Frontend Presentation & Ingestion Layer**: A Manifest V3 Chrome Extension operating in the user's browser.
2. **Local Orchestration & Inference Engine**: A Node.js backend powered by Mastra communicating directly with a local open-weight model runner (Ollama / llama.cpp) running Google Gemma 2, backed by an embedded deterministic adapter.

```mermaid
graph TB
    subgraph BrowserMV3 ["Chrome Extension (Manifest V3)"]
        ActiveTab["Active Job Tab (DOM)"] -->|Content Script| Scraper["DOM Scraper (scraper.js)"]
        Scraper -->|Chrome Messaging| Background["Background Service Worker (service-worker.js)"]
        Background <-->|Local Cache| Storage["chrome.storage.local"]
        Background -->|UI Sync| Popup["Popup UI / SidePanel (popup.js)"]
    end

    subgraph LocalBackend ["Local Orchestration Server (127.0.0.1:4141)"]
        Popup -->|HTTP REST| API["Express Server Engine (index.ts)"]
        
        subgraph MastraCore ["Mastra Workflow Pipeline"]
            Step1["1. Normalize Job Spec (Zod Schema)"]
            Step2["2. Skill Delta Analysis (ats-scorer.ts)"]
            Step3["3. Context-Aware Rewriter (gemma-runner.ts)"]
            Step4["4. ATS Verification & Scoring"]
            Step5["5. Artifact Synthesis (pdf-generator.ts)"]

            Step1 --> Step2 --> Step3 --> Step4 --> Step5
        end

        API --> Step1
        Disk[("Local Master Resume Store (data/master_resume.json)")] --> Step2
    end

    subgraph InferenceLayer ["Inference Backends"]
        GemmaEngine["Google Gemma 2 (Ollama at 127.0.0.1:11434)"]
        RuleEngine["Embedded Deterministic AST Engine"]
    end

    Step3 <-->|Primary Route| GemmaEngine
    Step3 -.->|Fallback Route| RuleEngine
```

---

## 2. Browser Extension Layer (Manifest V3)

### 2.1 Content Script Scraper (`scraper.js`)
Injected into designated career portals with site-specific DOM heuristics:
- **LinkedIn**: `.jobs-description-content__text`, `.job-details-jobs-unified-top-card__job-title`
- **Greenhouse**: `#content`, `.job-post`
- **Lever**: `.posting-headline`, `.posting-requirements`
- **Indeed**: `#jobDescriptionText`, `.jobsearch-JobInfoHeader-title`
- **Ashby**: `[data-testid="job-details"]`
- **Workday**: `[data-automation-id="jobPostingDescription"]`
- **Generic Fallback**: High-density text element traversal.

### 2.2 Background Service Worker (`service-worker.js`)
- Maintains encrypted state cache in `chrome.storage.local`.
- Bridges sandboxed content scripts with `http://127.0.0.1:4141`.
- Seeds default master resume templates upon first install.

---

## 3. Local Mastra Orchestration Layer

The orchestration engine coordinates workflows with strong schema validation via Zod:

```mermaid
stateDiagram-v2
    [*] --> IngestJobSpec
    IngestJobSpec --> ValidateSchema
    ValidateSchema --> AnalyzeGaps: JobSpecSchema Valid
    ValidateSchema --> Reject: Invalid Input
    
    AnalyzeGaps --> RouteInference
    RouteInference --> NeuralGemma: Ollama Active
    RouteInference --> EmbeddedAdapter: Ollama Offline
    
    NeuralGemma --> ValidateGrounding
    EmbeddedAdapter --> ValidateGrounding
    
    ValidateGrounding --> ComputeAtsScore
    ComputeAtsScore --> SynthesizePdf
    SynthesizePdf --> [*]
```

Each step produces typed artifacts adhering strictly to `TailorResponseSchema`.
