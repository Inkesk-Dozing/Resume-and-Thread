# Contributing to Resume & Thread

Thank you for your interest in contributing to Resume & Thread.

## Code of Conduct & Core Philosophy

Resume & Thread is dedicated to giving job seekers an open, private, zero-subscription tool to tailor resumes without surrendering personal data. All contributions must respect our **zero-remote-telemetry** and **local-first** security principles.

## Development Workflow

1. Fork the repository and create a descriptive branch:
   ```bash
   git checkout -b feat/ashby-scraper
   ```
2. Commit changes using [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New scrapers, Mastra workflows, or output formats
   - `fix:` Bug fixes in DOM extraction or prompt formatting
   - `docs:` Documentation improvements
   - `perf:` Optimization of local model inference or memory overhead
   - `test:` Unit or integration test suites
3. Ensure all code passes linting and formatting standards:
   - TypeScript: ESLint + Prettier
   - Extension: Chrome Manifest V3 validation
4. Submit a Pull Request with a clear description and testing artifacts.

## Testing Mandates

- Unit tests for ATS scoring formulas (`ats-scorer.test.ts`).
- Schema validation tests (`schemas.test.ts`).
- Grounding & local inference fallback tests (`gemma-runner.test.ts`).
- PDF generation tests (`pdf-generator.test.ts`).
- Verification that no network requests leave `localhost` during tailoring execution.
