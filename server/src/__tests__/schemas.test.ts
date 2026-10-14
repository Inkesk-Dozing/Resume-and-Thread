import { describe, it, expect } from 'vitest';
import { 
  JobSpecSchema, 
  MasterResumeSchema, 
  TailoredResumeSchema, 
  AtsScoreSchema 
} from '../schemas/index.js';

describe('Resume & Thread Schemas', () => {
  it('validates a correct JobSpec', () => {
    const raw = {
      title: 'Senior Distributed Systems Engineer',
      company: 'Datadog',
      rawText: 'Looking for a Senior Distributed Systems Engineer with Go, Kafka, and Kubernetes experience.',
      keywords: ['Go', 'Kafka', 'Kubernetes'],
      requiredSkills: ['Go', 'Kafka'],
      preferredSkills: ['Kubernetes']
    };

    const parsed = JobSpecSchema.parse(raw);
    expect(parsed.title).toBe('Senior Distributed Systems Engineer');
    expect(parsed.keywords).toContain('Go');
  });

  it('rejects invalid JobSpec missing required fields', () => {
    expect(() => {
      JobSpecSchema.parse({ title: '', company: '' });
    }).toThrow();
  });

  it('validates a complete MasterResume', () => {
    const raw = {
      basics: {
        name: 'Jordan Lee',
        email: 'jordan@example.com',
        label: 'Staff Engineer'
      },
      work: [
        {
          name: 'Acme Corp',
          position: 'Senior Engineer',
          startDate: '2021-01',
          highlights: ['Built low latency pipeline processing 10M events daily.']
        }
      ],
      skills: [
        { name: 'Languages', keywords: ['TypeScript', 'Rust'] }
      ],
      education: [
        { institution: 'Tech University', area: 'CS' }
      ]
    };

    const parsed = MasterResumeSchema.parse(raw);
    expect(parsed.basics.name).toBe('Jordan Lee');
    expect(parsed.work).toHaveLength(1);
  });

  it('validates TailoredResume extending MasterResume with target metadata', () => {
    const raw = {
      basics: { name: 'Jordan Lee' },
      work: [],
      skills: [],
      education: [],
      targetJobTitle: 'Staff Backend Engineer',
      targetCompany: 'Stripe'
    };

    const parsed = TailoredResumeSchema.parse(raw);
    expect(parsed.targetJobTitle).toBe('Staff Backend Engineer');
    expect(parsed.targetCompany).toBe('Stripe');
  });

  it('validates AtsScore metrics contract', () => {
    const score = {
      overall: 93,
      previousScore: 61,
      delta: '+32%',
      matchedKeywords: ['TypeScript', 'React', 'Kafka'],
      missingKeywords: ['Rust'],
      keywordDensityScore: 90,
      actionVerbRatio: 88
    };

    const parsed = AtsScoreSchema.parse(score);
    expect(parsed.overall).toBe(93);
    expect(parsed.delta).toBe('+32%');
  });
});
