# Local REST & WebSocket API Specification

## Server Endpoint: `http://127.0.0.1:4141`

All requests originate from the authorized Chrome Extension origin (`chrome-extension://*`) or localhost.

---

### 1. Health & Model Status Check

#### `GET /api/health`
Returns the status of the Mastra orchestration engine and the active inference backend.

##### Response (200 OK)
```json
{
  "uptimeSec": 120,
  "system": { "rssMb": 56, "heapUsedMb": 18 },
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

### 2. Parse Job Description (Preview)

#### `POST /api/parse-job`
Normalizes raw scraped HTML or plain text into a structured job specification.

##### Request Body
```json
{
  "rawText": "Senior Distributed Systems Engineer at Stripe...",
  "title": "Senior Distributed Systems Engineer",
  "company": "Stripe"
}
```

##### Response (200 OK)
```json
{
  "title": "Senior Distributed Systems Engineer",
  "company": "Stripe",
  "url": "",
  "rawText": "Senior Distributed Systems Engineer at Stripe...",
  "keywords": ["go", "kafka", "distributed", "kubernetes", "microservices"],
  "requiredSkills": ["go", "kafka", "distributed"],
  "preferredSkills": ["kubernetes", "microservices"]
}
```

---

### 3. Tailor Resume Workflow Execution

#### `POST /api/tailor`
Executes the full 5-step Mastra workflow to produce tailored resume artifacts.

##### Request Body
```json
{
  "jobSpec": {
    "title": "Senior Distributed Systems Engineer",
    "company": "Stripe",
    "rawText": "Requirements: Go, Kafka, Kubernetes, distributed transactions."
  },
  "masterResume": {
    "basics": { "name": "Alex Morgan", "label": "Full Stack Engineer" },
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
    "tone": "technical"
  }
}
```

##### Response (200 OK)
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
    "matchedKeywords": ["go", "kafka", "distributed", "kubernetes"],
    "missingKeywords": [],
    "keywordDensityScore": 92,
    "actionVerbRatio": 100
  },
  "artifacts": {
    "markdown": "# Alex Morgan\n\n## Experience...",
    "pdfBase64": "data:application/pdf;base64,JVBERi0xLjQKJ..."
  },
  "modelTelemetry": {
    "provider": "embedded-engine",
    "model": "deterministic-gemma-rule-engine",
    "latencyMs": 4,
    "mode": "deterministic-adapter",
    "status": "fallback_active"
  }
}
```
