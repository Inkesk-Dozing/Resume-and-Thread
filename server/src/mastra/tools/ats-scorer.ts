import { JobSpec, MasterResume, AtsScore } from '../../schemas/index.js';

const ATS_ACTION_VERBS = new Set([
  'accelerated', 'achieved', 'advanced', 'amplified', 'architected', 'automated',
  'boosted', 'built', 'centralized', 'championed', 'consolidated', 'constructed',
  'decreased', 'delivered', 'deployed', 'designed', 'developed', 'directed',
  'eliminated', 'engineered', 'enhanced', 'established', 'executed', 'expanded',
  'formulated', 'generated', 'governed', 'guided', 'halved', 'headed',
  'implemented', 'improved', 'increased', 'initiated', 'innovated', 'integrated',
  'launched', 'led', 'leveraged', 'maximized', 'mentored', 'minimized',
  'modernized', 'optimized', 'orchestrated', 'overhauled', 'pioneered', 'reduced',
  'refactored', 'resolved', 'restructured', 'scaled', 'spearheaded', 'streamlined',
  'surpassed', 'systematized', 'transformed', 'upgraded', 'validated'
]);

export function extractKeywordsFromText(text: string): string[] {
  const normalized = text.toLowerCase();
  const tokenRegex = /[a-zA-Z0-9+#.-]{2,}/g;
  const matches = normalized.match(tokenRegex) || [];
  
  const stopWords = new Set([
    'and', 'the', 'for', 'with', 'you', 'that', 'our', 'are', 'this', 'will',
    'have', 'from', 'your', 'about', 'can', 'all', 'working', 'work', 'experience',
    'team', 'years', 'requirements', 'responsibilities', 'opportunity', 'company'
  ]);

  const freq: Record<string, number> = {};
  matches.forEach(t => {
    if (!stopWords.has(t) && t.length > 2) {
      freq[t] = (freq[t] || 0) + 1;
    }
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([k]) => k);
}

export function calculateAtsScore(
  jobSpec: JobSpec,
  masterResume: MasterResume,
  tailoredResume: MasterResume
): AtsScore {
  const targetKeywords = jobSpec.keywords.length > 0 
    ? jobSpec.keywords.map(k => k.toLowerCase())
    : extractKeywordsFromText(jobSpec.rawText);

  const getResumeWords = (resume: MasterResume): string[] => {
    const textPieces: string[] = [
      resume.basics.summary || '',
      ...(resume.work || []).flatMap(w => w.highlights),
      ...(resume.skills || []).flatMap(s => s.keywords)
    ];
    return textPieces.join(' ').toLowerCase().match(/[a-zA-Z0-9+#.-]{2,}/g) || [];
  };

  const masterWords = new Set(getResumeWords(masterResume));
  const tailoredWords = new Set(getResumeWords(tailoredResume));

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  targetKeywords.forEach(kw => {
    if (tailoredWords.has(kw)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  const masterMatches = targetKeywords.filter(kw => masterWords.has(kw)).length;
  const tailoredMatches = matchedKeywords.length;
  const totalKeywords = Math.max(targetKeywords.length, 1);

  let totalBullets = 0;
  let actionBullets = 0;
  let quantifiedBullets = 0;

  const metricRegex = /\d+[%kKmMbB]?|\$\d+|\b(reduced|increased|improved|cut)\b/i;

  (tailoredResume.work || []).forEach(w => {
    w.highlights.forEach(h => {
      totalBullets++;
      const firstWord = h.trim().split(/\s+/)[0]?.toLowerCase();
      if (firstWord && ATS_ACTION_VERBS.has(firstWord)) {
        actionBullets++;
      }
      if (metricRegex.test(h)) {
        quantifiedBullets++;
      }
    });
  });

  const actionVerbRatio = totalBullets > 0 ? Math.round((actionBullets / totalBullets) * 100) : 80;
  const metricRatio = totalBullets > 0 ? Math.round((quantifiedBullets / totalBullets) * 100) : 70;

  const baselineCoverage = (masterMatches / totalKeywords) * 100;
  const tailoredCoverage = (tailoredMatches / totalKeywords) * 100;

  const previousScore = Math.min(95, Math.max(30, Math.round(baselineCoverage * 0.7 + 20)));
  const overall = Math.min(98, Math.max(65, Math.round(
    tailoredCoverage * 0.55 + 
    actionVerbRatio * 0.25 + 
    metricRatio * 0.20
  )));

  const delta = overall >= previousScore ? `+${overall - previousScore}%` : `${overall - previousScore}%`;

  return {
    overall,
    previousScore,
    delta,
    matchedKeywords,
    missingKeywords,
    keywordDensityScore: 92,
    actionVerbRatio
  };
}
