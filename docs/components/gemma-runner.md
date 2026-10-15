# Component Specification: Gemma Runner & Embedded AST Engine

## 1. Purpose

The `GemmaRunner` service ([`server/src/services/gemma-runner.ts`](file:///c:/Users/USER/Desktop/Extras/pending-projects/Resume-and-Thread/server/src/services/gemma-runner.ts)) provides dual-tier local inference for tailoring resumes. It dynamically routes requests to a local Google Gemma 2 model via Ollama when available, while automatically failing over to an embedded deterministic AST engine in under 5 milliseconds if Ollama is absent or offline.

---

## 2. Dependencies

- **Local Daemon (Optional)**: Ollama at `http://127.0.0.1:11434` running `gemma2:2b-instruct` or `gemma2:9b-instruct`
- **Native Web APIs**: `fetch`, `AbortController` (1,500ms startup health ping; 60,000ms inference timeout)
- **Zod Schemas**: `JobSpecSchema`, `MasterResumeSchema`, `TailoredResumeSchema`
- **Internal Modules**: `extractKeywordsFromText` from `ats-scorer.ts`

---

## 3. Algorithmic Complexity

- **Health Check Ping (`checkOllamaHealth`)**: Bounded by 1,500ms timeout on HTTP connection failure; typical response $<5\text{ms}$ on active localhost daemon.
- **Neural Inference (Mode 1)**: $O(P + G)$ transformer forward-pass latency, where $P$ is prompt tokens and $G$ is generated completion tokens (typically 1.2s to 3.5s on GPU/Apple Silicon, 4s to 8s on CPU).
- **Deterministic AST Fallback (Mode 2)**: $O(K + B)$, where $K$ is keyword extraction count and $B$ is experience highlight bullets. Executes in $<5\text{ms}$ deterministically.
- **Space Complexity**: $O(P + G)$ memory allocation for prompt payload and JSON response AST.

---

## 4. Operational Modes & Anti-Hallucination Boundaries

| Tier | Engine | Condition | Latency | Guardrails |
|---|---|---|---|---|
| **Tier 1 (Neural)** | Google Gemma 2 (2B/9B) | Ollama running at `127.0.0.1:11434` | 1.5s – 4.0s | Strict `<start_of_turn>` boundary tokens; prohibited from inventing false employers, degrees, or dates. |
| **Tier 2 (Deterministic)** | Embedded AST Adapter | Ollama absent, timed out, or uninstalled | $<5\text{ms}$ | Pure AST keyword integration; weaves top target skills into existing accomplishments using STAR/XYZ formulation without cloud calls. |
