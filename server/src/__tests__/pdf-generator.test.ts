import { describe, it, expect } from 'vitest';
import { generateResumePdf } from '../services/pdf-generator.js';
import { TailoredResume } from '../schemas/index.js';

describe('PDF Generator Service: Resume & Thread', () => {
  it('generates a valid binary PDF buffer and base64 data URI', async () => {
    const resume: TailoredResume = {
      basics: {
        name: 'Jordan Miller',
        label: 'Lead Systems Architect',
        email: 'jordan@miller.tech',
        phone: '+1 (555) 345-6789',
        summary: 'Architect with 8 years of distributed systems engineering experience.',
        location: { city: 'Seattle', region: 'WA' }
      },
      work: [
        {
          name: 'CloudScale Inc',
          position: 'Staff Engineer',
          startDate: '2021-01',
          endDate: 'Present',
          highlights: [
            'Architected distributed caching layer saving $1.2M annually.',
            'Scaled Kafka streaming clusters to 500k messages/sec.'
          ]
        }
      ],
      skills: [
        { name: 'Core', keywords: ['Go', 'Kubernetes', 'Kafka', 'PostgreSQL'] }
      ],
      education: [
        { institution: 'University of Washington', area: 'CS', studyType: 'B.S.' }
      ],
      targetJobTitle: 'Staff Backend Architect',
      targetCompany: 'AWS'
    };

    const artifact = await generateResumePdf(resume);

    expect(artifact.buffer).toBeInstanceOf(Buffer);
    expect(artifact.buffer.length).toBeGreaterThan(1000);
    const header = artifact.buffer.slice(0, 5).toString('utf-8');
    expect(header).toBe('%PDF-');
    expect(artifact.base64).toMatch(/^data:application\/pdf;base64,/);
  });
});
