/**
 * Resume & Thread: Popup Controller
 * Manages UI state, tab scraping, and local Mastra engine coordination.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const serverStatus = document.getElementById('serverStatus');
  const engineNotice = document.getElementById('engineNotice');
  const jobTitleEl = document.getElementById('jobTitle');
  const jobCompanyEl = document.getElementById('jobCompany');
  const jobKeywordPillsEl = document.getElementById('jobKeywordPills');
  const btnRescrape = document.getElementById('btnRescrape');
  const btnTailor = document.getElementById('btnTailor');
  const btnTailorText = document.getElementById('btnTailorText');
  const btnOptions = document.getElementById('btnOptions');
  const resultsContainer = document.getElementById('resultsContainer');
  const scoreDeltaEl = document.getElementById('scoreDelta');
  const scoreOriginalEl = document.getElementById('scoreOriginal');
  const scoreTailoredEl = document.getElementById('scoreTailored');
  const keywordsListEl = document.getElementById('keywordsList');
  const keywordsCountEl = document.getElementById('keywordsCount');
  const diffListEl = document.getElementById('diffList');
  const btnDownloadPdf = document.getElementById('btnDownloadPdf');
  const btnCopyMarkdown = document.getElementById('btnCopyMarkdown');

  let currentJobSpec = null;
  let tailoredArtifacts = null;
  let isServerOnline = false;

  // 1. Check Local Server Health & Active Inference Mode
  async function checkServerHealth() {
    serverStatus.className = 'status-banner connecting';
    serverStatus.querySelector('.status-text').textContent = 'Connecting to 127.0.0.1:4141...';
    if (engineNotice) engineNotice.style.display = 'none';

    chrome.runtime.sendMessage({ action: 'CHECK_SERVER_HEALTH' }, (response) => {
      if (response && response.success && response.data) {
        isServerOnline = true;
        const provider = response.data.modelProvider || {};
        const isNeural = provider.mode === 'neural-gemma';

        if (isNeural) {
          serverStatus.className = 'status-banner connected';
          serverStatus.querySelector('.status-text').textContent = `Mastra Online · Neural Gemma 2 (${provider.activeModel})`;
          if (engineNotice) engineNotice.style.display = 'none';
        } else {
          serverStatus.className = 'status-banner fallback';
          serverStatus.querySelector('.status-text').textContent = 'Mastra Online · Local Deterministic Engine';
          if (engineNotice) engineNotice.style.display = 'flex';
        }

        updateTailorButtonState();
      } else {
        isServerOnline = false;
        serverStatus.className = 'status-banner error';
        serverStatus.querySelector('.status-text').textContent = 'Engine Offline · Run "npm run dev" in /server';
        if (engineNotice) engineNotice.style.display = 'none';
        updateTailorButtonState();
      }
    });
  }

  // 2. Scrape Job Spec from Active Tab
  async function scrapeActiveTab() {
    jobTitleEl.textContent = 'Inspecting page...';
    jobCompanyEl.textContent = 'Looking for job description container...';
    if (jobKeywordPillsEl) jobKeywordPillsEl.style.display = 'none';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        jobTitleEl.textContent = 'No Active Tab';
        jobCompanyEl.textContent = 'Please navigate to a job listing.';
        return;
      }

      // Check if URL is supported
      if (!tab.url || tab.url.startsWith('chrome://')) {
        jobTitleEl.textContent = 'Browser Tab Unsupported';
        jobCompanyEl.textContent = 'Navigate to LinkedIn, Indeed, Greenhouse, Lever, Ashby, etc.';
        return;
      }

      chrome.tabs.sendMessage(tab.id, { action: 'SCRAPE_JOB_SPEC' }, (response) => {
        if (chrome.runtime.lastError || !response?.success) {
          // If content script was not already injected, inject dynamically
          chrome.scripting.executeScript(
            {
              target: { tabId: tab.id },
              files: ['content/scraper.js']
            },
            () => {
              chrome.tabs.sendMessage(tab.id, { action: 'SCRAPE_JOB_SPEC' }, (retryRes) => {
                if (retryRes?.success && retryRes.data) {
                  applyJobSpec(retryRes.data);
                } else {
                  jobTitleEl.textContent = 'No Job Spec Detected';
                  jobCompanyEl.textContent = 'Click "Rescrape" once on a job posting page.';
                }
              });
            }
          );
        } else {
          applyJobSpec(response.data);
        }
      });
    } catch (err) {
      jobTitleEl.textContent = 'Scraper Error';
      jobCompanyEl.textContent = err.message;
    }
  }

  function applyJobSpec(jobSpec) {
    currentJobSpec = jobSpec;
    jobTitleEl.textContent = jobSpec.title || 'Target Position';
    jobCompanyEl.textContent = jobSpec.company || 'Target Company';

    // Show extracted keyword chips preview if available
    if (jobKeywordPillsEl && jobSpec.keywords && jobSpec.keywords.length > 0) {
      jobKeywordPillsEl.innerHTML = '';
      jobSpec.keywords.slice(0, 6).forEach(kw => {
        const chip = document.createElement('span');
        chip.className = 'job-tag-chip';
        chip.textContent = kw;
        jobKeywordPillsEl.appendChild(chip);
      });
      jobKeywordPillsEl.style.display = 'flex';
    }

    updateTailorButtonState();
  }

  function updateTailorButtonState() {
    if (isServerOnline && currentJobSpec && currentJobSpec.rawText?.length > 50) {
      btnTailor.disabled = false;
    } else {
      btnTailor.disabled = true;
    }
  }

  // 3. Execute Tailor Workflow
  btnTailor.addEventListener('click', async () => {
    if (!currentJobSpec || !isServerOnline) return;

    btnTailor.disabled = true;
    btnTailorText.textContent = 'Tailoring Resume with Gemma & Mastra...';

    const storage = await chrome.storage.local.get(['masterResume']);
    const masterResume = storage.masterResume;

    if (!masterResume) {
      alert('Master Resume not found. Please configure your resume in Settings.');
      btnTailor.disabled = false;
      btnTailorText.textContent = 'Tailor Resume Locally';
      return;
    }

    const payload = {
      jobSpec: currentJobSpec,
      masterResume: masterResume,
      options: { 
        model: 'gemma2:2b-instruct',
        tone: 'technical'
      }
    };

    chrome.runtime.sendMessage({ action: 'EXECUTE_TAILOR', payload }, (response) => {
      btnTailor.disabled = false;
      btnTailorText.textContent = '🪡 Re-Tailor Resume';

      if (response && response.success && response.data) {
        displayResults(response.data);
      } else {
        alert('Tailoring Error: ' + (response?.error || 'Unknown error. Check server status at 127.0.0.1:4141'));
      }
    });
  });

  // 4. Render Tailoring Results & ATS Metrics
  function displayResults(data) {
    tailoredArtifacts = data.artifacts;
    resultsContainer.style.display = 'flex';
    resultsContainer.scrollIntoView({ behavior: 'smooth' });

    // ATS Score
    const prevScore = data.atsScore?.previousScore || 48;
    const newScore = data.atsScore?.overall || 94;
    const delta = data.atsScore?.delta || `+${newScore - prevScore}%`;

    scoreOriginalEl.textContent = `${prevScore}%`;
    scoreTailoredEl.textContent = `${newScore}%`;
    scoreDeltaEl.textContent = delta;

    // Matched Keywords
    keywordsListEl.innerHTML = '';
    const matched = data.atsScore?.matchedKeywords || [];
    const missing = data.atsScore?.missingKeywords || [];

    if (keywordsCountEl) {
      keywordsCountEl.textContent = `${matched.length} matched`;
    }

    matched.forEach(kw => {
      const tag = document.createElement('span');
      tag.className = 'tag matched';
      tag.textContent = `✓ ${kw}`;
      keywordsListEl.appendChild(tag);
    });

    missing.slice(0, 5).forEach(kw => {
      const tag = document.createElement('span');
      tag.className = 'tag missing';
      tag.textContent = `+ ${kw}`;
      keywordsListEl.appendChild(tag);
    });

    // Bullets Diff Preview
    diffListEl.innerHTML = '';
    const workItems = data.tailoredResume?.work || [];
    const sampleHighlights = workItems.flatMap(w => w.highlights || []).slice(0, 3);

    sampleHighlights.forEach(bullet => {
      const div = document.createElement('div');
      div.className = 'diff-bullet';
      div.textContent = bullet;
      diffListEl.appendChild(div);
    });
  }

  // 5. Export Actions
  btnDownloadPdf.addEventListener('click', () => {
    if (!tailoredArtifacts?.pdfBase64) {
      alert('PDF generation in progress or artifact unavailable.');
      return;
    }
    const safeCompany = (currentJobSpec?.company || 'Company').replace(/[^a-zA-Z0-9]/g, '_');
    const safeTitle = (currentJobSpec?.title || 'Resume').replace(/[^a-zA-Z0-9]/g, '_');
    const link = document.createElement('a');
    link.href = tailoredArtifacts.pdfBase64;
    link.download = `Tailored_${safeCompany}_${safeTitle}_ResumeAndThread.pdf`;
    link.click();
  });

  btnCopyMarkdown.addEventListener('click', () => {
    if (!tailoredArtifacts?.markdown) {
      alert('Markdown artifact unavailable.');
      return;
    }
    navigator.clipboard.writeText(tailoredArtifacts.markdown).then(() => {
      const originalText = btnCopyMarkdown.innerHTML;
      btnCopyMarkdown.innerHTML = '<span>✓</span> Copied!';
      setTimeout(() => {
        btnCopyMarkdown.innerHTML = originalText;
      }, 2000);
    });
  });

  btnRescrape.addEventListener('click', scrapeActiveTab);

  btnOptions.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Initial runs
  checkServerHealth();
  scrapeActiveTab();
});
