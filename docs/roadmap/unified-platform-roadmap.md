# Resume & Thread: Unified Platform Architecture & Development Roadmap

## 1. Multi-Phase Vision

Resume & Thread liberates job applicants from the recurring $20–$40/month SaaS resume builder subscription cycle by delivering a high-speed, 100% private, local-orchestrated alternative. 

```mermaid
gantt
    title Resume & Thread Multi-Phase Engineering Roadmap
    dateFormat  YYYY-MM
    section Phase 1 (Core)
    Chrome Extension MV3 Scrapers        :done, p1_1, 2026-09, 2026-10
    Mastra DAG Workflow Engine           :done, p1_2, 2026-09, 2026-10
    Dual-Tier Gemma 2 + Deterministic    :done, p1_3, 2026-10, 2026-10
    ATS Scoring & PDFKit Synthesis       :done, p1_4, 2026-10, 2026-10
    section Phase 2 (Enhance)
    Multi-Profile Support                :active, p2_1, 2026-10, 2026-11
    Cover Letter Generator Step          :p2_2, 2026-11, 2026-12
    Interactive Bullet Re-order Canvas   :p2_3, 2026-11, 2026-12
    section Phase 3 (Ecosystem)
    1-Click Form Autofill Integration    :p3_1, 2026-12, 2027-01
    Application Tracker Kanban Dashboard :p3_2, 2027-01, 2027-02
```

---

## 2. Milestone Deliverables

### Phase 1: MVP & Foundation (Current)
- Complete Manifest V3 extension with multi-portal scrapers (LinkedIn, Indeed, Greenhouse, Lever, Ashby, Workday).
- Local Mastra orchestration server with Zod schema verification.
- Dual-tier local inference (Google Gemma 2 via Ollama with automated deterministic fallback).
- Single-column ATS PDF generator and Markdown synthesizer.
- 10/10 Vitest unit test suite passed.

### Phase 2: Enhanced Customization & Formats
- Multiple resume versions (e.g. Frontend vs Distributed Backend profiles).
- Modular cover letter generator step using matching qualification taxonomies.
- Side-panel diff viewer with bullet point drag-and-drop.

### Phase 3: Automated Workflow & Local Intelligence
- One-click application autofill using extracted qualifications.
- Local SQLite job application tracker with interview timeline Kanban.
- Cross-platform desktop native runner bundling Ollama with zero setup.
