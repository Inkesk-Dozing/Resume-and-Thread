/**
 * Resume & Thread: Background Service Worker (Manifest V3)
 * Bridges communication between Chrome Extension contexts and the local Mastra server.
 */

const LOCAL_SERVER_URL = 'http://127.0.0.1:4141';

// Default Master Resume Template for initial onboarding
const DEFAULT_MASTER_RESUME = {
  basics: {
    name: "Alex Morgan",
    label: "Senior Full Stack Engineer",
    email: "alex.morgan.dev@gmail.com",
    phone: "+1 (555) 234-5678",
    url: "https://github.com/alexmorgan",
    summary: "Full stack engineer with 6+ years of experience designing scalable microservices, low-latency distributed APIs, and responsive modern web architectures. Specialized in TypeScript, React, Node.js, and cloud platforms."
  },
  work: [
    {
      name: "Nexus Cloud Systems",
      position: "Senior Full Stack Engineer",
      startDate: "2022-03",
      endDate: "Present",
      highlights: [
        "Architected and deployed distributed event-driven pipeline processing 14M events daily using Node.js, Kafka, and Redis, decreasing message processing lag by 34%.",
        "Refactored legacy monolith into modular microservices with strict TypeScript contracts, reducing deployment failure rates from 8% to under 0.5%.",
        "Engineered real-time collaboration canvas in React and WebSockets, supporting 50+ concurrent editors with sub-20ms state sync latency."
      ]
    },
    {
      name: "Vanguard Tech Solutions",
      position: "Software Engineer",
      startDate: "2019-06",
      endDate: "2022-02",
      highlights: [
        "Built customer-facing analytics dashboards using React, TailwindCSS, and PostgreSQL, increasing monthly active user engagement by 22%.",
        "Automated CI/CD deployment workflows with GitHub Actions and Docker, reducing build-to-production deployment duration from 45 minutes to 8 minutes.",
        "Authored comprehensive unit and integration test suites using Vitest and Playwright, raising codebase test coverage from 48% to 88%."
      ]
    }
  ],
  skills: [
    { name: "Programming Languages", keywords: ["TypeScript", "JavaScript", "Python", "Go", "SQL"] },
    { name: "Frameworks & Libraries", keywords: ["React", "Next.js", "Node.js", "Express", "TailwindCSS"] },
    { name: "Databases & Storage", keywords: ["PostgreSQL", "Redis", "MongoDB", "Prisma"] },
    { name: "Cloud & DevOps", keywords: ["Docker", "Kubernetes", "AWS", "GitHub Actions", "Kafka"] }
  ],
  education: [
    {
      institution: "State University of Technology",
      area: "Computer Science",
      studyType: "B.S.",
      startDate: "2015-09",
      endDate: "2019-05"
    }
  ]
};

// Initialize default storage on installation
chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(['masterResume', 'localServerUrl']);
  if (!existing.masterResume) {
    await chrome.storage.local.set({ masterResume: DEFAULT_MASTER_RESUME });
  }
  if (!existing.localServerUrl) {
    await chrome.storage.local.set({ localServerUrl: LOCAL_SERVER_URL });
  }
  console.log('[Resume & Thread] Extension initialized with local-first storage defaults.');
});

// Message listener for popup and content script requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'CHECK_SERVER_HEALTH') {
    fetch(`${LOCAL_SERVER_URL}/api/health`, { method: 'GET' })
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.action === 'EXECUTE_TAILOR') {
    fetch(`${LOCAL_SERVER_URL}/api/tailor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.payload)
    })
      .then(async res => {
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || `Server responded with HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});
