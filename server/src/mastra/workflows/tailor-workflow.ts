import { JobSpec, MasterResume, TailorResponse } from '../../schemas/index.js';
import { calculateAtsScore, extractKeywordsFromText } from '../tools/ats-scorer.js';
import { executeResumeAdaptation } from '../../services/gemma-runner.js';
import { generateResumePdf } from '../../services/pdf-generator.js';
import { generateResumeMarkdown } from '../../services/markdown-generator.js';

export interface WorkflowOptions {
  model?: string;
  tone?: 'technical' | 'concise' | 'executive';
  forceDeterministic?: boolean;
}

export function normalizeJobSpecStep(jobSpec: JobSpec): JobSpec {
  const extracted = jobSpec.keywords.length > 0
    ? jobSpec.keywords
    : extractKeywordsFromText(jobSpec.rawText);

  return {
    ...jobSpec,
    keywords: extracted,
    requiredSkills: jobSpec.requiredSkills.length > 0 ? jobSpec.requiredSkills : extracted.slice(0, 8),
    preferredSkills: jobSpec.preferredSkills.length > 0 ? jobSpec.preferredSkills : extracted.slice(8, 14)
  };
}

export function analyzeSkillDeltaStep(jobSpec: JobSpec, masterResume: MasterResume): {
  targetKeywords: string[];
  missingKeywords: string[];
} {
  const resumeWords = new Set(
    [
      masterResume.basics.summary || '',
      ...(masterResume.work || []).flatMap(w => w.highlights),
      ...(masterResume.skills || []).flatMap(s => s.keywords)
    ].join(' ').toLowerCase().match(/[a-zA-Z0-9+#.-]{2,}/g) || []
  );

  const missing = jobSpec.keywords.filter(k => !resumeWords.has(k.toLowerCase()));
  return {
    targetKeywords: jobSpec.keywords,
    missingKeywords: missing
  };
}

export async function runTailorWorkflow(
  rawJobSpec: JobSpec,
  masterResume: MasterResume,
  options: WorkflowOptions = {}
): Promise<TailorResponse> {
  const normalizedJobSpec = normalizeJobSpecStep(rawJobSpec);
  analyzeSkillDeltaStep(normalizedJobSpec, masterResume);

  const adaptation = await executeResumeAdaptation(normalizedJobSpec, masterResume, options);
  const tailoredResume = adaptation.tailoredResume;

  const atsScore = calculateAtsScore(normalizedJobSpec, masterResume, tailoredResume);
  const pdfArtifact = await generateResumePdf(tailoredResume);
  const markdownArtifact = generateResumeMarkdown(tailoredResume);

  return {
    tailoredResume,
    atsScore,
    artifacts: {
      markdown: markdownArtifact,
      pdfBase64: pdfArtifact.base64
    },
    modelTelemetry: {
      provider: adaptation.telemetry.provider,
      model: adaptation.telemetry.model,
      latencyMs: adaptation.telemetry.latencyMs,
      mode: adaptation.telemetry.mode,
      status: adaptation.telemetry.status,
      notice: adaptation.telemetry.notice
    }
  };
}
