# Local REST API Specification

## Server Endpoint: `http://127.0.0.1:4141`

All requests originate from the authorized Chrome Extension origin (`chrome-extension://*`) or localhost loopback. Cross-origin requests from outside loopback are blocked by the CORS guard.

---

### 1. Health Telemetry & Engine State

#### `GET /api/health`
Returns process uptime, memory telemetry (RSS, heap), Mastra engine version, and active model state.

##### Response (`200 OK`)
```json
{
  "uptimeSec": 142,
  "system": {
    "rssMb": 62,
    "heapUsedMb": 24
  },
  "engine": "Resume-and-Thread-Mastra",
  "version": "1.0.0",
  "status": "operational",
  "modelProvider": {
    "name": "embedded-deterministic-engine",
    "url": "http://127.0.0.1:11434",
    "available": false,
    "activeModel": "deterministic-gemma-rule-engine",
    "mode": "deterministic-adapter",
    "notice": "Local Ollama daemon not running. Embedded deterministic adapter is active and ready."
  }
}
```

---

### 2. Model Discovery & Readiness

#### `GET /api/models`
Checks availability of local Ollama models alongside the embedded deterministic AST engine.

##### Response (`200 OK`)
```json
{
  "ollama": {
    "available": true,
    "activeModel": "gemma2:2b-instruct",
    "installedModels": ["gemma2:2b-instruct", "gemma2:9b-instruct"]
  },
  "embeddedModels": [
    {
      "id": "deterministic-gemma-rule-engine",
      "name": "Deterministic ATS Adapter (Zero-Latency Local Engine)",
      "status": "ready"
    }
  ]
}
```

---

### 3. Job Description Parser

#### `POST /api/parse-job`
Normalizes raw scraped HTML or plain-text job postings into a strongly typed `JobSpec` schema with keyword extraction.

##### Request Body
```json
{
  "rawText": "Senior Distributed Systems Engineer at Stripe. Requirements: Go, Kafka, Kubernetes, microservices...",
  "title": "Senior Distributed Systems Engineer",
  "company": "Stripe",
  "url": "https://stripe.com/jobs/123"
}
```

##### Response (`200 OK`)
```json
{
  "title": "Senior Distributed Systems Engineer",
  "company": "Stripe",
  "url": "https://stripe.com/jobs/123",
  "rawText": "Senior Distributed Systems Engineer at Stripe...",
  "keywords": ["go", "kafka", "kubernetes", "microservices", "distributed"],
  "requiredSkills": ["go", "kafka", "kubernetes"],
  "preferredSkills": ["microservices", "distributed"]
}
```

---

### 4. Resume Tailoring Workflow Execution

#### `POST /api/tailor`
Executes the full 5-step Mastra workflow: job normalization, skill delta gap analysis, context-aware rewriting, ATS verification, and artifact compilation.

##### Request Body
```json
{
  "jobSpec": {
    "title": "Senior Distributed Systems Engineer",
    "company": "Stripe",
    "rawText": "Requirements: Go, Kafka, Kubernetes..."
  },
  "masterResume": {
    "basics": { "name": "Alex Morgan", "email": "alex@example.com" },
    "work": [
      {
        "name": "Nexus Cloud Systems",
        "position": "Senior Engineer",
        "highlights": ["Built distributed event-driven pipeline processing 14M events daily."]
      }
    ],
    "skills": [{ "name": "Languages", "keywords": ["Go", "TypeScript"] }],
    "education": []
  },
  "options": {
    "model": "gemma2:2b-instruct",
    "tone": "technical",
    "forceDeterministic": false
  }
}
```

##### Response (`200 OK`)
```json
{
  "tailoredResume": {
    "basics": { ... },
    "work": [ ... ],
    "skills": [ ... ],
    "targetJobTitle": "Senior Distributed Systems Engineer",
    "targetCompany": "Stripe"
  },
  "atsScore": {
    "overall": 96,
    "previousScore": 54,
    "delta": "+42%",
    "matchedKeywords": ["go", "kafka", "kubernetes"],
    "missingKeywords": [],
    "keywordDensityScore": 92,
    "actionVerbRatio": 100
  },
  "artifacts": {
    "markdown": "# Alex Morgan\n\n## Experience...",
    "pdfBase64": "data:application/pdf;base64,JVBERi0xLjQKJ..."
  },
  "modelTelemetry": {
    "provider": "ollama",
    "model": "gemma2:2b-instruct",
    "latencyMs": 1420,
    "mode": "neural-gemma",
    "status": "success"
  }
}
```

---

### 5. Master Resume Profile Persistence

#### `GET /api/resume/master`
Reads the stored master resume profile from `server/data/master_resume.json`.

##### Response (`200 OK`)
Returns JSON matching `MasterResumeSchema`.

#### `POST /api/resume/master`
Atomically validates and writes an updated master resume profile to local disk.

##### Request Body
JSON payload satisfying `MasterResumeSchema`.

##### Response (`200 OK`)
```json
{
  "success": true,
  "data": { ... }
}
```

---

### 6. Document Binary Streaming Endpoints

#### `POST /api/export/pdf`
Compiles and streams a single-column ATS-friendly binary PDF attachment.

- **Request Body**: JSON payload matching `TailoredResumeSchema`.
- **Headers**:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="{Candidate_Name}_Resume.pdf"`

#### `POST /api/export/markdown`
Compiles and streams plain-text GitHub-flavored Markdown.

- **Request Body**: JSON payload matching `TailoredResumeSchema`.
- **Headers**:
  - `Content-Type: text/markdown; charset=utf-8`
