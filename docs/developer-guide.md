# Resume & Thread: Developer Guide & Contributor Handbook

## 1. Local Workspace Initialization

### Prerequisites
- **Node.js** $\ge 18.0.0$
- **npm** $\ge 9.0.0$
- **Google Chrome** (or Chromium-based browser supporting Manifest V3)
- *(Optional)* **Ollama** with `gemma2:2b-instruct`

### Clone & Install
```bash
git clone https://github.com/Inkesk-Dozing/Resume-and-Thread.git
cd Resume-and-Thread/server
npm ci
```

---

## 2. Server Development Commands

All server scripts run from the `/server` directory:

```bash
# Start development server with live TypeScript compilation (ts-node)
npm run dev

# Compile TypeScript into JavaScript (/server/dist)
npm run build

# Run production build
npm start

# Execute full automated Vitest unit test suite
npm test
```

---

## 3. Chrome Extension Development & Debugging

1. Navigate to `chrome://extensions/` in Google Chrome.
2. Toggle **Developer mode** on (top-right).
3. Click **Load unpacked** and select the `/extension` directory.
4. **Service Worker Console**: Under the extension card, click `Inspect views: service worker` to monitor background network events, storage sync, and messages.
5. **Popup Inspection**: Right-click the extension icon in the Chrome toolbar and select **Inspect Popup** to view the DOM tree and JavaScript console.
6. **Content Script Debugging**: Open DevTools (`F12`) on any supported job portal (e.g. LinkedIn, Greenhouse) to observe scraper DOM traversal events.

---

## 4. Testing Protocols & Verification

The repository enforces a 100% pass mandate across all 4 test suites:
- `schemas.test.ts`: Verifies JSON Schema contracts and validation limits.
- `ats-scorer.test.ts`: Asserts mathematical determinism in ATS scoring calculations.
- `gemma-runner.test.ts`: Confirms sub-5ms fallback execution when Ollama is offline.
- `pdf-generator.test.ts`: Asserts `%PDF-` binary magic bytes and valid stream outputs.

Run all tests prior to submitting any pull request:
```bash
npm test --prefix server
```

---

## 5. Git & Contribution Workflow

1. Always branch from up-to-date `main`.
2. Follow **Conventional Commits**:
   - `feat(...)`: Functional capability
   - `fix(...)`: Bug correction
   - `docs(...)`: Documentation enhancement
   - `test(...)`: Unit test additions
   - `chore(...)`: Governance, dependencies, or maintenance
3. Open a Pull Request linking to the corresponding GitHub issue (`Closes #<issue_number>`).
