import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { mastraEngine } from './mastra/index.js';
import { 
  JobSpecSchema, 
  MasterResumeSchema, 
  TailorRequestSchema, 
  TailoredResumeSchema 
} from './schemas/index.js';
import { loadMasterResume, saveMasterResume } from './services/storage.js';
import { generateResumePdf } from './services/pdf-generator.js';
import { generateResumeMarkdown } from './services/markdown-generator.js';
import { checkOllamaHealth } from './services/gemma-runner.js';
import { extractKeywordsFromText } from './mastra/tools/ats-scorer.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4141;
const HOST = '127.0.0.1';

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.startsWith('chrome-extension://') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[Resume & Thread] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    project: 'Resume & Thread',
    tagline: 'Local-First Bespoke Resume Tailorer Engine',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: 'GET /api/health',
      models: 'GET /api/models',
      tailor: 'POST /api/tailor',
      parseJob: 'POST /api/parse-job',
      exportPdf: 'POST /api/export/pdf',
      exportMarkdown: 'POST /api/export/markdown',
      masterResume: 'GET/POST /api/resume/master'
    }
  });
});

app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const health = await mastraEngine.getHealthStatus();
    const memory = process.memoryUsage();

    res.json({
      uptimeSec: Math.round(process.uptime()),
      system: {
        rssMb: Math.round(memory.rss / (1024 * 1024)),
        heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024))
      },
      ...health
    });
  } catch (err: any) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

app.get('/api/models', async (req: Request, res: Response) => {
  try {
    const ollama = await checkOllamaHealth();
    res.json({
      activeMode: ollama.available ? 'neural-gemma' : 'deterministic-adapter',
      ollamaAvailable: ollama.available,
      installedOllamaModels: ollama.models,
      recommendedModel: 'gemma2:2b-instruct',
      embeddedModels: [
        {
          id: 'deterministic-gemma-rule-engine',
          name: 'Deterministic ATS Adapter (Zero-Latency Local Engine)',
          status: 'ready'
        }
      ]
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/parse-job', (req: Request, res: Response) => {
  try {
    const { rawText, title, company, url } = req.body;
    if (!rawText || typeof rawText !== 'string' || rawText.length < 10) {
      return res.status(400).json({ error: 'Field "rawText" must contain at least 10 characters.' });
    }

    const keywords = extractKeywordsFromText(rawText);
    const parsedJob = JobSpecSchema.parse({
      title: title || 'Target Position',
      company: company || 'Target Company',
      url: url || '',
      rawText,
      keywords,
      requiredSkills: keywords.slice(0, 8),
      preferredSkills: keywords.slice(8, 14)
    });

    res.json(parsedJob);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/tailor', async (req: Request, res: Response) => {
  try {
    const validatedRequest = TailorRequestSchema.parse(req.body);
    const { jobSpec, masterResume, options } = validatedRequest;

    const result = await mastraEngine.tailor(jobSpec, masterResume, options);
    res.json(result);
  } catch (err: any) {
    console.error('[Resume & Thread] Tailoring execution error:', err);
    res.status(400).json({
      error: err.message || 'Failed to execute tailoring workflow.',
      details: err.issues || undefined
    });
  }
});

app.post('/api/export/pdf', async (req: Request, res: Response) => {
  try {
    const resume = TailoredResumeSchema.parse(req.body);
    const pdfArtifact = await generateResumePdf(resume);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resume.basics.name.replace(/\s+/g, '_')}_Resume.pdf"`);
    res.send(pdfArtifact.buffer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/export/markdown', (req: Request, res: Response) => {
  try {
    const resume = TailoredResumeSchema.parse(req.body);
    const markdown = generateResumeMarkdown(resume);

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.send(markdown);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/resume/master', (req: Request, res: Response) => {
  try {
    const master = loadMasterResume();
    res.json(master);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/resume/master', (req: Request, res: Response) => {
  try {
    const validated = MasterResumeSchema.parse(req.body);
    const saved = saveMasterResume(validated);
    res.json({ success: true, masterResume: saved });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Resume & Thread] Unhandled Express error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.'
  });
});

app.listen(PORT, HOST, () => {
  console.log(`
========================================================================
🪡 Resume & Thread: Bespoke Local Orchestration Engine
========================================================================
• Host: http://${HOST}:${PORT}
• Health Check: http://${HOST}:${PORT}/api/health
• Privacy: 100% Local Inference · Zero Cloud Network Telemetry
• Supported Models: Google Gemma 2 (2B / 9B) + Embedded ATS Engine
========================================================================
`);
});

export default app;
