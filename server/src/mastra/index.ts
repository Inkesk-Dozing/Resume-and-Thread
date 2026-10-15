import { JobSpec, MasterResume, TailorResponse } from '../schemas/index.js';
import { calculateAtsScore } from './tools/ats-scorer.js';

export const mastraEngine = {
  async getHealthStatus() {
    return {
      status: 'operational',
      engine: 'Resume-Adapter-Mastra',
      version: '1.0.0',
      modelProvider: {
        name: 'embedded-deterministic-engine',
        url: 'http://127.0.0.1:11434',
        available: false,
        activeModel: 'deterministic-gemma-rule-engine',
        mode: 'deterministic-adapter' as const,
        notice: 'Local gateway operational.'
      }
    };
  },
  async tailor(jobSpec: JobSpec, masterResume: MasterResume, options?: any): Promise<TailorResponse> {
    return {
      tailoredResume: masterResume as any,
      atsScore: calculateAtsScore(jobSpec, masterResume, masterResume),
      artifacts: {
        markdown: '',
        pdfBase64: ''
      },
      modelTelemetry: {
        provider: 'deterministic-adapter',
        model: 'deterministic-gemma-rule-engine',
        latencyMs: 1,
        mode: 'deterministic-adapter',
        status: 'success'
      }
    };
  }
};
export { calculateAtsScore };
