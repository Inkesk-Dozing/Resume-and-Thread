import { describe, it, expect } from 'vitest';
import { extractKeywordsFromText, calculateAtsScore } from '../mastra/tools/ats-scorer.js';
import { JobSpec, MasterResume } from '../schemas/index.js';

describe('ATS Scorer Tool: Resume & Thread', () => {
  it('extracts top keywords from raw job description', () => {
    const jobText = `
      We are looking for a Senior Full Stack Engineer proficient in TypeScript, React, Node.js,
      and PostgreSQL. The ideal candidate will have experience with Docker, Kubernetes,
      distributed systems, and AWS cloud architecture.
    `;

    const keywords = extractKeywordsFromText(jobText);
    expect(keywords).toBeInstanceOf(Array);
    expect(keywords.length).toBeGreaterThan(0);
    const lower = keywords.map(k => k.toLowerCase());
    expect(lower).toContain('typescript');
    expect(lower).toContain('react');
  });

  it('calculates significant ATS score delta after tailoring', () => {
    const jobSpec: JobSpec = {
      title: 'Senior React Developer',
      company: 'TechCorp',
      rawText: 'Requires advanced React, Redux, Next.js, and TypeScript.',
      requiredSkills: ['React', 'TypeScript'],
      preferredSkills: ['Next.js'],
      keywords: ['react', 'typescript', 'redux', 'next.js']
    };

    const masterResume: MasterResume = {
      basics: {
        name: 'Alex Sample',
        summary: 'Software developer with general experience.'
      },
      work: [
        {
          name: 'OldCorp',
          position: 'Engineer',
          highlights: ['Worked on web applications.']
        }
      ],
      skills: [
        { name: 'Skills', keywords: ['HTML', 'CSS', 'JavaScript'] }
      ],
      education: []
    };

    const tailoredResume: MasterResume = {
      basics: {
        name: 'Alex Sample',
        summary: 'Senior React Developer with deep TypeScript, Next.js, and Redux expertise.'
      },
      work: [
        {
          name: 'OldCorp',
          position: 'Engineer',
          highlights: [
            'Architected responsive applications with React and Next.js, boosting engagement by 35%.',
            'Engineered state management pipelines in Redux and TypeScript.'
          ]
        }
      ],
      skills: [
        { name: 'Skills', keywords: ['React', 'TypeScript', 'Redux', 'Next.js', 'HTML', 'CSS'] }
      ],
      education: []
    };

    const score = calculateAtsScore(jobSpec, masterResume, tailoredResume);
    expect(score.overall).toBeGreaterThan(score.previousScore);
    expect(score.overall).toBeGreaterThanOrEqual(70);
    expect(score.matchedKeywords).toContain('react');
    expect(score.matchedKeywords).toContain('typescript');
  });
});
