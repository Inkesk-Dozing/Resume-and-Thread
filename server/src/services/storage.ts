import fs from 'fs';
import path from 'path';
import { MasterResume, MasterResumeSchema } from '../schemas/index.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const MASTER_RESUME_PATH = path.join(DATA_DIR, 'master_resume.json');

export const DEFAULT_SAMPLE_RESUME: MasterResume = {
  basics: {
    name: "Alex Morgan",
    label: "Senior Full Stack Engineer",
    email: "alex.morgan.dev@gmail.com",
    phone: "+1 (555) 234-5678",
    url: "https://github.com/alexmorgan",
    summary: "Full stack engineer with 6+ years of experience designing scalable microservices, low-latency distributed APIs, and responsive modern web architectures. Specialized in TypeScript, React, Node.js, and cloud platforms.",
    location: {
      city: "San Francisco",
      region: "CA",
      countryCode: "US"
    }
  },
  work: [
    {
      name: "Nexus Cloud Systems",
      position: "Senior Full Stack Engineer",
      startDate: "2022-03",
      endDate: "Present",
      summary: "Distributed systems and real-time backend engineering.",
      highlights: [
        "Architected and deployed distributed event-driven pipeline processing 14M events daily using Node.js, Kafka, and Redis, decreasing message processing lag by 34%.",
        "Refactored legacy monolith into modular microservices with strict TypeScript contracts, reducing deployment failure rates from 8% to under 0.5%.",
        "Engineered real-time collaboration canvas in React and WebSockets, supporting 50+ concurrent editors with sub-20ms state sync latency."
      ]
    },
    {
      name: "Vanguard Tech Solutions",
      position: "Software Engineer",
      startDate: "2019-06",
      endDate: "2022-02",
      summary: "Customer-facing applications and continuous integration workflows.",
      highlights: [
        "Built customer-facing analytics dashboards using React, TailwindCSS, and PostgreSQL, increasing monthly active user engagement by 22%.",
        "Automated CI/CD deployment workflows with GitHub Actions and Docker, reducing build-to-production deployment duration from 45 minutes to 8 minutes.",
        "Authored comprehensive unit and integration test suites using Vitest and Playwright, raising codebase test coverage from 48% to 88%."
      ]
    }
  ],
  skills: [
    { name: "Programming Languages", keywords: ["TypeScript", "JavaScript", "Python", "Go", "SQL"] },
    { name: "Frameworks & Libraries", keywords: ["React", "Next.js", "Node.js", "Express", "TailwindCSS"] },
    { name: "Databases & Storage", keywords: ["PostgreSQL", "Redis", "MongoDB", "Prisma"] },
    { name: "Cloud & DevOps", keywords: ["Docker", "Kubernetes", "AWS", "GitHub Actions", "Kafka"] }
  ],
  education: [
    {
      institution: "State University of Technology",
      area: "Computer Science",
      studyType: "B.S.",
      startDate: "2015-09",
      endDate: "2019-05"
    }
  ]
};

export function ensureDataDirectory(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadMasterResume(): MasterResume {
  ensureDataDirectory();
  if (!fs.existsSync(MASTER_RESUME_PATH)) {
    saveMasterResume(DEFAULT_SAMPLE_RESUME);
    return DEFAULT_SAMPLE_RESUME;
  }

  try {
    const raw = fs.readFileSync(MASTER_RESUME_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    const validated = MasterResumeSchema.parse(parsed);
    return validated;
  } catch (err) {
    console.warn('[Resume & Thread] Invalid master resume on disk, returning sample default:', err);
    return DEFAULT_SAMPLE_RESUME;
  }
}

export function saveMasterResume(resume: MasterResume): MasterResume {
  ensureDataDirectory();
  const validated = MasterResumeSchema.parse(resume);
  fs.writeFileSync(MASTER_RESUME_PATH, JSON.stringify(validated, null, 2), 'utf-8');
  return validated;
}
