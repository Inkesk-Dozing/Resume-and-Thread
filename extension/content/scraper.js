/**
 * Resume & Thread: Robust Multi-Portal DOM Scraper
 * Extracts and sanitizes job specifications without sending data to any external server.
 */

(() => {
  // Prevent duplicate script execution
  if (window.__RESUME_AND_THREAD_SCRAPER_LOADED__) return;
  window.__RESUME_AND_THREAD_SCRAPER_LOADED__ = true;

  /**
   * Sanitizes text by stripping dangerous characters, normalizing whitespace,
   * and removing excess punctuation.
   */
  function sanitizeText(raw) {
    if (!raw) return '';
    return raw
      .replace(/<[^>]*>?/gm, ' ') // Strip HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Scrapes job information based on domain heuristics.
   */
  function extractJobSpec() {
    const url = window.location.href;
    const hostname = window.location.hostname;
    let title = '';
    let company = '';
    let description = '';

    // 1. LinkedIn Jobs
    if (hostname.includes('linkedin.com')) {
      title = document.querySelector(
        '.job-details-jobs-unified-top-card__job-title, .topcard__title, .jobs-unified-top-card__job-title, h1.t-24'
      )?.textContent || '';

      company = document.querySelector(
        '.job-details-jobs-unified-top-card__company-name, .topcard__org-name-link, .jobs-unified-top-card__company-name'
      )?.textContent || '';

      description = document.querySelector(
        '.jobs-description-content__text, #job-details, .show-more-less-html__markup'
      )?.textContent || '';
    }
    // 2. Greenhouse
    else if (hostname.includes('greenhouse.io') || document.querySelector('#grnhse_app')) {
      title = document.querySelector('.app-title, .job-title, h1')?.textContent || '';
      company = document.querySelector('.company-name')?.textContent || '';
      description = document.querySelector('#content, #main, .body')?.textContent || '';
    }
    // 3. Lever
    else if (hostname.includes('lever.co')) {
      title = document.querySelector('.posting-headline h2, h2')?.textContent || '';
      company = document.querySelector('.main-header-logo img')?.alt || '';
      description = document.querySelector('.posting-requirements, .section-wrapper')?.textContent || '';
    }
    // 4. Indeed
    else if (hostname.includes('indeed.com')) {
      title = document.querySelector('.jobsearch-JobInfoHeader-title, h1')?.textContent || '';
      company = document.querySelector('[data-company-name="true"], .jobsearch-InlineCompanyRating-companyHeader')?.textContent || '';
      description = document.querySelector('#jobDescriptionText')?.textContent || '';
    }
    // 5. Ashby
    else if (hostname.includes('ashbyhq.com')) {
      title = document.querySelector('[data-testid="job-title"], h1')?.textContent || '';
      company = document.querySelector('[data-testid="company-name"]')?.textContent || '';
      description = document.querySelector('[data-testid="job-details"]')?.textContent || '';
    }
    // 6. Workday
    else if (hostname.includes('myworkdayjobs.com')) {
      title = document.querySelector('[data-automation-id="jobPostingHeader"], h1')?.textContent || '';
      company = document.querySelector('[data-automation-id="companyName"]')?.textContent || '';
      description = document.querySelector('[data-automation-id="jobPostingDescription"]')?.textContent || '';
    }

    // Generic Fallback Heuristic
    if (!title) {
      const h1 = document.querySelector('h1');
      if (h1) title = h1.textContent;
    }
    if (!description) {
      const candidates = Array.from(document.querySelectorAll('article, main, section, [class*="job"], [class*="description"]'));
      let bestLength = 0;
      candidates.forEach(el => {
        const text = el.textContent || '';
        if (text.length > bestLength && text.length < 30000) {
          bestLength = text.length;
          description = text;
        }
      });
      if (!description) {
        description = document.body.textContent.slice(0, 8000);
      }
    }

    return {
      url,
      title: sanitizeText(title) || 'Unknown Position',
      company: sanitizeText(company) || 'Target Company',
      rawText: sanitizeText(description),
      timestamp: new Date().toISOString()
    };
  }

  // Listen for extraction requests
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'SCRAPE_JOB_SPEC') {
      try {
        const data = extractJobSpec();
        sendResponse({ success: true, data });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    }
    return true;
  });
})();
