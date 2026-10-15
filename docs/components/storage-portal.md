# Component Specification: Storage Portal & Master Profile Store

## 1. Purpose

The Storage Portal provides local persistence for the candidate's master resume profile across two synchronized interfaces:
1. **Local Server Disk Persistence** ([`server/src/services/storage.ts`](file:///c:/Users/USER/Desktop/Extras/pending-projects/Resume-and-Thread/server/src/services/storage.ts)): Atomic read/write operations targeting `server/data/master_resume.json`.
2. **Chrome Extension Options Portal** ([`extension/options/`](file:///c:/Users/USER/Desktop/Extras/pending-projects/Resume-and-Thread/extension/options)): In-browser JSON schema editor with live syntax highlighting and validation against `MasterResumeSchema`.

---

## 2. Dependencies

- **Node.js Native**: `fs`, `path`
- **Chrome Storage API**: `chrome.storage.local`
- **Zod Schemas**: `MasterResumeSchema`

---

## 3. Algorithmic Complexity

- **Disk Read (`loadMasterResume`)**: $O(F)$ synchronous file read and JSON parse, where $F$ is file size (typically $4\text{KB} - 15\text{KB}$, execution $<1\text{ms}$).
- **Disk Write (`saveMasterResume`)**: $O(F)$ atomic serialization and disk sync.
- **Client Schema Validation**: $O(J)$ traversal validating JSON AST nodes against Zod schema rules ($<5\text{ms}$).
- **Space Complexity**: $O(F)$ memory allocation for profile JSON.

---

## 4. Resilience & Fallback

- **Auto-Initialization**: If `server/data/master_resume.json` does not exist on initial startup, the service automatically seeds it with an executive full-stack software engineer sample template (`DEFAULT_SAMPLE_RESUME`).
- **Synchronized Fallback**: If the extension cannot connect to the local server, it seamlessly persists and loads the master resume from Chrome's sandboxed `chrome.storage.local`.
