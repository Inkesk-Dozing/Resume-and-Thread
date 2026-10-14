# Security & Privacy Policy: Resume & Thread

## Core Privacy Pledge: Zero-Cloud PII Guarantee

Resume & Thread is engineered on the non-negotiable premise of **Absolute Local Privacy**:
- **Zero Third-Party Cloud Transmissions**: Master resumes, work histories, contact numbers, email addresses, and residential locations are never dispatched to third-party SaaS wrappers or remote API servers.
- **Local Model Processing**: All model inference executes strictly on the user's host machine using open-weight language models (Google Gemma 2 via Ollama / llama.cpp or embedded deterministic rule engine) orchestrated through a local Mastra runtime.
- **Encrypted Local Persistence**: Master resumes and profile configurations are stored either in `chrome.storage.local` or on the local filesystem under user control.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security flaw or data-leakage vulnerability:
1. Disclose privately by contacting the core maintainers via GitHub Security Advisories or direct developer email.
2. Provide reproducible steps, the extension version, browser version, and local inference server configuration.
3. Maintainers will acknowledge within 48 hours and coordinate a public mitigation patch.

## Threat Model Highlights

- **DOM Injection & Scraping Boundaries**: The Chrome extension operates under strict Manifest V3 Content Security Policies (`script-src 'self'`). It isolates scraped job descriptions and sanitizes raw HTML inputs prior to passing payloads to the local Mastra orchestrator.
- **Local Port Binding**: The local backend binds strictly to `127.0.0.1` (localhost) with Origin verification to prevent cross-site request forgery from malicious browser tabs.
