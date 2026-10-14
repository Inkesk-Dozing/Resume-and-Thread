import { z } from 'zod';

export const JobSpecSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  url: z.string().optional(),
  rawText: z.string().min(10),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([])
});

export type JobSpec = z.infer<typeof JobSpecSchema>;

export const ResumeBasicsSchema = z.object({
  name: z.string().min(1),
  label: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  url: z.string().optional(),
  summary: z.string().optional(),
  location: z.object({
    city: z.string().optional(),
    region: z.string().optional(),
    countryCode: z.string().optional()
  }).optional()
});

export type ResumeBasics = z.infer<typeof ResumeBasicsSchema>;

export const ResumeWorkSchema = z.object({
  name: z.string().min(1),
  position: z.string().min(1),
  url: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).default([])
});

export type ResumeWork = z.infer<typeof ResumeWorkSchema>;

export const ResumeSkillSchema = z.object({
  name: z.string().min(1),
  level: z.string().optional(),
  keywords: z.array(z.string()).default([])
});

export type ResumeSkill = z.infer<typeof ResumeSkillSchema>;

export const ResumeEducationSchema = z.object({
  institution: z.string().min(1),
  area: z.string().optional(),
  studyType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export type ResumeEducation = z.infer<typeof ResumeEducationSchema>;

export const MasterResumeSchema = z.object({
  basics: ResumeBasicsSchema,
  work: z.array(ResumeWorkSchema).default([]),
  skills: z.array(ResumeSkillSchema).default([]),
  education: z.array(ResumeEducationSchema).default([])
});

export type MasterResume = z.infer<typeof MasterResumeSchema>;

export const TailoredResumeSchema = MasterResumeSchema.extend({
  targetJobTitle: z.string().optional(),
  targetCompany: z.string().optional()
});

export type TailoredResume = z.infer<typeof TailoredResumeSchema>;

export const AtsScoreSchema = z.object({
  overall: z.number().min(0).max(100),
  previousScore: z.number().min(0).max(100),
  delta: z.string(),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  keywordDensityScore: z.number().min(0).max(100),
  actionVerbRatio: z.number().min(0).max(100)
});

export type AtsScore = z.infer<typeof AtsScoreSchema>;

export const ModelProviderSchema = z.object({
  name: z.string(),
  url: z.string(),
  activeModel: z.string(),
  available: z.boolean(),
  mode: z.enum(['neural-gemma', 'deterministic-adapter']),
  notice: z.string().optional()
});

export type ModelProvider = z.infer<typeof ModelProviderSchema>;

export const TailorRequestSchema = z.object({
  jobSpec: JobSpecSchema,
  masterResume: MasterResumeSchema,
  options: z.object({
    model: z.string().optional().default('gemma2:2b-instruct'),
    tone: z.enum(['technical', 'concise', 'executive']).optional().default('technical'),
    forceDeterministic: z.boolean().optional().default(false)
  }).optional().default({})
});

export type TailorRequest = z.infer<typeof TailorRequestSchema>;

export const TailorResponseSchema = z.object({
  tailoredResume: TailoredResumeSchema,
  atsScore: AtsScoreSchema,
  artifacts: z.object({
    markdown: z.string(),
    pdfBase64: z.string()
  }),
  modelTelemetry: z.object({
    provider: z.string(),
    model: z.string(),
    latencyMs: z.number(),
    mode: z.string(),
    status: z.string(),
    notice: z.string().optional()
  })
});

export type TailorResponse = z.infer<typeof TailorResponseSchema>;
