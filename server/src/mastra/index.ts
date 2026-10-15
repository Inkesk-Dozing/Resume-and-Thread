import { runTailorWorkflow, WorkflowOptions } from './workflows/tailor-workflow.js';
import { calculateAtsScore, extractKeywordsFromText } from './tools/ats-scorer.js';
import { checkOllamaHealth } from '../services/gemma-runner.js';
import { JobSpec, MasterResume, TailorResponse } from '../schemas/index.js';

export class ResumeAndThreadMastraEngine {
  readonly version = '1.0.0';

  async getHealthStatus() {
    const ollama = await checkOllamaHealth();
    return {
      engine: 'Resume-and-Thread-Mastra',
      version: this.version,
      status: 'operational',
      modelProvider: {
        name: ollama.available ? 'ollama' : 'embedded-deterministic-engine',
        url: 'http://127.0.0.1:11434',
        available: ollama.available,
        activeModel: ollama.available ? ollama.activeModel : 'deterministic-gemma-rule-engine',
        mode: ollama.available ? ('neural-gemma' as const) : ('deterministic-adapter' as const),
        notice: ollama.available 
          ? undefined 
          : 'Local Ollama daemon not running. Embedded deterministic adapter is active and ready.'
      }
    };
  }

  async tailor(jobSpec: JobSpec, masterResume: MasterResume, options: WorkflowOptions = {}): Promise<TailorResponse> {
    return runTailorWorkflow(jobSpec, masterResume, options);
  }
}

export const mastraEngine = new ResumeAndThreadMastraEngine();
export { runTailorWorkflow, calculateAtsScore, extractKeywordsFromText };
