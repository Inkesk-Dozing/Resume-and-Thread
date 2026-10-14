# Component Specification: Job Scraper

## 1. Purpose

The `JobScraper` content script component operates inside active browser tabs on designated recruitment portals (LinkedIn, Indeed, Greenhouse, Lever, Ashby, Workday). It deterministically extracts, sanitizes, and normalizes unstructured job specifications into strongly typed `JobSpec` payloads.

---

## 2. Dependencies

- **Chrome Extension Content Script Runtime** (DOM access)
- **DOMPurify / TextNode Traversal** (HTML payload stripping)
- **Regex Taxonomy Matcher** (Entity recognition)

---

## 3. Algorithmic Complexity

- **DOM Extraction**: $O(N)$ where $N$ is the number of DOM nodes within the targeted container subtree. Heuristic pruning bounds traversal to the primary article selector.
- **Sanitization & Normalization**: $O(T)$ where $T$ is the total character length of the raw job text (typically $2,000 \le T \le 12,000$).
- **Overall Time Complexity**: $O(N + T)$ with deterministic sub-50ms execution latency.
- **Space Complexity**: $O(T)$ representing the sanitized text payload.

---

## 4. Extraction Strategy by Platform

| Platform | Title Selector | Company Selector | Description Container |
|---|---|---|---|
| **LinkedIn** | `.job-details-jobs-unified-top-card__job-title` | `.job-details-jobs-unified-top-card__company-name` | `.jobs-description-content__text` |
| **Greenhouse** | `.app-title` | `.company-name` | `#content` |
| **Lever** | `.posting-headline h2` | `.main-header-logo` | `.posting-requirements` |
| **Indeed** | `.jobsearch-JobInfoHeader-title` | `[data-company-name="true"]` | `#jobDescriptionText` |
| **Ashby** | `[data-testid="job-title"]` | `[data-testid="company-name"]` | `[data-testid="job-details"]` |
| **Workday** | `[data-automation-id="jobPostingHeader"]` | `[data-automation-id="companyName"]` | `[data-automation-id="jobPostingDescription"]` |
| **Generic Fallback** | `h1` | `h2, [class*="company"]` | Maximum text-density container |
