<div align="center">
  <img src="assets/standalone-logo.png" alt="Resume & Thread Logo" width="160" style="border-radius: 12px; margin-bottom: 12px;" />
  <h1>Resume & Thread</h1>
  <p><strong>The Local-First Bespoke Resume Tailorer</strong></p>
  <p><em>Craftsmanship, Local Execution Threads, and Zero-Cloud Data Sovereignty</em></p>

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-emerald.svg)](extension/manifest.json)
[![Orchestrator: Mastra](https://img.shields.io/badge/Orchestrator-Mastra-purple.svg)](https://mastra.ai)
[![Model: Google Gemma](https://img.shields.io/badge/Model-Gemma%202-red.svg)](https://ai.google.dev/gemma)
[![Cost: $0.00](https://img.shields.io/badge/Operational%20Cost-%240.00-brightgreen.svg)]()
[![Privacy: 100% Local](https://img.shields.io/badge/Privacy-Zero--Cloud%20PII-success.svg)]()

</div>

> **Bespoke Career Craftsmanship Without the SaaS Rent.**  
> Scrapes job requirements directly from job portals (LinkedIn, Indeed, Greenhouse, Lever, Ashby, Workday), correlates them with your local Master Resume, and uses Google Gemma orchestrated via Mastra on your local machine to tailor, ATS-optimize, and compile professional resumes in seconds.

---

## 1. What "Resume & Thread" Signifies

The name **Resume & Thread** brings together three core dimensions of the system:

1. **Bespoke Tailoring Craftsmanship (The Needle & Thread)**  
   Inspired by Savile Row bespoke tailoring. Off-the-rack suits—and generic resumes—never fit properly. A master tailor takes quality raw fabric (your career history), measures the specifications of the occasion (the target job description), and cuts and stitches a custom garment. Resume & Thread applies this bespoke philosophy to career documents: precise, high-craft, and fitted to the role.

2. **Concurrency & Local Architecture (Execution Threads)**  
   In systems engineering, a *thread* is the fundamental unit of concurrent CPU/GPU execution. Resume & Thread runs completely locally on your hardware’s native threads. No cloud servers, no third-party API keys, and no personal data transmission.

3. **The Common Narrative Thread**  
   Every professional career has an underlying "golden thread"—the core narrative of problem solving, leadership, and technical capability. Resume & Thread draws out this continuous narrative thread to highlight relevant accomplishments without fabricating falsehoods.

---

## 2. System Architecture

```mermaid
flowchart TD
    subgraph Browser ["User Browser (Chrome Extension MV3)"]
        Tab["Active Job Tab\n(LinkedIn / Greenhouse / Lever / Ashby / Workday)"]
        CS["Content Script Scraper\n(Sanitizes & Normalizes DOM)"]
        Ext["Extension Popup & Side Panel\n(Real-Time Match Meter & Diff Preview)"]
        SW["Chrome Service Worker\n(Encrypted Local Storage)"]

        Tab -->|DOM Traversal| CS
        CS -->|Post Message| Ext
        Ext -->|State Storage| SW
    end

    subgraph LocalHost ["Local Machine (Zero Cloud Network Telemetry)"]
        Server["Mastra Orchestrator Server\n(Express + Zod Contract Guard at 127.0.0.1:4141)"]
        SW -->|Local HTTP Request| Server

        subgraph MastraWorkflow ["Mastra 5-Step Workflow DAG"]
            Step1["1. Normalize Job Spec & Extract Taxonomies"]
            Step2["2. Skill Gap & Delta Analysis"]
            Step3["3. Context-Aware Rewriter Agent"]
            Step4["4. ATS Keyword Verification & Density Score"]
            Step5["5. Output Synthesis (ATS PDF & Markdown)"]

            Step1 --> Step2 --> Step3 --> Step4 --> Step5
        end

        Server --> Step1

        subgraph DualEngine ["Dual-Tier Inference Layer"]
            Gemma["Neural Tier: Local Google Gemma 2\n(2B / 9B via Ollama at 127.0.0.1:11434)"]
            Fallback["Deterministic Tier: Embedded AST Adapter\n(Zero-Latency Rule Engine & STAR Quantifier)"]
        end

        Step3 <-->|Primary Path| Gemma
        Step3 -.->|Resilient Fallback| Fallback
        
        DiskStore[("Master Resume Store\n(JSON on Local Disk)")] --> Step2
    end

    Step5 --> OutputPDF["Generated ATS-Friendly PDF\n(One-Click Download)"]
    Step5 --> OutputMD["Structured Markdown\n(Clipboard Copy)"]
```

---

## 3. End-to-End Sequence Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Job Seeker
    participant Browser as Chrome Tab (Job Site)
    participant CS as Content Script (Scraper)
    participant Ext as Resume & Thread Popup
    participant Server as Mastra Local Server (127.0.0.1:4141)
    participant Engine as Gemma 2 / Deterministic Adapter
    participant Storage as Local Storage / Disk

    User->>Browser: Views Job Listing (LinkedIn / Greenhouse / Lever)
    User->>Ext: Clicks Resume & Thread Extension Icon
    Ext->>CS: Dispatches SCRAPE_JOB_SPEC Event
    CS->>Browser: Extracts Title, Company, Requirements & Body
    CS-->>Ext: Returns Sanitized JobSpec Payload
    Ext->>Storage: Retrieves Master Resume JSON
    Storage-->>Ext: Returns Candidate Master Credentials
    Ext->>Server: POST /api/tailor (JobSpec + MasterResume)
    
    Server->>Server: Step 1: Validate Contracts via Zod Schemas
    Server->>Server: Step 2: Correlate Skill Gaps & Keyword Taxonomies
    Server->>Engine: Stream Rewriting Context (STAR & XYZ Action Framing)
    Engine-->>Server: Returns Grounded Experience Highlights & Summary
    Server->>Server: Step 4: Calculate ATS Delta Score & Keyword Match
    Server->>Server: Step 5: Compile Single-Column ATS PDF & Markdown
    Server-->>Ext: Returns TailorResponse (Score, Tags, Bullets, PDF Base64)
    
    Ext-->>User: Displays Match Acceleration (+42%), Matched Chips & Diff
    User->>Ext: Clicks 'Download ATS PDF'
    Ext-->>User: Downloads Tailored_Role_ResumeAndThread.pdf
```

---

## 4. ATS Scoring Math & Verification Engine

The ATS scoring formula evaluates four weighted dimensions:

```mermaid
flowchart LR
    subgraph Inputs ["Analyzed Dimensions"]
        K["Keyword Coverage (55%)\nTarget Qualification Alignment"]
        V["Action Verbs (25%)\nATS Action Lexicon Matching"]
        M["Quantified Metrics (20%)\nSTAR / XYZ Formula Presence"]
    end

    subgraph Composite ["Scoring Formulation"]
        Formula["Score = (0.55 * Coverage) + (0.25 * Verbs) + (0.20 * Metrics)"]
        Delta["Delta = Tailored Score - Baseline Score"]
    end

    subgraph Output ["User Display"]
        Meter["ATS Match Meter (e.g. 54% ➔ 96%)"]
        Chips["Matched & Missing Keyword Chips"]
    end

    K --> Formula
    V --> Formula
    M --> Formula
    Formula --> Delta
    Delta --> Meter
    Formula --> Chips
```

---

## 5. Anti-Hallucination Grounding Rule-Set

```mermaid
graph TD
    Bullet[Generated Bullet Point] --> ParseEntities[Extract Entities & Metrics]
    ParseEntities --> CheckEmployer{Employer in Master Resume?}
    CheckEmployer -->|No| Reject[Reject Bullet -> Revert to Master Original]
    CheckEmployer -->|Yes| CheckTitle{Title Matches Level?}
    CheckTitle -->|No| Reject
    CheckTitle -->|Yes| CheckMetrics{Metric Plausible & Grounded?}
    CheckMetrics -->|No| Sanitize[Sanitize Metric -> Preserve Keyword Phrasing]
    CheckMetrics -->|Yes| Approve[Approve Bullet for Final Compilation]
```

---

## 6. Quick-Start Guide

### Prerequisites
1. **Node.js** (v18.0.0 or higher)
2. *(Optional for Neural Weights)* **Ollama** installed with Gemma 2:
   ```bash
   ollama pull gemma2:2b
   ```

### 1. Launch the Local Mastra Engine
```bash
cd server
npm install
npm run build
npm start
```
*The local orchestration engine initializes on `http://127.0.0.1:4141`.*

### 2. Load the Chrome Extension
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select the [`extension/`](extension) folder from this repository.
4. Pin **Resume & Thread** to your toolbar.

### 3. Add Your Master Resume
1. Click the Resume & Thread icon and open **Settings** (or edit `server/data/master_resume.json`).
2. Paste or edit your comprehensive Master Resume containing all past roles, achievements, and technical skills.

### 4. Tailor & Apply
1. Navigate to any job posting on LinkedIn, Indeed, Greenhouse, Lever, Ashby, or Workday.
2. Click **Resume & Thread**.
3. Inspect the live ATS Match Score and download your freshly tailored PDF or Markdown resume in seconds.

---

## 7. Documentation Architecture

Comprehensive engineering specifications are located in the [`/docs`](docs) directory:

- [01 - Project Overview & Strategic Foundation](docs/01-project-overview.md)
- [02 - Technical Architecture & Stack](docs/02-architecture.md)
- [03 - Privacy & Zero-Cloud Security Blueprint](docs/03-privacy-and-security.md)
- [04 - Mastra & Gemma Integration Specification](docs/04-mastra-gemma-integration.md)
- [05 - ATS Scoring Formula & Heuristics](docs/05-ats-scoring-engine.md)
- [Unified Phased Platform Roadmap (v1.0 to v3.0)](docs/roadmap/unified-platform-roadmap.md)
- [Component Specifications](docs/components/)
- [Local REST & WebSocket API Specification](docs/api/local-server-api.md)
- [Security Threat Model & Mitigations](docs/security/threat-model.md)
