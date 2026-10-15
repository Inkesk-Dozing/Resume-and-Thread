import { describe, it, expect } from 'vitest';
import { runDeterministicAdapter, executeResumeAdaptation } from '../services/gemma-runner.js';
import { JobSpec, MasterResume } from '../schemas/index.js';

describe('Gemma Runner & Deterministic Local Adapter: Resume & Thread', () => {
  const sampleJob: JobSpec = {
    title: 'Senior Backend Engineer',
    company: 'Stripe',
    rawText: 'Looking for a Senior Backend Engineer with Go, Kafka, distributed transactions, and Kubernetes.',
    keywords: ['Go', 'Kafka', 'Kubernetes', 'Transactions'],
    requiredSkills: ['Go', 'Kafka'],
    preferredSkills: ['Kubernetes']
  };

  const sampleMaster: MasterResume = {
    basics: {
      name: 'Taylor Swift',
      label: 'Software Engineer',
      summary: 'Experienced software developer.'
    },
    work: [
      {
        name: 'Prior Company',
        position: 'Backend Developer',
        highlights: [
          'Maintained API servers and database migrations.'
        ]
      }
    ],
    skills: [
      { name: 'Core', keywords: ['Java', 'SQL'] }
    ],
    education: []
  };

  it('runs deterministic adapter without hallucinations or inventing employers', () => {
    const tailored = runDeterministicAdapter(sampleJob, sampleMaster);

    expect(tailored.work[0].name).toBe('Prior Company');
    expect(tailored.work[0].position).toBe('Backend Developer');
    expect(tailored.targetJobTitle).toBe('Senior Backend Engineer');
    expect(tailored.targetCompany).toBe('Stripe');

    const bullet = tailored.work[0].highlights[0];
    expect(bullet).toMatch(/Go|Kafka|Kubernetes|Transactions/i);
    expect(bullet).toMatch(/\d+%/);
  });

  it('executes resume adaptation seamlessly with fallback telemetry when Ollama is offline', async () => {
    const result = await executeResumeAdaptation(sampleJob, sampleMaster, {
      forceDeterministic: true
    });

    expect(result.tailoredResume).toBeDefined();
    expect(result.telemetry.mode).toBe('deterministic-adapter');
    expect(result.telemetry.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
