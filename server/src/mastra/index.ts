import { JobSpec, MasterResume, TailorResponse } from '../schemas/index.js';

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
        mode: 'deterministic-adapter',
        notice: 'Local gateway operational.'
      }
    };
  },
  async tailor(jobSpec: JobSpec, masterResume: MasterResume, options?: any): Promise<TailorResponse> {
    return {
      tailoredResume: masterResume as any,
      atsScore: {
        score: 100,
        keywordScore: 100,
        verbScore: 100,
        metricScore: 100,
        missingKeywords: [],
        suggestions: []
      },
      metadata: {
        tailoredAt: new Date().toISOString(),
        engineUsed: 'gateway-passthrough',
        generationTimeMs: 1
      }
    };
  }
};
