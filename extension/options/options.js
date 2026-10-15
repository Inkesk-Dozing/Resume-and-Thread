/**
 * Resume & Thread: Options Page Controller
 * Manages Master Resume editing, schema verification, local persistence, and engine diagnostics.
 */

const LOCAL_SERVER_URL = 'http://127.0.0.1:4141';

const DEFAULT_SAMPLE_RESUME = {
  basics: {
    name: "Alex Morgan",
    label: "Senior Full Stack Engineer",
    email: "alex.morgan.dev@gmail.com",
    phone: "+1 (555) 234-5678",
    url: "https://github.com/alexmorgan",
    summary: "Full stack engineer with 6+ years of experience designing scalable microservices, low-latency distributed APIs, and responsive modern web architectures. Specialized in TypeScript, React, Node.js, and cloud platforms.",
    location: {
      city: "San Francisco",
      region: "CA",
      countryCode: "US"
    }
  },
  work: [
    {
      name: "Nexus Cloud Systems",
      position: "Senior Full Stack Engineer",
      startDate: "2022-03",
      endDate: "Present",
      summary: "Distributed systems and real-time backend engineering.",
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
      summary: "Customer-facing applications and continuous integration workflows.",
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

document.addEventListener('DOMContentLoaded', async () => {
  const jsonEditor = document.getElementById('jsonEditor');
  const resumePreview = document.getElementById('resumePreview');
  const btnSaveResume = document.getElementById('btnSaveResume');
  const btnResetDefault = document.getElementById('btnResetDefault');
  const btnTestConnection = document.getElementById('btnTestConnection');
  const btnCopyOllamaCmd = document.getElementById('btnCopyOllamaCmd');
  const saveStatus = document.getElementById('saveStatus');
  const connectionDiagnostic = document.getElementById('connectionDiagnostic');
  const diagIcon = document.getElementById('diagIcon');
  const diagTitle = document.getElementById('diagTitle');
  const diagMessage = document.getElementById('diagMessage');

  // 1. Initial Load: Try Chrome Storage, fallback to server or default sample
  const storage = await chrome.storage.local.get(['masterResume']);
  if (storage.masterResume) {
    jsonEditor.value = JSON.stringify(storage.masterResume, null, 2);
    renderPreview(storage.masterResume);
  } else {
    try {
      const res = await fetch(`${LOCAL_SERVER_URL}/api/resume/master`);
      if (res.ok) {
        const serverData = await res.json();
        jsonEditor.value = JSON.stringify(serverData, null, 2);
        renderPreview(serverData);
        await chrome.storage.local.set({ masterResume: serverData });
      } else {
        throw new Error();
      }
    } catch {
      jsonEditor.value = JSON.stringify(DEFAULT_SAMPLE_RESUME, null, 2);
      renderPreview(DEFAULT_SAMPLE_RESUME);
      await chrome.storage.local.set({ masterResume: DEFAULT_SAMPLE_RESUME });
    }
  }

  // 2. Real-time preview update on typing
  jsonEditor.addEventListener('input', () => {
    saveStatus.textContent = 'Unsaved changes...';
    saveStatus.style.color = '#f59e0b';
    try {
      const parsed = JSON.parse(jsonEditor.value);
      renderPreview(parsed);
    } catch {
      // Incomplete JSON while typing
    }
  });

  // 3. Save Resume
  btnSaveResume.addEventListener('click', async () => {
    try {
      const parsed = JSON.parse(jsonEditor.value);
      await chrome.storage.local.set({ masterResume: parsed });

      // Sync with local server
      fetch(`${LOCAL_SERVER_URL}/api/resume/master`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      }).catch(() => {});

      saveStatus.textContent = 'Saved Locally ✓';
      saveStatus.style.color = '#10b981';
      renderPreview(parsed);
    } catch (err) {
      alert('Invalid JSON: ' + err.message);
    }
  });

  // 4. Reset to Default Sample
  btnResetDefault.addEventListener('click', () => {
    if (confirm('Load sample master resume template?')) {
      jsonEditor.value = JSON.stringify(DEFAULT_SAMPLE_RESUME, null, 2);
      renderPreview(DEFAULT_SAMPLE_RESUME);
      chrome.storage.local.set({ masterResume: DEFAULT_SAMPLE_RESUME });
      saveStatus.textContent = 'Sample Loaded ✓';
      saveStatus.style.color = '#10b981';
    }
  });

  // 5. Test Engine Connection
  btnTestConnection.addEventListener('click', async () => {
    connectionDiagnostic.style.display = 'flex';
    connectionDiagnostic.className = 'diag-banner';
    diagIcon.textContent = '⏳';
    diagTitle.textContent = 'Testing connection to 127.0.0.1:4141...';
    diagMessage.textContent = 'Pinging Mastra engine and checking Ollama model status...';

    const start = Date.now();
    try {
      const res = await fetch(`${LOCAL_SERVER_URL}/api/health`, { method: 'GET' });
      const latency = Date.now() - start;

      if (res.ok) {
        const data = await res.json();
        const provider = data.modelProvider || {};
        const isNeural = provider.mode === 'neural-gemma';

        if (isNeural) {
          connectionDiagnostic.className = 'diag-banner success';
          diagIcon.textContent = '✓';
          diagTitle.textContent = `Connected! Neural Gemma 2 Active (${latency}ms)`;
          diagMessage.textContent = `Engine: ${data.engine} · Active Model: ${provider.activeModel} · Memory: ${data.system?.heapUsedMb || 0}MB Heap`;
        } else {
          connectionDiagnostic.className = 'diag-banner warning';
          diagIcon.textContent = '🪡';
          diagTitle.textContent = `Connected! Embedded Deterministic Engine Active (${latency}ms)`;
          diagMessage.textContent = `${provider.notice || 'Local engine ready. Zero cloud network telemetry.'}`;
        }
      } else {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
    } catch (err) {
      connectionDiagnostic.className = 'diag-banner error';
      diagIcon.textContent = '❌';
      diagTitle.textContent = 'Engine Offline';
      diagMessage.textContent = `Could not reach 127.0.0.1:4141. Open terminal in /server and run "npm run dev". (${err.message})`;
    }
  });

  // 6. Copy Ollama command helper
  if (btnCopyOllamaCmd) {
    btnCopyOllamaCmd.addEventListener('click', () => {
      navigator.clipboard.writeText('ollama run gemma2:2b').then(() => {
        btnCopyOllamaCmd.textContent = 'Copied!';
        setTimeout(() => { btnCopyOllamaCmd.textContent = 'Copy'; }, 2000);
      });
    });
  }

  // 7. Structured preview renderer
  function renderPreview(resume) {
    if (!resume || !resume.basics) return;

    let html = `
      <div class="preview-name">${escapeHtml(resume.basics.name || '')}</div>
      <div class="preview-label">${escapeHtml(resume.basics.label || '')}</div>
      <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 16px;">${escapeHtml(resume.basics.summary || '')}</p>

      <div class="preview-section-title">Experience</div>
    `;

    if (Array.isArray(resume.work)) {
      resume.work.forEach(w => {
        html += `
          <div class="preview-job">
            <div class="preview-job-title">${escapeHtml(w.position || '')} · <span style="color: #34d399">${escapeHtml(w.name || '')}</span></div>
            <div class="preview-job-company">${escapeHtml(w.startDate || '')} – ${escapeHtml(w.endDate || 'Present')}</div>
            <ul class="preview-bullets">
              ${(w.highlights || []).map(h => `<li>${escapeHtml(h)}</li>`).join('')}
            </ul>
          </div>
        `;
      });
    }

    if (Array.isArray(resume.skills)) {
      html += `<div class="preview-section-title">Technical Skills</div><p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.6;">`;
      resume.skills.forEach(s => {
        html += `<strong>${escapeHtml(s.name)}:</strong> ${(s.keywords || []).join(', ')}<br>`;
      });
      html += `</p>`;
    }

    if (Array.isArray(resume.education) && resume.education.length > 0) {
      html += `<div class="preview-section-title">Education</div><p style="font-size: 0.85rem; color: #cbd5e1;">`;
      resume.education.forEach(e => {
        const degree = [e.studyType, e.area].filter(Boolean).join(' in ');
        html += `<strong>${escapeHtml(e.institution)}</strong> — ${escapeHtml(degree)} (${escapeHtml(e.startDate || '')} – ${escapeHtml(e.endDate || '')})<br>`;
      });
      html += `</p>`;
    }

    resumePreview.innerHTML = html;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }
});
